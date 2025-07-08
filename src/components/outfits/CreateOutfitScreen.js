import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Shirt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import OutfitVisual from './OutfitVisual';
import CameraCapture from '../shared/CameraCapture';

const CreateOutfitScreen = ({ navigateToScreen, user }) => {
  const { wardrobe, addOutfit } = useAppContext();
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

  const categories = [
    { id: 'top', name: 'Top', items: wardrobe.filter(item => 
      ['Camisas', 'Casacos'].includes(item.category)
    )},
    { id: 'bottom', name: 'Bottom', items: wardrobe.filter(item => 
      ['Calças', 'Vestidos'].includes(item.category)
    )},
    { id: 'shoes', name: 'Sapatos', items: wardrobe.filter(item => 
      item.category === 'Sapatos'
    )},
    { id: 'accessories', name: 'Acessórios', items: wardrobe.filter(item => 
      item.category === 'Acessórios'
    )}
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
      let outfitImageUrl = null;
      
      if (outfitData.outfitImageUrl && outfitData.outfitImageUrl.startsWith('data:')) {
        const file = dataURLtoFile(outfitData.outfitImageUrl, `outfit_${Date.now()}.jpg`);
        const imagePath = `outfits/${user.uid}/${Date.now()}.jpg`;
        outfitImageUrl = await uploadImageToStorage(file, imagePath);
      } else if (outfitData.outfitImageUrl) {
        outfitImageUrl = outfitData.outfitImageUrl;
      }

      await addOutfit({
        ...outfitData,
        outfitImageUrl: outfitImageUrl
      });
      navigateToScreen('outfits');
    } catch (error) {
      alert('Erro ao criar outfit: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor escolhe uma imagem menor que 5MB.');
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
            {isLoading ? 'A criar...' : 'Criar Outfit'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for outfit preview
const OutfitPreview = ({ 
  outfitData, 
  previewMode, 
  setPreviewMode, 
  onImageUpload, 
  onCameraOpen, 
  onRemoveImage 
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-700">Preview do Outfit</h3>
      <div className="flex space-x-2">
        <button
          onClick={() => setPreviewMode('generated')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            previewMode === 'generated'
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Peças
        </button>
        <button
          onClick={() => setPreviewMode('photo')}
          className={`px-3 py-1 rounded-full text-xs transition-colors ${
            previewMode === 'photo'
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          Foto
        </button>
      </div>
    </div>
    
    {previewMode === 'photo' && outfitData.outfitImageUrl ? (
      <div className="relative">
        <img 
          src={outfitData.outfitImageUrl} 
          alt="Outfit completo" 
          className="w-full h-64 object-cover rounded-lg"
        />
        <button
          onClick={onRemoveImage}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
        >
          ×
        </button>
      </div>
    ) : previewMode === 'photo' ? (
      <PhotoUploadArea 
        onImageUpload={onImageUpload}
        onCameraOpen={onCameraOpen}
      />
    ) : (
      <OutfitVisual outfit={outfitData} />
    )}
  </div>
);

// Component for photo upload area
const PhotoUploadArea = ({ onImageUpload, onCameraOpen }) => (
  <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center">
    <div className="flex space-x-4 mb-4">
      <button
        onClick={onCameraOpen}
        className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Camera className="h-8 w-8 text-blue-500 mb-2" />
        <span className="text-sm text-blue-600">Tirar Foto</span>
      </button>
      
      <label className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
        <Upload className="h-8 w-8 text-green-500 mb-2" />
        <span className="text-sm text-green-600">Carregar</span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
        />
      </label>
    </div>
    <p className="text-gray-500 text-sm text-center">Adiciona uma foto tua com o outfit vestido</p>
  </div>
);

// Component for outfit details form
const OutfitDetailsForm = ({ outfitData, setOutfitData }) => (
  <div className="space-y-4 mb-6">
    <div>
      <label className="block text-gray-700 font-semibold mb-2">Nome do Outfit *</label>
      <input
        type="text"
        value={outfitData.name}
        onChange={(e) => setOutfitData(prev => ({ ...prev, name: e.target.value }))}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        placeholder="Ex: Look casual de fim de semana"
      />
    </div>

    <div>
      <label className="block text-gray-700 font-semibold mb-2">Ocasião</label>
      <input
        type="text"
        value={outfitData.occasion}
        onChange={(e) => setOutfitData(prev => ({ ...prev, occasion: e.target.value }))}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        placeholder="Ex: Trabalho, Jantar, Festa..."
      />
    </div>

    <div>
      <label className="block text-gray-700 font-semibold mb-2">Notas</label>
      <textarea
        value={outfitData.notes}
        onChange={(e) => setOutfitData(prev => ({ ...prev, notes: e.target.value }))}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        rows="2"
        placeholder="Combina bem com tempo quente..."
      />
    </div>
  </div>
);

// Component for category selector
const CategorySelector = ({ 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  scrollRef, 
  setScrollPosition 
}) => (
  <div className="mb-4">
    <h3 className="font-semibold text-gray-700 mb-3">Selecionar Peças</h3>
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
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategory === category.id
              ? 'bg-violet-500 text-white'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {category.name} ({category.items.length})
        </button>
      ))}
    </div>
  </div>
);

// Component for items grid
const ItemsGrid = ({ 
  categories, 
  selectedCategory, 
  onSelectItem, 
  isItemSelected, 
  navigateToScreen 
}) => {
  const currentCategory = categories.find(cat => cat.id === selectedCategory);
  
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {currentCategory?.items.map((item) => (
        <div 
          key={item.id}
          onClick={() => onSelectItem(item.id)}
          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
            isItemSelected(item.id)
              ? 'border-violet-500 bg-violet-50'
              : 'border-gray-200 hover:border-violet-300'
          }`}
        >
          <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Shirt className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
          <p className="text-gray-500 text-xs">{item.color}</p>
        </div>
      ))}
      
      {currentCategory?.items.length === 0 && (
        <div className="col-span-2 text-center py-8">
          <Shirt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500">Nenhuma peça disponível nesta categoria</p>
          <button
            onClick={() => navigateToScreen('add-item')}
            className="mt-2 text-violet-600 text-sm underline"
          >
            Adicionar peças ao armário
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateOutfitScreen;