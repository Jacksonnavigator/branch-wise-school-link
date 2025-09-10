// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDhOQNB2-BrjPziMxkjJQNDLOyYuwGqKS0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "schools-20bd6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "schools-20bd6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "schools-20bd6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "540173783517",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:540173783517:web:9060b4aea566f701dba634",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RR79WV073K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;