import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Users, User, Shield, UserCheck, Calendar, Building2, Mail, Phone, KeyRound } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string;
  user_id: string;
  role: 'admin' | 'headmaster' | 'teacher' | 'parent';
  branch_id: string | null;
  created_at: string;
  updated_at: string;
}

interface UserDetailsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [branchName, setBranchName] = useState<string>('No Branch Assigned');
  const [userEmail, setUserEmail] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      try {
        // Fetch branch name if user has a branch
        if (user.branch_id) {
          const branchDoc = await getDoc(doc(db, 'branches', user.branch_id));
          if (branchDoc.exists()) {
            setBranchName(branchDoc.data().name);
          } else {
            setBranchName('Branch Not Found');
          }
        }

        // For demo purposes, generate email from user data
        // In a real app, you'd store email in the profile or fetch from auth
        setUserEmail(`${user.name.toLowerCase().replace(/\s+/g, '.')}@school.com`);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (open && user) {
      fetchUserDetails();
    }
  }, [user, open]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'headmaster': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teacher': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'headmaster': return <UserCheck className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const handlePasswordReset = async () => {
    if (!userEmail) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, userEmail);
      toast({
        title: "Password Reset Sent",
        description: "Password reset email has been sent to the user",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">User Details</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            View and manage user information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile Section */}
          <Card className="glass border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 ring-4 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-primary-foreground font-semibold text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-foreground">{user.name}</h3>
                    <Badge className={`capitalize border ${getRoleColor(user.role)} flex items-center gap-1`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">User ID: {user.user_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{userEmail}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Branch:</span>
                    <span className="text-muted-foreground">{branchName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Joined:</span>
                    <span className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Last Updated:</span>
                    <span className="text-muted-foreground">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Section */}
          <Card className="glass border-border">
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-foreground mb-4">User Actions</h4>
              
              <div className="space-y-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Password Reset</h5>
                      <p className="text-sm text-muted-foreground">
                        Send a password reset email to help the user regain access
                      </p>
                    </div>
                    <Button 
                      onClick={handlePasswordReset}
                      disabled={loading}
                      className="gradient-primary hover:scale-105 transition-all"
                    >
                      <KeyRound className="h-4 w-4 mr-2" />
                      {loading ? 'Sending...' : 'Reset Password'}
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-foreground">Account Status</h5>
                      <p className="text-sm text-muted-foreground">
                        User account is active and in good standing
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};