// src/components/outfits/CreateOutfitScreen.js - ATUALIZAÇÃO PARA USAR ACESSÓRIOS SEPARADOS

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Shirt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import OutfitVisual from './OutfitVisual';
import CameraCapture from '../shared/CameraCapture';

const CreateOutfitScreen = ({ navigateToScreen, user }) => {
  const { 
    wardrobe, 
    accessories, // ✨ NOVO: usar acessórios separados
    addOutfit 
  } = useAppContext();
  const { uploadImageToStorage, dataURLtoFile } = useStorage();
  
  const [outfitData, setOutfitData] = useState({
    name: '',
    occasion: '',
    notes: '',
    outfitImageUrl: null,
    pieces: {
      top: null,
      bottom: null,
      shoes: null,
      accessories: []
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('top');
  const [showCamera, setShowCamera] = useState(false);
  const [previewMode, setPreviewMode] = useState('generated');
  const [scrollPosition, setScrollPosition] = useState(0);

  const scrollRef = useRef(null);

  // ✨ ATUALIZADO: Categorias agora incluem acessórios da coleção separada
  const categories = [
    { 
      id: 'top', 
      name: 'Top', 
      items: wardrobe.filter(item => 
        ['Camisas', 'Camisolas/Sweaters', 'Hoodies/Moletons', 'Blazers', 'Casacos', 'Blusas', 'Tops', 'Cardigans', 'Knitwear', 'Bodies', 'Crop Tops', 'Camisoles', 'Túnicas'].includes(item.category)
      )
    },
    { 
      id: 'bottom', 
      name: 'Bottom', 
      items: wardrobe.filter(item => 
        ['Calças', 'Jeans', 'Vestidos', 'Saias', 'Shorts', 'Bermudas', 'Leggings', 'Chinos', 'Calças de Fato'].includes(item.category)
      )
    },
    { 
      id: 'shoes', 
      name: 'Sapatos', 
      items: wardrobe.filter(item => 
        ['Sapatos', 'Ténis/Sneakers', 'Sapatos de Salto', 'Sandálias', 'Botas (Femininas)', 'Botas (Masculinas)', 'Sabrinas/Bailarinas', 'Wedges', 'Sapatos Formais', 'Mocassins'].includes(item.category)
      )
    },
    { 
      id: 'accessories', 
      name: 'Acessórios', 
      items: accessories // ✨ NOVO: usar a coleção de acessórios separada
    }
  ];

  // Preserve scroll position when changing categories
  useEffect(() => {
    if (scrollRef.current && scrollPosition > 0) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [selectedCategory]);

  const handleSelectItem = (itemId) => {
    // Save current scroll position
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollTop);
    }

    if (selectedCategory === 'accessories') {
      const currentAccessories = outfitData.pieces.accessories || [];
      const newAccessories = currentAccessories.includes(itemId)
        ? currentAccessories.filter(id => id !== itemId)
        : [...currentAccessories, itemId];
      
      setOutfitData(prev => ({
        ...prev,
        pieces: {
          ...prev.pieces,
          accessories: newAccessories
        }
      }));
    } else {
      setOutfitData(prev => ({
        ...prev,
        pieces: {
          ...prev.pieces,
          [selectedCategory]: prev.pieces[selectedCategory] === itemId ? null : itemId
        }
      }));
    }
  };

  const handleSave = async () => {
    if (!outfitData.name.trim()) {
      alert('Por favor insere um nome para o outfit.');
      return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = null;

      // Upload da imagem se disponível
      if (outfitData.outfitImageUrl && outfitData.outfitImageUrl.startsWith('data:')) {
        const imageFile = dataURLtoFile(outfitData.outfitImageUrl, 'outfit.jpg');
        const imagePath = `outfits/${user.uid}/${Date.now()}_${imageFile.name}`;
        finalImageUrl = await uploadImageToStorage(imageFile, imagePath);
      }

      // Dados finais do outfit
      const finalOutfitData = {
        ...outfitData,
        outfitImageUrl: finalImageUrl || outfitData.outfitImageUrl
      };

      await addOutfit(finalOutfitData);
      
      alert('Outfit criado com sucesso!');
      navigateToScreen('outfits');
      
    } catch (error) {
      console.error('Erro ao criar outfit:', error);
      alert('Erro ao criar outfit. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor escolhe uma imagem menor que 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setOutfitData(prev => ({ ...prev, outfitImageUrl: e.target.result }));
        setPreviewMode('photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setOutfitData(prev => ({ ...prev, outfitImageUrl: photoDataUrl }));
    setPreviewMode('photo');
    setShowCamera(false);
  };

  const isItemSelected = (itemId) => {
    if (selectedCategory === 'accessories') {
      return outfitData.pieces.accessories?.includes(itemId) || false;
    }
    return outfitData.pieces[selectedCategory] === itemId;
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('outfits')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Criar Outfit</h1>
        </div>

        <div 
          ref={scrollRef}
          className="bg-white rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto"
        >
          {/* Outfit Preview */}
          <OutfitPreview 
            outfitData={outfitData}
            previewMode={previewMode}
            setPreviewMode={setPreviewMode}
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setShowCamera(true)}
            onRemoveImage={() => {
              setOutfitData(prev => ({ ...prev, outfitImageUrl: null }));
              setPreviewMode('generated');
            }}
          />

          {/* Outfit Details */}
          <OutfitDetailsForm 
            outfitData={outfitData}
            setOutfitData={setOutfitData}
          />

          {/* Category Selection */}
          <CategorySelector 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            scrollRef={scrollRef}
            setScrollPosition={setScrollPosition}
          />

          {/* Items Grid */}
          <ItemsGrid 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectItem={handleSelectItem}
            isItemSelected={isItemSelected}
            navigateToScreen={navigateToScreen}
          />

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={!outfitData.name.trim() || isLoading}
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando...' : 'Criar Outfit'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ✨ COMPONENTES AUXILIARES ATUALIZADOS

const OutfitPreview = ({ outfitData, previewMode, setPreviewMode, onImageUpload, onCameraOpen, onRemoveImage }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Preview do Outfit</h3>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => setPreviewMode('generated')}
          className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            previewMode === 'generated'
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Preview Gerado
        </button>
        <button
          onClick={() => setPreviewMode('photo')}
          className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
            previewMode === 'photo'
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Foto Real
        </button>
      </div>

      {previewMode === 'photo' ? (
        <div className="relative">
          {outfitData.outfitImageUrl ? (
            <div className="relative">
              <img
                src={outfitData.outfitImageUrl}
                alt="Outfit"
                className="w-full h-48 object-cover rounded-xl"
              />
              <button
                onClick={onRemoveImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onCameraOpen}
                className="h-32 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl flex flex-col items-center justify-center hover:bg-violet-100"
              >
                <Camera className="h-8 w-8 text-violet-500 mb-2" />
                <span className="text-sm text-violet-700">Fotografar</span>
              </button>
              
              <label className="h-32 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl flex flex-col items-center justify-center hover:bg-violet-100 cursor-pointer">
                <Upload className="h-8 w-8 text-violet-500 mb-2" />
                <span className="text-sm text-violet-700">Galeria</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      ) : (
        <OutfitVisual outfit={outfitData} isSmall={false} />
      )}
    </div>
  );
};

const OutfitDetailsForm = ({ outfitData, setOutfitData }) => {
  return (
    <div className="space-y-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome do Outfit *
        </label>
        <input
          type="text"
          value={outfitData.name}
          onChange={(e) => setOutfitData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Look trabalho, Casual weekend..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ocasião
        </label>
        <input
          type="text"
          value={outfitData.occasion}
          onChange={(e) => setOutfitData(prev => ({ ...prev, occasion: e.target.value }))}
          placeholder="Ex: Trabalho, Festa, Casual..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          value={outfitData.notes}
          onChange={(e) => setOutfitData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Notas sobre este outfit..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>
    </div>
  );
};

const CategorySelector = ({ categories, selectedCategory, setSelectedCategory, scrollRef, setScrollPosition }) => {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Escolher Peças</h3>
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => {
              if (scrollRef.current) {
                setScrollPosition(scrollRef.current.scrollTop);
              }
              setSelectedCategory(category.id);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-violet-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name} ({category.items.length})
          </button>
        ))}
      </div>
    </div>
  );
};

const ItemsGrid = ({ categories, selectedCategory, onSelectItem, isItemSelected, navigateToScreen }) => {
  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  
  if (!currentCategory || currentCategory.items.length === 0) {
    return (
      <div className="text-center py-8 mb-6">
        <Shirt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-4">
          Nenhuma peça nesta categoria ainda.
        </p>
        <button
          onClick={() => {
            if (selectedCategory === 'accessories') {
              navigateToScreen('add-accessory');
            } else {
              navigateToScreen('add-item');
            }
          }}
          className="text-violet-600 hover:underline text-sm"
        >
          Adicionar primeira peça
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {currentCategory.items.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelectItem(item.id)}
          className={`relative bg-gray-50 rounded-xl overflow-hidden cursor-pointer transition-all ${
            isItemSelected(item.id)
              ? 'ring-2 ring-violet-500 ring-offset-2'
              : 'hover:shadow-md'
          }`}
        >
          <div className="aspect-square">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Shirt className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {isItemSelected(item.id) && (
            <div className="absolute top-2 right-2 bg-violet-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              ✓
            </div>
          )}
          
          <div className="p-3">
            <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
            <p className="text-xs text-gray-500">{item.category}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CreateOutfitScreen;