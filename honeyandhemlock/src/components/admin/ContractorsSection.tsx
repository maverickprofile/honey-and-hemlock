import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Clock, Award, CheckCircle, FileText, Star, Plus, Minus, Target, Zap, TrendingUp, BookOpen, Trash2 } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  content?: string;
  tier: 1 | 2 | 3;
}

interface RubricCriteria {
  name: string;
  description: string;
  score: number;
  maxScore: number;
  notes: string;
}

interface PageNote {
  pageNumber: number;
  note: string;
}

const ContractorsSection = () => {
  const [contractors, setContractors] = useState<any[]>([]);
  const [scripts, setScripts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Review functionality states
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [activeTab, setActiveTab] = useState("management");
  const [overallNotes, setOverallNotes] = useState("");
  const [pageNotes, setPageNotes] = useState<PageNote[]>([]);

  // Sample scripts for review demonstration
  const [reviewScripts] = useState<Script[]>([
    { id: "1", title: "The Last Stand", author: "John Smith", pageCount: 120, tier: 1 },
    { id: "2", title: "Midnight Runner", author: "Jane Doe", pageCount: 95, tier: 2 },
    { id: "3", title: "Silent Waters", author: "Mike Johnson", pageCount: 110, tier: 3 },
  ]);

  // Tier 1 Rubric - Simple scoring
  const [tier1Rubric, setTier1Rubric] = useState<RubricCriteria[]>([
    { name: "Story Structure", description: "Three-act structure, pacing, plot development", score: 7, maxScore: 10, notes: "" },
    { name: "Character Development", description: "Character arcs, dialogue, believability", score: 8, maxScore: 10, notes: "" },
    { name: "Dialogue", description: "Natural flow, character voice, subtext", score: 6, maxScore: 10, notes: "" },
    { name: "Visual Storytelling", description: "Scene description, action lines, visual elements", score: 7, maxScore: 10, notes: "" },
    { name: "Format & Presentation", description: "Industry standard formatting, readability", score: 9, maxScore: 10, notes: "" }
  ]);

  // Tier 2 Rubric - More detailed
  const [tier2Rubric, setTier2Rubric] = useState<RubricCriteria[]>([
    { name: "Premise & Concept", description: "Originality, marketability, hook strength", score: 7, maxScore: 10, notes: "" },
    { name: "Story Structure", description: "Three-act structure, pacing, plot points", score: 8, maxScore: 10, notes: "" },
    { name: "Character Development", description: "Protagonist journey, supporting characters", score: 6, maxScore: 10, notes: "" },
    { name: "Dialogue", description: "Authenticity, subtext, character differentiation", score: 7, maxScore: 10, notes: "" },
    { name: "Theme & Message", description: "Thematic depth, resonance, clarity", score: 6, maxScore: 10, notes: "" },
    { name: "Visual Storytelling", description: "Cinematic quality, scene craft", score: 8, maxScore: 10, notes: "" },
    { name: "Genre Execution", description: "Genre conventions, audience expectations", score: 7, maxScore: 10, notes: "" },
    { name: "Format & Craft", description: "Professional presentation, technical execution", score: 9, maxScore: 10, notes: "" }
  ]);

  // Tier 3 Rubric - Comprehensive
  const [tier3Rubric, setTier3Rubric] = useState<RubricCriteria[]>([
    { name: "Logline & Premise", description: "Hook, clarity, marketability potential", score: 7, maxScore: 10, notes: "" },
    { name: "Opening Pages", description: "Hook effectiveness, world establishment", score: 8, maxScore: 10, notes: "" },
    { name: "Act I Structure", description: "Setup, inciting incident, plot point 1", score: 7, maxScore: 10, notes: "" },
    { name: "Act II Development", description: "Rising action, obstacles, midpoint", score: 6, maxScore: 10, notes: "" },
    { name: "Act III Resolution", description: "Climax, resolution, satisfaction", score: 7, maxScore: 10, notes: "" },
    { name: "Character Arc", description: "Protagonist growth, supporting cast", score: 8, maxScore: 10, notes: "" },
    { name: "Dialogue Quality", description: "Voice, subtext, naturalism", score: 6, maxScore: 10, notes: "" },
    { name: "Scene Construction", description: "Purpose, conflict, transitions", score: 7, maxScore: 10, notes: "" },
    { name: "Visual Writing", description: "Cinematic prose, action description", score: 8, maxScore: 10, notes: "" },
    { name: "Theme Integration", description: "Thematic coherence and depth", score: 6, maxScore: 10, notes: "" },
    { name: "Genre Mastery", description: "Convention handling, innovation", score: 7, maxScore: 10, notes: "" },
    { name: "Market Readiness", description: "Commercial viability, production considerations", score: 7, maxScore: 10, notes: "" }
  ]);

  useEffect(() => {
    fetchContractors();
    fetchScripts();
  }, []);

  const fetchContractors = async () => {
    try {
      console.log('Fetching judges/contractors data...');
      const { data, error } = await supabase
        .from('judges')  // Using judges table as it hasn't been renamed yet
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Contractors fetch error:', error);
        // Show error but don't crash
        setContractors([]);
        toast({
          title: "Database Error",
          description: `Failed to fetch contractors: ${error.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }
      
      console.log('Contractors fetched:', data?.length || 0);
      console.log('Contractors data:', data);
      setContractors(data || []);
    } catch (error: any) {
      console.error('Error fetching contractors:', error);
      setContractors([]);
      setError(error.message || 'Failed to fetch contractors');
      toast({
        title: "Error",
        description: "Failed to fetch contractors. Check console for details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchScripts = async () => {
    try {
      console.log('Fetching scripts data...');
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Scripts fetch error:', error);
        setScripts([]);
        return;
      }
      
      console.log('Scripts fetched:', data?.length || 0);
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      setScripts([]);
    } finally {
      setLoading(false);
    }
  };

  const assignScript = async (scriptId: string, contractorId: string) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .update({ 
          assigned_judge_id: contractorId,  // Using judge_id as table hasn't been renamed
          status: 'assigned'
        })
        .eq('id', scriptId);

      if (error) throw error;

      // Log the activity (if function exists)
      try {
        await supabase.rpc('log_activity', {
          p_activity_type: 'assignment',
          p_description: `Script assigned to judge/contractor`,
          p_script_id: scriptId,
          p_judge_id: contractorId  // Using judge_id parameter
        });
      } catch (logError) {
        console.log('Activity logging not available:', logError);
        // Continue without logging - not critical
      }

      toast({
        title: "Success",
        description: "Script assigned successfully",
      });

      fetchScripts();
      fetchContractors();
    } catch (error) {
      console.error('Error assigning script:', error);
      toast({
        title: "Error",
        description: "Failed to assign script",
        variant: "destructive"
      });
    }
  };

  const handleDeleteContractor = async (contractorId: string) => {
    try {
      // Check if admin session exists
      const adminSession = localStorage.getItem('admin_session');
      if (!adminSession) {
        toast({
          title: "Authentication Required",
          description: "Please log in as admin to perform this action",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('judges')
        .delete()
        .eq('id', contractorId);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Contractor deleted successfully",
      });

      fetchContractors();
    } catch (error: any) {
      console.error('Error deleting contractor:', error);
      toast({
        title: "Error",
        description: "Failed to delete contractor. Please ensure the database migration has been run.",
        variant: "destructive"
      });
    }
  };

  const handleApproveContractor = async (contractorId: string) => {
    try {
      const { error } = await supabase
        .from('judges')
        .update({ status: 'approved' })
        .eq('id', contractorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contractor approved successfully",
      });

      fetchContractors();
    } catch (error: any) {
      console.error('Error approving contractor:', error);
      toast({
        title: "Error",
        description: "Failed to approve contractor",
        variant: "destructive"
      });
    }
  };

  const updateRubricScore = (tier: number, index: number, score: number) => {
    if (tier === 1) {
      const updated = [...tier1Rubric];
      updated[index].score = score;
      setTier1Rubric(updated);
    } else if (tier === 2) {
      const updated = [...tier2Rubric];
      updated[index].score = score;
      setTier2Rubric(updated);
    } else if (tier === 3) {
      const updated = [...tier3Rubric];
      updated[index].score = score;
      setTier3Rubric(updated);
    }
  };

  const updateRubricNotes = (tier: number, index: number, notes: string) => {
    if (tier === 1) {
      const updated = [...tier1Rubric];
      updated[index].notes = notes;
      setTier1Rubric(updated);
    } else if (tier === 2) {
      const updated = [...tier2Rubric];
      updated[index].notes = notes;
      setTier2Rubric(updated);
    } else if (tier === 3) {
      const updated = [...tier3Rubric];
      updated[index].notes = notes;
      setTier3Rubric(updated);
    }
  };

  const addPageNote = () => {
    if (selectedScript) {
      setPageNotes([...pageNotes, { pageNumber: 1, note: "" }]);
    }
  };

  const updatePageNote = (index: number, field: 'pageNumber' | 'note', value: string | number) => {
    const updated = [...pageNotes];
    updated[index][field] = value as any;
    setPageNotes(updated);
  };

  const removePageNote = (index: number) => {
    setPageNotes(pageNotes.filter((_, i) => i !== index));
  };

  const calculateTotalScore = (rubric: RubricCriteria[]) => {
    const totalScore = rubric.reduce((sum, criteria) => sum + criteria.score, 0);
    const maxPossible = rubric.reduce((sum, criteria) => sum + criteria.maxScore, 0);
    return { totalScore, maxPossible, percentage: Math.round((totalScore / maxPossible) * 100) };
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
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
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

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-portfolio-white text-center">
          <p className="text-red-500 mb-4">Error loading contractors section</p>
          <p className="text-sm text-gray-400">{error}</p>
          <Button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchContractors();
              fetchScripts();
            }}
            className="mt-4 bg-portfolio-gold text-black"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // RubricForm Component
  const RubricForm = ({ rubric, tier, title }: { rubric: RubricCriteria[], tier: number, title: string }) => {
    const scores = calculateTotalScore(rubric);
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-special-elite text-xl text-portfolio-gold">{title}</h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-portfolio-gold">
              {scores.totalScore}/{scores.maxPossible}
            </div>
            <div className="text-sm text-portfolio-white/70">
              {scores.percentage}%
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {rubric.map((criteria, index) => (
            <Card key={index} className="bg-portfolio-dark border-portfolio-gold/30 hover:border-portfolio-gold/60 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-portfolio-white">{criteria.name}</h4>
                    <p className="text-sm text-portfolio-white/70">{criteria.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Star className="w-4 h-4 text-portfolio-gold" />
                    <span className="text-portfolio-gold font-semibold">
                      {criteria.score}/{criteria.maxScore}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-portfolio-white/80 mb-2 block">Score</label>
                    <Slider
                      value={[criteria.score]}
                      onValueChange={(value) => updateRubricScore(tier, index, value[0])}
                      max={criteria.maxScore}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm text-portfolio-white/80 mb-2 block">Notes</label>
                    <Textarea
                      value={criteria.notes}
                      onChange={(e) => updateRubricNotes(tier, index, e.target.value)}
                      placeholder="Add specific feedback for this criteria..."
                      className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white min-h-[80px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Notes Section */}
        <Card className="bg-portfolio-dark border-portfolio-gold/30">
          <CardHeader>
            <CardTitle className="text-portfolio-gold">Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder={`Provide overall feedback based on page count (${selectedScript?.pageCount || 0} pages)...`}
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white min-h-[120px]"
            />
          </CardContent>
        </Card>

        {/* Tier 3 Page-by-Page Notes */}
        {tier === 3 && (
          <Card className="bg-portfolio-dark border-portfolio-gold/30">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-portfolio-gold">Page-by-Page Notes</CardTitle>
                <Button 
                  onClick={addPageNote}
                  size="sm"
                  className="bg-portfolio-gold text-portfolio-black hover:bg-portfolio-gold/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {pageNotes.length > 0 ? (
                <div className="space-y-4">
                  {pageNotes.map((note, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-portfolio-black rounded border border-portfolio-gold/20">
                      <div className="w-20">
                        <label className="text-xs text-portfolio-white/70 block mb-1">Page</label>
                        <Input
                          type="number"
                          min={1}
                          max={selectedScript?.pageCount || 200}
                          value={note.pageNumber}
                          onChange={(e) => updatePageNote(index, 'pageNumber', parseInt(e.target.value))}
                          className="bg-portfolio-dark border-portfolio-gold/30 text-portfolio-white"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-portfolio-white/70 block mb-1">Note</label>
                        <Textarea
                          value={note.note}
                          onChange={(e) => updatePageNote(index, 'note', e.target.value)}
                          placeholder="Add specific note for this page..."
                          className="bg-portfolio-dark border-portfolio-gold/30 text-portfolio-white min-h-[80px]"
                        />
                      </div>
                      <Button
                        onClick={() => removePageNote(index)}
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-6"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-portfolio-white/60 text-center py-4">
                  No page notes added yet. Click "Add Note" to provide page-specific feedback.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            className="border-portfolio-gold/50 text-portfolio-gold hover:bg-portfolio-gold/10"
          >
            Save Draft
          </Button>
          <Button
            className="bg-portfolio-gold text-portfolio-black hover:bg-portfolio-gold/90"
          >
            Submit Review
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-portfolio-black">
          <TabsTrigger value="management" className="data-[state=active]:bg-portfolio-gold data-[state=active]:text-black">
            Contractor Management
          </TabsTrigger>
          <TabsTrigger value="review" className="data-[state=active]:bg-portfolio-gold data-[state=active]:text-black">
            Script Review Panel
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="space-y-6">
          {/* Contractors Overview */}
          <Card className="bg-[#282828] border-none">
            <CardHeader>
              <CardTitle className="text-portfolio-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Contractors Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-portfolio-white">{contractors.length}</div>
                  <div className="text-gray-400">Total Contractors</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#FFD62F]">
                    {contractors.filter(c => c.status === 'approved' || c.availability === 'available').length}
                  </div>
                  <div className="text-gray-400">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">
                    {contractors.reduce((sum, c) => sum + (c.total_scripts_reviewed || 0), 0)}
                  </div>
                  <div className="text-gray-400">Total Reviews</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contractors Table */}
          <Card className="bg-[#282828] border-none">
            <CardHeader>
              <CardTitle className="text-portfolio-white">Contractor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Email</TableHead>
                    <TableHead className="text-gray-400">Specialization</TableHead>
                    <TableHead className="text-gray-400">Current Workload</TableHead>
                    <TableHead className="text-gray-400">Reviews Completed</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contractors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-portfolio-white/60">
                          <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p className="text-lg mb-2">No contractors found</p>
                          <p className="text-sm">Contractors will appear here once they are registered and approved.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    contractors.map((contractor) => (
                      <TableRow key={contractor.id}>
                        <TableCell className="text-portfolio-white">{contractor.name || 'N/A'}</TableCell>
                        <TableCell className="text-portfolio-white">{contractor.email || 'N/A'}</TableCell>
                        <TableCell className="text-portfolio-white">{contractor.specialization || 'General'}</TableCell>
                        <TableCell className="text-portfolio-white">{contractor.current_workload || 0}</TableCell>
                        <TableCell className="text-portfolio-white">{contractor.total_scripts_reviewed || 0}</TableCell>
                        <TableCell>{getStatusBadge(contractor.status || 'pending')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {contractor.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => handleApproveContractor(contractor.id)}
                              >
                                Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteContractor(contractor.id)}
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
            </CardContent>
          </Card>

          {/* Script Assignment */}
          <Card className="bg-[#282828] border-none">
            <CardHeader>
              <CardTitle className="text-portfolio-white">Script Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scripts.filter(s => s.status === 'pending').length === 0 ? (
                  <div className="text-center py-8 text-portfolio-white/60">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">No pending scripts</p>
                    <p className="text-sm">Scripts awaiting assignment will appear here.</p>
                  </div>
                ) : (
                  scripts.filter(s => s.status === 'pending').map((script) => (
                    <div key={script.id} className="flex items-center justify-between p-4 bg-[#232323] rounded">
                      <div>
                        <h3 className="text-portfolio-white font-semibold">{script.title || 'Untitled'}</h3>
                        <p className="text-gray-400">by {script.author_name || 'Unknown Author'}</p>
                        <p className="text-sm text-gray-500">
                          Tier: {script.tier_name || 'N/A'} | Amount: ${(script.amount || 0) / 100}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select onValueChange={(contractorId) => assignScript(script.id, contractorId)}>
                          <SelectTrigger className="w-[180px] bg-[#282828] text-portfolio-white">
                            <SelectValue placeholder="Assign to contractor" />
                          </SelectTrigger>
                          <SelectContent>
                            {contractors.filter(c => c.status === 'approved').length === 0 ? (
                              <SelectItem value="" disabled>No approved contractors available</SelectItem>
                            ) : (
                              contractors.filter(c => c.status === 'approved').map((contractor) => (
                                <SelectItem key={contractor.id} value={contractor.id}>
                                  {contractor.name} ({contractor.current_workload || 0} active)
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-portfolio-gold/20 border border-portfolio-gold/30 backdrop-blur-sm">
                <Target className="w-8 h-8 text-portfolio-gold" />
              </div>
            </div>
            <h2 className="font-special-elite text-2xl md:text-3xl font-semibold mb-4 text-portfolio-gold">
              Script Review Panel
            </h2>
            <p className="font-special-elite text-base text-portfolio-white/80 max-w-2xl mx-auto leading-relaxed">
              Professional script evaluation system with tier-based review criteria for comprehensive feedback.
            </p>
          </div>

          {/* Script Selection */}
          <Card className="bg-portfolio-dark border-portfolio-gold/30 mb-8">
            <CardHeader>
              <CardTitle className="text-portfolio-gold flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Select Script for Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviewScripts.map((script) => (
                  <Card 
                    key={script.id}
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedScript?.id === script.id 
                        ? 'bg-portfolio-gold/20 border-portfolio-gold shadow-lg' 
                        : 'bg-portfolio-black border-portfolio-gold/30 hover:border-portfolio-gold/60'
                    }`}
                    onClick={() => setSelectedScript(script)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-portfolio-white">{script.title}</h3>
                        <Badge className="bg-portfolio-gold/20 text-portfolio-gold">
                          Tier {script.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-portfolio-white/70">by {script.author}</p>
                      <p className="text-xs text-portfolio-white/50 flex items-center mt-2">
                        <BookOpen className="w-3 h-3 mr-1" />
                        {script.pageCount} pages
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Interface */}
          {selectedScript && (
            <Card className="bg-portfolio-dark border-portfolio-gold/30">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-portfolio-gold">{selectedScript.title}</CardTitle>
                    <p className="text-portfolio-white/70">
                      by {selectedScript.author} • {selectedScript.pageCount} pages • Tier {selectedScript.tier} Review
                    </p>
                  </div>
                  <Badge className="bg-portfolio-gold text-portfolio-black">
                    Tier {selectedScript.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={`tier${selectedScript.tier}`} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-portfolio-black">
                    <TabsTrigger 
                      value="tier1" 
                      className={`${selectedScript.tier === 1 ? 'data-[state=active]:bg-portfolio-gold data-[state=active]:text-black' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={selectedScript.tier !== 1}
                    >
                      Tier 1 - Basic Review
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tier2"
                      className={`${selectedScript.tier === 2 ? 'data-[state=active]:bg-portfolio-gold data-[state=active]:text-black' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={selectedScript.tier !== 2}
                    >
                      Tier 2 - Standard Review
                    </TabsTrigger>
                    <TabsTrigger 
                      value="tier3"
                      className={`${selectedScript.tier === 3 ? 'data-[state=active]:bg-portfolio-gold data-[state=active]:text-black' : 'opacity-50 cursor-not-allowed'}`}
                      disabled={selectedScript.tier !== 3}
                    >
                      Tier 3 - Comprehensive Review
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="tier1" className="mt-6">
                    <RubricForm rubric={tier1Rubric} tier={1} title="Basic Script Review" />
                  </TabsContent>
                  
                  <TabsContent value="tier2" className="mt-6">
                    <RubricForm rubric={tier2Rubric} tier={2} title="Standard Script Review" />
                  </TabsContent>
                  
                  <TabsContent value="tier3" className="mt-6">
                    <RubricForm rubric={tier3Rubric} tier={3} title="Comprehensive Script Review" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractorsSection;