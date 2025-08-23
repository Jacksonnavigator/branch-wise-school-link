
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bell, User, Settings } from 'lucide-react';
import ProfileDialog from '@/components/Profile/ProfileDialog';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="bg-card/95 backdrop-blur-md border-b border-border/50 px-6 py-4 shadow-card sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            EduManager Pro
          </h1>
          <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            {profile?.role} Dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="relative hover:bg-accent/50 transition-all duration-200"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="hover:bg-accent/50 transition-all duration-200"
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3 ml-4 p-2 rounded-lg hover:bg-accent/30 transition-all duration-200">
            <Button 
              variant="ghost" 
              className="p-0 h-auto hover:bg-transparent"
              onClick={() => setIsProfileOpen(true)}
            >
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all duration-300 hover:scale-105">
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
            className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </header>
  );
};

export default Header;
