import React from 'react';
import { Zap, Shirt, Dna, Bot, Calendar, ShoppingBag } from 'lucide-react';

const BottomNavigation = ({ 
  activeTab, 
  setActiveTab, 
  navigateToScreen,
  currentScreen = null,
  className = "" 
}) => {
  
  // ✅ EXATAS mesmas categorias do HomeScreen original
  const bottomNavItems = [
    { id: 'quick', icon: Zap, label: 'Rápido' },
    { id: 'wardrobe', icon: Shirt, label: 'Armário' },
    { id: 'analysis', icon: Dna, label: 'Análise' },
    { id: 'ai', icon: Bot, label: 'IA' },
    { id: 'planning', icon: Calendar, label: 'Planos' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shopping' }
  ];

  // ✅ Mapeamento de ecrãs para categorias (para ecrãs que não são o home)
  const getActiveTabFromScreen = (screen) => {
    const screenMappings = {
      // Home sempre mostra o activeTab atual
      'home': activeTab,
      
      // Wardrobe category
      'wardrobe': 'wardrobe',
      'add-item': 'wardrobe',
      'item-detail': 'wardrobe',
      
      // Analysis category  
      'color-analysis': 'analysis',
      'body-shape-analysis': 'analysis',
      'style-dna': 'analysis',
      'style-twin-finder': 'analysis',
      
      // AI category
      'personal-stylist': 'ai',
      'quick-analysis': 'ai',
      'recommendations': 'ai',
      'personal-shopper': 'ai',
      
      // Planning category
      'outfits': 'planning',
      'create-outfit': 'planning',
      'outfit-detail': 'planning',
      'outfit-calendar': 'planning',
      'event-planner': 'planning',
      'business-outfits': 'planning',
      'special-events': 'planning',
      
      // Shopping category
      'smart-shopping': 'shopping',
      'wishlist': 'shopping',
      'fashion-trends': 'shopping',
      
      // Quick access category
      'outfit-quiz': 'quick'
    };
    
    return screenMappings[screen] || 'quick';
  };

  // ✅ Determinar qual tab está ativo
  const currentActiveTab = currentScreen ? getActiveTabFromScreen(currentScreen) : activeTab;

  // ✅ Handle click - funciona para ambos os casos (home e outros ecrãs)
  const handleNavClick = (item) => {
    if (setActiveTab) {
      // Se é o HomeScreen, apenas muda o tab
      setActiveTab(item.id);
    } else if (navigateToScreen) {
      // Se é outro ecrã, navega baseado na categoria
      const navigationMappings = {
        'quick': 'home', // Vai para home na tab quick
        'wardrobe': 'wardrobe',
        'analysis': 'color-analysis', // Primeira feature da categoria
        'ai': 'personal-stylist',
        'planning': 'outfits',
        'shopping': 'smart-shopping'
      };
      
      const targetScreen = navigationMappings[item.id] || 'home';
      
      if (targetScreen === 'home') {
        // Quando vai para home, define o activeTab
        navigateToScreen('home', { activeTab: item.id });
      } else {
        navigateToScreen(targetScreen);
      }
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="flex">
          <div className="grid grid-cols-6 w-full">
            {bottomNavItems.map((item) => {
              const isActive = currentActiveTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                    isActive 
                      ? 'text-purple-600 bg-purple-50' 
                      : 'text-gray-600 active:bg-gray-100'
                  }`}
                  style={{ 
                    WebkitTapHighlightColor: 'transparent',
                    touchAction: 'manipulation'
                  }}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-purple-600' : 'text-gray-600'}`} />
                  <span className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-purple-600' : 'text-gray-600'
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white"></div>
    </div>
  );
};

export default BottomNavigation;