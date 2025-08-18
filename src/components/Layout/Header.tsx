
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
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            School Management System
          </h1>
          <p className="text-sm text-muted-foreground capitalize">
            {profile?.role} Dashboard
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              className="p-0 h-auto hover:bg-transparent"
              onClick={() => setIsProfileOpen(true)}
            >
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src={profile?.profile_photo || ''} />
                <AvatarFallback>
                  {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
            <div className="text-sm">
              <p className="font-medium text-foreground">{profile?.name || user?.email}</p>
              <p className="text-muted-foreground capitalize">{profile?.role}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ProfileDialog open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </header>
  );
};

export default Header;
