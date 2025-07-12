// src/hooks/useProfile.js
import { useState } from 'react';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useProfile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const checkAuth = () => {
    if (!auth.currentUser) {
      throw new Error('Utilizador não autenticado');
    }
    return auth.currentUser;
  };

  const loadUserProfile = async (userId) => {
    setIsLoadingProfile(true);
    try {
      console.log('Loading user profile for:', userId);
      
      const profileRef = doc(db, 'users', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const profileData = profileSnap.data();
        console.log('Profile loaded:', profileData);
        setUserProfile(profileData);
      } else {
        console.log('No profile found, creating empty profile');
        setUserProfile({});
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setUserProfile({});
    }
    setIsLoadingProfile(false);
  };

  const updateUserProfile = async (updates) => {
    try {
      console.log('Updating user profile with:', updates);
      const currentUser = checkAuth();
      
      const profileRef = doc(db, 'users', currentUser.uid);
      
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        await updateDoc(profileRef, {
          ...updates,
          updatedAt: new Date().toISOString()
        });
      } else {
        await setDoc(profileRef, {
          ...updates,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      console.log('Profile updated successfully');
      
      setUserProfile(prev => ({
        ...prev,
        ...updates,
        updatedAt: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const clearUserProfile = () => {
    setUserProfile(null);
  };

  return {
    userProfile,
    setUserProfile,
    isLoadingProfile,
    loadUserProfile,
    updateUserProfile,
    clearUserProfile
  };
};