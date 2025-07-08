import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Attempting sign in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', userCredential.user.uid);
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Erro no login: ' + error.message);
    }
    setIsLoading(false);
  };

  const signUp = async (email, password, displayName) => {
    try {
      setIsLoading(true);
      console.log('Attempting sign up...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful:', userCredential.user.uid);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
      
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: displayName,
        email: email,
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error signing up:', error);
      alert('Erro no registo: ' + error.message);
    }
    setIsLoading(false);
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    isLoading
  };
};