
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, User, Settings } from 'lucide-react';
import { db } from '@/lib/firebase';
import { onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import ProfileDialog from '@/components/Profile/ProfileDialog';
import NotificationPanel from '@/components/Notifications/NotificationPanel';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (profile?.id) {
      fetchUnreadCount();
      
      // Subscribe to notification changes using Firebase
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', profile.id),
        where('read', '==', false)
      );
      
      const unsubscribe = onSnapshot(notificationsQuery, () => {
        fetchUnreadCount();
      });

      return () => {
        unsubscribe();
      };
    }
  }, [profile?.id]);

  const fetchUnreadCount = async () => {
    if (!profile?.id) return;

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('recipient_id', '==', profile.id),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      setUnreadCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0);
    }
  };

  if (!user) return null;

  return (
    <header className="glass border-b border-border/30 px-6 py-4 shadow-elegant sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            EduManager Pro
          </h1>
          <p className="text-sm text-muted-foreground/80 capitalize flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-glow"></span>
            {profile?.role} Dashboard
          </p>
        </div>
        
    <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
      className="relative hover:bg-accent/50 transition-all duration-200 interactive-scale"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="hover:bg-accent/50 transition-all duration-200 interactive-scale"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
      <div className="flex items-center space-x-3 ml-4 p-2 rounded-xl hover:bg-accent/30 transition-all duration-200 glass">
            <Button 
              variant="ghost" 
              className="p-0 h-auto hover:bg-transparent"
              onClick={() => setIsProfileOpen(true)}
            >
        <Avatar className="cursor-pointer ring-1 ring-primary/10 hover:ring-2 hover:ring-primary/30 transition-all duration-300 hover:scale-105">
                <AvatarImage src={profile?.profile_photo || ''} />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                  {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
            <div className="text-sm hidden md:block">
              <p className="font-medium text-foreground">{profile?.name || user?.email}</p>
              <p className="text-muted-foreground capitalize text-xs">{profile?.role}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 interactive-scale"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
      <NotificationPanel 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </header>
  );
};

export default Header;
