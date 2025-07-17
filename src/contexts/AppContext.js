// src/contexts/AppContext.js - Versão corrigida
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { useWardrobe } from '../hooks/useWardrobe';
import { useOutfits } from '../hooks/useOutfits';
import { useProfile } from '../hooks/useProfile';
import { useAccessories } from '../hooks/useAccessories';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Adicionado estado user
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOutfit, setSelectedOutfit] = useState(null);

  // Initialize hooks
  const wardrobeHook = useWardrobe();
  const outfitsHook = useOutfits();
  const profileHook = useProfile();

  // Initialize accessories hook with user
  const {
    accessories,
    isLoading: isLoadingAccessories,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    getAccessoryById,
    searchAccessories,
    advancedFilter: advancedFilterAccessories,
    accessoriesAnalytics,
    getAccessoriesRecommendations
  } = useAccessories(user?.uid);

  // Load data when user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser); // Define o user no estado local
      
      if (currentUser) {
        console.log('Loading user data for:', currentUser.uid);
        // Removido o setTimeout - carregar imediatamente
        wardrobeHook.loadUserWardrobe(currentUser.uid);
        outfitsHook.loadUserOutfits(currentUser.uid);
        profileHook.loadUserProfile(currentUser.uid);
      } else {
        wardrobeHook.setWardrobe([]);
        outfitsHook.setOutfits([]);
        profileHook.clearUserProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  // Utility function to get item by ID
  const getItemById = (itemId) => {
    return wardrobeHook.wardrobe.find(item => item.id === itemId);
  };

  const value = {
    // User
    user,
    
    // Wardrobe
    ...wardrobeHook,
    
    // Outfits
    ...outfitsHook,
    
    // Profile
    ...profileHook,
    
    // Accessories
    accessories,
    isLoadingAccessories,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    getAccessoryById,
    searchAccessories,
    advancedFilterAccessories,
    accessoriesAnalytics,
    getAccessoriesRecommendations,
    
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