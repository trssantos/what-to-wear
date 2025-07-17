// src/components/shared/BottomNavigation.js - ATUALIZAÇÃO PARA INCLUIR ACESSÓRIOS

import React from 'react';
import { Home, Shirt, Watch, Palette, Sparkles } from 'lucide-react';

const BottomNavigation = ({ currentScreen, navigateToScreen }) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      gradient: 'from-purple-400 to-pink-500'
    },
    {
      id: 'wardrobe',
      label: 'Armário',
      icon: Shirt,
      gradient: 'from-orange-400 to-red-500'
    },
    {
      id: 'accessories', // ✨ NOVO
      label: 'Acessórios',
      icon: Watch,
      gradient: 'from-emerald-400 to-teal-500'
    },
    {
      id: 'outfits',
      label: 'Outfits',
      icon: Palette,
      gradient: 'from-violet-400 to-purple-500'
    },
    {
      id: 'style-chat',
      label: 'AI',
      icon: Sparkles,
      gradient: 'from-blue-400 to-indigo-500'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-40">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => navigateToScreen(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105` 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;