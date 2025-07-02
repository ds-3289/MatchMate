// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBb7DusbmyJe69gKg2W5QqfYsSFrqr71u0",
  authDomain: "matchmate-3289.firebaseapp.com",
  projectId: "matchmate-3289",
  storageBucket: "matchmate-3289.firebasestorage.app",
  messagingSenderId: "812165814475",
  appId: "1:812165814475:web:dc5ee4dc8fb9aed198a34e",
  measurementId: "G-CVMCJMSCEW"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ✅ Initialize and export Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

