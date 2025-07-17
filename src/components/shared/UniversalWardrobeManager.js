// src/components/shared/UniversalWardrobeManager.js
// Componente para gestão unificada de roupas e acessórios

import React, { useState, useMemo } from 'react';
import { Search, Filter, Shirt, Watch, Grid, List, Plus, Star } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const UniversalWardrobeManager = ({ 
  mode = 'selection', // 'selection' ou 'display'
  allowMultiple = true,
  onSelectionChange = () => {},
  selectedItems = [],
  showAddButtons = false,
  navigateToScreen = () => {}
}) => {
  const { wardrobe, accessories, getItemById, getAccessoryById } = useAppContext();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'clothing', 'accessories'
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('recent');

  // Combinar todos os itens em uma lista unificada
  const allItems = useMemo(() => {
    const clothingItems = wardrobe.map(item => ({
      ...item,
      itemType: 'clothing',
      displayCategory: `👕 ${item.category}`
    }));
    
    const accessoryItems = accessories.map(item => ({
      ...item,
      itemType: 'accessories',
      displayCategory: `⌚ ${item.category}`
    }));
    
    return [...clothingItems, ...accessoryItems];
  }, [wardrobe, accessories]);

  // Filtrar e ordenar itens
  const filteredItems = useMemo(() => {
    let filtered = allItems.filter(item => {
      // Filtro de tipo
      if (filterType === 'clothing' && item.itemType !== 'clothing') return false;
      if (filterType === 'accessories' && item.itemType !== 'accessories') return false;
      
      // Filtro de pesquisa
      if (searchQuery) {
        const searchTerms = searchQuery.toLowerCase();
        const itemText = `${item.name} ${item.category} ${item.color} ${item.brand || ''} ${item.notes || ''} ${item.aiMetadata || ''} ${item.tags?.join(' ') || ''}`.toLowerCase();
        if (!itemText.includes(searchTerms)) return false;
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
      case 'type':
        filtered.sort((a, b) => a.itemType.localeCompare(b.itemType));
        break;
      case 'recent':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    return filtered;
  }, [allItems, searchQuery, filterType, sortBy]);

  // Estatísticas
  const stats = {
    total: allItems.length,
    clothing: wardrobe.length,
    accessories: accessories.length,
    aiAnalyzed: allItems.filter(item => item.aiMetadata).length
  };

  const handleItemSelect = (item) => {
    if (mode !== 'selection') return;
    
    const itemId = item.id;
    let newSelection;
    
    if (allowMultiple) {
      newSelection = selectedItems.includes(itemId)
        ? selectedItems.filter(id => id !== itemId)
        : [...selectedItems, itemId];
    } else {
      newSelection = selectedItems.includes(itemId) ? [] : [itemId];
    }
    
    onSelectionChange(newSelection);
  };

  const isItemSelected = (itemId) => {
    return selectedItems.includes(itemId);
  };

  const getSelectedItemsData = () => {
    return selectedItems.map(id => {
      // Primeiro tenta roupas, depois acessórios
      return getItemById(id) || getAccessoryById(id);
    }).filter(Boolean);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      {/* Header com estatísticas */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          {mode === 'selection' ? 'Selecionar Itens' : 'Minha Coleção Completa'}
        </h2>
        
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.clothing}</div>
            <div className="text-xs text-gray-500">Roupas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.accessories}</div>
            <div className="text-xs text-gray-500">Acessórios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.aiAnalyzed}</div>
            <div className="text-xs text-gray-500">AI</div>
          </div>
        </div>
      </div>

      {/* Seleção atual (apenas no modo seleção) */}
      {mode === 'selection' && selectedItems.length > 0 && (
        <div className="mb-6 p-4 bg-violet-50 rounded-xl">
          <h3 className="font-semibold text-violet-800 mb-2">
            Selecionados ({selectedItems.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {getSelectedItemsData().map(item => (
              <div key={item.id} className="flex items-center bg-violet-200 text-violet-800 px-3 py-1 rounded-full text-sm">
                <span className="mr-1">
                  {item.itemType === 'clothing' ? '👕' : '⌚'}
                </span>
                <span>{item.name}</span>
                <button
                  onClick={() => handleItemSelect(item)}
                  className="ml-2 text-violet-600 hover:text-violet-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controles de pesquisa e filtros */}
      <div className="space-y-4 mb-6">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Pesquisar em toda a coleção..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>

        {/* Filtros e controles */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Filtro de tipo */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
            >
              <option value="all">Tudo ({stats.total})</option>
              <option value="clothing">Roupas ({stats.clothing})</option>
              <option value="accessories">Acessórios ({stats.accessories})</option>
            </select>

            {/* Ordenação */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
            >
              <option value="recent">Mais Recentes</option>
              <option value="name">Nome A-Z</option>
              <option value="category">Categoria</option>
              <option value="type">Tipo</option>
            </select>
          </div>

          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Botões de adicionar (se habilitado) */}
      {showAddButtons && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => navigateToScreen('add-item')}
            className="flex items-center justify-center p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Adicionar Roupa</span>
          </button>
          <button
            onClick={() => navigateToScreen('add-accessory')}
            className="flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Adicionar Acessório</span>
          </button>
        </div>
      )}

      {/* Lista/Grid de itens */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            {allItems.length === 0 ? <Shirt className="h-16 w-16 mx-auto" /> : <Search className="h-16 w-16 mx-auto" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {allItems.length === 0 ? 'Coleção vazia' : 'Nenhum item encontrado'}
          </h3>
          <p className="text-gray-500">
            {allItems.length === 0 
              ? 'Adiciona a primeira peça ou acessório para começar!'
              : 'Tenta ajustar os filtros ou termos de pesquisa.'
            }
          </p>
        </div>
      ) : (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-3'} max-h-96 overflow-y-auto`}>
          {filteredItems.map((item) => (
            <div
              key={`${item.itemType}-${item.id}`}
              onClick={() => handleItemSelect(item)}
              className={`relative bg-gray-50 rounded-xl overflow-hidden transition-all ${
                mode === 'selection' 
                  ? 'cursor-pointer hover:shadow-md' 
                  : 'cursor-default'
              } ${
                isItemSelected(item.id) 
                  ? 'ring-2 ring-violet-500 ring-offset-2' 
                  : ''
              } ${
                viewMode === 'list' ? 'flex items-center p-3' : 'p-3'
              }`}
            >
              {viewMode === 'grid' ? (
                <>
                  <div className="aspect-square bg-gray-200 rounded-lg mb-3 overflow-hidden">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.itemType === 'clothing' ? (
                          <Shirt className="h-8 w-8 text-orange-400" />
                        ) : (
                          <Watch className="h-8 w-8 text-emerald-400" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm truncate mb-1">{item.name}</h4>
                    <p className="text-xs text-gray-500 mb-1">{item.displayCategory}</p>
                    <p className="text-xs text-gray-400">{item.color}</p>
                    
                    {item.aiMetadata && (
                      <div className="flex items-center mt-2">
                        <Star className="h-3 w-3 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-600">AI</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mr-4 overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {item.itemType === 'clothing' ? (
                          <Shirt className="h-6 w-6 text-orange-400" />
                        ) : (
                          <Watch className="h-6 w-6 text-emerald-400" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
                    <div className="flex items-center space-x-3 text-sm">
                      <span className={`${item.itemType === 'clothing' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {item.displayCategory}
                      </span>
                      <span className="text-gray-500">{item.color}</span>
                      {item.aiMetadata && (
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-blue-500 mr-1" />
                          <span className="text-xs text-blue-600">AI</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {mode === 'selection' && isItemSelected(item.id) && (
                <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  ✓
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UniversalWardrobeManager;