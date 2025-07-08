import React, { useState } from 'react';
import { 
  Sparkles, 
  Shirt, 
  ShoppingBag, 
  MessageCircle, 
  Package,
  User,
  Settings,
  LogOut,
  Palette,
  Users,
  Calendar,
  Target,
  Store,
  Eye,
  Briefcase,
  PartyPopper,
  Lipstick,
  Bot,
  Dna,
  Star,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import FeatureCard from './FeatureCard';

const HomeScreen = ({ navigateToScreen, user, setShowApiSetup }) => {
  const { wardrobe, outfits } = useAppContext();
  const { signOut } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ai-tools');

  const featureCategories = {
    'ai-tools': {
      name: 'IA & Assistente',
      icon: <Sparkles className="h-5 w-5" />,
      color: 'from-blue-500 to-cyan-500',
      features: [
        {
          icon: <Sparkles className="h-8 w-8" />,
          title: "Recomendação Inteligente",
          subtitle: "IA que entende qualquer situação específica",
          screen: "outfit-quiz",
          gradient: "from-blue-500 to-cyan-500"
        },
        {
          icon: <MessageCircle className="h-8 w-8" />,
          title: "Consultor de Estilo IA",
          subtitle: "Chat com análise de fotos em tempo real",
          screen: "style-chat",
          gradient: "from-green-500 to-emerald-500"
        },
        {
          icon: <Bot className="h-8 w-8" />,
          title: "Personal Shopper IA",
          subtitle: "Assistente avançado para compras inteligentes",
          screen: "personal-shopper",
          gradient: "from-purple-500 to-pink-500"
        },
        {
          icon: <Star className="h-8 w-8" />,
          title: "Estilista Pessoal IA",
          subtitle: "Conselhos profissionais personalizados",
          screen: "personal-stylist",
          gradient: "from-yellow-500 to-orange-500"
        }
      ]
    },
    'analysis': {
      name: 'Análise & DNA',
      icon: <Dna className="h-5 w-5" />,
      color: 'from-purple-500 to-pink-500',
      features: [
        {
          icon: <Palette className="h-8 w-8" />,
          title: "Análise de Cores",
          subtitle: "Descobre as tuas cores perfeitas (Spring/Summer/Autumn/Winter)",
          screen: "color-analysis",
          gradient: "from-pink-500 to-rose-500"
        },
        {
          icon: <User className="h-8 w-8" />,
          title: "Formato Corporal",
          subtitle: "Análise de body shape e recomendações específicas",
          screen: "body-shape-analysis",
          gradient: "from-indigo-500 to-purple-500"
        },
        {
          icon: <Dna className="h-8 w-8" />,
          title: "Style DNA",
          subtitle: "O teu DNA de estilo único e partilhável",
          screen: "style-dna",
          gradient: "from-emerald-500 to-teal-500"
        },
        {
          icon: <Users className="h-8 w-8" />,
          title: "Style Twin Finder",
          subtitle: "Encontra looks similares e inspirações",
          screen: "style-twin-finder",
          gradient: "from-orange-500 to-red-500"
        }
      ]
    },
    'wardrobe': {
      name: 'Armário & Outfits',
      icon: <Shirt className="h-5 w-5" />,
      color: 'from-orange-500 to-red-500',
      features: [
        {
          icon: <Shirt className="h-8 w-8" />,
          title: "Armário Digital",
          subtitle: "Gere e organize com IA",
          screen: "wardrobe",
          gradient: "from-orange-500 to-red-500"
        },
        {
          icon: <Package className="h-8 w-8" />,
          title: "Meus Outfits",
          subtitle: "Combina peças e cria looks",
          screen: "outfits",
          gradient: "from-violet-500 to-purple-500"
        },
        {
          icon: <Target className="h-8 w-8" />,
          title: "Desafios do Armário",
          subtitle: "30 outfits em 30 dias e missions criativas",
          screen: "wardrobe-challenges",
          gradient: "from-red-500 to-pink-500"
        },
        {
          icon: <Eye className="h-8 w-8" />,
          title: "Sala de Provas Virtual",
          subtitle: "Experimenta peças virtualmente antes de comprar",
          screen: "virtual-fitting",
          gradient: "from-cyan-500 to-blue-500"
        }
      ]
    },
    'planning': {
      name: 'Planeamento',
      icon: <Calendar className="h-5 w-5" />,
      color: 'from-green-500 to-emerald-500',
      features: [
        {
          icon: <Calendar className="h-8 w-8" />,
          title: "Planeador de Outfits",
          subtitle: "Planeia os teus looks com antecedência",
          screen: "outfit-planner",
          gradient: "from-blue-500 to-indigo-500"
        },
        {
          icon: <Briefcase className="h-8 w-8" />,
          title: "Armário Profissional",
          subtitle: "Gestão especializada para o trabalho",
          screen: "professional-wardrobe",
          gradient: "from-gray-600 to-gray-800"
        },
        {
          icon: <PartyPopper className="h-8 w-8" />,
          title: "Planeador de Eventos",
          subtitle: "Outfits perfeitos para casamentos, festas e ocasiões",
          screen: "event-planner",
          gradient: "from-purple-500 to-pink-500"
        }
      ]
    },
    'shopping': {
      name: 'Shopping & Beleza',
      icon: <ShoppingBag className="h-5 w-5" />,
      color: 'from-indigo-500 to-purple-500',
      features: [
        {
          icon: <ShoppingBag className="h-8 w-8" />,
          title: "Recomendações Personalizadas",
          subtitle: "IA analisa teu estilo e sugere compras",
          screen: "recommendations",
          gradient: "from-indigo-500 to-purple-500"
        },
        {
          icon: <Store className="h-8 w-8" />,
          title: "Lista de Compras Inteligente",
          subtitle: "Shopping organizado com IA e budget tracking",
          screen: "smart-shopping",
          gradient: "from-green-500 to-teal-500"
        },
        {
          icon: <Lipstick className="h-8 w-8" />,
          title: "Integração Beauty",
          subtitle: "Maquilhagem, cabelo e unhas coordenados",
          screen: "beauty-integration",
          gradient: "from-pink-500 to-rose-500"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Olá, {user?.displayName}!</h2>
              <p className="text-white/80 text-sm">{wardrobe.length} peças • {outfits.length} outfits</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setShowApiSetup(true)}
              className="p-2 bg-white/20 rounded-full"
            >
              <Settings className="h-5 w-5 text-white" />
            </button>
            <button 
              onClick={signOut}
              className="p-2 bg-white/20 rounded-full"
            >
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="mb-4 animate-bounce">
            <Shirt className="h-16 w-16 text-white mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">What to Wear</h1>
          <p className="text-white/90">O teu assistente de moda com IA</p>
        </div>

        {/* Category Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {Object.entries(featureCategories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === key
                    ? 'bg-white text-purple-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category.icon}
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {featureCategories[activeCategory].features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              subtitle={feature.subtitle}
              onClick={() => navigateToScreen(feature.screen)}
              gradient={feature.gradient}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
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
      </div>
    </div>
  );
};

export default HomeScreen;