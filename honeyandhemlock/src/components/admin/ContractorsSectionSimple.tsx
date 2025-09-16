import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Trash2, Check, X, Clock, Calendar } from 'lucide-react';

const ContractorsSectionSimple = () => {
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contractorToDelete, setContractorToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchContractors();
  }, []);

  const fetchContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching contractors data...');
      const { data, error } = await supabase
        .from('judges')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Contractors fetch error:', error);
        setError(error.message);
        setContractors([]);
        return;
      }
      
      console.log('Contractors fetched:', data?.length || 0);
      console.log('First contractor:', data?.[0]);
      setContractors(data || []);
    } catch (err: any) {
      console.error('Error fetching contractors:', err);
      setError(err.message || 'Failed to fetch contractors');
      setContractors([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-800">Declined</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Unknown'}</Badge>;
    }
  };

  const handleUpdateStatus = async (contractorId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('judges')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', contractorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Contractor ${newStatus === 'approved' ? 'approved' : newStatus === 'declined' ? 'declined' : 'updated'} successfully`,
      });

      fetchContractors();
    } catch (err: any) {
      console.error('Error updating contractor status:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to update contractor status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContractor = async () => {
    if (!contractorToDelete) return;

    try {
      const { error } = await supabase
        .from('judges')
        .delete()
        .eq('id', contractorToDelete.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setContractorToDelete(null);
      fetchContractors();
    } catch (err: any) {
      console.error('Error deleting contractor:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to delete contractor",
        variant: "destructive"
      });
    }
  };

  const openDeleteDialog = (contractor: any) => {
    setContractorToDelete(contractor);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-portfolio-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-portfolio-gold mx-auto mb-4"></div>
          <p>Loading contractors data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-red-500 mb-4">Error loading contractors:</p>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <Button 
              onClick={fetchContractors}
              className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter contractors based on status
  const filteredContractors = statusFilter === 'all' 
    ? contractors 
    : contractors.filter(c => c.status === statusFilter);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <CardTitle className="text-portfolio-white flex items-center">
            <User className="w-5 h-5 mr-2" />
            Contractors Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-portfolio-white">{contractors.length}</div>
              <div className="text-gray-400 text-xs sm:text-sm mt-1">Total</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-yellow-400">
                {contractors.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm mt-1">Pending</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">
                {contractors.filter(c => c.status === 'approved').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm mt-1">Approved</div>
            </div>
            <div className="bg-[#232323] rounded-lg p-4 text-center">
              <div className="text-2xl sm:text-3xl font-bold text-red-400">
                {contractors.filter(c => c.status === 'declined').length}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm mt-1">Declined</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contractors Table with Filter */}
      <Card className="bg-[#282828] border-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-portfolio-white">Contractor Management</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-500 text-portfolio-white hover:bg-gray-600">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-500">
                <SelectItem value="all">All Contractors</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-6 hidden lg:block">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-400">Name</TableHead>
                <TableHead className="text-gray-400">Email</TableHead>
                <TableHead className="text-gray-400">Status</TableHead>
                <TableHead className="text-gray-400">Created</TableHead>
                <TableHead className="text-gray-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-portfolio-white/60">
                      <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No contractors found</p>
                      <p className="text-sm">Contractors will appear here once registered.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContractors.map((contractor) => (
                  <TableRow 
                    key={contractor.id}
                    className={contractor.status === 'pending' ? 'bg-yellow-500/5' : ''}
                  >
                    <TableCell className="text-portfolio-white">
                      {contractor.name || 'Unnamed'}
                    </TableCell>
                    <TableCell className="text-portfolio-white">
                      {contractor.email || 'No email'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(contractor.status)}
                    </TableCell>
                    <TableCell className="text-portfolio-white">
                      {contractor.created_at ? new Date(contractor.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {contractor.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-600 hover:bg-green-700 text-white border-none"
                              onClick={() => handleUpdateStatus(contractor.id, 'approved')}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-600 hover:bg-red-700 text-white border-none"
                              onClick={() => handleUpdateStatus(contractor.id, 'declined')}
                              title="Decline"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {contractor.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                            onClick={() => handleUpdateStatus(contractor.id, 'pending')}
                            title="Revoke Approval"
                          >
                            <Clock className="w-4 h-4" />
                          </Button>
                        )}
                        {contractor.status === 'declined' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-green-600 hover:bg-green-700 text-white border-none"
                            onClick={() => handleUpdateStatus(contractor.id, 'approved')}
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeleteDialog(contractor)}
                          title="Delete"
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

        {/* Mobile Cards */}
        <CardContent className="p-0 lg:hidden">
          {filteredContractors.length === 0 ? (
            <div className="p-8">
              <div className="text-portfolio-white/60 text-center">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No contractors found</p>
                <p className="text-sm">Contractors will appear here once registered.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {filteredContractors.map((contractor) => (
                <Card
                  key={contractor.id}
                  className={`bg-[#2a2a2a] border ${contractor.status === 'pending' ? 'border-yellow-500/50' : 'border-gray-700'}`}
                >
                  <CardContent className="p-4">
                    {/* Header with Name and Status */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-portfolio-white font-semibold text-base mb-1">
                          {contractor.name || 'Unnamed'}
                        </h3>
                        <p className="text-portfolio-gold text-sm">
                          {contractor.email || 'No email'}
                        </p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(contractor.status)}
                      </div>
                    </div>

                    {/* Contractor Details */}
                    <div className="bg-[#232323] rounded p-3 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {contractor.created_at ? new Date(contractor.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="text-sm text-gray-300">
                        Status: <span className="text-portfolio-white font-medium">{contractor.status}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {contractor.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleUpdateStatus(contractor.id, 'approved')}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleUpdateStatus(contractor.id, 'declined')}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Decline
                          </Button>
                        </>
                      )}
                      {contractor.status === 'approved' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => handleUpdateStatus(contractor.id, 'pending')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Revoke
                        </Button>
                      )}
                      {contractor.status === 'declined' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleUpdateStatus(contractor.id, 'pending')}
                        >
                          <Clock className="w-4 h-4 mr-1" />
                          Reconsider
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(contractor)}
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
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contractor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contractorToDelete?.name || 'this contractor'}"? 
              This action cannot be undone. Any scripts assigned to this contractor will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setContractorToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContractor} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ContractorsSectionSimple;