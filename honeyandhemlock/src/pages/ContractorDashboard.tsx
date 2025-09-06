import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogOut, FileText, Clock, CheckCircle, XCircle, AlertCircle, Eye, Download } from 'lucide-react';

interface Script {
  id: string;
  title: string;
  author_name: string;
  submitted_at: string;
  status: string;
  file_url?: string;
  page_count?: number;
  user_email?: string;
  amount?: number;
  tier_id?: string;
  tier_name?: string;
}

const ContractorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/judge');
      return;
    }
    
    fetchAssignedScripts();
  }, [user, navigate]);

  const fetchAssignedScripts = async () => {
    try {
      // First check if user is a valid contractor/judge
      const { data: judgeData, error: judgeError } = await supabase
        .from('judges')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (judgeError || !judgeData) {
        console.error('User is not a registered contractor:', judgeError);
        toast({
          title: "Access Denied",
          description: "You are not registered as a contractor",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Check if contractor is approved
      if (judgeData.status !== 'approved') {
        toast({
          title: "Pending Approval",
          description: "Your contractor account is pending admin approval",
          variant: "destructive"
        });
        setScripts([]);
        setLoading(false);
        return;
      }

      // Fetch assigned scripts with file URLs
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('assigned_judge_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching scripts:', error);
        throw error;
      }
      
      setScripts(data || []);
    } catch (error: any) {
      console.error('Error fetching scripts:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch assigned scripts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };


  const downloadScript = async (script: Script) => {
    try {
      if (!script.file_url) {
        toast({
          title: "Error",
          description: "Script file not found",
          variant: "destructive"
        });
        return;
      }

      // Check if it's a Supabase storage URL
      if (script.file_url.startsWith('https://zknmzaowomihtrtqleon.supabase.co/storage/')) {
        // It's already a public URL, just open it
        window.open(script.file_url, '_blank');
        
        toast({
          title: "Download started",
          description: "Your script is being downloaded",
        });
        return;
      }
      
      // For test URLs
      if (script.file_url.startsWith('/')) {
        // Use a sample PDF for testing
        const samplePdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        window.open(samplePdfUrl, '_blank');
        
        toast({
          title: "Sample Download",
          description: "This is a test script. Downloading a sample PDF.",
        });
        return;
      }

      // For other URLs, open directly
      if (script.file_url.startsWith('http')) {
        window.open(script.file_url, '_blank');
        
        toast({
          title: "Download started",
          description: "Your script is being downloaded",
        });
      }
    } catch (error) {
      console.error('Error downloading script:', error);
      toast({
        title: "Error",
        description: "Failed to download script",
        variant: "destructive"
      });
    }
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'in_review':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4 text-purple-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-portfolio-black flex items-center justify-center">
        <div className="text-portfolio-white">Loading...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-portfolio-black text-portfolio-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-special-elite text-3xl font-semibold text-portfolio-gold">Contractor Dashboard</h1>
            <p className="text-portfolio-white/70">Welcome back, {user?.user_metadata?.name || user?.email}</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="bg-portfolio-black text-red-500 border-2 border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 font-semibold transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Scripts List */}
        <Card className="bg-portfolio-dark border-portfolio-gold/20">
          <CardHeader>
            <CardTitle className="text-portfolio-gold flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Assigned Scripts ({scripts.length})
            </CardTitle>
            <CardDescription className="text-portfolio-white/70">
              Review Process: 1) View PDF & add page notes → 2) Fill Judge's Rubric → 3) Submit final review
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scripts.length > 0 ? (
              <div className="space-y-4">
                {scripts.map((script) => (
                  <div key={script.id} className="p-4 bg-portfolio-black rounded border border-portfolio-gold/20">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-portfolio-white text-lg">{script.title}</h3>
                        <p className="text-sm text-portfolio-white/60">by {script.author_name}</p>
                        <p className="text-xs text-portfolio-white/50 mt-1">
                          Submitted: {new Date(script.submitted_at).toLocaleDateString()}
                        </p>
                        {script.page_count && (
                          <p className="text-xs text-portfolio-white/50">
                            Pages: {script.page_count}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(script.status)}
                        <span className="text-xs capitalize text-portfolio-white">{script.status}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <Button
                        onClick={() => navigate(`/script-review/${script.id}`)}
                        size="sm"
                        className="bg-portfolio-black text-portfolio-gold border-2 border-portfolio-gold hover:bg-portfolio-gold hover:text-portfolio-black font-semibold transition-all duration-300"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View & Review
                      </Button>
                      <Button
                        onClick={() => downloadScript(script)}
                        size="sm"
                        variant="outline"
                        className="bg-portfolio-white text-portfolio-black border-2 border-portfolio-white hover:bg-portfolio-black hover:text-portfolio-gold hover:border-portfolio-gold font-semibold transition-all duration-300"
                      >
                        <Download className="w-4 h-4 mr-2 text-black" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-portfolio-white/30 mx-auto mb-4" />
                <p className="text-portfolio-white/60">No scripts assigned yet</p>
                <p className="text-portfolio-white/40 text-sm mt-2">
                  Scripts will appear here once the admin assigns them to you
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractorDashboard;