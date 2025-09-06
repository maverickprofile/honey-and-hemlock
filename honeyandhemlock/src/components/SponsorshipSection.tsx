
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SponsorshipSection = () => {
  const [amount, setAmount] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorEmail, setSponsorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSponsorshipPayment = async () => {
    if (!amount || parseFloat(amount) < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount of at least $1",
        variant: "destructive",
      });
      return;
    }

    if (!sponsorName.trim() || !sponsorEmail.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-sponsorship-payment', {
        body: {
          amount: parseFloat(amount),
          sponsorName: sponsorName.trim(),
          sponsorEmail: sponsorEmail.trim(),
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating sponsorship payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-portfolio-black text-portfolio-white py-16">
      <div className="container mx-auto px-6">
        {/* The Field Logo at the top */}
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/4774b947-de46-4d2c-aec1-c15b60d7b422.png" 
            alt="The Field Organization" 
            className="mx-auto h-32 w-auto mb-8"
          />
        </div>

        <div className="text-center mb-16">
          <h2 className="font-special-elite text-4xl font-semibold mb-4">Support Our Vision</h2>
          <p className="font-special-elite text-lg text-portfolio-gold mb-8">
            Honey & Hemlock Productions is proud to be associated with The Field, a non profit organization dedicated to helping artists thrive.
          </p>
        </div>

        {/* Custom Sponsorship Amount Section */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-portfolio-dark border-portfolio-gold/20">
            <CardHeader>
              <CardTitle className="text-portfolio-gold text-center text-2xl">Sponsor Our Production</CardTitle>
              <CardDescription className="text-portfolio-white/70 text-center">
                Enter your desired sponsorship amount and help support female-driven filmmaking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label htmlFor="sponsorName" className="block text-portfolio-white font-medium mb-2">
                  Your Name
                </label>
                <Input
                  id="sponsorName"
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="sponsorEmail" className="block text-portfolio-white font-medium mb-2">
                  Your Email
                </label>
                <Input
                  id="sponsorEmail"
                  type="email"
                  value={sponsorEmail}
                  onChange={(e) => setSponsorEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-portfolio-white font-medium mb-2">
                  Sponsorship Amount ($)
                </label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount (minimum $1)"
                  className="bg-portfolio-black border-portfolio-gold/30 text-portfolio-white placeholder:text-gray-400"
                />
              </div>

              <Button
                onClick={handleSponsorshipPayment}
                disabled={isLoading}
                className="w-full bg-portfolio-gold hover:bg-portfolio-gold/90 text-portfolio-black font-semibold py-3"
              >
                {isLoading ? 'Processing...' : 'Sponsor Now'}
              </Button>

              <p className="text-portfolio-white/60 text-sm text-center">
                Your contribution will be processed securely through Stripe and is tax-deductible through The Field.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SponsorshipSection;
