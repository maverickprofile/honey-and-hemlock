import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface JudgeRubricFormProps {
  scriptTitle: string;
  reviewId: string;
}

const JudgeRubricForm: React.FC<JudgeRubricFormProps> = ({
  scriptTitle,
  reviewId
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_response: '',
    plot_rating: '',
    plot_notes: '',
    characters_rating: '',
    character_notes: '',
    concept_originality_rating: '',
    concept_originality_notes: '',
    structure_rating: '',
    structure_notes: '',
    dialogue_rating: '',
    dialogue_notes: '',
    format_pacing_rating: '',
    format_pacing_notes: '',
    theme_rating: '',
    theme_tone_notes: '',
    catharsis_rating: '',
    catharsis_notes: '',
    production_budget_rating: '',
    production_budget_notes: ''
  });

  // Load existing rubric data
  useEffect(() => {
    loadExistingRubricData();
  }, [reviewId]);

  const loadExistingRubricData = async () => {
    try {
      const { data, error } = await supabase
        .from('script_reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title_response: data.title_response || '',
          plot_rating: data.plot_rating?.toString() || '',
          plot_notes: data.plot_notes || '',
          characters_rating: data.characters_rating?.toString() || '',
          character_notes: data.character_notes || '',
          concept_originality_rating: data.concept_originality_rating?.toString() || '',
          concept_originality_notes: data.concept_originality_notes || '',
          structure_rating: data.structure_rating?.toString() || '',
          structure_notes: data.structure_notes || '',
          dialogue_rating: data.dialogue_rating?.toString() || '',
          dialogue_notes: data.dialogue_notes || '',
          format_pacing_rating: data.format_pacing_rating?.toString() || '',
          format_pacing_notes: data.format_pacing_notes || '',
          theme_rating: data.theme_rating?.toString() || '',
          theme_tone_notes: data.theme_tone_notes || '',
          catharsis_rating: data.catharsis_rating?.toString() || '',
          catharsis_notes: data.catharsis_notes || '',
          production_budget_rating: data.production_budget_rating?.toString() || '',
          production_budget_notes: data.production_budget_notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading rubric data:', error);
    }
  };

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
      const updateData: any = {
        title_response: formData.title_response || null,
        plot_rating: formData.plot_rating ? parseInt(formData.plot_rating) : null,
        plot_notes: formData.plot_notes || null,
        characters_rating: formData.characters_rating ? parseInt(formData.characters_rating) : null,
        character_notes: formData.character_notes || null,
        concept_originality_rating: formData.concept_originality_rating ? parseInt(formData.concept_originality_rating) : null,
        concept_originality_notes: formData.concept_originality_notes || null,
        structure_rating: formData.structure_rating ? parseInt(formData.structure_rating) : null,
        structure_notes: formData.structure_notes || null,
        dialogue_rating: formData.dialogue_rating ? parseInt(formData.dialogue_rating) : null,
        dialogue_notes: formData.dialogue_notes || null,
        format_pacing_rating: formData.format_pacing_rating ? parseInt(formData.format_pacing_rating) : null,
        format_pacing_notes: formData.format_pacing_notes || null,
        theme_rating: formData.theme_rating ? parseInt(formData.theme_rating) : null,
        theme_tone_notes: formData.theme_tone_notes || null,
        catharsis_rating: formData.catharsis_rating ? parseInt(formData.catharsis_rating) : null,
        catharsis_notes: formData.catharsis_notes || null,
        production_budget_rating: formData.production_budget_rating ? parseInt(formData.production_budget_rating) : null,
        production_budget_notes: formData.production_budget_notes || null
      };

      const { error } = await supabase
        .from('script_reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving rubric:', error);
    } finally {
      setSaving(false);
    }
  };

  const RatingScale = ({ 
    value, 
    onChange, 
    name, 
    max = 5,
    lowLabel = "Lowest",
    highLabel = "Highest" 
  }: { 
    value: string, 
    onChange: (value: string) => void, 
    name: string,
    max?: number,
    lowLabel?: string,
    highLabel?: string
  }) => (
    <div className="flex items-center space-x-4">
      <span className="text-xs text-portfolio-white/50 w-12">{lowLabel}</span>
      <RadioGroup value={value} onValueChange={onChange} className="flex flex-row items-center space-x-3">
        {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
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
      </RadioGroup>
      <span className="text-xs text-portfolio-white/50 w-12">{highLabel}</span>
    </div>
  );

  return (
    <div className="bg-portfolio-dark border-t-2 border-portfolio-gold/30 p-8">
      <Card className="bg-portfolio-black border-portfolio-gold/20 max-w-5xl mx-auto">
        <CardHeader className="border-b border-portfolio-gold/20">
          <CardTitle className="text-2xl font-special-elite text-portfolio-gold">
            Judging Rubric For {scriptTitle}
          </CardTitle>
          {saving && (
            <div className="text-sm text-portfolio-white/50 flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Auto-saving...
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-8 pt-6">
          {/* 1. Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-portfolio-white">
              1. Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title_response}
              onChange={(e) => setFormData(prev => ({ ...prev, title_response: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30"
            />
          </div>

          {/* 2. Plot */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              2. PLOT <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.plot_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, plot_rating: value }))}
              name="plot"
            />
          </div>

          {/* 3. Plot Notes */}
          <div className="space-y-2">
            <Label htmlFor="plot-notes" className="text-portfolio-white">
              3. PLOT NOTES <span className="text-red-500">*</span>
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
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[100px]"
            />
          </div>

          {/* 4. Characters */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              4. CHARACTERS <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.characters_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, characters_rating: value }))}
              name="characters"
            />
          </div>

          {/* 5. Character Notes */}
          <div className="space-y-2">
            <Label htmlFor="character-notes" className="text-portfolio-white">
              5. CHARACTER NOTES <span className="text-red-500">*</span>
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
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 6. Concept/Originality */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              6. CONCEPT/ ORIGINALITY <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.concept_originality_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, concept_originality_rating: value }))}
              name="concept"
            />
          </div>

          {/* 7. Concept/Originality Notes */}
          <div className="space-y-2">
            <Label htmlFor="concept-notes" className="text-portfolio-white">
              7. CONCEPT/ ORIGINALITY NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Does the concept hook the reader? Is it easy to describe and easy to understand? Does the premise elicit excitement, 
              intrigue, and nuance? How fresh are the story, characters, and ideas? Does the script create a surprising and unique 
              emotional journey for the audience? Does the writer manage to tell the story with unexpected details or themes dealt 
              with in a new, emotionally satisfying, and relevant way?
            </p>
            <Textarea
              id="concept-notes"
              value={formData.concept_originality_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, concept_originality_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 8. Structure */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              8. STRUCTURE <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.structure_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, structure_rating: value }))}
              name="structure"
            />
          </div>

          {/* 9. Structure Notes */}
          <div className="space-y-2">
            <Label htmlFor="structure-notes" className="text-portfolio-white">
              9. STRUCTURE NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Is the overall story built in a way that is connective and logical and keep the reader want to know where it goes? 
              Does the story build emotionally? Does the plot ebb and flow with dynamic range, and does it build to a climax? 
              Does the reader feel pulled through by the story and captivated throughout?
            </p>
            <Textarea
              id="structure-notes"
              value={formData.structure_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, structure_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 10. Dialogue */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              10. DIALOGUE <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.dialogue_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, dialogue_rating: value }))}
              name="dialogue"
            />
          </div>

          {/* 11. Dialogue Notes */}
          <div className="space-y-2">
            <Label htmlFor="dialogue-notes" className="text-portfolio-white">
              11. DIALOGUE NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Do the characters speak in a believable, unique, and interesting ways? Does the writer use subtext to deliver meaning? 
              Does the dialogue reflect the tone and emotion of the scenes? Does the dialogue add texture (intrigue, humor, tension, 
              dread) to the script? Does each character have a unique way of communicating?
            </p>
            <Textarea
              id="dialogue-notes"
              value={formData.dialogue_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, dialogue_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 12. Format/Pacing */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              12. FORMAT/ PACING <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.format_pacing_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, format_pacing_rating: value }))}
              name="format"
            />
          </div>

          {/* 13. Format/Pacing Notes */}
          <div className="space-y-2">
            <Label htmlFor="format-notes" className="text-portfolio-white">
              13. FORMAT/ PACING NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Does the writer display a proficient understanding of industry-standard screenwriting format? Are there virtually no 
              spelling, grammatical, or formatting errors? Does the overall story move at an appropriate speed? Does the story 
              contain any unnecessary scenes? Does the writer build momentum and emotion as the story progresses?
            </p>
            <Textarea
              id="format-notes"
              value={formData.format_pacing_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, format_pacing_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 14. Theme */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              14. THEME <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.theme_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, theme_rating: value }))}
              name="theme"
            />
          </div>

          {/* 15. Theme & Tone */}
          <div className="space-y-2">
            <Label htmlFor="theme-notes" className="text-portfolio-white">
              15. THEME & TONE <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Does the writer have an interesting or unique perspective on some moral, human or cultural issue? Do they express it 
              organically through the characters' journeys? Does the story raise questions about what it means to be human and how 
              a human life should be lived? Does the writing convey an overall mood or feeling that enhances the storytelling in 
              some way? Are the dialogue and narrative voice aligned with the mood and theme of the story? Does the writing evoke 
              visual imagery akin to seeing it on the screen?
            </p>
            <Textarea
              id="theme-notes"
              value={formData.theme_tone_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, theme_tone_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 16. Catharsis */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              16. CATHARSIS <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.catharsis_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, catharsis_rating: value }))}
              name="catharsis"
            />
          </div>

          {/* 17. Catharsis Notes */}
          <div className="space-y-2">
            <Label htmlFor="catharsis-notes" className="text-portfolio-white">
              17. CATHARSIS NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Does the ending of the story feel satisfactory for the narrative established by the writer? Does the ending release 
              tension that is created and intensified throughout the arc of the story? Whether happy/sad, does the ending provide 
              an emotional sense of completion and logical conclusion? Does it leave the reader feeling changed or emotionally 
              transported in some way (meaningful laughter, sadness, anger, hopefulness)?
            </p>
            <Textarea
              id="catharsis-notes"
              value={formData.catharsis_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, catharsis_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>

          {/* 18. Production Budget */}
          <div className="space-y-4">
            <Label className="text-portfolio-white">
              18. PRODUCTION BUDGET <span className="text-red-500">*</span>
            </Label>
            <RatingScale 
              value={formData.production_budget_rating} 
              onChange={(value) => setFormData(prev => ({ ...prev, production_budget_rating: value }))}
              name="budget"
              max={6}
              lowLabel="High"
              highLabel="Low Budget"
            />
          </div>

          {/* 19. Production Budget Notes */}
          <div className="space-y-2">
            <Label htmlFor="budget-notes" className="text-portfolio-white">
              19. *** Separate Production/ producibility and PRODUCTION BUDGET NOTES <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-portfolio-white/60">
              Are there multiple locations or only one? Are there big action scenes, car chases, etc.? Is the cast a large number 
              or quite small? Please list anything that made you give the score that you gave for the budget.
            </p>
            <Textarea
              id="budget-notes"
              value={formData.production_budget_notes}
              onChange={(e) => setFormData(prev => ({ ...prev, production_budget_notes: e.target.value }))}
              placeholder="Short answer text"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-portfolio-white/30 min-h-[120px]"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JudgeRubricForm;