import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileDropdownProps {
  onNavigateToSettings?: () => void;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onNavigateToSettings }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-black/80"
        >
          <User className="w-5 h-5 text-[#FFD62F]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-[#282828] border-gray-600"
      >
        <DropdownMenuLabel className="text-portfolio-white">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">Admin Account</p>
            <p className="text-xs text-gray-400 truncate">
              {user?.email || 'admin'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-600" />
        
        {onNavigateToSettings && (
          <DropdownMenuItem
            className="text-portfolio-white hover:bg-[#323232] cursor-pointer"
            onClick={onNavigateToSettings}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem
          className="text-portfolio-white hover:bg-[#323232] cursor-pointer"
          onClick={handleGoHome}
        >
          <Home className="w-4 h-4 mr-2" />
          Go to Homepage
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-gray-600" />
        
        <DropdownMenuItem
          className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;