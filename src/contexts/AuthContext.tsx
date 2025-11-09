import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'headmaster' | 'teacher' | 'parent' | 'accountant';
  branch_id: string | null;
  profile_photo: string | null;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role: string; branch_id?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        console.log('Auth state changed:', firebaseUser?.uid);
        setUser(firebaseUser);
        
        if (firebaseUser) {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('User profile loaded:', userData);
            setProfile({
              id: firebaseUser.uid,
              user_id: firebaseUser.uid,
              name: userData.full_name || userData.name || 'Unknown User',
              role: userData.role || 'teacher',
              branch_id: userData.branch_id || null,
              profile_photo: userData.profile_photo || null,
              must_change_password: userData.must_change_password || false
            });
          } else {
            console.error('User profile not found in Firestore');
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setProfile(null);
        // Don't throw here, just set profile to null and continue
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; role: string; branch_id?: string }) => {
    try {
      console.log('Attempting to create user:', email, userData);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create profile in Firestore
      const profileData = {
        email: email,
        full_name: userData.name,
        role: userData.role as 'admin' | 'headmaster' | 'teacher' | 'parent' | 'accountant',
        branch_id: userData.branch_id || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      console.log('Creating user profile:', profileData);
      await setDoc(doc(db, 'users', user.uid), profileData);
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('Sending password reset to:', email);
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      resetPassword,
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
