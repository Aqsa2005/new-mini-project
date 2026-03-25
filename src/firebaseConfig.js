import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// REPLACE THESE WITH YOUR ACTUAL FIREBASE PROJECT CREDENTIALS
// Find these in your Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyCBUuf2QdLcSioyk3RRx8BO6-Z2eoKcsNM",
  authDomain: "wellness-app-33074.firebaseapp.com",
  projectId: "wellness-app-33074",
  storageBucket: "wellness-app-33074.firebasestorage.app",
  messagingSenderId: "604292841877",
  appId:"1:604292841877:web:c2ef77622c5456b98ab69c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
