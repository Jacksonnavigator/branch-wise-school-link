// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDhOQNB2-BrjPziMxkjJQNDLOyYuwGqKS0",
  authDomain: "schools-20bd6.firebaseapp.com",
  projectId: "schools-20bd6",
  storageBucket: "schools-20bd6.firebasestorage.app",
  messagingSenderId: "540173783517",
  appId: "1:540173783517:web:9060b4aea566f701dba634",
  measurementId: "G-RR79WV073K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;