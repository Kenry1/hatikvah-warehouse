// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // Add this line if you have measurementId
};

// Validate Firebase configuration
for (const key in firebaseConfig) {
  if (typeof firebaseConfig[key as keyof typeof firebaseConfig] !== 'string' || !firebaseConfig[key as keyof typeof firebaseConfig]) {
    throw new Error(`Missing or malformed Firebase environment variable: ${key}. Please check your .env file.`);
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig as Record<string, string>);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);