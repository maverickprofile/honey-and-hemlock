
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Search, Filter, Download, X, User, Mail, Phone, Calendar, DollarSign, Tag, Trash2, UserPlus, Eye, Send, MessageSquare, FileDown } from 'lucide-react';
import { exportRubricToPDF } from '@/utils/exportRubricPdf';

const ScriptsSection = () => {
  const [scripts, setScripts] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [scriptToDelete, setScriptToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchScripts();
    fetchContractors();
  }, []);

  useEffect(() => {
    filterScripts();
  }, [scripts, searchTerm, statusFilter, tierFilter]);

  const fetchScripts = async () => {
    try {
      console.log('Fetching scripts data...');
      // First try to fetch with script_reviews, if it fails, fetch without
      let { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Scripts fetch error:', error);
        setScripts([]);
        toast({
          title: "Database Error",
          description: `Failed to fetch scripts: ${error.message}`,
          variant: "destructive"
        });
        return;
      }
      
      console.log('Scripts fetched:', data?.length || 0);
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setScripts([]);
      toast({
        title: "Error",
        description: "Failed to fetch scripts. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContractors = async () => {
    try {
      console.log('Fetching judges data for scripts section...');
      const { data, error } = await supabase
        .from('judges')  // Using judges table as it hasn't been renamed yet
        .select('*');
      
      if (error) {
        console.error('Judges fetch error:', error);
        setContractors([]);
        return;
      }
      
      console.log('Judges fetched for scripts:', data?.length || 0);
        setContractors(data || []);
    } catch (error) {
      console.error('Error fetching judges:', error);
      setContractors([]);
    }
  };

  const filterScripts = () => {
    let filtered = scripts;

    if (searchTerm) {
      filtered = filtered.filter(script => 
        script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.author_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(script => script.status === statusFilter);
    }

    if (tierFilter !== 'all') {
      filtered = filtered.filter(script => script.tier_name === tierFilter);
    }

    setFilteredScripts(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-100 text-blue-800">Assigned</Badge>;
      case 'reviewed':
        return <Badge className="bg-purple-100 text-purple-800">Reviewed</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'incomplete':
        return <Badge className="bg-orange-100 text-orange-800">Incomplete</Badge>;
      case 'approved': // Legacy support
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'declined': // Legacy support
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getContractorName = (contractorId: string) => {
    const contractor = contractors.find(c => c.id === contractorId);
    return contractor ? contractor.name : 'Unassigned';
  };

  const handleViewScript = (script: any) => {
    setSelectedScript(script);
    setIsViewDialogOpen(true);
  };

  const handleAssignScript = async (scriptId: string, judgeId: string) => {
    try {
      console.log('Assigning script:', scriptId, 'to judge:', judgeId);
      
      // Get contractor name for feedback
      const contractor = contractors.find(c => c.id === judgeId);
      const contractorName = contractor?.name || 'Unknown';
      
      // First, let's check if the script exists
      const { data: scriptCheck, error: checkError } = await supabase
        .from('scripts')
        .select('id, title')
        .eq('id', scriptId)
        .single();
      
      if (checkError) {
        console.error('Script not found:', checkError);
        throw new Error('Script not found');
      }
      
      console.log('Script found:', scriptCheck);
      
      // Use the RPC function directly since we have RLS issues
      console.log('Using RPC function to assign script...');
      const { data: rpcResult, error: rpcError } = await supabase
        .rpc('assign_script_to_judge', {
          p_script_id: scriptId,
          p_judge_id: judgeId || null
        });
      
      if (rpcError) {
        console.error('RPC error:', rpcError);
        // Fallback to direct update
        console.log('Falling back to direct update...');
        const { error } = await supabase
          .from('scripts')
          .update({ 
            assigned_judge_id: judgeId || null,
            status: judgeId ? 'assigned' : 'pending'
          })
          .eq('id', scriptId);
        
        if (error) {
          console.error('Direct update also failed:', error);
          throw error;
        }
      } else {
        console.log('RPC assignment result:', rpcResult);
      }

      console.log('Assignment completed successfully');

      toast({
        title: "Success",
        description: judgeId 
          ? `Script assigned to ${contractorName}`
          : "Assignment removed",
      });

      // Refresh the scripts list to show updated assignment
      setTimeout(() => {
        fetchScripts();
      }, 500);
    } catch (error: any) {
      console.error('Error assigning script:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign script",
        variant: "destructive"
      });
    }
  };

  const handleDeleteScript = async () => {
    if (!scriptToDelete) return;

    try {
      // First try to delete directly
      const { data, error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptToDelete.id)
        .select(); // Add select to verify deletion

      if (error) {
        console.error('Direct deletion failed:', error);
        
        // If direct deletion fails, try using the admin function
        console.log('Attempting deletion via admin function...');
        const { data: funcData, error: funcError } = await supabase
          .rpc('delete_script_admin', { p_script_id: scriptToDelete.id });
        
        if (funcError) {
          throw funcError;
        }
        
        if (!funcData) {
          throw new Error('Script deletion failed - the script may not exist or you may not have permission');
        }
      } else if (!data || data.length === 0) {
        // No error but no data returned means RLS blocked it
        console.warn('Deletion may have been blocked by RLS policies');
        
        // Try the admin function
        const { data: funcData, error: funcError } = await supabase
          .rpc('delete_script_admin', { p_script_id: scriptToDelete.id });
        
        if (funcError) {
          throw funcError;
        }
        
        if (!funcData) {
          throw new Error('Unable to delete script - please check your permissions');
        }
      }

      toast({
        title: "Success",
        description: "Script deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setScriptToDelete(null);
      fetchScripts();
    } catch (error: any) {
      console.error('Error deleting script:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete script",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (script: any) => {
    setScriptToDelete(script);
    setIsDeleteDialogOpen(true);
  };

  const handleViewReview = async (script: any) => {
    try {
      // Check if script_reviews table exists and fetch review data
      const { data: reviews, error } = await supabase
        .from('script_reviews')
        .select('*')
        .eq('script_id', script.id)
        .eq('status', 'completed')
        .single();
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        toast({
          title: "Reviews Not Available",
          description: "The review system hasn't been set up yet.",
          variant: "destructive"
        });
        return;
      }
      
      const review = reviews;
      
      if (!review) {
        toast({
          title: "No Review Available",
          description: "This script hasn't been reviewed yet.",
          variant: "destructive"
        });
        return;
      }

      // Fetch the page notes for this review
      const { data: pageNotes, error: pageNotesError } = await supabase
        .from('script_page_notes')
        .select('*')
        .eq('script_review_id', review.id)
        .order('page_number');

      if (pageNotesError) throw pageNotesError;

      // Get contractor details
      const contractor = contractors.find(c => c.id === review.judge_id);

      setSelectedReview({
        ...review,
        script: script,
        pageNotes: pageNotes || [],
        contractor: contractor
      });
      setIsReviewDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching review:', error);
      toast({
        title: "Error",
        description: "Failed to fetch review details",
        variant: "destructive"
      });
    }
  };

  const handleSendReviewEmail = async () => {
    if (!selectedReview || !selectedReview.script) return;

    setSendingEmail(true);
    try {
      // Get site settings for SMTP configuration
      const { data: settings } = await supabase
        .from('site_settings')
        .select('smtp_settings')
        .single();

      if (!settings?.smtp_settings) {
        toast({
          title: "SMTP Not Configured",
          description: "Please configure SMTP settings in the Email section first.",
          variant: "destructive"
        });
        return;
      }

      // Format the email content
      const emailContent = `
Dear ${selectedReview.script.author_name},

Thank you for submitting your script "${selectedReview.script.title}" to Honey & Hemlock Productions.

Our reviewer has completed their assessment of your script. Below you'll find their detailed feedback:

${selectedReview.contractor ? `Reviewed by: ${selectedReview.contractor.name}` : ''}
Review Status: ${(selectedReview.status === 'completed' || selectedReview.recommendation === 'approved' || selectedReview.recommendation === 'declined') ? 'COMPLETED' : 'INCOMPLETE'}

--- OVERALL ASSESSMENT ---
${selectedReview.overall_notes || 'No overall notes provided.'}

--- DETAILED FEEDBACK ---
${selectedReview.feedback || 'No detailed feedback provided.'}

${selectedReview.pageNotes && selectedReview.pageNotes.length > 0 ? `
--- PAGE-BY-PAGE NOTES ---
${selectedReview.pageNotes.map((note: any) => `
Page ${note.page_number}:
${note.note_content}`).join('\n')}
` : ''}

Thank you for submitting your script. Our review process is now complete, and we appreciate your patience throughout the evaluation period.

Best regards,
Honey & Hemlock Productions
`;

      // In production, you would send this via your email service
      // For now, we'll just copy to clipboard and show a success message
      await navigator.clipboard.writeText(emailContent);
      
      toast({
        title: "Email Content Copied",
        description: "The review email has been copied to your clipboard. You can now paste it into your email client.",
      });

      // Create a notification that the review was sent
      await supabase
        .from('notifications')
        .insert({
          title: 'Review Email Sent',
          message: `Review for "${selectedReview.script.title}" sent to ${selectedReview.script.author_email}`,
          type: 'review_sent',
          metadata: { script_id: selectedReview.script.id }
        });

    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to prepare email content",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-portfolio-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-portfolio-gold mx-auto mb-4"></div>
          <p>Loading scripts data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scripts Overview */}
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <CardTitle className="text-portfolio-white flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Scripts Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-portfolio-white">{scripts.length}</div>
              <div className="text-gray-400 text-sm mt-1">Total Scripts</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                {scripts.filter(s => s.status === 'pending').length}
              </div>
              <div className="text-gray-400 text-sm mt-1">Pending</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                {scripts.filter(s => s.status === 'assigned').length}
              </div>
              <div className="text-gray-400 text-sm mt-1">In Review</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                {scripts.filter(s => s.status === 'reviewed').length}
              </div>
              <div className="text-gray-400 text-sm mt-1">Reviewed</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center col-span-2 sm:col-span-1">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">
                {scripts.filter(s => s.status === 'completed' || s.status === 'approved' || s.status === 'declined').length}
              </div>
              <div className="text-gray-400 text-sm mt-1">Completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="bg-[#282828] border-none">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 items-stretch md:items-center">
            <div className="flex items-center space-x-2 flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 text-portfolio-white border-gray-500 placeholder-gray-400 focus:border-portfolio-gold focus:ring-portfolio-gold w-full md:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-gray-700 text-portfolio-white border-gray-500 hover:bg-gray-600">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full md:w-[150px] bg-gray-700 text-portfolio-white border-gray-500 hover:bg-gray-600">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="Free Upload">Free Upload</SelectItem>
                <SelectItem value="Essential Review">Essential Review</SelectItem>
                <SelectItem value="Comprehensive Analysis">Comprehensive Analysis</SelectItem>
                <SelectItem value="Premium Script Notes">Premium Script Notes</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Table - Desktop */}
      <Card className="bg-[#282828] border-none hidden lg:block">
        <CardHeader>
          <CardTitle className="text-portfolio-white">All Scripts</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Author</TableHead>
                <TableHead className="text-gray-400">Tier</TableHead>
                <TableHead className="text-gray-400">Amount</TableHead>
                <TableHead className="text-gray-400">Payment</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Assign To</TableHead>
                <TableHead className="text-gray-400">Submitted</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredScripts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-portfolio-white/60">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No scripts found</p>
                      <p className="text-sm">
                        {scripts.length === 0 
                          ? "Scripts will appear here once submissions are received."
                          : "Try adjusting your filters to see scripts."
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredScripts.map((script) => (
                  <TableRow key={script.id}>
                    <TableCell className="text-portfolio-white font-medium">{script.title || 'Untitled'}</TableCell>
                    <TableCell className="text-portfolio-white">{script.author_name || 'Unknown'}</TableCell>
                    <TableCell className="text-portfolio-white">{script.tier_name || 'N/A'}</TableCell>
                    <TableCell className="text-portfolio-white">${(script.amount || 0) / 100}</TableCell>
                    <TableCell>{getPaymentStatusBadge(script.payment_status || 'pending')}</TableCell>
                    <TableCell>{getStatusBadge(script.status || 'pending')}</TableCell>
                    <TableCell>
                      <Select 
                        value={script.assigned_judge_id || "unassigned"}
                        onValueChange={(value) => handleAssignScript(script.id, value === "unassigned" ? null : value)}
                      >
                        <SelectTrigger className="w-[150px] bg-gray-700 text-portfolio-white border-gray-500 hover:bg-gray-600">
                          <SelectValue placeholder="Assign to..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {contractors.filter(c => c.status === 'approved').map((contractor) => (
                            <SelectItem key={contractor.id} value={contractor.id}>
                              {contractor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-portfolio-white">
                      {script.created_at ? new Date(script.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-portfolio-black text-portfolio-gold border border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black transition-all duration-300"
                          onClick={() => handleViewScript(script)}
                          title="View Script Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {/* Show View Review button if script has been reviewed */}
                        {(script.status === 'reviewed' || script.status === 'completed' || script.status === 'approved' || script.status === 'declined') && (
                          <Button
                            size="sm"
                            className="bg-portfolio-white text-portfolio-black border border-portfolio-white hover:bg-portfolio-black hover:text-portfolio-gold hover:border-portfolio-gold transition-all duration-300"
                            onClick={() => handleViewReview(script)}
                            title="View Review"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(script)}
                          title="Delete Script"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        <Card className="bg-[#282828] border-none">
          <CardHeader>
            <CardTitle className="text-portfolio-white">All Scripts</CardTitle>
          </CardHeader>
        </Card>

        {filteredScripts.length === 0 ? (
          <Card className="bg-[#282828] border-none">
            <CardContent className="py-8">
              <div className="text-portfolio-white/60 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No scripts found</p>
                <p className="text-sm">
                  {scripts.length === 0
                    ? "Scripts will appear here once submissions are received."
                    : "Try adjusting your filters to see scripts."
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 px-4">
            {filteredScripts.map((script) => (
              <Card key={script.id} className="bg-[#2a2a2a] border border-gray-700">
                <CardContent className="p-4">
                  {/* Title and Status Row */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 mr-2">
                      <h3 className="text-portfolio-white font-semibold text-base mb-1">
                        {script.title || 'Untitled'}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        by {script.author_name || 'Unknown'}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getStatusBadge(script.status || 'pending')}
                      {getPaymentStatusBadge(script.payment_status || 'pending')}
                    </div>
                  </div>

                  {/* Script Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div>
                      <p className="text-gray-500">Tier</p>
                      <p className="text-portfolio-white font-medium">
                        {script.tier_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="text-portfolio-white font-medium">
                        ${(script.amount || 0) / 100}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Submitted</p>
                      <p className="text-portfolio-white font-medium">
                        {script.created_at ? new Date(script.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="text-portfolio-gold font-medium text-xs truncate">
                        {script.author_email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Assign Dropdown */}
                  <div className="mb-3">
                    <Select
                      value={script.assigned_judge_id || "unassigned"}
                      onValueChange={(value) => handleAssignScript(script.id, value === "unassigned" ? null : value)}
                    >
                      <SelectTrigger className="w-full bg-gray-700 text-portfolio-white border-gray-600">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {contractors.filter(c => c.status === 'approved').map((contractor) => (
                          <SelectItem key={contractor.id} value={contractor.id}>
                            {contractor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
                      onClick={() => handleViewScript(script)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    {(script.status === 'reviewed' || script.status === 'completed' || script.status === 'approved' || script.status === 'declined') && (
                      <Button
                        size="sm"
                        className="flex-1 bg-white text-black hover:bg-gray-200"
                        onClick={() => handleViewReview(script)}
                      >
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => openDeleteDialog(script)}
                      className="px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Script Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-portfolio-dark border-portfolio-gold text-portfolio-white">
          <DialogHeader>
            <DialogTitle className="text-portfolio-gold text-xl font-special-elite">
              Script Details
            </DialogTitle>
            <DialogDescription className="text-portfolio-white/70">
              Complete information about the submitted script
            </DialogDescription>
          </DialogHeader>
          
          {selectedScript && (
            <div className="space-y-4 mt-4">
              {/* Script Title and Status */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-portfolio-white">
                    {selectedScript.title || 'Untitled Script'}
                  </h3>
                  <div className="flex gap-2 mt-2">
                    {getStatusBadge(selectedScript.status || 'pending')}
                    {getPaymentStatusBadge(selectedScript.payment_status || 'pending')}
                  </div>
                </div>
                <Badge className="bg-portfolio-gold/20 text-portfolio-gold">
                  {selectedScript.tier_name || 'N/A'}
                </Badge>
              </div>

              {/* Author Information */}
              <Card className="bg-portfolio-black border-portfolio-gold/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-portfolio-gold">Author Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">{selectedScript.author_name || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">{selectedScript.author_email || 'N/A'}</span>
                  </div>
                  {selectedScript.author_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-portfolio-gold/70" />
                      <span className="text-portfolio-white">{selectedScript.author_phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submission Details */}
              <Card className="bg-portfolio-black border-portfolio-gold/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-portfolio-gold">Submission Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">
                      Submitted: {selectedScript.created_at ? new Date(selectedScript.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">
                      Amount: ${(selectedScript.amount || 0) / 100}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">
                      Tier: {selectedScript.tier_name || 'N/A'} ({selectedScript.tier_id || 'N/A'})
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* File Information */}
              {selectedScript.file_name && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">File Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-portfolio-gold/70" />
                      <span className="text-portfolio-white">{selectedScript.file_name}</span>
                    </div>
                    {selectedScript.file_url && (
                      <Button
                        size="sm"
                        className="mt-3 bg-portfolio-gold text-portfolio-dark font-semibold hover:bg-portfolio-gold/80"
                        onClick={() => window.open(selectedScript.file_url, '_blank')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Script
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Assignment Information */}
              <Card className="bg-portfolio-black border-portfolio-gold/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-portfolio-gold">Assignment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-portfolio-gold/70" />
                    <span className="text-portfolio-white">
                      Assigned to: {getContractorName(selectedScript.assigned_judge_id)}
                    </span>
                  </div>
                  {selectedScript.reviewed_at && (
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-portfolio-gold/70" />
                      <span className="text-portfolio-white">
                        Reviewed: {new Date(selectedScript.reviewed_at).toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                  className="border-portfolio-gold text-black hover:bg-portfolio-gold/10 hover:text-black"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Review Details Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto bg-portfolio-dark border-portfolio-gold text-portfolio-white">
          <DialogHeader>
            <DialogTitle className="text-portfolio-gold text-base sm:text-xl font-special-elite">
              Script Review
            </DialogTitle>
            <DialogDescription className="text-portfolio-white/70">
              Complete review for "{selectedReview?.script?.title}"
            </DialogDescription>
          </DialogHeader>
          
          {selectedReview && (
            <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 px-2 sm:px-0">
              {/* Script Information */}
              <Card className="bg-portfolio-black border-portfolio-gold/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-portfolio-gold">Script Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-portfolio-white">
                  <div><strong className="text-portfolio-gold">Title:</strong> <span className="text-portfolio-white/90">{selectedReview.script.title}</span></div>
                  <div><strong className="text-portfolio-gold">Author:</strong> <span className="text-portfolio-white/90">{selectedReview.script.author_name}</span></div>
                  <div><strong className="text-portfolio-gold">Email:</strong> <span className="text-portfolio-white/90">{selectedReview.script.author_email}</span></div>
                  <div><strong className="text-portfolio-gold">Tier:</strong> <span className="text-portfolio-white/90">{selectedReview.script.tier_name}</span></div>
                </CardContent>
              </Card>

              {/* Reviewer Information */}
              <Card className="bg-portfolio-black border-portfolio-gold/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-portfolio-gold">Reviewer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-portfolio-white">
                  <div><strong className="text-portfolio-gold">Reviewer:</strong> <span className="text-portfolio-white/90">{selectedReview.contractor?.name || 'Unknown'}</span></div>
                  <div><strong className="text-portfolio-gold">Review Date:</strong> <span className="text-portfolio-white/90">{new Date(selectedReview.created_at).toLocaleString()}</span></div>
                  <div className="flex items-center gap-2">
                    <strong className="text-portfolio-gold">Recommendation:</strong>
                    <Badge className="bg-green-600 text-white border border-green-400">
                      {selectedReview.status === 'completed' ? 'COMPLETED' : 'INCOMPLETE'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Assessment */}
              {selectedReview.overall_notes && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">Overall Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-portfolio-white/90">
                      {selectedReview.overall_notes}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Compiled Feedback */}
              {selectedReview.feedback && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">Detailed Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap text-portfolio-white/90">
                      {selectedReview.feedback}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Title Response */}
              {selectedReview.title_response && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">Title Response</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-portfolio-white/90">{selectedReview.title_response}</div>
                  </CardContent>
                </Card>
              )}

              {/* Complete Rubric Scores - All Fields */}
              {(selectedReview.plot_rating || selectedReview.characters_rating || selectedReview.dialogue_rating) && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">Complete Rubric Assessment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Plot */}
                    {(selectedReview.plot_rating || selectedReview.plot_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Plot</span>
                          {selectedReview.plot_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.plot_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.plot_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.plot_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.plot_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Characters */}
                    {(selectedReview.characters_rating || selectedReview.character_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Characters</span>
                          {selectedReview.characters_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.characters_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.characters_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.character_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.character_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Concept/Originality */}
                    {(selectedReview.concept_originality_rating || selectedReview.concept_originality_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Concept/Originality</span>
                          {selectedReview.concept_originality_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.concept_originality_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.concept_originality_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.concept_originality_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.concept_originality_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Structure */}
                    {(selectedReview.structure_rating || selectedReview.structure_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Structure</span>
                          {selectedReview.structure_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.structure_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.structure_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.structure_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.structure_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Dialogue */}
                    {(selectedReview.dialogue_rating || selectedReview.dialogue_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Dialogue</span>
                          {selectedReview.dialogue_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.dialogue_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.dialogue_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.dialogue_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.dialogue_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Format/Pacing */}
                    {(selectedReview.format_pacing_rating || selectedReview.format_pacing_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Format/Pacing</span>
                          {selectedReview.format_pacing_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.format_pacing_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.format_pacing_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.format_pacing_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.format_pacing_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Theme/Tone */}
                    {(selectedReview.theme_rating || selectedReview.theme_tone_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Theme/Tone</span>
                          {selectedReview.theme_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.theme_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.theme_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.theme_tone_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.theme_tone_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Catharsis */}
                    {(selectedReview.catharsis_rating || selectedReview.catharsis_notes) && (
                      <div className="border-b border-portfolio-gold/20 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Catharsis</span>
                          {selectedReview.catharsis_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.catharsis_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.catharsis_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.catharsis_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.catharsis_notes}</p>
                        )}
                      </div>
                    )}

                    {/* Production Budget */}
                    {(selectedReview.production_budget_rating || selectedReview.production_budget_notes) && (
                      <div className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-portfolio-gold font-semibold">Production Budget</span>
                          {selectedReview.production_budget_rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-5 h-5 rounded ${
                                    i < selectedReview.production_budget_rating
                                      ? 'bg-portfolio-gold'
                                      : 'bg-portfolio-gold/20'
                                  }`}
                                />
                              ))}
                              <span className="text-portfolio-white ml-2">{selectedReview.production_budget_rating}/5</span>
                            </div>
                          )}
                        </div>
                        {selectedReview.production_budget_notes && (
                          <p className="text-portfolio-white/80 text-sm">{selectedReview.production_budget_notes}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}


              {/* Page Notes */}
              {selectedReview.pageNotes && selectedReview.pageNotes.length > 0 && (
                <Card className="bg-portfolio-black border-portfolio-gold/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-portfolio-gold">Page-by-Page Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedReview.pageNotes.map((note: any) => (
                      <div key={note.id} className="border-l-2 border-portfolio-gold/30 pl-3">
                        <div className="text-portfolio-gold text-sm font-semibold mb-1">
                          Page {note.page_number}
                        </div>
                        <div className="text-portfolio-white/90 whitespace-pre-wrap">
                          {note.note_content}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleSendReviewEmail}
                    disabled={sendingEmail}
                    className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90 text-sm sm:text-base"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{sendingEmail ? 'Preparing Email...' : 'Copy Review Email'}</span>
                    <span className="sm:hidden">{sendingEmail ? 'Preparing...' : 'Copy Email'}</span>
                  </Button>
                  <Button
                    onClick={() => exportRubricToPDF(selectedReview)}
                    className="bg-green-600 text-white hover:bg-green-700 text-sm sm:text-base"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download PDF</span>
                    <span className="sm:hidden">PDF</span>
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="border-portfolio-gold text-portfolio-gold hover:bg-portfolio-gold/10 w-full sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Script</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scriptToDelete?.title || 'this script'}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setScriptToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteScript} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScriptsSection;
