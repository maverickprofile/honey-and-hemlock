
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, BookOpen } from 'lucide-react';

interface ContractorSignupFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContractorSignupForm: React.FC<ContractorSignupFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialization: '',
    experience_years: '',
    bio: '',
    availability: 'part-time'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('contractor_applications')
        .insert({
          name: formData.name,
          email: formData.email,
          specialization: formData.specialization,
          experience_years: parseInt(formData.experience_years) || null,
          bio: formData.bio,
          availability: formData.availability,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Application Submitted",
        description: "Thank you for your interest! We'll review your application and get back to you soon.",
      });

      setFormData({
        name: '',
        email: '',
        specialization: '',
        experience_years: '',
        bio: '',
        availability: 'part-time'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="bg-portfolio-dark border-portfolio-gold/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-portfolio-gold flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Apply to Become a Contractor
          </CardTitle>
          <CardDescription className="text-portfolio-white/70">
            Join our team of script reviewers and help shape the future of screenwriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-portfolio-white">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-portfolio-white">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="specialization" className="text-portfolio-white">Specialization</Label>
                <Input
                  id="specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Drama, Comedy, Horror, etc."
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
                />
              </div>
              <div>
                <Label htmlFor="experience" className="text-portfolio-white">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="availability" className="text-portfolio-white">Availability</Label>
              <Select value={formData.availability} onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}>
                <SelectTrigger className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="weekends">Weekends only</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio" className="text-portfolio-white">Tell us about yourself</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Share your background, experience with scripts, and why you'd like to be a contractor..."
                className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white min-h-[100px]"
              />
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractorSignupForm;
