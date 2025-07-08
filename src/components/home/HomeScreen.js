import React from 'react';
import { 
  Sparkles, 
  Shirt, 
  ShoppingBag, 
  MessageCircle, 
  Package,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../hooks/useAuth';
import FeatureCard from './FeatureCard';

const HomeScreen = ({ navigateToScreen, user, setShowApiSetup }) => {
  const { wardrobe, outfits } = useAppContext();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
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

        <div className="text-center mb-8">
          <div className="mb-4 animate-bounce">
            <Shirt className="h-16 w-16 text-white mx-auto" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">What to Wear</h1>
          <p className="text-white/90">O teu assistente de moda com IA</p>
        </div>

        <div className="space-y-4">
          <FeatureCard
            icon={<Sparkles className="h-8 w-8" />}
            title="Recomendação Inteligente"
            subtitle="IA que entende qualquer situação específica"
            onClick={() => navigateToScreen('outfit-quiz')}
            gradient="from-blue-500 to-cyan-500"
          />
          
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8" />}
            title="Consultor de Estilo IA"
            subtitle="Chat com análise de fotos em tempo real"
            onClick={() => navigateToScreen('style-chat')}
            gradient="from-green-500 to-emerald-500"
          />
          
          <FeatureCard
            icon={<Shirt className="h-8 w-8" />}
            title="Armário Digital"
            subtitle="Gere e organize com IA"
            onClick={() => navigateToScreen('wardrobe')}
            gradient="from-orange-500 to-red-500"
          />

          <FeatureCard
            icon={<Package className="h-8 w-8" />}
            title="Meus Outfits"
            subtitle="Combina peças e cria looks"
            onClick={() => navigateToScreen('outfits')}
            gradient="from-violet-500 to-purple-500"
          />
          
          <FeatureCard
            icon={<ShoppingBag className="h-8 w-8" />}
            title="Recomendações Personalizadas"
            subtitle="IA analisa teu estilo e sugere compras"
            onClick={() => navigateToScreen('recommendations')}
            gradient="from-indigo-500 to-purple-500"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;