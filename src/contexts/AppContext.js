// src/contexts/AppContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useWardrobe } from '../hooks/useWardrobe';
import { useOutfits } from '../hooks/useOutfits';
import { useProfile } from '../hooks/useProfile'; // ✅ NOVO

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  // Initialize hooks
  const wardrobeHook = useWardrobe();
  const outfitsHook = useOutfits();
  const profileHook = useProfile(); // ✅ NOVO

  // Load data when user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('Loading user data for:', user.uid);
        setTimeout(() => {
          wardrobeHook.loadUserWardrobe(user.uid);
          outfitsHook.loadUserOutfits(user.uid);
          profileHook.loadUserProfile(user.uid); // ✅ NOVO
        }, 1500);
      } else {
        wardrobeHook.setWardrobe([]);
        outfitsHook.setOutfits([]);
        profileHook.clearUserProfile(); // ✅ NOVO
      }
    });

    return () => unsubscribe();
  }, []);

  // Utility function to get item by ID
  const getItemById = (itemId) => {
    return wardrobeHook.wardrobe.find(item => item.id === itemId);
  };

  const value = {
    // Wardrobe
    ...wardrobeHook,
    
    // Outfits
    ...outfitsHook,
    
    // ✅ NOVO: Profile
    ...profileHook,
    
    // Selected items
    selectedItem,
    setSelectedItem,
    selectedOutfit,
    setSelectedOutfit,
    
    // Utilities
    getItemById
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};