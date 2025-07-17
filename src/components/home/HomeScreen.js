// src/components/home/HomeScreen.js - VERSÃO COMPLETA COM ACESSÓRIOS

import React, { useState, useEffect } from 'react';
import { Home, User, Shirt, Watch, Palette, Sparkles, Plus, TrendingUp, Calendar, Settings, Target, BarChart3 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import BottomNavigation from '../shared/BottomNavigation';

const HomeScreen = ({ navigateToScreen }) => {
  const { 
    wardrobe, 
    accessories, 
    outfits, 
    userProfile, 
    wardrobeAnalytics,
    accessoriesAnalytics 
  } = useAppContext();

  const [isRevealed, setIsRevealed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Greeting baseado na hora
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Estatísticas para incluir acessórios
  const stats = [
    {
      label: 'Peças de Roupa',
      value: wardrobeAnalytics?.totalItems || 0,
      icon: Shirt,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      label: 'Acessórios',
      value: accessoriesAnalytics?.totalItems || 0,
      icon: Watch,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      label: 'Outfits Criados',
      value: outfits?.length || 0,
      icon: Palette,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      gradient: 'from-violet-400 to-purple-500'
    },
    {
      label: 'Análises AI',
      value: (wardrobeAnalytics?.aiAnalyzedItems || 0) + (accessoriesAnalytics?.aiAnalyzedItems || 0),
      icon: Sparkles,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  // Quick Actions atualizadas
  const quickActions = [
    {
      title: 'Adicionar Roupa',
      description: 'Nova peça ao armário',
      icon: Shirt,
      gradient: 'from-orange-400 to-red-500',
      action: () => navigateToScreen('add-item')
    },
    {
      title: 'Adicionar Acessório',
      description: 'Novo acessório à coleção',
      icon: Watch,
      gradient: 'from-emerald-400 to-teal-500',
      action: () => navigateToScreen('add-accessory')
    },
    {
      title: 'Criar Outfit',
      description: 'Combinar peças',
      icon: Palette,
      gradient: 'from-violet-400 to-purple-500',
      action: () => navigateToScreen('create-outfit')
    },
    {
      title: 'Consultor AI',
      description: 'Dicas personalizadas',
      icon: Sparkles,
      gradient: 'from-blue-400 to-indigo-500',
      action: () => navigateToScreen('style-chat')
    }
  ];

  // Main Features atualizadas
  const mainFeatures = [
    {
      title: 'Meu Armário',
      description: `${wardrobeAnalytics?.totalItems || 0} peças catalogadas`,
      icon: Shirt,
      gradient: 'from-orange-400 to-red-600',
      screen: 'wardrobe',
      stats: wardrobeAnalytics?.totalItems || 0
    },
    {
      title: 'Acessórios',
      description: `${accessoriesAnalytics?.totalItems || 0} acessórios organizados`,
      icon: Watch,
      gradient: 'from-emerald-400 to-teal-600',
      screen: 'accessories',
      stats: accessoriesAnalytics?.totalItems || 0
    },
    {
      title: 'Meus Outfits',
      description: `${outfits?.length || 0} combinações criadas`,
      icon: Palette,
      gradient: 'from-violet-400 to-purple-600',
      screen: 'outfits',
      stats: outfits?.length || 0
    },
    {
      title: 'Stylist AI',
      description: 'Consultoria personalizada',
      icon: Sparkles,
      gradient: 'from-blue-400 to-purple-600',
      screen: 'style-chat',
      isSpecial: true
    }
  ];

  // AI Features
  const aiFeatures = [
    {
      title: 'Style Chat',
      description: 'Conversa com o teu consultor AI',
      icon: Sparkles,
      screen: 'style-chat'
    },
    {
      title: 'Personal Stylist',
      description: 'Consultoria profissional completa',
      icon: User,
      screen: 'personal-stylist'
    },
    {
      title: 'Análise de Outfit',
      description: 'Análise inteligente de combinações',
      icon: Target,
      screen: 'outfit-analysis'
    },
    {
      title: 'Style DNA',
      description: 'Descobre o teu perfil de estilo',
      icon: BarChart3,
      screen: 'style-dna'
    }
  ];

  // Recomendações inteligentes
  const getSmartRecommendations = () => {
    const recommendations = [];
    const totalClothing = wardrobeAnalytics?.totalItems || 0;
    const totalAccessories = accessoriesAnalytics?.totalItems || 0;
    const totalOutfits = outfits?.length || 0;

    if (totalAccessories < totalClothing * 0.3 && totalClothing > 5) {
      recommendations.push({
        title: 'Adicionar Acessórios',
        description: `Tens ${totalAccessories} acessórios para ${totalClothing} roupas. Adiciona mais acessórios para versatilidade.`,
        icon: Watch,
        action: () => navigateToScreen('add-accessory'),
        color: 'emerald'
      });
    }

    if (totalOutfits < Math.max(totalClothing * 0.1, 3) && (totalClothing > 0 || totalAccessories > 0)) {
      recommendations.push({
        title: 'Criar Mais Outfits',
        description: `Com ${totalClothing + totalAccessories} itens, podes criar mais combinações.`,
        icon: Palette,
        action: () => navigateToScreen('create-outfit'),
        color: 'violet'
      });
    }

    if (totalClothing === 0 && totalAccessories === 0) {
      recommendations.push({
        title: 'Começar Coleção',
        description: 'Adiciona as primeiras peças ao teu armário digital.',
        icon: Plus,
        action: () => navigateToScreen('add-item'),
        color: 'blue'
      });
    }

    return recommendations.slice(0, 2);
  };

  const recommendations = getSmartRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 pb-24">
      
      {/* Header */}
      <div className={`transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="flex items-center justify-between mb-4 pt-8">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()}{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-white/80 text-sm">
              {currentTime.toLocaleDateString('pt-PT', { 
                weekday: 'long',
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
          <button
            onClick={() => navigateToScreen('profile-settings')}
            className="bg-white/20 text-white p-3 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>

        {/* Welcome Message */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <p className="text-white text-center">
            ✨ Bem-vindo ao teu armário digital inteligente ✨
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className={`grid grid-cols-2 gap-4 mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white transform transition-all duration-500 delay-${index * 100} hover:scale-105`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`h-6 w-6 ${stat.color.replace('text-', 'text-white')}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-white/90 font-medium">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Smart Recommendations */}
      {recommendations.length > 0 && (
        <div className={`mb-6 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Recomendações para Ti
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const Icon = rec.icon;
              return (
                <button
                  key={index}
                  onClick={rec.action}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/20 transition-all hover:scale-105"
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 bg-${rec.color}-500 rounded-full flex items-center justify-center mr-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{rec.title}</h3>
                      <p className="text-sm text-white/80">{rec.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className={`mb-6 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={action.title}
                onClick={action.action}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white hover:bg-white/20 transition-all hover:scale-105 transform delay-${index * 100}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.gradient} rounded-xl flex items-center justify-center mb-3 mx-auto`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs text-white/80">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Features */}
      <div className={`mb-6 transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Explorar</h2>
        <div className="space-y-3">
          {mainFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.title}
                onClick={() => navigateToScreen(feature.screen)}
                className={`w-full bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-left hover:bg-white/20 transition-all hover:scale-105 transform delay-${index * 100}`}
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mr-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-lg">{feature.title}</h3>
                    <p className="text-white/80 text-sm">{feature.description}</p>
                  </div>
                  <div className="text-white/60">
                    {feature.isSpecial ? (
                      <Sparkles className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5 rotate-45" />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* AI Features */}
      <div className={`mb-6 transform transition-all duration-1000 delay-600 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          Funcionalidades AI
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {aiFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <button
                key={feature.title}
                onClick={() => navigateToScreen(feature.screen)}
                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white hover:bg-white/20 transition-all hover:scale-105 transform delay-${index * 100}`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl flex items-center justify-center mb-3 mx-auto">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-medium text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-white/70">{feature.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Tip */}
      <div className={`transform transition-all duration-1000 delay-700 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="bg-gradient-to-r from-yellow-400/20 to-orange-400/20 backdrop-blur-sm rounded-2xl p-4 border border-yellow-300/30">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-3">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">Dica do Dia</h3>
          </div>
          <p className="text-white/90 text-sm">
            {totalAccessories === 0 
              ? "Adiciona alguns acessórios para transformar looks básicos em combinações sofisticadas! ⌚"
              : recommendations.length > 0
                ? "Experimenta criar um novo outfit combinando diferentes acessórios com as tuas peças favoritas! ✨"
                : "Usa a análise AI para descobrir novas formas de combinar as peças que já tens! 🤖"
            }
          </p>
        </div>
      </div>

      <BottomNavigation currentScreen="home" navigateToScreen={navigateToScreen} />
    </div>
  );
};

export default HomeScreen;