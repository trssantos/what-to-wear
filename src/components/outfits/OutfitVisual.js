// src/components/outfits/OutfitVisual.js - ATUALIZAÇÃO PARA USAR ACESSÓRIOS SEPARADOS

import React from 'react';
import { Shirt, Star } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const OutfitVisual = ({ outfit, isSmall = true }) => {
  const { 
    getItemById, 
    getAccessoryById // ✨ NOVO: função para obter acessórios
  } = useAppContext();

  if (!outfit || !outfit.pieces) {
    return (
      <div className={`${isSmall ? 'h-32' : 'h-48'} bg-gray-100 rounded-xl flex items-center justify-center`}>
        <Shirt className={`${isSmall ? 'h-8 w-8' : 'h-12 w-12'} text-gray-300`} />
      </div>
    );
  }

  // Obter peças do armário
  const topItem = outfit.pieces.top ? getItemById(outfit.pieces.top) : null;
  const bottomItem = outfit.pieces.bottom ? getItemById(outfit.pieces.bottom) : null;
  const shoesItem = outfit.pieces.shoes ? getItemById(outfit.pieces.shoes) : null;
  
  // ✨ NOVO: Obter acessórios da coleção separada
  const getAccessoryItems = () => {
    if (!outfit.pieces.accessories || !Array.isArray(outfit.pieces.accessories)) {
      return [];
    }
    return outfit.pieces.accessories
      .map(accessoryId => getAccessoryById(accessoryId))
      .filter(Boolean); // Remove nulls/undefined
  };

  const accessoryItems = getAccessoryItems();

  const gridSize = isSmall ? 'h-32' : 'h-48';
  const itemSize = isSmall ? 'h-10 w-10' : 'h-16 w-16';
  const accessorySize = isSmall ? 'h-6 w-6' : 'h-8 w-8';

  return (
    <div className={`relative ${gridSize} bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200`}>
      {/* Layout em Grid 2x2 para as peças principais */}
      <div className="grid grid-cols-2 grid-rows-2 h-full gap-1 p-2">
        
        {/* Top - Canto superior esquerdo */}
        <div className="flex items-center justify-center">
          {topItem ? (
            <div className={`${itemSize} bg-white rounded-lg shadow-sm border overflow-hidden`}>
              {topItem.imageUrl ? (
                <img 
                  src={topItem.imageUrl} 
                  alt={topItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-orange-200 flex items-center justify-center">
                  <Shirt className={`${isSmall ? 'h-4 w-4' : 'h-6 w-6'} text-orange-600`} />
                </div>
              )}
            </div>
          ) : (
            <div className={`${itemSize} bg-white/50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-400`}>Top</span>
            </div>
          )}
        </div>

        {/* Acessórios - Canto superior direito */}
        <div className="flex items-center justify-center">
          {accessoryItems.length > 0 ? (
            <div className="relative">
              {/* Mostrar primeiro acessório */}
              <div className={`${itemSize} bg-white rounded-lg shadow-sm border overflow-hidden`}>
                {accessoryItems[0].imageUrl ? (
                  <img 
                    src={accessoryItems[0].imageUrl} 
                    alt={accessoryItems[0].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-200 flex items-center justify-center">
                    <Star className={`${isSmall ? 'h-4 w-4' : 'h-6 w-6'} text-emerald-600`} />
                  </div>
                )}
              </div>
              
              {/* Indicador de mais acessórios */}
              {accessoryItems.length > 1 && (
                <div className={`absolute -bottom-1 -right-1 ${isSmall ? 'w-4 h-4 text-xs' : 'w-6 h-6 text-sm'} bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold`}>
                  +{accessoryItems.length - 1}
                </div>
              )}
            </div>
          ) : (
            <div className={`${itemSize} bg-white/50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-400`}>Acessórios</span>
            </div>
          )}
        </div>

        {/* Bottom - Canto inferior esquerdo */}
        <div className="flex items-center justify-center">
          {bottomItem ? (
            <div className={`${itemSize} bg-white rounded-lg shadow-sm border overflow-hidden`}>
              {bottomItem.imageUrl ? (
                <img 
                  src={bottomItem.imageUrl} 
                  alt={bottomItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-violet-200 flex items-center justify-center">
                  <Shirt className={`${isSmall ? 'h-4 w-4' : 'h-6 w-6'} text-violet-600`} />
                </div>
              )}
            </div>
          ) : (
            <div className={`${itemSize} bg-white/50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-400`}>Bottom</span>
            </div>
          )}
        </div>

        {/* Shoes - Canto inferior direito */}
        <div className="flex items-center justify-center">
          {shoesItem ? (
            <div className={`${itemSize} bg-white rounded-lg shadow-sm border overflow-hidden`}>
              {shoesItem.imageUrl ? (
                <img 
                  src={shoesItem.imageUrl} 
                  alt={shoesItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Shirt className={`${isSmall ? 'h-4 w-4' : 'h-6 w-6'} text-gray-600`} />
                </div>
              )}
            </div>
          ) : (
            <div className={`${itemSize} bg-white/50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center`}>
              <span className={`${isSmall ? 'text-xs' : 'text-sm'} text-gray-400`}>Shoes</span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Acessórios no lado direito (se não for small) */}
      {!isSmall && accessoryItems.length > 1 && (
        <div className="absolute top-2 right-2 space-y-1">
          {accessoryItems.slice(1, 4).map((accessory, index) => (
            <div key={index} className={`${accessorySize} bg-white rounded-full shadow-sm border overflow-hidden`}>
              {accessory.imageUrl ? (
                <img 
                  src={accessory.imageUrl} 
                  alt={accessory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-200 flex items-center justify-center">
                  <Star className="h-3 w-3 text-emerald-600" />
                </div>
              )}
            </div>
          ))}
          
          {accessoryItems.length > 4 && (
            <div className={`${accessorySize} bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold`}>
              +{accessoryItems.length - 4}
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de preview gerado */}
      <div className="absolute bottom-1 left-1 bg-black/50 text-white px-2 py-0.5 rounded text-xs">
        Preview
      </div>

      {/* ✨ NOVO: Indicador de número total de peças */}
      <div className="absolute bottom-1 right-1 bg-violet-500 text-white px-2 py-0.5 rounded text-xs font-medium">
        {[topItem, bottomItem, shoesItem].filter(Boolean).length + accessoryItems.length} peças
      </div>
    </div>
  );
};

export default OutfitVisual;