
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScriptSubmissionForm from "@/components/ScriptSubmissionForm";
import ScriptReviewDetails from "@/components/ScriptReviewDetails";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

const ScriptPortal = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);

  useEffect(() => {
    // Get the selected tier from localStorage
    const tierData = localStorage.getItem('selectedTier');
    console.log('=== SCRIPT PORTAL DEBUG ===');
    console.log('Raw localStorage data:', tierData);
    
    if (tierData) {
      try {
        const parsedTier = JSON.parse(tierData);
        
        // Enhanced debug logging
        console.log('Parsed tier object:', parsedTier);
        console.log('Tier price:', parsedTier.price);
        console.log('Tier name:', parsedTier.name);
        console.log('Tier ID:', parsedTier.id);
        
        // Validate that the tier has proper pricing (should be 0, 500, 750, or 1000)
        if (parsedTier.price !== undefined && (parsedTier.price === 0 || parsedTier.price === 500 || parsedTier.price === 750 || parsedTier.price === 1000)) {
          console.log('Valid tier detected, setting selectedTier');
          setSelectedTier(parsedTier);
        } else {
          console.warn('Invalid tier pricing detected:', parsedTier.price);
          console.warn('Expected: 0, 500, 750, or 1000');
          console.warn('Clearing localStorage and redirecting to pricing page');
          localStorage.removeItem('selectedTier');
          navigate('/script-portal');
        }
      } catch (error) {
        console.error('Error parsing tier data:', error);
        localStorage.removeItem('selectedTier');
        navigate('/script-portal');
      }
    } else {
      console.log('No tier data in localStorage, redirecting to pricing page');
      navigate('/script-portal');
    }
  }, [navigate]);

  const handleSubmissionStart = () => {
    setIsUploading(true);
  };

  const handleSubmissionEnd = () => {
    setIsUploading(false);
  };

  const handleBackToPricing = () => {
    localStorage.removeItem('selectedTier');
    localStorage.removeItem('pendingScript'); // Clear any pending script data too
    navigate('/script-portal');
  };

  if (!selectedTier) {
    return (
      <div className="min-h-screen bg-portfolio-black text-portfolio-white flex items-center justify-center">
        <div className="text-center px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Loading...</h2>
          <p className="text-sm sm:text-base">Redirecting to pricing page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white relative overflow-hidden">
      {/* Background Lens Images */}
      <div 
        className="absolute top-0 right-1/3 w-1/4 h-1/3 opacity-16 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="absolute bottom-1/4 left-1/4 w-1/5 h-1/4 opacity-17 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <Header />
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <Button
            onClick={handleBackToPricing}
            variant="outline"
            className="mb-6 border-portfolio-gold text-portfolio-gold bg-transparent hover:bg-portfolio-gold hover:text-black text-sm sm:text-base px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
          
          <h1 className="font-special-elite text-2xl sm:text-3xl md:text-4xl font-semibold mb-4 px-4">Submit Your Script</h1>
          <div className="bg-portfolio-dark border border-portfolio-gold/20 rounded-lg p-4 sm:p-6 mb-8 max-w-md mx-auto">
            <h2 className="text-portfolio-gold text-lg sm:text-xl font-semibold mb-2">
              Selected Package: {selectedTier.name}
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-portfolio-white">
              {selectedTier.price === 0 ? 'Free' : `$${selectedTier.price}`}
            </p>
            <p className="text-portfolio-white/80 text-xs sm:text-sm mt-2 leading-relaxed">{selectedTier.description}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="bg-portfolio-dark border-portfolio-gold/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-portfolio-gold text-lg sm:text-xl">Upload Your Script</CardTitle>
              <CardDescription className="text-portfolio-white/70 text-sm sm:text-base">
                Upload your script for a professional review. All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-6">
                <ScriptSubmissionForm 
                  onSubmissionStart={handleSubmissionStart}
                  onSubmissionEnd={handleSubmissionEnd}
                  selectedTier={selectedTier}
                />
                <ScriptReviewDetails selectedTier={selectedTier} />
              </div>
              
              {isUploading && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-portfolio-dark p-6 rounded-lg flex items-center space-x-3 max-w-sm w-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-portfolio-gold"></div>
                    <span className="text-portfolio-white text-sm sm:text-base">Processing...</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ScriptPortal;
