// src/components/home/HomeScreen.js - Versão atualizada
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
      color: 'from-indigo-500 to-purple-500',
      features: [
        {
          icon: <Calendar className="h-6 w-6" />,
          title: "Planeador de Outfits",
          subtitle: "Planeia os teus looks semanais",
          screen: "outfit-planner",
          gradient: "from-blue-500 to-indigo-500"
        },
        {
          icon: <Briefcase className="h-6 w-6" />,
          title: "Armário Profissional",
          subtitle: "Gestão especializada para o trabalho",
          screen: "professional-wardrobe",
          gradient: "from-gray-600 to-gray-800"
        },
        {
          icon: <PartyPopper className="h-6 w-6" />,
          title: "Planeador de Eventos",
          subtitle: "Outfits para ocasiões especiais",
          screen: "event-planner",
          gradient: "from-purple-500 to-pink-500"
        }
      ]
    },
    'shopping': {
      name: 'Shopping & Beleza',
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      features: [
        {
          icon: <Store className="h-6 w-6" />,
          title: "Lista de Compras Inteligente",
          subtitle: "Shopping com IA e budget tracking",
          screen: "smart-shopping",
          gradient: "from-green-500 to-teal-500"
        },
        {
          icon: <Palette className="h-6 w-6" />,
          title: "Integração Beauty",
          subtitle: "Maquilhagem, cabelo e unhas",
          screen: "beauty-integration",
          gradient: "from-pink-500 to-rose-500"
        }
      ]
    }
  };

  const getAllFeatures = () => {
    const allFeatures = [];
    Object.values(featureCategories).forEach(category => {
      category.features.forEach(feature => {
        allFeatures.push({
          ...feature,
          category: category.name
        });
      });
    });
    return allFeatures;
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
                  {wardrobe.length} peças • {outfits.length} outfits
                </p>
              </div>
            </div>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={handleProfileMenuClick}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Settings className="h-5 w-5 text-white" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl py-2 w-56 z-50 border border-gray-200">
                  <button
                    onClick={(e) => handleMenuOptionClick('profile-settings', e)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 text-gray-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-800">Configurações do Perfil</div>
                      <div className="text-xs text-gray-500">Editar preferências pessoais</div>
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-100 my-1"></div>
                  
                 
                  <button
                    onClick={(e) => handleMenuOptionClick('logout', e)}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <div>
                      <div className="font-medium">Sair</div>
                      <div className="text-xs opacity-75">Terminar sessão</div>
                    </div>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Procurar funcionalidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-gray-500"
          />
        </div>
      </div>


      {/* Features Grid */}
      <div className="max-w-md mx-auto px-4 pb-4">
        <div className="space-y-3">
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