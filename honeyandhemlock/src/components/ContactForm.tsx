import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Send } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  // Animate form entrance
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowForm(true), 100);
    } else {
      setShowForm(false);
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save to Supabase
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          subject: formData.subject || null,
          message: formData.message,
          status: 'new'
        })
        .select()
        .single();

      if (error) throw error;

      // Also save to localStorage as backup
      const contacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      const newContact = {
        ...formData,
        id: data.id,
        created_at: data.created_at,
        status: 'new'
      };
      contacts.push(newContact);
      localStorage.setItem('contacts', JSON.stringify(contacts));

      setIsSuccess(true);
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you soon.",
      });

      // Reset form after success animation
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTimeout(() => {
          onClose();
        }, 1000);
      }, 2500);
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-700 ${
      showForm ? 'opacity-100' : 'opacity-0'
    }`}>
      
      {/* Liquid Glass Backdrop */}
      <div className="absolute inset-0 bg-black/20">
        <div className="absolute inset-0 backdrop-blur-md"></div>
      </div>

      {/* Main Glass Container */}
      <div className={`relative w-full max-w-lg transform transition-all duration-800 delay-100 ${
        showForm ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        
        {/* Success State */}
        {isSuccess && (
          <div className="absolute inset-0 z-10 flex items-center justify-center liquid-glass rounded-2xl">
            <div className="text-center p-8">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-2xl font-special-elite text-portfolio-gold mb-3">
                Message Sent
              </h2>
              <p className="text-portfolio-white/80">
                Thank you! We'll be in touch soon.
              </p>
            </div>
          </div>
        )}

        {/* Liquid Glass Form Container */}
        <div className="liquid-glass rounded-2xl p-8 relative overflow-hidden">
          
          {/* Subtle Inner Glow */}
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/5 to-transparent rounded-t-2xl pointer-events-none"></div>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-special-elite text-portfolio-gold mb-2">
              Contact Us
            </h2>
            <div className="w-16 h-px bg-portfolio-gold/40 mx-auto"></div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-portfolio-gold/70 hover:text-portfolio-gold hover:bg-white/10 transition-all duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name Field */}
            <div className="space-y-2">
              <label className={`block text-sm font-special-elite transition-all duration-300 ${
                focusedField === 'name' || formData.name 
                  ? 'text-portfolio-gold' 
                  : 'text-portfolio-white/80'
              }`}>
                Name
              </label>
              <Input
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                required
                className={`liquid-field h-12 transition-all duration-300 ${
                  focusedField === 'name' ? 'liquid-field-focus' : ''
                }`}
              />
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className={`block text-sm font-special-elite transition-all duration-300 ${
                focusedField === 'email' || formData.email 
                  ? 'text-portfolio-gold' 
                  : 'text-portfolio-white/80'
              }`}>
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className={`liquid-field h-12 transition-all duration-300 ${
                  focusedField === 'email' ? 'liquid-field-focus' : ''
                }`}
              />
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className={`block text-sm font-special-elite transition-all duration-300 ${
                focusedField === 'phone' || formData.phone 
                  ? 'text-portfolio-gold' 
                  : 'text-portfolio-white/80'
              }`}>
                Phone
              </label>
              <Input
                name="phone"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleChange}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                className={`liquid-field h-12 transition-all duration-300 ${
                  focusedField === 'phone' ? 'liquid-field-focus' : ''
                }`}
              />
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label className={`block text-sm font-special-elite transition-all duration-300 ${
                focusedField === 'subject' || formData.subject 
                  ? 'text-portfolio-gold' 
                  : 'text-portfolio-white/80'
              }`}>
                Subject
              </label>
              <Input
                name="subject"
                placeholder="What's this about?"
                value={formData.subject}
                onChange={handleChange}
                onFocus={() => setFocusedField('subject')}
                onBlur={() => setFocusedField(null)}
                required
                className={`liquid-field h-12 transition-all duration-300 ${
                  focusedField === 'subject' ? 'liquid-field-focus' : ''
                }`}
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label className={`block text-sm font-special-elite transition-all duration-300 ${
                focusedField === 'message' || formData.message 
                  ? 'text-portfolio-gold' 
                  : 'text-portfolio-white/80'
              }`}>
                Message
              </label>
              <Textarea
                name="message"
                placeholder="Tell us about your project..."
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField('message')}
                onBlur={() => setFocusedField(null)}
                required
                rows={4}
                className={`liquid-field transition-all duration-300 resize-none ${
                  focusedField === 'message' ? 'liquid-field-focus' : ''
                }`}
              />
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="liquid-button w-full h-12 relative overflow-hidden group"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2 w-4 h-4 border-2 border-black/20 border-t-black rounded-full"></div>
                  <span className="font-special-elite">Sending...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10 font-special-elite flex items-center justify-center">
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </span>
                  <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12"></div>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;