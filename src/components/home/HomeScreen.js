// src/components/home/HomeScreen.js - VERSÃO CORRIGIDA

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

  // Definir variáveis para estatísticas
  const totalClothing = wardrobeAnalytics?.totalItems || 0;
  const totalAccessories = accessoriesAnalytics?.totalItems || 0;
  const totalOutfits = outfits?.length || 0;

  // Estatísticas para incluir acessórios
  const stats = [
    {
      label: 'Peças de Roupa',
      value: totalClothing,
      icon: Shirt,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
      gradient: 'from-orange-400 to-red-500'
    },
    {
      label: 'Acessórios',
      value: totalAccessories,
      icon: Watch,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      label: 'Outfits Criados',
      value: totalOutfits,
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
      description: `${totalClothing} peças catalogadas`,
      icon: Shirt,
      gradient: 'from-orange-400 to-red-600',
      screen: 'wardrobe',
      stats: totalClothing
    },
    {
      title: 'Acessórios',
      description: `${totalAccessories} acessórios organizados`,
      icon: Watch,
      gradient: 'from-emerald-400 to-teal-600',
      screen: 'accessories',
      stats: totalAccessories
    },
    {
      title: 'Meus Outfits',
      description: `${totalOutfits} combinações criadas`,
      icon: Palette,
      gradient: 'from-violet-400 to-purple-600',
      screen: 'outfits',
      stats: totalOutfits
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-white">
              {getGreeting()}{userProfile?.name ? `, ${userProfile.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-white/70 mt-1">
              {new Date().toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
            <Calendar className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className={`grid grid-cols-2 gap-4 mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {stats.map((stat, index) => (
          <div 
            key={index}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gray-800">{stat.value}</div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`mb-6 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`bg-gradient-to-r ${action.gradient} p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
            >
              <action.icon className="h-6 w-6 text-white mb-2" />
              <h3 className="font-bold text-white text-sm">{action.title}</h3>
              <p className="text-white/80 text-xs">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Features */}
      <div className={`mb-6 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Explorar</h2>
        <div className="space-y-3">
          {mainFeatures.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigateToScreen(feature.screen)}
              className={`w-full bg-gradient-to-r ${feature.gradient} p-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-between`}
            >
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-white">{feature.title}</h3>
                  <p className="text-white/80 text-sm">{feature.description}</p>
                </div>
              </div>
              {!feature.isSpecial && (
                <div className="text-2xl font-black text-white/90">
                  {feature.stats}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div className={`mb-6 transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="text-xl font-bold text-white mb-4">Inteligência Artificial</h2>
        <div className="grid grid-cols-2 gap-3">
          {aiFeatures.map((feature, index) => (
            <button
              key={index}
              onClick={() => navigateToScreen(feature.screen)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl hover:bg-white/20 transition-all"
            >
              <feature.icon className="h-6 w-6 text-white mb-2" />
              <h3 className="font-semibold text-white text-sm mb-1">{feature.title}</h3>
              <p className="text-white/70 text-xs">{feature.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Smart Tip */}
      <div className={`mb-6 transform transition-all duration-1000 delay-600 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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