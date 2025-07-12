import React, { useState } from 'react';
import { ArrowLeft, Plus, Shirt, Search, Filter, Sparkles, Eye, Heart, Zap } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import ItemCard from './ItemCard';

const WardrobeScreen = ({ navigateToScreen }) => {
  const { wardrobe, isLoadingWardrobe, setSelectedItem } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [isRevealed, setIsRevealed] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  const categories = ['Todos', 'Camisas', 'Calças', 'Sapatos', 'Acessórios', 'Casacos', 'Vestidos'];

  const filteredWardrobe = wardrobe.filter(item => {
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
                         (item.aiMetadata && item.aiMetadata.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'recent':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const handleItemClick = (item) => {
    setSelectedItem(item);
    navigateToScreen('item-detail');
  };

  const aiAnalyzedCount = wardrobe.filter(item => item.aiMetadata).length;
  const totalPieces = wardrobe.length;

  if (isLoadingWardrobe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-[3rem] p-8 text-center shadow-2xl border-4 border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <Shirt className="h-10 w-10 text-white animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">A carregar armário...</h2>
          <p className="text-gray-600 font-medium">A sincronizar as tuas peças</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header Magazine Style */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Shirt className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">MEU ARMÁRIO</span>
            </div>
            <button 
              onClick={() => navigateToScreen('add-item')}
              className="bg-white text-orange-500 p-3 rounded-full shadow-xl transform hover:scale-110 transition-all"
            >
              <Plus className="h-6 w-6" />
            </button>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-orange-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            DIGITAL WARDROBE
          </h1>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-3 gap-3 mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{totalPieces}</div>
            <div className="text-white text-xs font-bold opacity-80">Peças</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{aiAnalyzedCount}</div>
            <div className="text-white text-xs font-bold opacity-80">AI Analisadas</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="text-2xl font-black text-white">{categories.length - 1}</div>
            <div className="text-white text-xs font-bold opacity-80">Categorias</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`mb-4 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Procurar por nome, tags ou descrição AI..."
              className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white/90 backdrop-blur-sm border-none focus:outline-none focus:ring-2 focus:ring-white font-medium shadow-lg"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className={`mb-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg transform transition-all duration-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="mb-3">
              <label className="block text-gray-700 font-bold mb-2 text-sm">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="category">Categoria</option>
              </select>
            </div>
          </div>
        )}

        {/* Categories */}
        <div className={`mb-6 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-bold text-sm transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-white text-orange-600 shadow-xl'
                    : 'bg-white/20 text-white backdrop-blur-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Wardrobe Grid */}
        <div className={`transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {filteredWardrobe.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredWardrobe.map((item) => (
                <EnhancedItemCard 
                  key={item.id}
                  item={item}
                  onClick={() => handleItemClick(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Shirt className="h-12 w-12 text-white/50" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Nenhuma peça encontrada</h3>
              <p className="text-white/80 mb-6 font-medium">
                {searchQuery ? 'Tenta outro termo de pesquisa' : 'O teu armário está vazio'}
              </p>
              <button
                onClick={() => navigateToScreen('add-item')}
                className="bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-lg shadow-xl transform hover:scale-105 transition-all flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>ADICIONAR PRIMEIRA PEÇA</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {totalPieces > 0 && (
          <div className={`mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform transition-all duration-1000 delay-600 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Ações Rápidas</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => navigateToScreen('create-outfit')}
                className="bg-white/20 text-white p-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-all"
              >
                <Heart className="h-4 w-4 mx-auto mb-1" />
                Criar Outfit
              </button>
              <button 
                onClick={() => navigateToScreen('style-chat')}
                className="bg-white/20 text-white p-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-all"
              >
                <Sparkles className="h-4 w-4 mx-auto mb-1" />
                AI Styling
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Item Card Component
const EnhancedItemCard = ({ item, onClick }) => {
  return (
    <div 
      className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* AI Badge */}
      {item.aiMetadata && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Sparkles className="h-3 w-3" />
          <span>AI</span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Eye className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-gray-600 text-xs mb-2">{item.category} • {item.color}</p>
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-gray-400 text-xs">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* AI Metadata Preview */}
        {item.aiMetadata && (
          <div className="bg-purple-50 rounded-lg p-2 mt-2">
            <p className="text-purple-700 text-xs line-clamp-2 font-medium">
              {item.aiMetadata.substring(0, 80)}...
            </p>
          </div>
        )}

        {/* Brand */}
        {item.brand && (
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-gray-500 text-xs font-medium">{item.brand}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WardrobeScreen;