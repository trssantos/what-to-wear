import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

// Import existing components
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

// NEW AI-ENHANCED SCREENS
import ColorAnalysisScreen from './components/analysis/ColorAnalysisScreen';
import BodyShapeAnalysisScreen from './components/analysis/BodyShapeAnalysisScreen';
import StyleDNAScreen from './components/analysis/StyleDNAScreen';
import StyleTwinFinderScreen from './components/ai/StyleTwinFinderScreen';
import OutfitPlannerScreen from './components/planning/OutfitPlannerScreen';
import WardrobeChallengesScreen from './components/challenges/WardrobeChallengesScreen';
import SmartShoppingScreen from './components/shopping/SmartShoppingScreen';
import VirtualFittingScreen from './components/fitting/VirtualFittingScreen';
import ProfessionalWardrobeScreen from './components/professional/ProfessionalWardrobeScreen';
import EventPlannerScreen from './components/events/EventPlannerScreen';
import BeautyIntegrationScreen from './components/beauty/BeautyIntegrationScreen';
import PersonalShopperScreen from './components/ai/PersonalShopperScreen';
import PersonalStylistScreen from './components/ai/PersonalStylistScreen';

// NEW AI INTEGRATION SCREENS
import AISetupScreen from './components/setup/AISetupScreen';
import AIIntegrationDemo from './components/demo/AIIntegrationDemo';
import AIPoweredFeaturesDemo from './components/demo/AIPoweredFeaturesDemo';
import WardrobeMigrationScreen from './components/migration/WardrobeMigrationScreen';

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
  const [screenData, setScreenData] = useState(null);
  const [appVersion, setAppVersion] = useState('2.0'); // Track app version for migrations

  // Initialize API key from storage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('whatToWear_openai_key');
    if (savedApiKey) {
      setOpenaiApiKey(savedApiKey);
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? user.email : 'No user');
      
      if (user) {
        setUser(user);
        
        // Check if user needs onboarding or migration
        const hasCompletedOnboarding = localStorage.getItem('whatToWear_onboarding');
        const userAppVersion = localStorage.getItem('whatToWear_app_version');
        
        if (!hasCompletedOnboarding) {
          console.log('🎯 New user - starting onboarding');
          setCurrentScreen('onboarding');
        } else if (!userAppVersion || userAppVersion < appVersion) {
          console.log('🔄 User needs migration to version', appVersion);
          setCurrentScreen('migration');
        } else {
          console.log('✅ Existing user - going to home');
          setCurrentScreen('home');
        }
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [appVersion]);

  const navigateToScreen = (screen, data = null) => {
    console.log('🧭 Navigating to:', screen, data ? 'with data' : '');
    
    setIsTransitioning(true);
    setScreenData(data);
    
    setTimeout(() => {
      setCurrentScreen(screen);
      setIsTransitioning(false);
    }, 150);
  };

  const completeOnboarding = () => {
    localStorage.setItem('whatToWear_onboarding', 'true');
    localStorage.setItem('whatToWear_app_version', appVersion);
    navigateToScreen('home');
  };

  const completeMigration = () => {
    localStorage.setItem('whatToWear_app_version', appVersion);
    navigateToScreen('home');
  };

  // Enhanced screen renderer with AI integration
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
      openaiApiKey,
      setOpenaiApiKey,
      screenData
    };

    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onLoginSuccess={() => navigateToScreen('home')} />;
      
      case 'onboarding':
        return <OnboardingScreen onComplete={completeOnboarding} {...commonProps} />;
      
      case 'migration':
        return <WardrobeMigrationScreen onComplete={completeMigration} {...commonProps} />;
      
      case 'home':
        return <HomeScreen {...commonProps} />;
      
      // Wardrobe Management (AI-Enhanced)
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
      case 'style-chat':
        return <StyleChatScreen {...commonProps} />;
      case 'recommendations':
        return <RecommendationsScreen {...commonProps} />;
      case 'outfit-quiz':
        return <OutfitQuizScreen {...commonProps} />;
      case 'personal-shopper':
        return <PersonalShopperScreen {...commonProps} />;
      case 'personal-stylist':
        return <PersonalStylistScreen {...commonProps} />;
      
      // Analysis & Profiling
      case 'color-analysis':
        return <ColorAnalysisScreen {...commonProps} />;
      case 'body-shape-analysis':
        return <BodyShapeAnalysisScreen {...commonProps} />;
      case 'style-dna':
        return <StyleDNAScreen {...commonProps} />;
      
      // Advanced Features
      case 'style-twin-finder':
        return <StyleTwinFinderScreen {...commonProps} />;
      case 'virtual-fitting':
        return <VirtualFittingScreen {...commonProps} />;
      case 'smart-shopping':
        return <SmartShoppingScreen {...commonProps} />;
      
      // Planning & Organization
      case 'outfit-planner':
        return <OutfitPlannerScreen {...commonProps} />;
      case 'wardrobe-challenges':
        return <WardrobeChallengesScreen {...commonProps} />;
      case 'professional-wardrobe':
        return <ProfessionalWardrobeScreen {...commonProps} />;
      case 'event-planner':
        return <EventPlannerScreen {...commonProps} />;
      
      // Beauty & Styling
      case 'beauty-integration':
        return <BeautyIntegrationScreen {...commonProps} />;
      
      // AI Setup & Demo
      case 'ai-setup':
        return <AISetupScreen {...commonProps} />;
      case 'ai-integration-demo':
        return <AIIntegrationDemo {...commonProps} />;
      case 'ai-features-demo':
        return <AIPoweredFeaturesDemo {...commonProps} />;
      
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
        
        {/* API Setup Modal */}
        {showApiSetup && (
          <ApiSetupModal
            isOpen={showApiSetup}
            onClose={() => setShowApiSetup(false)}
            onSave={(apiKey) => {
              setOpenaiApiKey(apiKey);
              localStorage.setItem('whatToWear_openai_key', apiKey);
              setShowApiSetup(false);
            }}
            currentApiKey={openaiApiKey}
          />
        )}
        
        {/* AI Integration Status Bar (Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 right-4 bg-black text-white px-3 py-2 rounded-lg text-xs font-mono z-50">
            AI: {openaiApiKey ? '✓' : '✗'} | Screen: {currentScreen} | v{appVersion}
          </div>
        )}
      </div>
    </AppProvider>
  );
};

// Simple Onboarding Screen Component
const OnboardingScreen = ({ onComplete, navigateToScreen, openaiApiKey }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">👋</div>
            <h1 className="text-3xl font-black text-gray-800">Bem-vindo ao What to Wear!</h1>
            <p className="text-gray-600">A tua nova assistente de moda inteligente</p>
          </div>
        );
      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🤖</div>
            <h1 className="text-3xl font-black text-gray-800">Powered by AI</h1>
            <p className="text-gray-600">
              Cada peça que adicionares será analisada pela inteligência artificial para recomendações mais precisas
            </p>
            {!openaiApiKey && (
              <button
                onClick={() => navigateToScreen('ai-setup')}
                className="bg-purple-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                Configurar AI Agora
              </button>
            )}
          </div>
        );
      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">✨</div>
            <h1 className="text-3xl font-black text-gray-800">Vamos Começar!</h1>
            <p className="text-gray-600">
              Adiciona algumas peças ao teu armário digital e explora todas as funcionalidades
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 p-8">
          {renderStep()}
          
          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < step ? 'bg-purple-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextStep}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold"
            >
              {step === totalSteps ? 'Começar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatToWearApp;