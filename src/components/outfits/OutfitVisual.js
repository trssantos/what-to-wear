import React from 'react';
import { Shirt, Package, Star } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const OutfitVisual = ({ outfit, size = 'large' }) => {
  const { getItemById } = useAppContext();

  // Se tem foto do outfit completo, mostrar essa
  if (outfit.outfitImageUrl) {
    const containerHeight = size === 'small' ? 'h-32' : 'h-64';
    return (
      <div className={`relative ${containerHeight} bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg overflow-hidden border-2 border-gray-200`}>
        <img 
          src={outfit.outfitImageUrl} 
          alt="Outfit completo" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          Foto Real
        </div>
      </div>
    );
  }

  // Caso contrário, mostrar o preview gerado das peças
  const getTopItem = () => {
    if (!outfit.pieces?.top) return null;
    return getItemById(outfit.pieces.top);
  };

  const getBottomItem = () => {
    if (!outfit.pieces?.bottom) return null;
    return getItemById(outfit.pieces.bottom);
  };

  const getShoesItem = () => {
    if (!outfit.pieces?.shoes) return null;
    return getItemById(outfit.pieces.shoes);
  };

  const getAccessoryItems = () => {
    if (!outfit.pieces?.accessories || outfit.pieces.accessories.length === 0) return [];
    return outfit.pieces.accessories.map(id => getItemById(id)).filter(Boolean);
  };

  const isSmall = size === 'small';
  const containerHeight = isSmall ? 'h-32' : 'h-64';
  const itemHeight = isSmall ? 'h-8' : 'h-16';
  const accessorySize = isSmall ? 'h-6 w-6' : 'h-12 w-12';

  return (
    <div className={`relative ${containerHeight} bg-gradient-to-b from-blue-50 to-gray-100 rounded-lg overflow-hidden border-2 border-gray-200`}>
      {/* Top piece (shirt, jacket, etc.) */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3/4">
        {getTopItem() ? (
          <div className={`${itemHeight} bg-white rounded-lg shadow-sm border overflow-hidden`}>
            {getTopItem().imageUrl ? (
              <img 
                src={getTopItem().imageUrl} 
                alt={getTopItem().name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                <Shirt className={`${isSmall ? 'h-4 w-4' : 'h-8 w-8'} text-blue-600`} />
              </div>
            )}
          </div>
        ) : (
          <div className={`${itemHeight} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
            <span className={`text-gray-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>Top</span>
          </div>
        )}
      </div>

      {/* Bottom piece (pants, skirt, etc.) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3">
        {getBottomItem() ? (
          <div className={`${itemHeight} bg-white rounded-lg shadow-sm border overflow-hidden`}>
            {getBottomItem().imageUrl ? (
              <img 
                src={getBottomItem().imageUrl} 
                alt={getBottomItem().name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-green-200 flex items-center justify-center">
                <Package className={`${isSmall ? 'h-4 w-4' : 'h-8 w-8'} text-green-600`} />
              </div>
            )}
          </div>
        ) : (
          <div className={`${itemHeight} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
            <span className={`text-gray-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>Bottom</span>
          </div>
        )}
      </div>

      {/* Shoes */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/2">
        {getShoesItem() ? (
          <div className={`${itemHeight} bg-white rounded-lg shadow-sm border overflow-hidden`}>
            {getShoesItem().imageUrl ? (
              <img 
                src={getShoesItem().imageUrl} 
                alt={getShoesItem().name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-yellow-200 flex items-center justify-center">
                <Package className={`${isSmall ? 'h-4 w-4' : 'h-8 w-8'} text-yellow-600`} />
              </div>
            )}
          </div>
        ) : (
          <div className={`${itemHeight} border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center`}>
            <span className={`text-gray-400 ${isSmall ? 'text-xs' : 'text-sm'}`}>Shoes</span>
          </div>
        )}
      </div>

      {/* Accessories */}
      {getAccessoryItems().length > 0 && (
        <div className="absolute top-2 right-2 space-y-1">
          {getAccessoryItems().slice(0, 3).map((accessory, index) => (
            <div key={index} className={`${accessorySize} bg-white rounded-full shadow-sm border overflow-hidden`}>
              {accessory.imageUrl ? (
                <img 
                  src={accessory.imageUrl} 
                  alt={accessory.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-200 flex items-center justify-center">
                  <Star className={`${isSmall ? 'h-2 w-2' : 'h-4 w-4'} text-purple-600`} />
                </div>
              )}
            </div>
          ))}
          {getAccessoryItems().length > 3 && (
            <div className={`${accessorySize} bg-gray-200 rounded-full flex items-center justify-center`}>
              <span className="text-xs text-gray-600">+{getAccessoryItems().length - 3}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Indicador de preview gerado */}
      <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        Preview
      </div>
    </div>
  );
};

export default OutfitVisual;