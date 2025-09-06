
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ContractorSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: 'contractor'
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert judge record into the judges table with bcrypt password hash
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);
        
        const { error: judgeError } = await supabase
          .from('judges')
          .insert({
            id: data.user.id,
            name,
            email,
            password_hash: passwordHash,
            status: 'pending'
          });

        if (judgeError) {
          console.error('Error creating judge record:', judgeError);
          // Still show success since auth account was created
        }
      }

      toast({
        title: "Request Sent",
        description: "Awaiting admin's approval. You will be notified once your account is approved.",
      });
      
      navigate('/contractor');
    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-portfolio-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-portfolio-dark border-portfolio-gold">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-special-elite text-portfolio-gold">Contractor Sign Up</CardTitle>
            <CardDescription className="text-portfolio-white/80">
              Apply to become a script reviewer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-portfolio-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-portfolio-black border-gray-600 text-portfolio-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-portfolio-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-portfolio-black border-gray-600 text-portfolio-white placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-portfolio-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="bg-portfolio-black border-gray-600 text-portfolio-white placeholder-gray-400"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
              >
                {isLoading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-portfolio-white/60 text-sm">
                Already have an account? <Link to="/contractor" className="text-portfolio-gold hover:underline">Login</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-portfolio-gold hover:text-portfolio-white transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContractorSignup;
