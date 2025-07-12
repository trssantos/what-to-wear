import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import screens
import LoadingScreen from './components/shared/LoadingScreen';
import AuthScreen from './components/auth/AuthScreen';
import HomeScreen from './components/home/HomeScreen';
import WardrobeScreen from './components/wardrobe/WardrobeScreen';
import AddItemScreen from './components/wardrobe/AddItemScreen';
import ItemDetailScreen from './components/wardrobe/ItemDetailScreen';
import OutfitsScreen from './components/outfits/OutfitsScreen';
import CreateOutfitScreen from './components/outfits/CreateOutfitScreen';
import OutfitDetailScreen from './components/outfits/OutfitDetailScreen';
import OutfitQuizScreen from './components/ai/OutfitQuizScreen';
import StyleChatScreen from './components/ai/StyleChatScreen';
import RecommendationsScreen from './components/ai/RecommendationsScreen';
import AISetupScreen from './components/setup/AISetupScreen';

// Import contexts
import { AppProvider } from './contexts/AppContext';

// Import constants
import { OPENAI_API_KEY } from './utils/constants';

const WhatToWearApp = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [screenData, setScreenData] = useState(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      
      if (user) {
        setUser(user);
        setCurrentScreen('home');
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navigateToScreen = (screen, data = null) => {
    console.log('🧭 Navigating to:', screen, data ? 'with data' : '');
    
    setIsTransitioning(true);
    setScreenData(data);
    
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 150);
  };

  // Screen renderer
  const renderScreen = () => {
    if (isTransitioning) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      );
    }

    const commonProps = {
      navigateToScreen,
      screenData
    };

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onLoginSuccess={() => navigateToScreen('home')} />;
      
      case 'home':
        return <HomeScreen {...commonProps} />;
      
      // Wardrobe Management
      case 'wardrobe':
        return <WardrobeScreen {...commonProps} />;
      case 'add-item':
        return <AddItemScreen {...commonProps} />;
      case 'item-detail':
        return <ItemDetailScreen {...commonProps} />;
      
      // Outfit Management
      case 'outfits':
        return <OutfitsScreen {...commonProps} />;
      case 'create-outfit':
        return <CreateOutfitScreen {...commonProps} />;
      case 'outfit-detail':
        return <OutfitDetailScreen {...commonProps} />;
      
      // AI Features - Removidas as props openaiApiKey
      case 'outfit-quiz':
        return <OutfitQuizScreen {...commonProps} />;
      case 'style-chat':
        return <StyleChatScreen {...commonProps} />;
      case 'recommendations':
        return <RecommendationsScreen {...commonProps} />;
      
      // AI Setup
      case 'ai-setup':
        return <AISetupScreen {...commonProps} />;
      
      default:
        return <HomeScreen {...commonProps} />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <div className="app">
        {renderScreen()}
        
        {/* AI Integration Status Bar (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
            AI: {OPENAI_API_KEY ? '✓ Configurada' : '❌ Não configurada'}
          </div>
        )}
      </div>
    </AppProvider>
  );
};

export default WhatToWearApp;