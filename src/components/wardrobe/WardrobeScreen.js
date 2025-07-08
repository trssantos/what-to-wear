import React, { useState } from 'react';
import { ArrowLeft, Plus, Shirt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import ItemCard from './ItemCard';

const WardrobeScreen = ({ navigateToScreen }) => {
  const { wardrobe, isLoadingWardrobe, setSelectedItem } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['Todos', 'Camisas', 'Calças', 'Sapatos', 'Acessórios', 'Casacos', 'Vestidos'];

  const filteredWardrobe = wardrobe.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCategory && matchesSearch;
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    navigateToScreen('item-detail');
  };

  if (isLoadingWardrobe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin mb-4">
            <Shirt className="h-16 w-16 text-orange-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">A carregar armário...</h2>
          <p className="text-gray-600">A sincronizar as tuas peças</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center">
            <button onClick={() => navigateToScreen('home')} className="text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Armário Digital</h1>
          </div>
          <button 
            onClick={() => navigateToScreen('add-item')}
            className="bg-white text-orange-500 p-2 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar peças..."
            className="w-full p-3 rounded-lg bg-white/90 backdrop-blur-sm border-none focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-orange-600'
                    : 'bg-white/20 text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredWardrobe.map((item) => (
            <ItemCard 
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item)}
            />
          ))}
        </div>

        {filteredWardrobe.length === 0 && (
          <div className="text-center py-12">
            <Shirt className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80">Nenhuma peça encontrada</p>
            <button
              onClick={() => navigateToScreen('add-item')}
              className="mt-4 bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold"
            >
              Adicionar Primeira Peça
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeScreen;