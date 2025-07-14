// src/App.js - Versão com OutfitAnalysisScreen
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

// Import analysis screens
import ColorAnalysisScreen from './components/analysis/ColorAnalysisScreen';
import BodyShapeAnalysisScreen from './components/analysis/BodyShapeAnalysisScreen';
import StyleDNAScreen from './components/analysis/StyleDNAScreen';
import StyleTwinFinderScreen from './components/ai/StyleTwinFinderScreen';
import PersonalStylistScreen from './components/ai/PersonalStylistScreen';
import QuickAnalysisScreen from './components/analysis/QuickAnalysisScreen';
import OutfitAnalysisScreen from './components/analysis/OutfitAnalysisScreen'; // ✨ NOVO

// Import additional screens
import VirtualFittingScreen from './components/fitting/VirtualFittingScreen';
import WardrobeChallengesScreen from './components/challenges/WardrobeChallengesScreen';
import PersonalShopperScreen from './components/ai/PersonalShopperScreen';
import SmartShoppingScreen from './components/shopping/SmartShoppingScreen';

// Import new onboarding screens
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import ProfileSettingsScreen from './components/profile/ProfileSettingsScreen';

// Import contexts
import { AppProvider, useAppContext } from './contexts/AppContext';

// Import constants
import { OPENAI_API_KEY } from './utils/constants';

// Componente interno que tem acesso ao AppContext
const AppContent = () => {
  const { userProfile, isLoadingProfile } = useAppContext();
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
        // Não definimos o screen aqui - aguardamos o perfil carregar
      } else {
        setUser(null);
        setCurrentScreen('auth');
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Effect para decidir o screen baseado no perfil carregado
  useEffect(() => {
    if (user && !isLoadingProfile) {
      console.log('👤 User profile loaded:', userProfile);
      
      // Verifica se o onboarding foi completado
      const hasCompletedOnboarding = userProfile?.onboardingCompleted === true;
      
      if (hasCompletedOnboarding) {
        console.log('✅ Onboarding completed, going to home');
        setCurrentScreen('home');
      } else {
        console.log('📋 Onboarding not completed, going to onboarding');
        setCurrentScreen('onboarding');
      }
      
      setIsLoading(false);
    } else if (user && isLoadingProfile) {
      // Utilizador logado mas perfil ainda a carregar
      console.log('⏳ User logged in, waiting for profile to load...');
    }
  }, [user, userProfile, isLoadingProfile]);

  const navigateToScreen = (screen, data = null) => {
    console.log('🧭 Navigating to:', screen, data ? 'with data' : '');
    
    setIsTransitioning(true);
    setScreenData(data);
    
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 150);
  };

  // Loading screen enquanto autentica ou carrega perfil
  if (isLoading || (user && isLoadingProfile)) {
    return <LoadingScreen />;
  }

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
      screenData,
      openaiApiKey: OPENAI_API_KEY
    };

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onLoginSuccess={() => {
          // Não navegamos aqui - deixamos o useEffect decidir baseado no perfil
          console.log('🔑 Login successful, waiting for profile check...');
        }} />;
      
      case 'onboarding':
        return (
          <OnboardingWizard 
            onComplete={() => {
              console.log('✅ Onboarding completed, going to home');
              navigateToScreen('home');
            }}
            navigateToScreen={navigateToScreen}
          />
        );
      
      case 'home':
        return <HomeScreen {...commonProps} />;
      
      // Profile settings
      case 'profile-settings':
        return <ProfileSettingsScreen {...commonProps} />;
      
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
      
      // AI Features
      case 'outfit-quiz':
        return <OutfitQuizScreen {...commonProps} />;
      case 'style-chat':
        return <StyleChatScreen {...commonProps} />;
      case 'recommendations':
        return <RecommendationsScreen {...commonProps} />;
      case 'quick-analysis': 
        return <QuickAnalysisScreen {...commonProps} />;
      case 'outfit-analysis': // ✨ NOVO
        return <OutfitAnalysisScreen {...commonProps} />;
      
      // Analysis Features
      case 'color-analysis':
        return <ColorAnalysisScreen {...commonProps} />;
      case 'body-shape-analysis':
        return <BodyShapeAnalysisScreen {...commonProps} />;
      case 'style-dna':
        return <StyleDNAScreen {...commonProps} />;
      case 'style-twin-finder':
        return <StyleTwinFinderScreen {...commonProps} />;
      case 'personal-stylist':
        return <PersonalStylistScreen {...commonProps} />;
      
      // Additional Features
      case 'virtual-fitting':
        return <VirtualFittingScreen {...commonProps} />;
      case 'wardrobe-challenges':
        return <WardrobeChallengesScreen {...commonProps} />;
      case 'personal-shopper':
        return <PersonalShopperScreen {...commonProps} />;
      case 'smart-shopping':
        return <SmartShoppingScreen {...commonProps} />;
      case 'ai-setup':
        return <AISetupScreen {...commonProps} />;
      
      default:
        return <HomeScreen {...commonProps} />;
    }
  };

  return renderScreen();
};

// Componente principal que envolve com o AppProvider
const WhatToWearApp = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default WhatToWearApp;