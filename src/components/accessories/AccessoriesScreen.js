// src/components/accessories/AccessoriesScreen.js
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Filter, Watch, Sparkles, Grid, List, SlidersHorizontal, ChevronDown, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { getAccessoryCategoriesByGender, ACCESSORIES_COLOR_THEME } from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const AccessoriesScreen = ({ navigateToScreen }) => {
  const { accessories, userProfile } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
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

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCategoryDropdown && !event.target.closest('.category-dropdown')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showCategoryDropdown]);

  // Obter categorias baseadas no gênero do utilizador
  const availableCategories = getAccessoryCategoriesByGender(userProfile?.gender);
  
  // Criar lista de categorias para filtros (incluindo "Todas")
  const categories = ['Todas', ...availableCategories];

  // Estatísticas dos acessórios
  const totalPieces = accessories.length;
  const aiAnalyzedCount = accessories.filter(item => item.aiMetadata).length;
  const categoryCounts = availableCategories.length;

  // Função para toggle de categorias
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

  // Função para limpar categorias
  const clearCategories = () => {
    setSelectedCategories([]);
  };

  // Filtrar e ordenar acessórios
  const getFilteredAccessories = () => {
    let filtered = accessories.filter(item => {
      // Filtro de pesquisa
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase();
        const itemText = `${item.name} ${item.category} ${item.color} ${item.brand || ''} ${item.notes || ''} ${item.aiMetadata || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
        if (!itemText.includes(searchTerms)) return false;
      }

      // Filtro de múltiplas categorias
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

  const filteredAccessories = getFilteredAccessories();

  // Obter cores e marcas únicas para filtros
  const uniqueColors = [...new Set(accessories.map(item => item.color).filter(Boolean))].sort();
  const uniqueBrands = [...new Set(accessories.map(item => item.brand).filter(Boolean))].sort();
  const uniqueConditions = [...new Set(accessories.map(item => item.condition).filter(Boolean))].sort();

  const clearFilters = () => {
    setFilters({
      color: '',
      brand: '',
      condition: '',
      hasAI: undefined,
      tags: []
    });
    setSelectedCategories([]);
    setSearchQuery('');
  };

  const openItemDetail = (item) => {
    navigateToScreen('accessory-detail', item);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 p-6 pb-24">
      {/* Header */}
      <div className={`transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
            <Watch className="h-4 w-4" />
            <span className="font-bold tracking-wide text-sm">ACESSÓRIOS</span>
          </div>
          <button 
            onClick={() => navigateToScreen('add-accessory')}
            className="bg-white text-emerald-500 p-3 rounded-full shadow-xl transform hover:scale-110 transition-all"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-200 via-white to-teal-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
          ACCESSORIES COLLECTION
        </h1>
        
        {/* Mostrar informação do gênero se disponível */}
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
          <div className="text-white text-xs font-bold opacity-80">Acessórios</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-white">{aiAnalyzedCount}</div>
          <div className="text-white text-xs font-bold opacity-80">AI Analisados</div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <div className="text-2xl font-black text-white">{categoryCounts}</div>
          <div className="text-white text-xs font-bold opacity-80">Categorias</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`mb-4 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-600 h-5 w-5" />
          <input
            type="text"
            placeholder="Pesquisar acessórios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border-0 focus:ring-2 focus:ring-emerald-300 text-gray-800 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Filters and Controls */}
      <div className={`flex items-center justify-between mb-6 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Category Filter */}
        <div className="relative category-dropdown">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategories.length > 0 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-white/20 text-white backdrop-blur-sm'
            }`}
          >
            <span className="text-sm">
              {selectedCategories.length === 0 
                ? 'Categorias' 
                : selectedCategories.length === 1 
                  ? selectedCategories[0]
                  : `${selectedCategories.length} selecionadas`
              }
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto">
              <div className="p-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                      category === 'Todas' 
                        ? selectedCategories.length === 0
                          ? 'bg-emerald-100 text-emerald-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        : selectedCategories.includes(category)
                          ? 'bg-emerald-100 text-emerald-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 rounded-full transition-all ${
              showFilters 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'bg-white/20 text-white backdrop-blur-sm'
            }`}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-full bg-white/20 text-white backdrop-blur-sm text-sm border-0 focus:ring-2 focus:ring-emerald-300"
          >
            <option value="recent" className="text-gray-800">Mais Recentes</option>
            <option value="name" className="text-gray-800">Nome A-Z</option>
            <option value="category" className="text-gray-800">Categoria</option>
            <option value="color" className="text-gray-800">Cor</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-full bg-white/20 text-white backdrop-blur-sm"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <h3 className="text-white font-semibold mb-3">Filtros Avançados</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <select
              value={filters.color}
              onChange={(e) => setFilters(prev => ({ ...prev, color: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/20 text-white backdrop-blur-sm text-sm border-0"
            >
              <option value="" className="text-gray-800">Todas as Cores</option>
              {uniqueColors.map(color => (
                <option key={color} value={color} className="text-gray-800">{color}</option>
              ))}
            </select>

            <select
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="px-3 py-2 rounded-lg bg-white/20 text-white backdrop-blur-sm text-sm border-0"
            >
              <option value="" className="text-gray-800">Todas as Marcas</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand} className="text-gray-800">{brand}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={filters.hasAI === true}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    hasAI: e.target.checked ? true : undefined 
                  }))}
                  className="rounded border-white/30 bg-white/20 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Apenas com análise AI</span>
              </label>
            </div>

            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-white/20 text-white rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Selected Categories Pills */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map(category => (
            <div key={category} className="flex items-center space-x-1 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm">
              <span>{category}</span>
              <button
                onClick={() => toggleCategory(category)}
                className="ml-1 hover:bg-emerald-600 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={clearCategories}
            className="px-3 py-1 bg-white/20 text-white rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            Limpar Todas
          </button>
        </div>
      )}

      {/* Accessories Grid/List */}
      <div className={`transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {filteredAccessories.length === 0 ? (
          <div className="text-center py-12">
            <Watch className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {accessories.length === 0 ? 'Nenhum acessório ainda' : 'Nenhum acessório encontrado'}
            </h3>
            <p className="text-white/70 mb-6">
              {accessories.length === 0 
                ? 'Adiciona o teu primeiro acessório para começar a organizar a tua coleção!'
                : 'Tenta ajustar os filtros ou termos de pesquisa.'
              }
            </p>
            {accessories.length === 0 && (
              <button
                onClick={() => navigateToScreen('add-accessory')}
                className="bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-emerald-50 transition-colors"
              >
                Adicionar Primeiro Acessório
              </button>
            )}
          </div>
        ) : (
          <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
            {filteredAccessories.map((accessory) => (
              <div
                key={accessory.id}
                onClick={() => openItemDetail(accessory)}
                className={`bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center p-3' : 'p-3'
                }`}
              >
                {viewMode === 'grid' ? (
                  <>
                    <div className="aspect-square bg-emerald-100 rounded-xl mb-3 overflow-hidden">
                      {accessory.imageUrl ? (
                        <img 
                          src={accessory.imageUrl} 
                          alt={accessory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Watch className="h-8 w-8 text-emerald-400" />
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">{accessory.name}</h3>
                      <p className="text-sm text-emerald-600 mb-1">{accessory.category}</p>
                      <p className="text-xs text-gray-500">{accessory.color}</p>
                      
                      {accessory.aiMetadata && (
                        <div className="flex items-center mt-2">
                          <Sparkles className="h-3 w-3 text-emerald-500 mr-1" />
                          <span className="text-xs text-emerald-600">Análise AI</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 rounded-xl mr-4 overflow-hidden flex-shrink-0">
                      {accessory.imageUrl ? (
                        <img 
                          src={accessory.imageUrl} 
                          alt={accessory.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Watch className="h-6 w-6 text-emerald-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{accessory.name}</h3>
                      <div className="flex items-center space-x-3 text-sm">
                        <span className="text-emerald-600">{accessory.category}</span>
                        <span className="text-gray-500">{accessory.color}</span>
                        {accessory.aiMetadata && (
                          <div className="flex items-center">
                            <Sparkles className="h-3 w-3 text-emerald-500 mr-1" />
                            <span className="text-xs text-emerald-600">AI</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation currentScreen="accessories" navigateToScreen={navigateToScreen} />
    </div>
  );
};

export default AccessoriesScreen;