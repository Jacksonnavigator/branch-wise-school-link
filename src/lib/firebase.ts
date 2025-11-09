// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Validate required environment variables
const envVarMap = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
} as const;

const requiredEnvVars = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check for missing required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => envVarMap[key as keyof typeof envVarMap]);

// In development, allow fallbacks but warn. In production, require all env vars.
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

if (missingVars.length > 0) {
  if (isProduction) {
    // In production, fail hard if env vars are missing
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Please create a .env file with the required Firebase configuration. See .env.example for reference.'
    );
  } else {
    // In development, warn but allow fallbacks (for testing)
    console.warn(
      `⚠️ WARNING: Missing Firebase environment variables: ${missingVars.join(', ')}\n` +
      'Using fallback values for development. This is INSECURE for production!\n' +
      'Please create a .env file with your Firebase credentials.'
    );
  }
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || (isDevelopment ? "AIzaSyDhOQNB2-BrjPziMxkjJQNDLOyYuwGqKS0" : ""),
  authDomain: requiredEnvVars.authDomain || (isDevelopment ? "schools-20bd6.firebaseapp.com" : ""),
  projectId: requiredEnvVars.projectId || (isDevelopment ? "schools-20bd6" : ""),
  storageBucket: requiredEnvVars.storageBucket || (isDevelopment ? "schools-20bd6.firebasestorage.app" : ""),
  messagingSenderId: requiredEnvVars.messagingSenderId || (isDevelopment ? "540173783517" : ""),
  appId: requiredEnvVars.appId || (isDevelopment ? "1:540173783517:web:9060b4aea566f701dba634" : ""),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || (isDevelopment ? "G-RR79WV073K" : undefined),
};

// Validate that all required config values are present
const configValues = Object.values(firebaseConfig).filter(v => v !== undefined && v !== "");
if (configValues.length < 6) {
  const errorMsg = `Firebase configuration is incomplete. Missing required values. Check your environment variables.`;
  if (isProduction) {
    throw new Error(errorMsg);
  } else {
    console.error(errorMsg, firebaseConfig);
  }
}

// Initialize Firebase with error handling
// Check if Firebase app is already initialized (e.g., from hot reload)
let app;
try {
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    // Use existing app (from hot reload or previous initialization)
    app = existingApps[0];
    if (isDevelopment) {
      console.log('Using existing Firebase app instance');
    }
  } else {
    // Initialize new app
    app = initializeApp(firebaseConfig);
    if (isDevelopment) {
      console.log('Initialized new Firebase app');
    }
  }
} catch (error: any) {
  const errorMsg = `Failed to initialize Firebase: ${error?.message || 'Unknown error'}`;
  console.error('Firebase initialization error:', errorMsg, error);
  
  if (isProduction) {
    throw new Error(errorMsg);
  } else {
    // In development, try to get default app as last resort
    try {
      app = getApp();
      console.warn('⚠️ Using default Firebase app as fallback. This may cause issues.');
    } catch (fallbackError: any) {
      console.error('All Firebase initialization attempts failed:', fallbackError);
      throw new Error(
        `Firebase initialization failed: ${errorMsg}\n` +
        `Fallback also failed: ${fallbackError?.message || 'Unknown error'}\n` +
        'Please check your Firebase configuration and ensure Firebase is properly set up.'
      );
    }
  }
}

// Initialize Analytics only in browser environments where supported
if (typeof window !== 'undefined') {
  // dynamic import to avoid SSR / test environment errors
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      // isSupported returns a promise
      try {
        isSupported().then((supported) => {
          if (supported) {
            getAnalytics(app);
          }
        }).catch(() => {
          // ignore analytics support errors
        });
      } catch (e) {
        // ignore
      }
    })
    .catch(() => {
      // analytics package not available or failed to load in this env
    });
}

// Export Firebase services with error handling
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error: any) {
  console.error('Failed to initialize Firebase services:', error);
  // In development, we'll try to continue but log the error
  if (isProduction) {
    throw new Error(`Failed to initialize Firebase services: ${error?.message || 'Unknown error'}`);
  }
  // Re-throw in development so we can see the error
  throw error;
}

export { auth, db, storage };
export default app;