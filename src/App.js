import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import components
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
import LoadingScreen from './components/shared/LoadingScreen';
import ApiSetupModal from './components/auth/ApiSetupModal';

// Import contexts
import { AppProvider } from './contexts/AppContext';

// Import constants
import { OPENAI_API_KEY } from './utils/constants';

const WhatToWearApp = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('auth');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.uid}` : 'No user');
      if (user) {
        setUser(user);
        setCurrentScreen('home');
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
      setIsLoading(false);
    });

    // Setup OpenAI API Key
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'sk-proj-YOUR_OPENAI_API_KEY_HERE') {
      setOpenaiApiKey(OPENAI_API_KEY);
      console.log('✅ OpenAI API Key carregada automaticamente');
    } else {
      const savedApiKey = localStorage.getItem('whatToWear_openai_key');
      if (savedApiKey) {
        setOpenaiApiKey(savedApiKey);
        console.log('✅ OpenAI API Key carregada do localStorage');
      } else {
        console.log('⚠️ OpenAI API Key não encontrada - configura manualmente');
      }
    }

    return () => unsubscribe();
  }, []);

  const navigateToScreen = (screen, data = null) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 150);
  };

  // Loading Screen
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Screen Router
  const renderScreen = () => {
    if (!user) {
      return (
        <AuthScreen 
          navigateToScreen={navigateToScreen}
          openaiApiKey={openaiApiKey}
          setShowApiSetup={setShowApiSetup}
        />
      );
    }

    const screenProps = {
      navigateToScreen,
      user,
      openaiApiKey
    };

    switch (currentScreen) {
      case 'home':
        return         <HomeScreen {...screenProps} setShowApiSetup={setShowApiSetup} />;
      case 'wardrobe':
        return <WardrobeScreen {...screenProps} />;
      case 'add-item':
        return <AddItemScreen {...screenProps} />;
      case 'item-detail':
        return <ItemDetailScreen {...screenProps} />;
      case 'outfits':
        return <OutfitsScreen {...screenProps} />;
      case 'create-outfit':
        return <CreateOutfitScreen {...screenProps} />;
      case 'outfit-detail':
        return <OutfitDetailScreen {...screenProps} />;
      case 'outfit-quiz':
        return <OutfitQuizScreen {...screenProps} />;
      case 'style-chat':
        return <StyleChatScreen {...screenProps} />;
      case 'recommendations':
        return <RecommendationsScreen {...screenProps} />;
      default:
        return <HomeScreen {...screenProps} />;
    }
  };

  return (
    <AppProvider>
      <div className={`transition-opacity duration-150 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderScreen()}
        {showApiSetup && (
          <ApiSetupModal 
            openaiApiKey={openaiApiKey}
            setOpenaiApiKey={setOpenaiApiKey}
            setShowApiSetup={setShowApiSetup}
          />
        )}
      </div>
    </AppProvider>
  );
};

export default WhatToWearApp;