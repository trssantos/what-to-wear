import React, { useState } from 'react';
import { 
  User, Settings, LogOut, Shirt, Sparkles, Camera, 
  Palette, ShoppingBag, Calendar, Search, Plus,
  MessageCircle, Bot, Star, Dna, Users, Target, Eye,
  Briefcase, PartyPopper, Store, Package,
  TrendingUp, Zap, Home, ChevronRight
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';

const HomeScreenReorganized = ({ navigateToScreen, setShowApiSetup, openaiApiKey }) => {
  const { wardrobe, outfits } = useAppContext();
  const { user, signOut } = useAuth();
  
  const [activeTab, setActiveTab] = useState('quick');
  const [searchTerm, setSearchTerm] = useState('');

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
          subtitle: "Análise de body shape",
          screen: "body-shape-analysis",
          gradient: "from-indigo-500 to-purple-500"
        },
        {
          icon: <Dna className="h-6 w-6" />,
          title: "Style DNA",
          subtitle: "O teu DNA de estilo único",
          screen: "style-dna",
          gradient: "from-emerald-500 to-teal-500"
        },
        {
          icon: <Users className="h-6 w-6" />,
          title: "Style Twin Finder",
          subtitle: "Encontra looks similares",
          screen: "style-twin-finder",
          gradient: "from-orange-500 to-red-500"
        }
      ]
    },
    'ai': {
      name: 'Assistentes IA',
      icon: <Bot className="h-5 w-5" />,
      color: 'from-emerald-500 to-teal-500',
      features: [
        {
          icon: <Bot className="h-6 w-6" />,
          title: "Personal Shopper IA",
          subtitle: "Assistente para compras inteligentes",
          screen: "personal-shopper",
          gradient: "from-purple-500 to-pink-500"
        },
        {
          icon: <Star className="h-6 w-6" />,
          title: "Estilista Pessoal IA",
          subtitle: "Conselhos profissionais personalizados",
          screen: "personal-stylist",
          gradient: "from-yellow-500 to-orange-500"
        },
        {
          icon: <TrendingUp className="h-6 w-6" />,
          title: "Recomendações Personalizadas",
          subtitle: "IA analisa teu estilo e sugere",
          screen: "recommendations",
          gradient: "from-indigo-500 to-purple-500"
        }
      ]
    },
    'planning': {
      name: 'Planeamento',
      icon: <Calendar className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
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
                  Olá, {user?.displayName?.split(' ')[0] || 'Utilizador'}!
                </h2>
                <p className="text-white/80 text-xs">
                  {wardrobe.length} peças • {outfits.length} outfits
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button 
                onClick={() => setShowApiSetup(true)}
                className="p-2 bg-white/20 rounded-full active:bg-white/30 transition-colors"
              >
                <Settings className="h-4 w-4 text-white" />
              </button>
              <button 
                onClick={signOut}
                className="p-2 bg-white/20 rounded-full active:bg-white/30 transition-colors"
              >
                <LogOut className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4">
        {/* Title Section (only on quick tab) */}
        {activeTab === 'quick' && !searchTerm && (
          <div className="text-center py-6">
            <div className="mb-3">
              <Shirt className="h-10 w-10 text-white mx-auto" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">What to Wear</h1>
            <p className="text-white/90 text-sm">O teu assistente de moda com IA</p>
          </div>
        )}

        {/* Page Title (for other tabs) */}
        {activeTab !== 'quick' && !searchTerm && (
          <div className="py-4">
            <h2 className="text-white font-bold text-xl text-center">
              {featureCategories[activeTab]?.name}
            </h2>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Procurar funcionalidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-xl border-0 focus:ring-2 focus:ring-white/50 focus:outline-none text-gray-800 placeholder-gray-500 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3 pb-4">
          {searchTerm && (
            <h3 className="text-white font-semibold text-base mb-3">
              Resultados ({filteredFeatures.length})
            </h3>
          )}
          
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feature, index) => (
              <FeatureCard
                key={index}
                {...feature}
                onClick={() => {
                  if (!openaiApiKey && feature.screen !== 'wardrobe' && feature.screen !== 'outfits') {
                    alert('Por favor configura a OpenAI API primeiro nas definições.');
                    return;
                  }
                  navigateToScreen(feature.screen);
                }}
                showCategory={!!searchTerm}
              />
            ))
          ) : (
            searchTerm && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/70 text-sm">Nenhum resultado encontrado</p>
              </div>
            )
          )}
        </div>

        {/* Stats (only on quick tab) */}
        {activeTab === 'quick' && !searchTerm && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-white font-bold text-lg">{wardrobe.length}</div>
              <div className="text-white/80 text-xs">Peças</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-white font-bold text-lg">{outfits.length}</div>
              <div className="text-white/80 text-xs">Outfits</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
              <div className="text-white font-bold text-lg">
                {wardrobe.length > 0 ? Math.floor(outfits.length / wardrobe.length * 100) : 0}%
              </div>
              <div className="text-white/80 text-xs">Utilização</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200/50">
          <div className="max-w-md mx-auto">
            <div className="flex justify-around py-1">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSearchTerm('');
                    }}
                    className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all ${
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