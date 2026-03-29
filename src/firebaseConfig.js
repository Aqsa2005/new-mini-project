import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCKp8tZEkqPMvazZ2VU9hiz79MPruDxnzw",
  authDomain: "college-chatbot-system-ee2de.firebaseapp.com",
  projectId: "college-chatbot-system-ee2de",
  storageBucket: "college-chatbot-system-ee2de.firebasestorage.app",
  messagingSenderId: "853193379355",
  appId: "1:853193379355:web:61f46523e1a1b63893b2be"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;