
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutDashboard, 
  User, 
  Settings, 
  LogOut, 
  Search, 
  Bell,
  FileText,
  DollarSign,
  Mail
} from 'lucide-react';

// Import the new sections
import ContractorsSection from '@/components/admin/ContractorsSectionSimple'; // Using simple version for now
import ScriptsSection from '@/components/admin/ScriptsSection';
import SettingsSection from '@/components/admin/SettingsSection';
import ContactsSection from '@/components/admin/ContactsSection';
import NotificationsDropdown from '@/components/admin/NotificationsDropdown';
import ProfileDropdown from '@/components/admin/ProfileDropdown';
import SearchModal from '@/components/admin/SearchModal';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalPayments: 0,
    scriptUploads: 0,
    assignedScripts: 0,
    pendingScripts: 0,
    totalContractors: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Check if user is admin
    if (!user || (user.role !== 'admin' && !user.isAdmin)) {
      navigate('/admin');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch scripts data with better error handling
      const { data: scripts, error: scriptsError } = await supabase
        .from('scripts')
        .select('*');
      
      if (scriptsError) {
        console.error('Scripts fetch error:', scriptsError);
        // Don't throw, just log and continue with empty data
      }

      // Fetch contractors data from judges table
      const { data: contractors, error: contractorsError } = await supabase
        .from('judges')
        .select('*');
      
      if (contractorsError) {
        console.error('Contractors fetch error:', contractorsError);
        // Don't throw, just log and continue with empty data
      }

      // Fetch recent activity with better error handling
      const { data: activity, error: activityError } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (activityError) {
        console.error('Activity log fetch error:', activityError);
        // Don't throw, just log and continue with empty data
      }

      // Calculate metrics with null safety
      const safeScripts = scripts || [];
      const safeContractors = contractors || [];
      const safeActivity = activity || [];

      const totalPayments = safeScripts.filter(s => s.payment_status === 'paid')
        .reduce((sum, s) => sum + (s.amount || 0), 0) || 0;
      
      const assignedScripts = safeScripts.filter(s => s.status === 'assigned').length || 0;
      const pendingScripts = safeScripts.filter(s => s.status === 'pending').length || 0;

      console.log('Dashboard data calculated:', {
        scripts: safeScripts.length,
        contractors: safeContractors.length,
        activity: safeActivity.length
      });

      setDashboardData({
        totalPayments: totalPayments / 100, // Convert from cents to dollars
        scriptUploads: safeScripts.length,
        assignedScripts,
        pendingScripts,
        totalContractors: safeContractors.length,
        recentActivity: safeActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default empty data instead of failing
      setDashboardData({
        totalPayments: 0,
        scriptUploads: 0,
        assignedScripts: 0,
        pendingScripts: 0,
        totalContractors: 0,
        recentActivity: []
      });
      
      toast({
        title: "Warning",
        description: "Some dashboard data could not be loaded. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'approval': return '🟢';
      case 'decline': return '🔴';
      case 'payment': return '🟡';
      case 'registration': return '🔵';
      case 'assignment': return '🟠';
      default: return '⚪';
    }
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payments Card */}
        <Card className="bg-[#282828] border-none relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Payments Received</p>
                <p className="text-3xl font-bold text-portfolio-white mt-2">${dashboardData.totalPayments.toLocaleString()}</p>
                <p className="text-sm mt-2">
                  <span className="text-green-400">+8.7%</span>
                  <span className="text-gray-400 ml-1">Since Last Month</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FFD62F] rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Script Uploads Card */}
        <Card className="bg-[#282828] border-none relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Scripts Uploaded</p>
                <p className="text-3xl font-bold text-portfolio-white mt-2">{dashboardData.scriptUploads}</p>
                <p className="text-sm mt-2">
                  <span className="text-green-400">+12.3%</span>
                  <span className="text-gray-400 ml-1">Since Last Month</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FFD62F] rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scripts Assignment Card */}
        <Card className="bg-[#282828] border-none">
          <CardHeader>
            <CardTitle className="text-portfolio-white">Scripts Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Assigned to Contractors</span>
                <span className="text-2xl font-bold text-portfolio-white">{dashboardData.assignedScripts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Pending Assignment</span>
                <span className="text-2xl font-bold text-[#FFD62F]">{dashboardData.pendingScripts}</span>
              </div>
              <div className="mt-4">
                <Progress 
                  value={dashboardData.assignedScripts + dashboardData.pendingScripts > 0 
                    ? (dashboardData.assignedScripts / (dashboardData.assignedScripts + dashboardData.pendingScripts)) * 100 
                    : 0} 
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contractors Registered Card */}
        <Card className="bg-[#282828] border-none">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Contractors Registered</p>
                <p className="text-3xl font-bold text-portfolio-white mt-2">{dashboardData.totalContractors}</p>
                <p className="text-sm mt-2">
                  <span className="text-green-400">+3</span>
                  <span className="text-gray-400 ml-1">New This Month</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-[#FFD62F] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="bg-[#282828] border-none">
          <CardHeader>
            <CardTitle className="text-portfolio-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <span className="text-lg">{getActivityIcon(activity.activity_type)}</span>
                  <div className="flex-1">
                    <p className="text-sm text-portfolio-white">{activity.description}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {dashboardData.recentActivity.length === 0 && (
                <p className="text-gray-400 text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Progress */}
        <Card className="bg-[#282828] border-none">
          <CardHeader>
            <CardTitle className="text-portfolio-white">Payment Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#404040"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="#FFD62F"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${Math.min(dashboardData.totalPayments / 1000, 1) * 314} ${(1 - Math.min(dashboardData.totalPayments / 1000, 1)) * 314}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-portfolio-white">
                  {Math.min(Math.round(dashboardData.totalPayments / 10), 100)}%
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm text-center">Monthly payment goal</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#232323] text-portfolio-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#282828] min-h-screen p-6 flex flex-col">
        {/* User Profile */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#FFD62F] rounded-full flex items-center justify-center mb-3">
            <User className="w-8 h-8 text-black" />
          </div>
          <h3 className="text-portfolio-white font-semibold">{user?.email?.split('@')[0] || 'Admin'}</h3>
          <p className="text-gray-400 text-sm">Administrator</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'contractors', label: 'Contractors', icon: User },
              { id: 'scripts', label: 'Scripts', icon: FileText },
              { id: 'contacts', label: 'Contacts', icon: Mail },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                    activeTab === item.id
                      ? 'bg-portfolio-gold text-black font-semibold'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-portfolio-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="w-full bg-portfolio-black text-red-500 border-2 border-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-[#FFD62F] h-16 px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-black">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:bg-black/20 transition-all duration-300"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
            </Button>
            <NotificationsDropdown />
            <ProfileDropdown onNavigateToSettings={() => setActiveTab('settings')} />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'contractors' && <ContractorsSection />}
          {activeTab === 'scripts' && <ScriptsSection />}
          {activeTab === 'contacts' && <ContactsSection />}
          {activeTab === 'settings' && <SettingsSection />}
        </main>
      </div>
      
      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
