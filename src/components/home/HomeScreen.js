// src/components/home/HomeScreen.js - Versão completa atualizada
import React, { useState, useEffect } from 'react';
import { 
  User, Settings, LogOut, Shirt, Sparkles, Camera, 
  Palette, ShoppingBag, Calendar, Search, Plus,
  MessageCircle, Bot, Star, Dna, Users, Target, Eye,
  Briefcase, PartyPopper, Store, Package,
  TrendingUp, Zap, Home, ChevronRight, Edit3
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase';
import { OPENAI_API_KEY } from '../../utils/constants';

const HomeScreenReorganized = ({ navigateToScreen, setShowApiSetup }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState('quick');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Get current user from Firebase auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Get user's preferred name
  const getUserName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Utilizador';
  };

  const featureCategories = {
    'quick': {
      name: 'Acesso Rápido',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: <Sparkles className="h-6 w-6" />,
          title: "Recomendação Inteligente",
          subtitle: "IA que entende qualquer situação",
          screen: "outfit-quiz",
          gradient: "from-blue-500 to-cyan-500"
        },
        {
          icon: <Camera className="h-6 w-6" />,
          title: "Adicionar Peça",
          subtitle: "Fotografa e adiciona ao armário",
          screen: "add-item",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          icon: <Package className="h-6 w-6" />,
          title: "Criar Outfit",
          subtitle: "Combina peças rapidamente",
          screen: "create-outfit",
          gradient: "from-orange-500 to-red-500"
        },
        {
          icon: <Target className="h-6 w-6" />,
          title: "Análise Rápida",
          subtitle: "Vale a pena comprar esta peça?",
          screen: "quick-analysis",
          gradient: "from-purple-600 to-indigo-600"
        },
        {
          icon: <MessageCircle className="h-6 w-6" />,
          title: "Consultor de Estilo",
          subtitle: "Chat com análise de fotos",
          screen: "style-chat",
          gradient: "from-purple-500 to-pink-500"
        }
      ]
    },
    'wardrobe': {
      name: 'Armário & Outfits',
      icon: <Shirt className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        {
          icon: <Shirt className="h-6 w-6" />,
          title: "Armário Digital",
          subtitle: `${wardrobe.length} peças organizadas`,
          screen: "wardrobe",
          gradient: "from-blue-500 to-cyan-500"
        },
        {
          icon: <Package className="h-6 w-6" />,
          title: "Meus Outfits",
          subtitle: `${outfits.length} looks criados`,
          screen: "outfits",
          gradient: "from-violet-500 to-purple-500"
        },
        {
          icon: <Target className="h-6 w-6" />,
          title: "Desafios do Armário",
          subtitle: "30 outfits em 30 dias",
          screen: "wardrobe-challenges",
          gradient: "from-red-500 to-pink-500"
        },
        {
          icon: <Eye className="h-6 w-6" />,
          title: "Sala de Provas Virtual",
          subtitle: "Experimenta peças virtualmente",
          screen: "virtual-fitting",
          gradient: "from-cyan-500 to-blue-500"
        }
      ]
    },
    'analysis': {
      name: 'Análise & Perfil',
      icon: <Dna className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: <Palette className="h-6 w-6" />,
          title: "Análise de Cores",
          subtitle: "Descobre as tuas cores perfeitas",
          screen: "color-analysis",
          gradient: "from-pink-500 to-rose-500"
        },
        {
          icon: <User className="h-6 w-6" />,
          title: "Formato Corporal",
          subtitle: "Análise da tua silhueta ideal",
          screen: "body-shape-analysis",
          gradient: "from-indigo-500 to-purple-500"
        },
        {
          icon: <Dna className="h-6 w-6" />,
          title: "Style DNA",
          subtitle: "Descobre o teu código de estilo único",
          screen: "style-dna",
          gradient: "from-emerald-500 to-teal-500"
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: "Style Twin Finder",
          subtitle: "Encontra celebridades com o teu estilo",
          screen: "style-twin-finder",
          gradient: "from-yellow-500 to-orange-500"
        }
      ]
    },
    'ai': {
      name: 'IA & Styling',
      icon: <Bot className="h-5 w-5" />,
      color: 'from-green-500 to-teal-500',
      features: [
        {
          icon: <Bot className="h-6 w-6" />,
          title: "Personal Stylist IA",
          subtitle: "Consultas completas de styling",
          screen: "personal-stylist",
          gradient: "from-purple-500 to-indigo-500"
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Recomendações Personalizadas",
          subtitle: "Sugestões baseadas no teu perfil",
          screen: "recommendations",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          icon: <ShoppingBag className="h-6 w-6" />,
          title: "Personal Shopper IA",
          subtitle: "Assistente de compras inteligente",
          screen: "personal-shopper",
          gradient: "from-blue-500 to-teal-500"
        }
      ]
    },
    'planning': {
      name: 'Planeamento',
      icon: <Calendar className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      features: [
        {
          icon: <Calendar className="h-6 w-6" />,
          title: "Calendário de Looks",
          subtitle: "Planeia outfits com antecedência",
          screen: "outfit-calendar",
          gradient: "from-blue-500 to-indigo-500"
        },
        {
          icon: <Briefcase className="h-6 w-6" />,
          title: "Outfits Profissionais",
          subtitle: "Looks para trabalho e reuniões",
          screen: "business-outfits",
          gradient: "from-gray-500 to-blue-500"
        },
        {
          icon: <PartyPopper className="h-6 w-6" />,
          title: "Eventos Especiais",
          subtitle: "Preparação para ocasiões importantes",
          screen: "special-events",
          gradient: "from-pink-500 to-purple-500"
        }
      ]
    },
    'shopping': {
      name: 'Shopping',
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      features: [
        {
          icon: <ShoppingBag className="h-6 w-6" />,
          title: "Lista de Compras Inteligente",
          subtitle: "O que comprar baseado no armário",
          screen: "smart-shopping",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          icon: <Store className="h-6 w-6" />,
          title: "Wishlist & Favoritos",
          subtitle: "Guarda peças que queres comprar",
          screen: "wishlist",
          gradient: "from-purple-500 to-pink-500"
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Trends & Novidades",
          subtitle: "Últimas tendências da moda",
          screen: "fashion-trends",
          gradient: "from-orange-500 to-red-500"
        }
      ]
    }
  };

  const getAllFeatures = () => {
    return Object.keys(featureCategories).reduce((acc, category) => {
      const featuresWithCategory = featureCategories[category].features.map(feature => ({
        ...feature,
        category: featureCategories[category].name
      }));
      return [...acc, ...featuresWithCategory];
    }, []);
  };

  const filteredFeatures = searchTerm 
    ? getAllFeatures().filter(feature => 
        feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : featureCategories[activeTab]?.features || [];

  const bottomNavItems = [
    { id: 'quick', icon: Zap, label: 'Rápido' },
    { id: 'wardrobe', icon: Shirt, label: 'Armário' },
    { id: 'analysis', icon: Dna, label: 'Análise' },
    { id: 'ai', icon: Bot, label: 'IA' },
    { id: 'planning', icon: Calendar, label: 'Planos' },
    { id: 'shopping', icon: ShoppingBag, label: 'Shopping' }
  ];

  const handleProfileMenuClick = (e) => {
    e.stopPropagation();
    setShowProfileMenu(!showProfileMenu);
  };

  const handleMenuOptionClick = (action, e) => {
    e.stopPropagation();
    console.log(`Menu option clicked: ${action}`);
    setShowProfileMenu(false);
    
    switch (action) {
      case 'profile-settings':
        navigateToScreen('profile-settings');
        break;
      case 'ai-settings':
        if (setShowApiSetup) setShowApiSetup(true);
        break;
      case 'logout':
        signOut();
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showProfileMenu) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showProfileMenu]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 pb-20">
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-sm">
                  Olá, {getUserName()}!
                </h2>
                <p className="text-white/80 text-xs">
                  {OPENAI_API_KEY ? 'IA ativada' : 'Configure a IA'}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={handleProfileMenuClick}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <Settings className="h-4 w-4 text-white" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={(e) => handleMenuOptionClick('profile-settings', e)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Perfil & Configurações
                  </button>
                  <button
                    onClick={(e) => handleMenuOptionClick('ai-settings', e)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Configurar IA
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={(e) => handleMenuOptionClick('logout', e)}
                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Terminar Sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Procurar funcionalidades..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm border-0 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-md mx-auto px-4">
        <div className="space-y-3 mb-6">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                subtitle={feature.subtitle}
                onClick={() => navigateToScreen(feature.screen)}
                gradient={feature.gradient}
                showCategory={!!searchTerm}
                category={feature.category}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/80">Nenhuma funcionalidade encontrada</p>
              <p className="text-white/60 text-sm">Tenta outro termo de pesquisa</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-md mx-auto px-4 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3">Resumo Rápido</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{wardrobe.length}</div>
              <div className="text-white/80 text-sm">Peças no armário</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{outfits.length}</div>
              <div className="text-white/80 text-sm">Outfits criados</div>
            </div>
          </div>
          
          {userProfile && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="text-white/80 text-sm">
                <span className="font-medium">Estilo:</span> {userProfile.preferredStyle || 'Não definido'}
              </div>
              {userProfile.favoriteColors && userProfile.favoriteColors.length > 0 && (
                <div className="text-white/80 text-sm mt-1">
                  <span className="font-medium">Cores favoritas:</span> {userProfile.favoriteColors.length}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto">
          <div className="flex">
            <div className="grid grid-cols-6 w-full">
              {bottomNavItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                      isActive 
                        ? 'text-purple-600 bg-purple-50' 
                        : 'text-gray-600 active:bg-gray-100'
                    }`}
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
      </div>
    </div>
  );
};

// Mobile-optimized Feature Card
const FeatureCard = ({ icon, title, subtitle, onClick, gradient, showCategory, category }) => (
  <div 
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} p-4 rounded-xl shadow-sm cursor-pointer active:opacity-80 transition-opacity`}
    style={{ 
      WebkitTapHighlightColor: 'transparent',
      touchAction: 'manipulation'
    }}
  >
    <div className="flex items-center space-x-3">
      <div className="text-white flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-white font-semibold text-base leading-tight">
          {title}
        </h3>
        <p className="text-white/90 text-sm leading-tight mt-1">
          {subtitle}
        </p>
        {showCategory && category && (
          <p className="text-white/70 text-xs mt-1">
            {category}
          </p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-white/60 flex-shrink-0" />
    </div>
  </div>
);

export default HomeScreenReorganized;