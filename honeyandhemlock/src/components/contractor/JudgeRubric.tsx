import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Save, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JudgeRubricProps {
  scriptTitle: string;
  reviewId: string;
  onComplete: () => void;
  initialData?: {
    title_response?: string;
    plot_rating?: number;
    plot_notes?: string;
    characters_rating?: number;
    character_notes?: string;
  };
}

const JudgeRubric: React.FC<JudgeRubricProps> = ({
  scriptTitle,
  reviewId,
  onComplete,
  initialData = {}
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_response: initialData.title_response || '',
    plot_rating: initialData.plot_rating?.toString() || '',
    plot_notes: initialData.plot_notes || '',
    characters_rating: initialData.characters_rating?.toString() || '',
    character_notes: initialData.character_notes || ''
  });

  // Auto-save functionality
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.values(formData).some(value => value !== '')) {
        saveRubricData();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const saveRubricData = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('script_reviews')
        .update({
          title_response: formData.title_response || null,
          plot_rating: formData.plot_rating ? parseInt(formData.plot_rating) : null,
          plot_notes: formData.plot_notes || null,
          characters_rating: formData.characters_rating ? parseInt(formData.characters_rating) : null,
          character_notes: formData.character_notes || null
        })
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving rubric:', error);
      toast({
        title: "Error",
        description: "Failed to save rubric data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title_response || !formData.plot_rating || !formData.plot_notes || 
        !formData.characters_rating || !formData.character_notes) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields marked with *",
        variant: "destructive"
      });
      return;
    }

    await saveRubricData();
    onComplete();
  };

  const RatingScale = ({ value, onChange, name }: { value: string, onChange: (value: string) => void, name: string }) => (
    <RadioGroup value={value} onValueChange={onChange} className="flex flex-row items-center space-x-6">
      {[1, 2, 3, 4, 5].map((rating) => (
        <div key={rating} className="flex flex-col items-center">
          <RadioGroupItem 
            value={rating.toString()} 
            id={`${name}-${rating}`}
            className="border-portfolio-gold/50 text-portfolio-gold data-[state=checked]:border-portfolio-gold data-[state=checked]:bg-portfolio-gold"
          />
          <Label 
            htmlFor={`${name}-${rating}`} 
            className="text-xs text-portfolio-white/70 mt-1 cursor-pointer"
          >
            {rating}
          </Label>
        </div>
      ))}
      <div className="flex items-center space-x-4 ml-4">
        <span className="text-xs text-portfolio-white/50">Lowest</span>
        <span className="text-xs text-portfolio-white/50">→</span>
        <span className="text-xs text-portfolio-white/50">Highest</span>
      </div>
    </RadioGroup>
  );

  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white p-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <Card className="bg-portfolio-dark border-portfolio-gold/20">
          <CardHeader className="border-b border-portfolio-gold/20">
            <CardTitle className="text-2xl font-special-elite text-portfolio-gold">
              Judging Rubric For {scriptTitle}
            </CardTitle>
            <CardDescription className="text-portfolio-white/70">
              Please fill out all sections of this rubric to evaluate the script
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8 pt-6">
            {/* Title Section */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-portfolio-white">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title_response}
                onChange={(e) => setFormData(prev => ({ ...prev, title_response: e.target.value }))}
                placeholder="Short answer text"
                className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30"
                required
              />
            </div>

            {/* Plot Rating Section */}
            <div className="space-y-4">
              <Label className="text-portfolio-white text-lg">
                PLOT <span className="text-red-500">*</span>
              </Label>
              <RatingScale 
                value={formData.plot_rating} 
                onChange={(value) => setFormData(prev => ({ ...prev, plot_rating: value }))}
                name="plot"
              />
            </div>

            {/* Plot Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="plot-notes" className="text-portfolio-white text-lg">
                PLOT NOTES <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-portfolio-white/60">
                Do the events of the story contain conflict, logic, and flow? Are the developments organic yet also surprising? 
                Do you get the feeling of one event leading into another?
              </p>
              <Textarea
                id="plot-notes"
                value={formData.plot_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, plot_notes: e.target.value }))}
                placeholder="Short answer text"
                className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
                required
              />
            </div>

            {/* Characters Rating Section */}
            <div className="space-y-4">
              <Label className="text-portfolio-white text-lg">
                CHARACTERS <span className="text-red-500">*</span>
              </Label>
              <RatingScale 
                value={formData.characters_rating} 
                onChange={(value) => setFormData(prev => ({ ...prev, characters_rating: value }))}
                name="characters"
              />
            </div>

            {/* Character Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="character-notes" className="text-portfolio-white text-lg">
                CHARACTER NOTES <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-portfolio-white/60">
                Are the characters authentic and unique? Do they have a satisfying arc? Do the characters feel realistic and believable? 
                Do their emotions feel honest, sincere, and earned? Are they distinct from one another? Without necessarily being likable, 
                are the characters interesting, specific, detailed, and do they hold the reader's attention?
              </p>
              <Textarea
                id="character-notes"
                value={formData.character_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, character_notes: e.target.value }))}
                placeholder="Short answer text"
                className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[150px]"
                required
              />
            </div>

            {/* Submit Section */}
            <div className="flex justify-between items-center pt-6 border-t border-portfolio-gold/20">
              <div className="text-sm text-portfolio-white/50">
                {saving && (
                  <span className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Auto-saving...
                  </span>
                )}
              </div>
              <Button
                type="submit"
                className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
                disabled={saving}
              >
                Continue to Final Review
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default JudgeRubric;