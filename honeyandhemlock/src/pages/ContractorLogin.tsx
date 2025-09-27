
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ContractorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome to your dashboard",
        });
        navigate('/contractor-dashboard');
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-portfolio-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Lens Images */}
      <div 
        className="absolute top-0 right-1/3 w-1/3 h-1/2 opacity-18 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/74c9a851-6d57-412e-9a5e-b83bc5a76b7c.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div 
        className="absolute bottom-1/4 left-1/4 w-1/4 h-1/3 opacity-16 z-0 pointer-events-none"
        style={{
          backgroundImage: `url('/lovable-uploads/9cf1eb65-bc24-4062-9ec2-2bafdbaa9642.png')`,
          backgroundPosition: 'center',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="w-full max-w-md space-y-6 relative z-10">
        <Card className="bg-portfolio-dark border-portfolio-gold">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-special-elite text-portfolio-gold">Contractor Login</CardTitle>
            <CardDescription className="text-portfolio-white/80">
              Access your contractor dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-portfolio-black border-gray-600 text-portfolio-white placeholder-gray-400"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-portfolio-black border-gray-600 text-portfolio-white placeholder-gray-400"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-portfolio-gold text-black hover:bg-portfolio-gold/90"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <p className="text-portfolio-white/60 text-sm">
            Don't have an account? <Link to="/contractor-signup" className="text-portfolio-gold hover:underline">Sign Up</Link>
          </p>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full bg-transparent text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-black font-semibold transition-all duration-300"
          >
            ← Back to Home Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContractorLogin;
