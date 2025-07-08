import React, { useState } from 'react';
import { ArrowLeft, Plus, Package } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import OutfitVisual from './OutfitVisual';

const OutfitsScreen = ({ navigateToScreen }) => {
  const { outfits, isLoadingOutfits, setSelectedOutfit, getItemById } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOutfits = outfits.filter(outfit => 
    outfit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (outfit.occasion && outfit.occasion.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOutfitClick = (outfit) => {
    setSelectedOutfit(outfit);
    navigateToScreen('outfit-detail');
  };

  if (isLoadingOutfits) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-400 to-purple-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin mb-4">
            <Package className="h-16 w-16 text-violet-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">A carregar outfits...</h2>
          <p className="text-gray-600">A sincronizar os teus looks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center">
            <button onClick={() => navigateToScreen('home')} className="text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Meus Outfits</h1>
          </div>
          <button 
            onClick={() => navigateToScreen('create-outfit')}
            className="bg-white text-violet-500 p-2 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar outfits..."
            className="w-full p-3 rounded-lg bg-white/90 backdrop-blur-sm border-none focus:outline-none focus:ring-2 focus:ring-white"
          />
        </div>

        <div className="space-y-4">
          {filteredOutfits.map((outfit) => (
            <OutfitCard 
              key={outfit.id}
              outfit={outfit}
              getItemById={getItemById}
              onClick={() => handleOutfitClick(outfit)}
            />
          ))}
        </div>

        {filteredOutfits.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/80">Nenhum outfit encontrado</p>
            <button
              onClick={() => navigateToScreen('create-outfit')}
              className="mt-4 bg-white text-violet-600 px-6 py-2 rounded-lg font-semibold"
            >
              Criar Primeiro Outfit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for individual outfit card
const OutfitCard = ({ outfit, getItemById, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105"
    >
      <div className="flex space-x-4">
        <div className="w-24 h-24 flex-shrink-0">
          <OutfitVisual outfit={outfit} size="small" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg mb-1">{outfit.name}</h3>
          {outfit.occasion && (
            <p className="text-violet-600 text-sm mb-2">{outfit.occasion}</p>
          )}
          <div className="flex flex-wrap gap-1">
            {outfit.pieces?.top && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {getItemById(outfit.pieces.top)?.name || 'Top'}
              </span>
            )}
            {outfit.pieces?.bottom && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {getItemById(outfit.pieces.bottom)?.name || 'Bottom'}
              </span>
            )}
            {outfit.pieces?.shoes && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                {getItemById(outfit.pieces.shoes)?.name || 'Shoes'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitsScreen;