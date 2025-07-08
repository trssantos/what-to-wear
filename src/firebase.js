import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// SUBSTITUI ESTA CONFIGURAÇÃO PELA TUA CONFIGURAÇÃO DO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyA5XIyC5b_jIPDq1sEn_Vvc7mavkU5jUjo",
    authDomain: "what-to-wear-app-14783.firebaseapp.com",
    projectId: "what-to-wear-app-14783",
    storageBucket: "what-to-wear-app-14783.firebasestorage.app",
    messagingSenderId: "695093746824",
    appId: "1:695093746824:web:ccbd22c6b3a20615e7533d"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Initialize Cloud Storage
export const storage = getStorage(app);

export default app;