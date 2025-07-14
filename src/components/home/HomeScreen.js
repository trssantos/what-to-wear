// src/components/home/HomeScreen.js - Versão reorganizada
import React, { useState, useEffect } from 'react';
import { 
  User, Settings, LogOut, Shirt, Sparkles, Camera, 
  Palette, ShoppingBag, Calendar, Search, Plus,
  MessageCircle, Bot, Star, Dna, Users, Target, Eye,
  Briefcase, PartyPopper, Store, Package,
  TrendingUp, Zap, ChevronRight, Edit3
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../firebase';
import { OPENAI_API_KEY } from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const HomeScreen = ({ navigateToScreen, setShowApiSetup, screenData }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { signOut } = useAuth();
  const [user, setUser] = useState(null);
  
  const [activeTab, setActiveTab] = useState(screenData?.activeTab || 'quick');
  const [searchTerm, setSearchTerm] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (screenData?.activeTab) {
      setActiveTab(screenData.activeTab);
    }
  }, [screenData]);

  const getUserName = () => {
    if (userProfile?.name) {
      return userProfile.name;
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Utilizador';
  };

  // ✨ REORGANIZADO: Nova tab dedicada aos Outfits
  const featureCategories = {
    'quick': {
      name: 'Acesso Rápido',
      icon: <Zap className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: <Camera className="h-6 w-6" />,
          title: "Adicionar Peça",
          subtitle: "Fotografa e adiciona ao armário",
          screen: "add-item",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          icon: <Target className="h-6 w-6" />,
          title: "Análise Rápida",
          subtitle: "Vale a pena comprar esta peça?",
          screen: "quick-analysis",
          gradient: "from-pink-500 to-purple-500"
        },
        {
          icon: <MessageCircle className="h-6 w-6" />,
          title: "Consultor de Estilo",
          subtitle: "Chat direto com stylist IA",
          screen: "style-chat",
          gradient: "from-teal-500 to-cyan-500"
        },
        {
          icon: <Sparkles className="h-6 w-6" />,
          title: "Recomendação de Look",
          subtitle: "IA sugere outfit para qualquer ocasião",
          screen: "outfit-quiz",
          gradient: "from-blue-500 to-cyan-500"
        }
      ]
    },
    'wardrobe': {
      name: 'Armário',
      icon: <Shirt className="h-5 w-5" />,
      color: 'from-blue-500 to-indigo-500',
      features: [
        {
          icon: <Shirt className="h-6 w-6" />,
          title: "Meu Armário",
          subtitle: "Gerir todas as tuas peças",
          screen: "wardrobe",
          gradient: "from-blue-500 to-indigo-500"
        },
        {
          icon: <Camera className="h-6 w-6" />,
          title: "Adicionar Nova Peça",
          subtitle: "Fotografa e cataloga",
          screen: "add-item",
          gradient: "from-green-500 to-emerald-500"
        }
      ]
    },
    'analysis': {
      name: 'Análise Pessoal',
      icon: <Dna className="h-5 w-5" />,
      color: 'from-pink-500 to-rose-500',
      features: [
        {
          icon: <Palette className="h-6 w-6" />,
          title: "Análise de Cor",
          subtitle: "Descobre a tua estação de cor ideal",
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
      name: 'Assistentes IA',
      icon: <Bot className="h-5 w-5" />,
      color: 'from-green-500 to-teal-500',
      features: [
        {
          icon: <MessageCircle className="h-6 w-6" />,
          title: "Consultor de Estilo IA",
          subtitle: "Chat conversacional sobre moda",
          screen: "style-chat",
          gradient: "from-teal-500 to-cyan-500"
        },
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
        // ❌ REMOVIDO: "Análise de Look" (redundante com Análise Rápida)
      ]
    },
    'outfits': {
      name: 'Outfits & Looks',
      icon: <Package className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      features: [
        {
          icon: <Package className="h-6 w-6" />,
          title: "Meus Outfits",
          subtitle: "Coleção dos teus looks favoritos",
          screen: "outfits",
          gradient: "from-violet-500 to-purple-500"
        },
        {
          icon: <Plus className="h-6 w-6" />,
          title: "Criar Novo Outfit",
          subtitle: "Combina peças para novos looks",
          screen: "create-outfit",
          gradient: "from-orange-500 to-red-500"
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Análise de Outfit",
          subtitle: "Score e feedback completo do teu look",
          screen: "outfit-analysis",
          gradient: "from-emerald-500 to-teal-500"
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
        feature.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : featureCategories[activeTab]?.features || [];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 pb-20">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center pt-8 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Olá, {getUserName()}! 👋
              </h1>
              <p className="text-white/80 mt-1">O que vamos criar hoje?</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white"
              >
                <User className="h-6 w-6" />
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigateToScreen('profile-settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Settings className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-800">Definições</span>
                    </button>
                    {!OPENAI_API_KEY && (
                      <button
                        onClick={() => {
                          setShowApiSetup(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50"
                      >
                        <Bot className="h-4 w-4 text-orange-600" />
                        <span className="text-orange-800">Configurar IA</span>
                      </button>
                    )}
                    <div className="border-t my-2"></div>
                    <button
                      onClick={() => {
                        signOut();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" />
          <input
            type="text"
            placeholder="Pesquisar funcionalidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/20 backdrop-blur-sm text-white placeholder-white/60 pl-10 pr-4 py-3 rounded-xl border border-white/20 focus:border-white/40 focus:outline-none"
          />
        </div>
      </div>

      {/* Features Grid */}
      <div className="flex-1 p-6 pt-0">
        <div className="max-w-md mx-auto">
          {filteredFeatures.length > 0 ? (
            <div className="space-y-3">
              {filteredFeatures.map((feature, index) => (
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
              ))}
            </div>
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
      <BottomNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentScreen="home"
      />
    </div>
  );
};

export default HomeScreen;