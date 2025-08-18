import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mail, Lock, User, Building2, Eye, EyeOff, ArrowLeft, GraduationCap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Branch {
  id: string;
  name: string;
}

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(mode === 'reset');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'headmaster' | 'teacher' | 'parent'>('teacher');
  const [branchId, setBranchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [adminExists, setAdminExists] = useState(false);
  
  const { user, signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchBranchesAndAdminStatus = async () => {
      try {
        // Fetch branches
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
        const branchesData = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Branch[];
        
        // Check if admin exists
        const adminQuery = query(collection(db, 'profiles'), where('role', '==', 'admin'));
        const adminSnapshot = await getDocs(adminQuery);
        
        setBranches(branchesData);
        setAdminExists(!adminSnapshot.empty);
      } catch (error) {
        console.error('Error fetching data:', error);
        setBranches([]);
        setAdminExists(false);
      }
    };
    
    fetchBranchesAndAdminStatus();
  }, []);

  useEffect(() => {
    const fetchAvailableBranches = async () => {
      if (role === 'headmaster') {
        try {
          // Simplified query to avoid index requirement
          const headmasterQuery = query(
            collection(db, 'profiles'), 
            where('role', '==', 'headmaster')
          );
          const headmasterSnapshot = await getDocs(headmasterQuery);
          const occupiedBranchIds = headmasterSnapshot.docs
            .map(doc => doc.data().branch_id)
            .filter(id => id !== null && id !== undefined);
          
          const available = branches.filter(branch => !occupiedBranchIds.includes(branch.id));
          setAvailableBranches(available);
        } catch (error) {
          console.error('Error fetching headmaster branches:', error);
          // On error, show all branches to allow signup
          setAvailableBranches(branches);
        }
      } else {
        setAvailableBranches(branches);
      }
    };

    fetchAvailableBranches();
  }, [role, branches]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isResetMode) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Reset email sent",
            description: "Check your email for password reset instructions",
          });
          setIsResetMode(false);
        }
      } else if (isSignUp) {
        if (!name.trim()) {
          toast({
            title: "Error",
            description: "Name is required",
            variant: "destructive",
          });
          return;
        }

        if (role !== 'parent' && role !== 'admin' && !branchId) {
          toast({
            title: "Error", 
            description: "Campus selection is required for headmasters and teachers",
            variant: "destructive",
          });
          return;
        }

        const { error } = await signUp(email, password, {
          name,
          role,
          branch_id: (role === 'parent' || role === 'admin') ? undefined : branchId
        });

        if (error) {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up successful",
            description: "Please check your email for verification",
          });
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 gradient-primary animate-gradient opacity-60"></div>
      
      {/* Enhanced Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 gradient-accent rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float"></div>
      <div className="absolute top-40 right-20 w-96 h-96 gradient-secondary rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-80 h-80 gradient-primary rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-float" style={{ animationDelay: '1s' }}></div>

      <Card className="w-full max-w-md mx-4 glass shadow-elegant border border-white/20 relative z-10 backdrop-blur-xl animate-fade-in">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center shadow-soft animate-scale-in">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-foreground mb-1">
              {isResetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-base">
              {isResetMode 
                ? 'Enter your email to receive reset instructions'
                : isSignUp 
                  ? 'Join the School Management System'
                  : 'Sign in to your account'
              }
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!adminExists && !isResetMode && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription className="text-amber-800">
                💡 No admin exists yet. First user with admin role will become the system administrator.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-soft border-primary/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2 font-medium">
                    <Building2 className="h-4 w-4" />
                    Role
                  </Label>
                  <Select value={role} onValueChange={(value: 'admin' | 'headmaster' | 'teacher' | 'parent') => setRole(value)}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      {!adminExists && <SelectItem value="admin">Administrator</SelectItem>}
                      <SelectItem value="headmaster">Headmaster</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {role !== 'parent' && role !== 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="branch" className="flex items-center gap-2 font-medium">
                      <Building2 className="h-4 w-4" />
                      Campus
                    </Label>
                    <Select value={branchId} onValueChange={setBranchId}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select your campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {(role === 'headmaster' ? availableBranches : branches).map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {role === 'headmaster' && availableBranches.length === 0 && (
                      <p className="text-sm text-amber-600">All campuses already have headmasters assigned.</p>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2 font-medium">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="h-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-soft border-primary/20"
                required
              />
            </div>
            
            {!isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 font-medium">
                  <Lock className="h-4 w-4" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 pr-12 transition-all duration-300 focus:scale-[1.02] focus:shadow-soft border-primary/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-12 gradient-primary hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-soft hover:shadow-elegant" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isResetMode ? 'Sending...' : isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isResetMode ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          {!isResetMode && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 border-2 hover:scale-105 transition-all duration-200 font-medium"
              >
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </>
          )}
          
          <div className="text-center space-y-2">
            {isResetMode ? (
              <Button
                variant="link"
                onClick={() => setIsResetMode(false)}
                className="text-sm flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Button>
            ) : (
              <>
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm font-medium text-foreground hover:text-primary"
                >
                  {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                </Button>
                {!isSignUp && (
                  <Button
                    variant="link"
                    onClick={() => setIsResetMode(true)}
                    className="text-sm text-foreground opacity-75 hover:opacity-100"
                  >
                    Forgot your password?
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;