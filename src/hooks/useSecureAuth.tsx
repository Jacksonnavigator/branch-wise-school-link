import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { rateLimiter, auditLog, sanitizeInput, isSessionValid, generateSessionToken } from '@/lib/crypto';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SecureAuthState {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  sessionValid: boolean;
  remainingAttempts: number;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const useSecureAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<SecureAuthState>({
    user: null,
    loading: true,
    isAuthenticated: false,
    sessionValid: false,
    remainingAttempts: 5,
  });

  /**
   * Secure login with rate limiting and audit logging
   */
  const secureSignIn = useCallback(async (credentials: LoginCredentials) => {
    const sanitizedEmail = sanitizeInput(credentials.email);
    const clientIP = await getClientIP();
    
    // Check rate limiting
    if (rateLimiter.isBlocked(sanitizedEmail)) {
      const remaining = rateLimiter.getRemainingAttempts(sanitizedEmail);
      toast({
        title: "Too Many Attempts",
        description: `Account temporarily locked. Try again later.`,
        variant: "destructive",
      });
      
      await auditLog({
        action: 'blocked_login_attempt',
        details: { email: sanitizedEmail, reason: 'rate_limited' },
        ipAddress: clientIP,
      });
      
      return { error: 'Rate limited' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      // Attempt authentication with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, sanitizedEmail, credentials.password);
      const data = { user: userCredential.user };

      // Success - reset rate limiting
      rateLimiter.recordAttempt(sanitizedEmail, true);

      // Generate secure session token
      const sessionToken = generateSessionToken();
      const sessionTimestamp = Date.now();

      // Store session securely
      if (credentials.rememberMe) {
        localStorage.setItem('session_token', sessionToken);
        localStorage.setItem('session_timestamp', sessionTimestamp.toString());
      } else {
        sessionStorage.setItem('session_token', sessionToken);
        sessionStorage.setItem('session_timestamp', sessionTimestamp.toString());
      }

      // Audit successful login
      await auditLog({
        action: 'login_success',
        userId: data.user.uid,
        details: { 
          email: sanitizedEmail,
          remember_me: credentials.rememberMe,
          session_token: sessionToken.substring(0, 8) + '...' // Log only part of token
        },
        ipAddress: clientIP,
      });

      setAuthState({
        user: data.user,
        loading: false,
        isAuthenticated: true,
        sessionValid: true,
        remainingAttempts: 5,
      });

      toast({
        title: "Welcome",
        description: "Successfully signed in to your account.",
      });

      return { data };

    } catch (error: any) {
      // Record failed attempt
      rateLimiter.recordAttempt(sanitizedEmail, false);
      
      await auditLog({
        action: 'login_failed',
        details: { 
          email: sanitizedEmail, 
          error: error.message,
          remaining_attempts: rateLimiter.getRemainingAttempts(sanitizedEmail)
        },
        ipAddress: clientIP,
      });

      setAuthState(prev => ({
        ...prev,
        loading: false,
        remainingAttempts: rateLimiter.getRemainingAttempts(sanitizedEmail)
      }));

      toast({
        title: "Authentication Failed",
        description: `Invalid credentials. ${rateLimiter.getRemainingAttempts(sanitizedEmail)} attempts remaining.`,
        variant: "destructive",
      });

      return { error: error.message };
    }
  }, [toast]);

  /**
   * Secure logout with session cleanup
   */
  const secureSignOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);

      // Clear all session data
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_timestamp');
      sessionStorage.removeItem('session_token');
      sessionStorage.removeItem('session_timestamp');

      // Audit logout
      await auditLog({
        action: 'logout',
        userId: authState.user?.uid,
        details: { timestamp: new Date().toISOString() },
      });

      setAuthState({
        user: null,
        loading: false,
        isAuthenticated: false,
        sessionValid: false,
        remainingAttempts: 5,
      });

      toast({
        title: "Signed Out",
        description: "You have been securely signed out.",
      });

    } catch (error: any) {
      console.error('Logout error:', error);
      
      await auditLog({
        action: 'logout_error',
        userId: authState.user?.uid,
        details: { error: error.message },
      });
    }
  }, [authState.user?.uid, toast]);

  /**
   * Validate current session
   */
  const validateSession = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('session_token') || sessionStorage.getItem('session_token');
      const sessionTimestamp = localStorage.getItem('session_timestamp') || sessionStorage.getItem('session_timestamp');

      if (!sessionToken || !sessionTimestamp) {
        setAuthState(prev => ({ ...prev, loading: false, sessionValid: false }));
        return false;
      }

      const isValid = isSessionValid(parseInt(sessionTimestamp));
      
      if (!isValid) {
        // Session expired
        await secureSignOut();
        toast({
          title: "Session Expired",
          description: "Please sign in again for security.",
          variant: "destructive",
        });
        return false;
      }

      // Validate with Firebase
      const user = auth.currentUser;
      
      if (!user) {
        await secureSignOut();
        return false;
      }

      setAuthState({
        user,
        loading: false,
        isAuthenticated: true,
        sessionValid: true,
        remainingAttempts: 5,
      });

      return true;

    } catch (error: any) {
      console.error('Session validation error:', error);
      setAuthState(prev => ({ ...prev, loading: false, sessionValid: false }));
      return false;
    }
  }, [secureSignOut, toast]);

  /**
   * Check for suspicious activity
   */
  const checkSuspiciousActivity = useCallback(async () => {
    try {
      const userAgent = navigator.userAgent;
      const lastUserAgent = localStorage.getItem('last_user_agent');
      
      if (lastUserAgent && lastUserAgent !== userAgent) {
        await auditLog({
          action: 'suspicious_activity',
          userId: authState.user?.uid,
          details: { 
            reason: 'user_agent_changed',
            old_user_agent: lastUserAgent,
            new_user_agent: userAgent
          },
        });

        toast({
          title: "Security Alert",
          description: "Login from a different device detected. Please verify your account.",
          variant: "destructive",
        });
      }

      localStorage.setItem('last_user_agent', userAgent);

    } catch (error) {
      console.error('Suspicious activity check failed:', error);
    }
  }, [authState.user?.uid, toast]);

  /**
   * Initialize secure authentication
   */
  useEffect(() => {
    validateSession();
  }, [validateSession]);

  /**
   * Monitor for suspicious activity
   */
  useEffect(() => {
    if (authState.isAuthenticated) {
      checkSuspiciousActivity();
    }
  }, [authState.isAuthenticated, checkSuspiciousActivity]);

  /**
   * Auto-refresh session periodically
   */
  useEffect(() => {
    if (authState.isAuthenticated) {
      const interval = setInterval(() => {
        validateSession();
      }, 300000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [authState.isAuthenticated, validateSession]);

  return {
    ...authState,
    signIn: secureSignIn,
    signOut: secureSignOut,
    validateSession,
  };
};

/**
 * Get client IP address (simplified version)
 */
async function getClientIP(): Promise<string> {
  try {
    // In a real implementation, you might use a service to get the IP
    // For now, return a placeholder
    return 'unknown';
  } catch {
    return 'unknown';
  }
}