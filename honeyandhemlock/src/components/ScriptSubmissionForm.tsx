
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

interface ScriptSubmissionFormProps {
  onSubmissionStart: () => void;
  onSubmissionEnd: () => void;
  selectedTier: PricingTier;
}

const ScriptSubmissionForm: React.FC<ScriptSubmissionFormProps> = ({
  onSubmissionStart,
  onSubmissionEnd,
  selectedTier
}) => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedTitle, setSubmittedTitle] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [discountApplied, setDiscountApplied] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['.pdf', '.doc', '.docx'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF, DOC, or DOCX file",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive"
        });
        return;
      }
      
      setFile(selectedFile);
    }
  };

  // Predefined discount codes (in production, these would be in a database)
  const DISCOUNT_CODES: { [key: string]: number } = {
    'LAUNCH2024': 20, // 20% off
    'EARLY50': 50, // 50% off
    'FRIEND10': 10, // 10% off
    'HONEY25': 25, // 25% off
  };

  const validateDiscountCode = () => {
    setIsValidatingDiscount(true);

    // Check if discount code is valid
    const upperCode = discountCode.toUpperCase().trim();
    if (DISCOUNT_CODES[upperCode]) {
      setDiscountPercentage(DISCOUNT_CODES[upperCode]);
      setDiscountApplied(true);
      toast({
        title: "Discount Applied!",
        description: `${DISCOUNT_CODES[upperCode]}% discount has been applied to your order.`,
      });
    } else if (discountCode.trim() !== '') {
      toast({
        title: "Invalid Code",
        description: "The discount code you entered is not valid.",
        variant: "destructive",
      });
      setDiscountPercentage(0);
      setDiscountApplied(false);
    }

    setIsValidatingDiscount(false);
  };

  const calculateDiscountedPrice = () => {
    if (discountApplied && discountPercentage > 0) {
      return selectedTier.price * (1 - discountPercentage / 100);
    }
    return selectedTier.price;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !authorName || !authorEmail || !file) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload your script",
        variant: "destructive"
      });
      return;
    }

    onSubmissionStart();

    try {
      // Enhanced debug logging
      console.log('=== SCRIPT SUBMISSION DEBUG ===');
      console.log('Selected Tier:', selectedTier);
      console.log('Tier Price (dollars):', selectedTier.price);
      console.log('Is Free Tier:', selectedTier.price === 0);
      
      // Check if this is a free tier or $1000 tier (TESTING MODE)
      if (selectedTier.price === 0 || selectedTier.price === 1000) {
        // For free tier, upload the file to Supabase storage first
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${file.name}`;
        const filePath = `scripts/${fileName}`;
        
        console.log('Uploading file to Supabase storage:', filePath);
        
        // Upload file to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('scripts')
          .upload(filePath, file);
        
        if (uploadError) {
          console.error('File upload error:', uploadError);
          throw new Error('Failed to upload file');
        }
        
        // Get public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('scripts')
          .getPublicUrl(filePath);
        
        console.log('File uploaded successfully, creating script record');
        
        // Create script record directly in database
        const { data: scriptData, error: scriptError } = await supabase
          .from('scripts')
          .insert({
            title,
            author_name: authorName,
            author_email: authorEmail,
            author_phone: authorPhone,
            file_url: publicUrl,
            file_name: file.name,
            amount: selectedTier.price,
            payment_status: 'paid', // Mark as paid since it's free
            status: 'pending',
            tier_id: selectedTier.id,
            tier_name: selectedTier.name
          })
          .select()
          .single();
        
        if (scriptError) {
          console.error('Script creation error:', scriptError);
          throw scriptError;
        }

        console.log('Script created successfully (Test Mode for $1000 tier):', scriptData);

        // Show success dialog
        setSubmittedTitle(title);
        setShowSuccessDialog(true);

        // Clear form
        setTitle('');
        setAuthorName('');
        setAuthorEmail('');
        setAuthorPhone('');
        setFile(null);

        // Clear selected tier from localStorage
        localStorage.removeItem('selectedTier');

        return;
      }

      // Apply discount if applicable
      const finalPrice = calculateDiscountedPrice();

      // For paid tiers, proceed with Stripe payment
      const requestBody = {
        title,
        authorName,
        authorEmail,
        authorPhone,
        amount: Math.round(finalPrice * 100), // Convert to cents with discount applied
        originalAmount: selectedTier.price * 100, // Original price in cents
        discountCode: discountApplied ? discountCode : null,
        discountPercentage: discountApplied ? discountPercentage : 0,
        tierName: selectedTier.name,
        tierId: selectedTier.id,
        tierDescription: selectedTier.description,
      };
      
      console.log('Full request body being sent to Supabase:', requestBody);
      console.log('Specifically, amount being sent:', requestBody.amount);
      
      // Create Stripe payment session with the selected tier price
      const { data, error } = await supabase.functions.invoke('create-script-payment', {
        body: requestBody,
      });

      if (error) throw error;

      if (data?.url) {
        // Store form data temporarily in localStorage for after payment
        localStorage.setItem('pendingScript', JSON.stringify({
          title,
          authorName,
          authorEmail,
          authorPhone,
          fileName: file.name,
          selectedTier: selectedTier
        }));

        // Show success dialog before redirecting to payment
        setSubmittedTitle(title);
        toast({
          title: "Processing Payment",
          description: "Redirecting to secure payment page...",
        });

        // Redirect to Stripe checkout after a brief delay
        setTimeout(() => {
          window.location.href = data.url;
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error processing submission:', error);
      
      let errorMessage = "Failed to process submission. Please try again.";
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.details) {
        errorMessage = error.details;
      }
      
      toast({
        title: "Submission Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      onSubmissionEnd();
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    // Navigate to home after closing the dialog
    window.location.href = '/';
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-portfolio-white">Script Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter script title"
            className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="authorName" className="text-portfolio-white">Author Name *</Label>
          <Input
            id="authorName"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Enter your full name"
            className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authorEmail" className="text-portfolio-white">Email Address *</Label>
          <Input
            id="authorEmail"
            type="email"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            placeholder="Enter your email"
            className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
            required
          />
        </div>
        <div>
          <Label htmlFor="authorPhone" className="text-portfolio-white">Phone Number</Label>
          <Input
            id="authorPhone"
            type="tel"
            value={authorPhone}
            onChange={(e) => setAuthorPhone(e.target.value)}
            placeholder="Enter your phone number"
            className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="file" className="text-portfolio-white">Script File * (PDF, DOC, DOCX - Max 10MB)</Label>
        <Input
          id="file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white"
          required
        />
        {file && (
          <div className="mt-2 flex items-center text-sm text-portfolio-gold">
            <FileText className="w-4 h-4 mr-2" />
            {file.name}
          </div>
        )}
      </div>

      {/* Discount Code Section - Only show for paid tiers */}
      {selectedTier.price > 0 && (
        <div className="space-y-2">
          <Label htmlFor="discountCode" className="text-portfolio-white">Discount Code (Optional)</Label>
          <div className="flex gap-2">
            <Input
              id="discountCode"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                setDiscountApplied(false);
                setDiscountPercentage(0);
              }}
              placeholder="Enter discount code"
              className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white flex-1"
            />
            <Button
              type="button"
              onClick={validateDiscountCode}
              disabled={isValidatingDiscount || !discountCode.trim()}
              className="bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
            >
              Apply
            </Button>
          </div>
          {discountApplied && (
            <div className="text-sm text-green-400">
              ✓ Discount applied: {discountPercentage}% off
              <div className="text-portfolio-white mt-1">
                Original: ${selectedTier.price} → Final: ${calculateDiscountedPrice()}
              </div>
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-portfolio-gold text-black hover:bg-portfolio-gold/90 text-lg py-3"
      >
        <Upload className="w-5 h-5 mr-2" />
        {(selectedTier.price === 0 || selectedTier.price === 1000) ? 'Upload Script (Test Mode)' : 'Proceed to Payment'}
      </Button>
    </form>

      {/* Success Confirmation Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-portfolio-dark border-portfolio-gold/20 max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-portfolio-gold flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Submission Successful!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-portfolio-white/90 text-base space-y-4">
            <p>
              Thank you for submitting your screenplay <span className="text-portfolio-gold font-semibold">'{submittedTitle}'</span> for feedback.
            </p>
            <p>
              Our team of producers and screenplay professionals will provide feedback within 14 days of submission.
            </p>
          </DialogDescription>
          <DialogFooter>
            <Button
              onClick={handleSuccessDialogClose}
              className="w-full bg-portfolio-gold text-black hover:bg-portfolio-gold/90 font-semibold"
            >
              Continue to Homepage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScriptSubmissionForm;
