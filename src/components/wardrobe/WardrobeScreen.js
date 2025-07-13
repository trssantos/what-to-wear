import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Shirt, Sparkles, Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { getClothingCategoriesByGender } from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const WardrobeScreen = ({ navigateToScreen }) => {
  const { wardrobe, userProfile } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]); // ✨ MUDANÇA: array em vez de string
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false); // ✨ NOVO
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'
  const [isRevealed, setIsRevealed] = useState(false);
  
  // Filtros avançados
  const [filters, setFilters] = useState({
    color: '',
    brand: '',
    condition: '',
    hasAI: undefined,
    tags: []
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✨ NOVO: Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCategoryDropdown]);

  // ✨ NOVO: Obter categorias baseadas no gênero do utilizador
  const availableCategories = getClothingCategoriesByGender(userProfile?.gender);
  
  // Criar lista de categorias para filtros (incluindo "Todas")
  const categories = ['Todas', ...availableCategories];

  // Estatísticas do armário
  const totalPieces = wardrobe.length;
  const aiAnalyzedCount = wardrobe.filter(item => item.aiMetadata).length;
  const categoryCounts = availableCategories.length;

  // ✨ NOVO: Função para toggle de categorias
  const toggleCategory = (category) => {
    if (category === 'Todas') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(prev => 
        prev.includes(category)
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  // ✨ NOVO: Função para limpar categorias
  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Filtrar e ordenar peças
  const getFilteredWardrobe = () => {
    let filtered = wardrobe.filter(item => {
      // Filtro de pesquisa
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase();
        const itemText = `${item.name} ${item.category} ${item.color} ${item.brand || ''} ${item.notes || ''} ${item.aiMetadata || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
        if (!itemText.includes(searchTerms)) return false;
      }

      // ✨ MUDANÇA: Filtro de múltiplas categorias
      if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;

      // Filtros avançados
      if (filters.color && item.color !== filters.color) return false;
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.condition && item.condition !== filters.condition) return false;
      if (filters.hasAI !== undefined) {
        const hasAI = Boolean(item.aiMetadata);
        if (filters.hasAI !== hasAI) return false;
      }
      if (filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.every(tag => 
          item.tags && item.tags.includes(tag)
        );
        if (!hasRequiredTags) return false;
      }

      return true;
    });

    // Ordenação
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        filtered.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'color':
        filtered.sort((a, b) => a.color.localeCompare(b.color));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return filtered;
  };

  const filteredWardrobe = getFilteredWardrobe();

  // Obter cores e marcas únicas para filtros
  const uniqueColors = [...new Set(wardrobe.map(item => item.color).filter(Boolean))].sort();
  const uniqueBrands = [...new Set(wardrobe.map(item => item.brand).filter(Boolean))].sort();
  const uniqueConditions = [...new Set(wardrobe.map(item => item.condition).filter(Boolean))].sort();

  const clearFilters = () => {
    setFilters({
      color: '',
      brand: '',
      condition: '',
      hasAI: undefined,
      tags: []
    });
    setSelectedCategories([]); // ✨ MUDANÇA
    setSearchQuery('');
  };

  const openItemDetail = (item) => {
    navigateToScreen('item-detail', item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
      {/* Header */}
      <div className={`transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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
        
        {/* ✨ Mostrar informação do gênero se disponível */}
        {userProfile?.gender && (
          <p className="text-center text-white/80 text-sm mb-4">
            Categorias personalizadas para {userProfile.gender === 'female' ? 'mulher' : userProfile.gender === 'male' ? 'homem' : 'estilo neutro'}
          </p>
        )}
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
          <div className="text-2xl font-black text-white">{categoryCounts}</div>
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
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="text-gray-400 hover:text-gray-600"
              title={viewMode === 'grid' ? 'Vista em lista' : 'Vista em grelha'}
            >
              {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className={`mb-4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg transform transition-all duration-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros Avançados
            </h3>
            <button
              onClick={clearFilters}
              className="text-orange-600 text-sm font-medium hover:text-orange-700"
            >
              Limpar Tudo
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="recent">Mais recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="category">Categoria</option>
                <option value="color">Cor</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Análise AI:</label>
              <select
                value={filters.hasAI === undefined ? '' : filters.hasAI.toString()}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  hasAI: e.target.value === '' ? undefined : e.target.value === 'true'
                }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">Todas</option>
                <option value="true">Com análise AI</option>
                <option value="false">Sem análise AI</option>
              </select>
            </div>
          </div>

          {/* ✨ NOVO: Dropdown de categorias */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Categorias ({selectedCategories.length} selecionadas):
            </label>
            <div className="relative category-dropdown">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm flex items-center justify-between bg-white"
              >
                <span className="text-gray-700">
                  {selectedCategories.length === 0 
                    ? 'Selecionar categorias...' 
                    : selectedCategories.length === 1 
                      ? selectedCategories[0]
                      : `${selectedCategories.length} categorias selecionadas`
                  }
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setSelectedCategories([]);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        selectedCategories.length === 0 
                          ? 'bg-orange-100 text-orange-700 font-medium' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Todas as categorias
                    </button>
                    {availableCategories.map(category => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`w-full text-left p-2 rounded text-sm transition-colors flex items-center justify-between ${
                          selectedCategories.includes(category)
                            ? 'bg-orange-100 text-orange-700 font-medium'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span>{category}</span>
                        {selectedCategories.includes(category) && (
                          <span className="text-orange-600">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Cor:</label>
              <select
                value={filters.color}
                onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">Todas as cores</option>
                {uniqueColors.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Marca:</label>
              <select
                value={filters.brand}
                onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">Todas as marcas</option>
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Condição:</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="">Todas</option>
                {uniqueConditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredWardrobe.length !== totalPieces && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
              <p className="text-orange-800 text-sm">
                A mostrar {filteredWardrobe.length} de {totalPieces} peças
              </p>
            </div>
          )}
        </div>
      )}

      {/* Categories - Scroll horizontal + info de selecionadas */}
      <div className={`mb-6 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Categorias selecionadas */}
        {selectedCategories.length > 0 && (
          <div className="mb-4 p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium text-sm">
                {selectedCategories.length} categoria{selectedCategories.length > 1 ? 's' : ''} selecionada{selectedCategories.length > 1 ? 's' : ''}
              </span>
              <button
                onClick={clearCategories}
                className="text-white/80 hover:text-white text-sm flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Limpar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <span
                  key={category}
                  className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                >
                  {category}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="hover:bg-orange-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scroll horizontal de categorias */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategories([])}
            className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-bold text-sm transform hover:scale-105 ${
              selectedCategories.length === 0
                ? 'bg-white text-orange-600 shadow-xl'
                : 'bg-white/20 text-white backdrop-blur-sm'
            }`}
          >
            Todas
          </button>
          {availableCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-bold text-sm transform hover:scale-105 ${
                selectedCategories.includes(category)
                  ? 'bg-white text-orange-600 shadow-xl'
                  : 'bg-white/20 text-white backdrop-blur-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Wardrobe Grid/List */}
      <div className={`transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {filteredWardrobe.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 gap-4" 
            : "space-y-3"
          }>
            {filteredWardrobe.map((item) => (
              <div
                key={item.id}
                onClick={() => openItemDetail(item)}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg cursor-pointer transform hover:scale-105 transition-all ${
                  viewMode === 'grid' 
                    ? 'p-4' 
                    : 'p-4 flex items-center space-x-4'
                }`}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="relative mb-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-xl"
                      />
                      {item.aiMetadata && (
                        <div className="absolute top-2 right-2 bg-purple-500 p-1 rounded-full">
                          <Sparkles className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{item.name}</h3>
                      <p className="text-gray-600 text-xs mb-1">{item.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 text-xs">{item.color}</span>
                        {item.brand && (
                          <span className="text-gray-400 text-xs">{item.brand}</span>
                        )}
                      </div>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="text-gray-400 text-xs">+{item.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-xl"
                      />
                      {item.aiMetadata && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 p-1 rounded-full">
                          <Sparkles className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>
                      <p className="text-gray-600 text-xs mb-1">{item.category} • {item.color}</p>
                      {item.brand && (
                        <p className="text-gray-400 text-xs">{item.brand}</p>
                      )}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center shadow-xl">
            <Shirt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {searchQuery || selectedCategories.length > 0 || Object.values(filters).some(f => f !== '' && f !== undefined && (!Array.isArray(f) || f.length > 0))
                ? 'Nenhuma peça encontrada'
                : 'O teu armário está vazio'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategories.length > 0 || Object.values(filters).some(f => f !== '' && f !== undefined && (!Array.isArray(f) || f.length > 0))
                ? 'Tenta ajustar os filtros de pesquisa.'
                : 'Adiciona a tua primeira peça para começar!'
              }
            </p>
            <button
              onClick={() => navigateToScreen('add-item')}
              className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Adicionar Peça
            </button>
          </div>
        )}
      </div>

      <BottomNavigation 
        currentScreen="item-detail" 
        navigateToScreen={navigateToScreen}
      />
    </div>
  );
};

export default WardrobeScreen;