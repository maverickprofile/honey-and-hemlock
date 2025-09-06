
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface PricingTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  description: string;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Upload',
    price: 0,
    description: 'Upload your script for basic processing and storage in our system',
    features: [
      'Script upload and storage',
      'Basic file processing',
      'Access to your uploaded script',
      'Entry into review queue'
    ]
  },
  {
    id: 'tier1',
    name: 'Essential Review',
    price: 500,
    description: 'Rubric (updated) and scoring with 4-5 pages of notes and detailed feedback',
    features: [
      'Updated rubric scoring system',
      '4-5 pages of detailed notes',
      'Comprehensive feedback',
      'Professional evaluation'
    ]
  },
  {
    id: 'tier2',
    name: 'Comprehensive Analysis',
    price: 750,
    description: 'Rubric score, includes 9-10 pages of notes. Including detailed analysis on character, structure, story, voice, and form – what works and what doesn\'t – plus additional comments on how to strengthen, tighten, and clarify the script.',
    features: [
      'Everything from Essential Review',
      '9-10 pages of detailed notes',
      'Character analysis',
      'Structure evaluation',
      'Story and voice assessment',
      'Form analysis',
      'Strengthening recommendations',
      'Tightening suggestions',
      'Clarification guidance'
    ]
  },
  {
    id: 'tier3',
    name: 'Premium Script Notes',
    price: 1000,
    description: 'Rubric score, includes everything from Package 2, plus written notations on the script. Script Notes includes suggestions for scenes that could be cut, condensed, dialogue that could be clearer, possible character changes as well as suggestions where to insert story changes.',
    features: [
      'Everything from Comprehensive Analysis',
      'Written notations directly on script',
      'Scene cutting suggestions',
      'Scene condensation recommendations',
      'Dialogue clarity improvements',
      'Character change suggestions',
      'Story insertion recommendations',
      'Line-by-line feedback'
    ]
  }
];

const PricingPage = () => {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);

  const handleTierSelection = (tier: PricingTier) => {
    setSelectedTier(tier.id);
    // Store the selected tier data in localStorage to pass to the upload form
    localStorage.setItem('selectedTier', JSON.stringify(tier));
    // Navigate to the upload form
    navigate('/script-upload');
  };

  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white">
      <Header />
      
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/db11a8de-7cf8-49e0-b7c9-33d92bc0fd88.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h1 className="font-special-elite text-3xl sm:text-4xl md:text-5xl font-semibold mb-4 text-portfolio-gold px-4">
            Honey Writes
          </h1>
          <p className="font-special-elite text-xl sm:text-2xl mb-6 md:mb-8 text-portfolio-white px-4">
            By producers for production
          </p>
          <p className="font-special-elite text-base sm:text-lg text-portfolio-white/80 max-w-3xl mx-auto px-4 leading-relaxed">
            Professional script review services designed by industry professionals to help you refine your screenplay and bring it closer to production-ready quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-12 md:mb-16 px-4">
          {pricingTiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`h-full bg-portfolio-dark border-2 transition-all hover:scale-105 cursor-pointer flex flex-col ${
                selectedTier === tier.id 
                  ? 'border-portfolio-gold shadow-lg shadow-portfolio-gold/20' 
                  : 'border-portfolio-gold/20 hover:border-portfolio-gold/40'
              }`}
              onClick={() => handleTierSelection(tier)}
            >
              <CardHeader className="text-center p-4 sm:p-6">
                <CardTitle className="text-portfolio-gold text-xl sm:text-2xl font-special-elite mb-2">
                  {tier.name}
                </CardTitle>
                <div className="text-3xl sm:text-4xl font-bold text-portfolio-white mb-4">
                  {tier.price === 0 ? 'Free' : `$${tier.price}`}
                </div>
                <p className="text-portfolio-white/80 text-sm leading-relaxed">
                  {tier.description}
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0 flex flex-col flex-grow">
                <ul className="space-y-3 mb-6 flex-grow">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-portfolio-gold mt-0.5 flex-shrink-0" />
                      <span className="text-portfolio-white/90 text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-portfolio-gold text-black hover:bg-portfolio-gold/90 font-semibold py-3 text-sm sm:text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTierSelection(tier);
                  }}
                >
                  Select {tier.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Pricing Info */}
        <div className="text-center px-4">
          <p className="text-portfolio-white/80 text-lg font-special-elite">
            90-120 pages: Additional $5 per page
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PricingPage;
