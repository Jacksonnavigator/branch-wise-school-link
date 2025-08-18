
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import PasswordChangeDialog from '@/components/Profile/PasswordChangeDialog';

interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'admin' | 'headmaster' | 'teacher' | 'parent';
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
  signInWithGoogle: () => Promise<{ error: any }>;
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
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Fetch user profile from Firestore
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as Profile;
            setProfile(profileData);
            
            // Check if user needs to change password
            if (profileData.must_change_password) {
              setShowPasswordChange(true);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; role: string; branch_id?: string }) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create profile document in Firestore
      await setDoc(doc(db, 'profiles', user.uid), {
        id: user.uid,
        user_id: user.uid,
        name: userData.name,
        role: userData.role as 'admin' | 'headmaster' | 'teacher' | 'parent',
        branch_id: userData.branch_id || null,
        profile_photo: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      signUp, 
      signIn, 
      signInWithGoogle,
      resetPassword,
      signOut 
    }}>
      {children}
      <PasswordChangeDialog 
        open={showPasswordChange} 
        onOpenChange={setShowPasswordChange}
        isRequired={true}
      />
    </AuthContext.Provider>
  );
};
