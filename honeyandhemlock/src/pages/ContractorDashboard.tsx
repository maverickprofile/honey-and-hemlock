import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download, Send } from 'lucide-react';
import PDFViewer from '@/components/contractor/PDFViewer';

interface Script {
  id: string;
  title: string;
  author_name: string;
  submitted_at: string;
  status: string;
  file_url?: string;
  page_count?: number;
  user_email?: string;
  amount?: number;
  tier_id?: string;
  tier_name?: string;
}

interface Review {
  id: string;
  script_id: string;
  status: string;
  overall_notes?: string;
  feedback?: string;
  recommendation?: string;
  title_response?: string;
  plot_rating?: number;
  plot_notes?: string;
  characters_rating?: number;
  character_notes?: string;
}

const ContractorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingScript, setViewingScript] = useState<Script | null>(null);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [overallNotes, setOverallNotes] = useState('');
  const [recommendation, setRecommendation] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Only redirect if user is truly not logged in and not viewing a script
    if (!user && !viewingScript) {
      // Check localStorage for contractor session before redirecting
      const contractorSession = localStorage.getItem('contractor_session');
      if (!contractorSession) {
        navigate('/contractor');
        return;
      }
    }
    
    if (user) {
      fetchAssignedScripts();
    }
  }, [user, navigate, viewingScript]);

  const fetchAssignedScripts = async () => {
    try {
      // First check if user is a valid contractor/judge
      const { data: judgeData, error: judgeError } = await supabase
        .from('judges')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (judgeError || !judgeData) {
        console.error('User is not a registered contractor:', judgeError);
        toast({
          title: "Access Denied",
          description: "You are not registered as a contractor",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if contractor is approved
      if (judgeData.status !== 'approved') {
        toast({
          title: "Pending Approval",
          description: "Your contractor account is pending admin approval",
          variant: "destructive"
        });
        setScripts([]);
        setLoading(false);
        return;
      }

      // Fetch assigned scripts with file URLs
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('assigned_judge_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scripts:', error);
        throw error;
      }
      
      setScripts(data || []);
    } catch (error: any) {
      console.error('Error fetching scripts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assigned scripts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const startReview = async (script: Script) => {
    try {
      // Check if a review already exists
      const { data: existingReview } = await supabase
        .from('script_reviews')
        .select('*')
        .eq('script_id', script.id)
        .eq('judge_id', user?.id)
        .single();

      if (existingReview) {
        setCurrentReview(existingReview);
        setOverallNotes(existingReview.overall_notes || '');
        setRecommendation(existingReview.recommendation || '');
      } else {
        // Create a new review
        const { data: newReview, error } = await supabase
          .from('script_reviews')
          .insert({
            script_id: script.id,
            judge_id: user?.id,
            status: 'in_progress'
          })
          .select()
          .single();

        if (error) throw error;
        setCurrentReview(newReview);
      }

      // Get the file URL from Supabase storage
      if (script.file_url) {
        let fileUrl = script.file_url;
        
        // Check if it's a Word document
        if (fileUrl.endsWith('.docx') || fileUrl.endsWith('.doc')) {
          toast({
            title: "Unsupported File Type",
            description: "This script is a Word document. Please upload PDF files for review. Using a sample PDF instead.",
            variant: "destructive"
          });
          
          // Use sample PDF for non-PDF files
          fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          
          setViewingScript({
            ...script,
            file_url: fileUrl
          });
        } else if (fileUrl.startsWith('http')) {
          // It's a valid URL, use it directly
          setViewingScript({
            ...script,
            file_url: fileUrl
          });
        } else if (fileUrl.startsWith('/')) {
          // It's a test URL, use sample PDF
          fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          
          toast({
            title: "Using Sample PDF",
            description: "This is a test script. Loading a sample PDF.",
          });
          
          setViewingScript({
            ...script,
            file_url: fileUrl
          });
        } else {
          // It's a relative URL, assume it's a storage path
          setViewingScript({
            ...script,
            file_url: script.file_url
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Script file not found",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error starting review:', error);
      toast({
        title: "Error",
        description: "Failed to start review",
        variant: "destructive"
      });
    }
  };

  const downloadScript = async (script: Script) => {
    try {
      if (!script.file_url) {
        toast({
          title: "Error",
          description: "Script file not found",
          variant: "destructive"
        });
        return;
      }

      // Check if it's a Supabase storage URL
      if (script.file_url.startsWith('https://zknmzaowomihtrtqleon.supabase.co/storage/')) {
        // It's already a public URL, just open it
        window.open(script.file_url, '_blank');
        
        toast({
          title: "Download started",
          description: "Your script is being downloaded",
        });
        return;
      }
      
      // For test URLs
      if (script.file_url.startsWith('/')) {
        // Use a sample PDF for testing
        const samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        window.open(samplePdfUrl, '_blank');
        
        toast({
          title: "Sample Download",
          description: "This is a test script. Downloading a sample PDF.",
        });
        return;
      }

      // For other URLs, open directly
      if (script.file_url.startsWith('http')) {
        window.open(script.file_url, '_blank');
        
        toast({
          title: "Download started",
          description: "Your script is being downloaded",
        });
      }
    } catch (error) {
      console.error('Error downloading script:', error);
      toast({
        title: "Error",
        description: "Failed to download script",
        variant: "destructive"
      });
    }
  };

  const submitReview = async () => {
    if (!currentReview || !recommendation) {
      toast({
        title: "Missing Information",
        description: "Please provide a recommendation",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Get all page notes for this review
      const { data: pageNotes } = await supabase
        .from('script_page_notes')
        .select('*')
        .eq('script_review_id', currentReview.id)
        .order('page_number');
      
      // Get the current rubric data
      const { data: reviewData } = await supabase
        .from('script_reviews')
        .select('title_response, plot_rating, plot_notes, characters_rating, character_notes')
        .eq('id', currentReview.id)
        .single();

      // Compile comprehensive feedback including rubric
      const compiledFeedback = `JUDGE'S RUBRIC EVALUATION:
      
Title Response: ${reviewData?.title_response || 'Not provided'}

Plot Rating: ${reviewData?.plot_rating || 'Not rated'}/5
Plot Notes: ${reviewData?.plot_notes || 'Not provided'}

Characters Rating: ${reviewData?.characters_rating || 'Not rated'}/5
Character Notes: ${reviewData?.character_notes || 'Not provided'}

OVERALL ASSESSMENT:
${overallNotes}

PAGE-BY-PAGE NOTES:
${pageNotes?.map(note => `Page ${note.page_number}: ${note.note_content}`).join('\n\n') || 'No page notes'}`;

      // Update the review with final details
      const { error: reviewError } = await supabase
        .from('script_reviews')
        .update({
          overall_notes: overallNotes,
          feedback: compiledFeedback,
          recommendation: recommendation,
          status: 'completed'
        })
        .eq('id', currentReview.id);

      if (reviewError) throw reviewError;

      // Update script status - set to 'reviewed' when review is submitted
      // Keep approved/declined for backward compatibility but default to 'reviewed'
      let newStatus = 'reviewed';
      if (recommendation === 'approved') {
        newStatus = 'approved';
      } else if (recommendation === 'declined') {
        newStatus = 'declined';
      }
      
      const { error: scriptError } = await supabase
        .from('scripts')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', currentReview.script_id);

      if (scriptError) throw scriptError;

      toast({
        title: "Review Submitted",
        description: "Your review has been submitted successfully",
      });

      // Reset state
      setViewingScript(null);
      setCurrentReview(null);
      setOverallNotes('');
      setRecommendation('');
      setShowSubmitDialog(false);
      fetchAssignedScripts();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-portfolio-black flex items-center justify-center">
        <div className="text-portfolio-white">Loading...</div>
      </div>
    );
  }

  // If viewing a script, show the PDF viewer with integrated rubric
  if (viewingScript && currentReview) {
    return (
      <>
        <PDFViewer
          scriptId={viewingScript.id}
          scriptTitle={viewingScript.title}
          fileUrl={viewingScript.file_url || ''}
          reviewId={currentReview.id}
          scriptAmount={viewingScript.amount}
          tierName={viewingScript.tier_name}
          pageCount={viewingScript.page_count}
          onClose={() => {
            // Close PDF viewer and show submit dialog
            setViewingScript(null);
            setCurrentReview(currentReview); // Preserve the review
            setShowSubmitDialog(true);
            // Refresh scripts list to show updated status
            fetchAssignedScripts();
          }}
        />
        
        {/* Submit Review Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="bg-portfolio-dark border-portfolio-gold/20 text-portfolio-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-portfolio-gold">Submit Review</DialogTitle>
              <DialogDescription className="text-portfolio-white/70">
                Provide your overall assessment and recommendation for this script.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <label className="text-portfolio-white text-sm font-medium">Overall Notes</label>
                <Textarea
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  placeholder="Provide your overall assessment of the script..."
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white min-h-[150px] mt-2"
                />
              </div>
              
              <div>
                <label className="text-portfolio-white text-sm font-medium">Recommendation</label>
                <Select value={recommendation} onValueChange={setRecommendation}>
                  <SelectTrigger className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white mt-2">
                    <SelectValue placeholder="Select your recommendation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="declined">Decline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSubmitDialog(false);
                  setViewingScript(null);
                  setCurrentReview(null);
                }}
                className="border-gray-600"
              >
                Cancel Review
              </Button>
              <Button
                onClick={submitReview}
                disabled={submitting || !recommendation}
                className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-special-elite text-3xl font-semibold text-portfolio-gold">Contractor Dashboard</h1>
            <p className="text-portfolio-white/70">Welcome back, {user?.user_metadata?.name || user?.email}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-portfolio-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Scripts List */}
        <Card className="bg-portfolio-dark border-portfolio-gold/20">
          <CardHeader>
            <CardTitle className="text-portfolio-gold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assigned Scripts ({scripts.length})
            </CardTitle>
            <CardDescription className="text-portfolio-white/70">
              Review Process: 1) View PDF & add page notes → 2) Fill Judge's Rubric → 3) Submit final review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scripts.length > 0 ? (
              <div className="space-y-4">
                {scripts.map((script) => (
                  <div key={script.id} className="p-4 bg-portfolio-black rounded border border-portfolio-gold/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-portfolio-white text-lg">{script.title}</h3>
                        <p className="text-sm text-portfolio-white/60">by {script.author_name}</p>
                        <p className="text-xs text-portfolio-white/50 mt-1">
                          Submitted: {new Date(script.submitted_at).toLocaleDateString()}
                        </p>
                        {script.page_count && (
                          <p className="text-xs text-portfolio-white/50">
                            Pages: {script.page_count}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(script.status)}
                        <span className="text-xs capitalize text-portfolio-white">{script.status}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button
                        onClick={() => startReview(script)}
                        size="sm"
                        className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View & Review
                      </Button>
                      <Button
                        onClick={() => downloadScript(script)}
                        size="sm"
                        variant="outline"
                        className="text-black border-portfolio-gold/30 hover:text-black"
                      >
                        <Download className="w-4 h-4 mr-2 text-black" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-portfolio-white/30 mx-auto mb-4" />
                <p className="text-portfolio-white/60">No scripts assigned yet</p>
                <p className="text-portfolio-white/40 text-sm mt-2">
                  Scripts will appear here once the admin assigns them to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorDashboard;