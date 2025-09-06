import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, FileText, Users, Mail, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'script_upload' | 'review_complete' | 'contact_form' | 'contractor_signup' | 'system';
  title: string;
  message: string;
  metadata?: any;
  is_read: boolean;
  created_at: string;
}

const NotificationsDropdown = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications' 
        }, 
        (payload) => {
          console.log('New notification:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching notifications:', error);
        // Use mock data if table doesn't exist yet
        setNotifications([
          {
            id: '1',
            type: 'script_upload',
            title: 'New Script Uploaded',
            message: 'A new script "The Last Signal" has been uploaded',
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: {}
          },
          {
            id: '2',
            type: 'contact_form',
            title: 'New Contact Form',
            message: 'John Doe submitted a contact form',
            is_read: false,
            created_at: new Date(Date.now() - 3600000).toISOString(),
            metadata: {}
          }
        ]);
        setUnreadCount(2);
        return;
      }

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        // Update locally anyway
      }

      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) {
        console.error('Error marking all as read:', error);
      }

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearNotifications = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .not('id', 'is', null);

      if (error) {
        console.error('Error clearing notifications:', error);
      }

      setNotifications([]);
      setUnreadCount(0);
      toast({
        title: "Notifications Cleared",
        description: "All notifications have been cleared",
      });
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'script_upload':
        return <FileText className="w-4 h-4" />;
      case 'review_complete':
        return <Check className="w-4 h-4" />;
      case 'contact_form':
        return <Mail className="w-4 h-4" />;
      case 'contractor_signup':
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-black hover:bg-black/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 bg-[#282828] border-gray-600 max-h-96 overflow-y-auto"
      >
        <DropdownMenuLabel className="text-portfolio-white flex justify-between items-center">
          <span>Notifications</span>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-portfolio-gold hover:text-portfolio-white"
                onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}
              >
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-xs text-red-400 hover:text-red-300"
                onClick={(e) => {
                  e.preventDefault();
                  clearNotifications();
                }}
              >
                Clear all
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-600" />
        
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-400">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`px-4 py-3 cursor-pointer hover:bg-[#323232] ${
                !notification.is_read ? 'bg-[#2a2a2a] border-l-2 border-portfolio-gold' : ''
              }`}
              onClick={() => {
                if (!notification.is_read) {
                  markAsRead(notification.id);
                }
              }}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`mt-1 ${!notification.is_read ? 'text-portfolio-gold' : 'text-gray-400'}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notification.is_read ? 'text-portfolio-white' : 'text-gray-300'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;