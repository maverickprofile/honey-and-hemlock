import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PDFViewer from '@/components/contractor/PDFViewer';
import { FileText, AlertCircle, CheckCircle, ChevronLeft } from 'lucide-react';

const ScriptReview = () => {
  const { scriptId } = useParams<{ scriptId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [script, setScript] = useState<any>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/judge');
      return;
    }
    
    if (scriptId) {
      loadScriptAndReview();
    }
  }, [user, scriptId]);

  const loadScriptAndReview = async () => {
    try {
      setLoading(true);
      
      // Fetch script details
      const { data: scriptData, error: scriptError } = await supabase
        .from('scripts')
        .select('*')
        .eq('id', scriptId)
        .single();

      if (scriptError) throw scriptError;
      
      if (!scriptData) {
        toast({
          title: "Script not found",
          description: "The requested script could not be found.",
          variant: "destructive"
        });
        navigate('/contractor-dashboard');
        return;
      }

      setScript(scriptData);

      // Get the judge record for the current user
      let judgeId = null;
      const { data: judgeData } = await supabase
        .from('judges')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (judgeData) {
        judgeId = judgeData.id;
      } else {
        // Try by user_id if email doesn't work
        const { data: judgeByUserId } = await supabase
          .from('judges')
          .select('id')
          .eq('user_id', user?.id)
          .single();
        
        if (judgeByUserId) {
          judgeId = judgeByUserId.id;
        }
      }

      if (!judgeId) {
        toast({
          title: "Error",
          description: "You are not registered as a judge/contractor.",
          variant: "destructive"
        });
        navigate('/contractor-dashboard');
        return;
      }

      // Check if a review already exists for this script and judge
      const { data: existingReview, error: reviewError } = await supabase
        .from('script_reviews')
        .select('*')
        .eq('script_id', scriptId)
        .eq('judge_id', judgeId)
        .single();

      if (existingReview) {
        setReviewId(existingReview.id);
      } else {
        // Create a new review entry
        const { data: newReview, error: createError } = await supabase
          .from('script_reviews')
          .insert({
            script_id: scriptId,
            judge_id: judgeId,
            status: 'in_progress'
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating review:', createError);
          toast({
            title: "Error",
            description: "Failed to create review. Please try again.",
            variant: "destructive"
          });
        } else {
          setReviewId(newReview.id);
        }
      }
    } catch (error) {
      console.error('Error loading script:', error);
      toast({
        title: "Error",
        description: "Failed to load script details.",
        variant: "destructive"
      });
      navigate('/contractor-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewId) {
      toast({
        title: "Error",
        description: "No review found. Please refresh and try again.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // First, get the current review data to check if rubric is filled
      const { data: reviewData, error: fetchError } = await supabase
        .from('script_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (fetchError) throw fetchError;

      // Check if essential fields are filled
      if (!reviewData.title_response || !reviewData.plot_rating || !reviewData.characters_rating) {
        toast({
          title: "Incomplete Review",
          description: "Please complete all required rubric fields before submitting.",
          variant: "destructive"
        });
        setSubmitting(false);
        setShowSubmitDialog(false);
        return;
      }

      // Set status to 'reviewed' to match what the admin dashboard expects
      const recommendation = 'reviewed'; // Mark as reviewed when rubric is submitted

      // Compile all notes into feedback
      const feedback = [
        reviewData.plot_notes && `Plot: ${reviewData.plot_notes}`,
        reviewData.character_notes && `Characters: ${reviewData.character_notes}`,
        reviewData.concept_originality_notes && `Concept/Originality: ${reviewData.concept_originality_notes}`,
        reviewData.structure_notes && `Structure: ${reviewData.structure_notes}`,
        reviewData.dialogue_notes && `Dialogue: ${reviewData.dialogue_notes}`,
        reviewData.format_pacing_notes && `Format/Pacing: ${reviewData.format_pacing_notes}`,
        reviewData.theme_tone_notes && `Theme/Tone: ${reviewData.theme_tone_notes}`,
        reviewData.catharsis_notes && `Catharsis: ${reviewData.catharsis_notes}`,
        reviewData.production_budget_notes && `Production Budget: ${reviewData.production_budget_notes}`
      ].filter(Boolean).join('\n\n');

      // Use the RPC function to submit the review (bypasses RLS and users table issues)
      const { data: submitResult, error: submitError } = await supabase
        .rpc('submit_script_review', {
          p_review_id: reviewId,
          p_recommendation: recommendation,
          p_feedback: feedback,
          p_overall_notes: `Title Response: ${reviewData.title_response}`
        });

      if (submitError) {
        console.error('RPC submit error:', submitError);
        
        // Fallback to direct updates if RPC fails
        const { error: updateError } = await supabase
          .from('script_reviews')
          .update({
            status: 'completed',
            submitted_at: new Date().toISOString(),
            recommendation,
            feedback,
            overall_notes: `Title Response: ${reviewData.title_response}`
          })
          .eq('id', reviewId);

        if (updateError) throw updateError;

        // Update script status to 'reviewed' to match admin dashboard expectations
        const { error: scriptError } = await supabase
          .from('scripts')
          .update({ status: 'reviewed', reviewed_at: new Date().toISOString() })
          .eq('id', scriptId);

        if (scriptError) throw scriptError;
      }

      toast({
        title: "Review Submitted",
        description: "Your review has been successfully submitted.",
      });

      // Navigate back to contractor dashboard
      navigate('/contractor-dashboard');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const handleClosePDFViewer = () => {
    setShowSubmitDialog(true);
  };

  const handleBackToDashboard = () => {
    navigate('/contractor-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-portfolio-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-portfolio-gold mx-auto mb-4"></div>
          <p className="text-portfolio-white">Loading script...</p>
        </div>
      </div>
    );
  }

  if (!script) {
    return (
      <div className="min-h-screen bg-portfolio-black flex items-center justify-center">
        <Card className="bg-portfolio-dark border-portfolio-gold/20 max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-portfolio-gold mx-auto mb-4" />
            <h3 className="text-portfolio-white text-lg font-semibold mb-2">Script Not Found</h3>
            <p className="text-portfolio-white/60 mb-4">The requested script could not be found.</p>
            <Button
              onClick={handleBackToDashboard}
              className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <PDFViewer
        scriptId={script.id}
        scriptTitle={script.title}
        fileUrl={script.file_url}
        reviewId={reviewId || undefined}
        scriptAmount={script.amount}
        tierName={script.tier}
        pageCount={script.page_count}
        onClose={handleClosePDFViewer}
      />

      {/* Submit Review Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-portfolio-dark border-portfolio-gold/20 max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-portfolio-gold text-base sm:text-lg">Submit Review</DialogTitle>
            <DialogDescription className="text-portfolio-white/80 text-sm sm:text-base">
              Are you ready to submit your review for "{script.title}"? Once submitted, you cannot make further changes.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setShowSubmitDialog(false);
                navigate('/contractor-dashboard');
              }}
              className="bg-portfolio-black text-portfolio-white border border-portfolio-white/20 hover:bg-portfolio-white/10 w-full sm:w-auto"
            >
              Save & Exit
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300 w-full sm:w-auto"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScriptReview;