import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Save, X, Camera, Upload, Eye, Shirt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import OutfitVisual from './OutfitVisual';
import CameraCapture from '../shared/CameraCapture';

const OutfitDetailScreen = ({ navigateToScreen }) => {
  const { 
    selectedOutfit, 
    setSelectedOutfit,
    updateOutfit, 
    deleteOutfit, 
    wardrobe, 
    getItemById 
  } = useAppContext();
  const { uploadImageToStorage, dataURLtoFile } = useStorage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedOutfit, setEditedOutfit] = useState({ ...selectedOutfit });
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [previewMode, setPreviewMode] = useState(selectedOutfit?.outfitImageUrl ? 'photo' : 'generated');
  const [selectedCategory, setSelectedCategory] = useState('top');
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

  useEffect(() => {
    if (scrollRef.current && scrollPosition > 0) {
      scrollRef.current.scrollTop = scrollPosition;
    }
  }, [selectedCategory]);

  const handleSelectItem = (itemId) => {
    if (scrollRef.current) {
      setScrollPosition(scrollRef.current.scrollTop);
    }

    if (selectedCategory === 'accessories') {
      const currentAccessories = editedOutfit.pieces.accessories || [];
      const newAccessories = currentAccessories.includes(itemId)
        ? currentAccessories.filter(id => id !== itemId)
        : [...currentAccessories, itemId];
      
      setEditedOutfit(prev => ({
        ...prev,
        pieces: {
          ...prev.pieces,
          accessories: newAccessories
        }
      }));
    } else {
      setEditedOutfit(prev => ({
        ...prev,
        pieces: {
          ...prev.pieces,
          [selectedCategory]: prev.pieces[selectedCategory] === itemId ? null : itemId
        }
      }));
    }
  };

  const isItemSelected = (itemId) => {
    if (selectedCategory === 'accessories') {
      return editedOutfit.pieces.accessories?.includes(itemId) || false;
    }
    return editedOutfit.pieces[selectedCategory] === itemId;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let outfitImageUrl = editedOutfit.outfitImageUrl;
      
      if (editedOutfit.outfitImageUrl && editedOutfit.outfitImageUrl.startsWith('data:')) {
        const file = dataURLtoFile(editedOutfit.outfitImageUrl, `outfit_${Date.now()}.jpg`);
        const imagePath = `outfits/${selectedOutfit.userId}/${Date.now()}.jpg`;
        outfitImageUrl = await uploadImageToStorage(file, imagePath);
      }

      const updatedOutfit = { ...editedOutfit, outfitImageUrl };
      await updateOutfit(selectedOutfit.id, updatedOutfit);
      setSelectedOutfit(updatedOutfit);
      setIsEditing(false);
    } catch (error) {
      alert('Erro ao guardar: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tens a certeza que queres eliminar este outfit?')) {
      setIsLoading(true);
      try {
        await deleteOutfit(selectedOutfit.id);
        navigateToScreen('outfits');
      } catch (error) {
        alert('Erro ao eliminar: ' + error.message);
      }
      setIsLoading(false);
    }
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
        setEditedOutfit({ ...editedOutfit, outfitImageUrl: e.target.result });
        setPreviewMode('photo');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setEditedOutfit({ ...editedOutfit, outfitImageUrl: photoDataUrl });
    setPreviewMode('photo');
    setShowCamera(false);
  };

  const getOutfitPieces = () => {
    const pieces = [];
    
    if (selectedOutfit.pieces?.top) {
      const item = getItemById(selectedOutfit.pieces.top);
      if (item) pieces.push({ ...item, type: 'Top' });
    }
    
    if (selectedOutfit.pieces?.bottom) {
      const item = getItemById(selectedOutfit.pieces.bottom);
      if (item) pieces.push({ ...item, type: 'Bottom' });
    }
    
    if (selectedOutfit.pieces?.shoes) {
      const item = getItemById(selectedOutfit.pieces.shoes);
      if (item) pieces.push({ ...item, type: 'Sapatos' });
    }
    
    if (selectedOutfit.pieces?.accessories) {
      selectedOutfit.pieces.accessories.forEach(accessoryId => {
        const item = getItemById(accessoryId);
        if (item) pieces.push({ ...item, type: 'Acessório' });
      });
    }
    
    return pieces;
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (!selectedOutfit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-400 to-purple-600 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Outfit não encontrado</p>
          <button 
            onClick={() => navigateToScreen('outfits')}
            className="mt-4 bg-white text-violet-600 px-6 py-2 rounded-lg"
          >
            Voltar aos Outfits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center">
            <button onClick={() => navigateToScreen('outfits')} className="text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Outfit' : 'Detalhes do Outfit'}
            </h1>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/20 rounded-full"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 bg-red-500/80 rounded-full"
                disabled={isLoading}
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>

        <div 
          ref={isEditing ? scrollRef : null}
          className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        >
          {/* Outfit Visual */}
          <div className="mb-6">
            {isEditing && (
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
            )}
            
            {isEditing && previewMode === 'photo' ? (
              <EditablePhotoPreview 
                editedOutfit={editedOutfit}
                setEditedOutfit={setEditedOutfit}
                setPreviewMode={setPreviewMode}
                onImageUpload={handleImageUpload}
                onCameraOpen={() => setShowCamera(true)}
              />
            ) : (
              <OutfitVisual outfit={isEditing ? editedOutfit : selectedOutfit} />
            )}
          </div>

          {isEditing ? (
            <EditingMode 
              editedOutfit={editedOutfit}
              setEditedOutfit={setEditedOutfit}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              scrollRef={scrollRef}
              setScrollPosition={setScrollPosition}
              handleSelectItem={handleSelectItem}
              isItemSelected={isItemSelected}
              handleSave={handleSave}
              isLoading={isLoading}
              onCancel={() => {
                setIsEditing(false);
                setEditedOutfit({ ...selectedOutfit });
                setPreviewMode(selectedOutfit.outfitImageUrl ? 'photo' : 'generated');
              }}
              navigateToScreen={navigateToScreen}
            />
          ) : (
            <ViewingMode 
              selectedOutfit={selectedOutfit}
              outfitPieces={getOutfitPieces()}
              navigateToScreen={navigateToScreen}
              setSelectedItem={(item) => {
                // This would need to be passed from parent or use context
                navigateToScreen('item-detail', item);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component for editable photo preview
const EditablePhotoPreview = ({ 
  editedOutfit, 
  setEditedOutfit, 
  setPreviewMode, 
  onImageUpload, 
  onCameraOpen 
}) => {
  if (editedOutfit.outfitImageUrl) {
    return (
      <div className="relative">
        <img 
          src={editedOutfit.outfitImageUrl} 
          alt="Outfit completo" 
          className="w-full h-64 object-cover rounded-lg"
        />
        <button
          onClick={() => {
            setEditedOutfit({ ...editedOutfit, outfitImageUrl: null });
            setPreviewMode('generated');
          }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
        >
          ×
        </button>
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
          <div className="flex space-x-4">
            <button
              onClick={onCameraOpen}
              className="p-3 bg-blue-500 rounded-full"
            >
              <Camera className="h-5 w-5 text-white" />
            </button>
            <label className="p-3 bg-green-500 rounded-full cursor-pointer">
              <Upload className="h-5 w-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
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
};

// Component for editing mode
const EditingMode = ({ 
  editedOutfit, 
  setEditedOutfit, 
  categories, 
  selectedCategory, 
  setSelectedCategory, 
  scrollRef, 
  setScrollPosition, 
  handleSelectItem, 
  isItemSelected, 
  handleSave, 
  isLoading, 
  onCancel, 
  navigateToScreen 
}) => (
  <div className="space-y-4">
    {/* Text fields */}
    <div>
      <label className="block text-gray-700 font-semibold mb-2">Nome do Outfit</label>
      <input
        type="text"
        value={editedOutfit.name}
        onChange={(e) => setEditedOutfit({ ...editedOutfit, name: e.target.value })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-gray-700 font-semibold mb-2">Ocasião</label>
      <input
        type="text"
        value={editedOutfit.occasion || ''}
        onChange={(e) => setEditedOutfit({ ...editedOutfit, occasion: e.target.value })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
      />
    </div>

    <div>
      <label className="block text-gray-700 font-semibold mb-2">Notas</label>
      <textarea
        value={editedOutfit.notes || ''}
        onChange={(e) => setEditedOutfit({ ...editedOutfit, notes: e.target.value })}
        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        rows="3"
      />
    </div>

    {/* Edit pieces section */}
    <div className="border-t pt-4">
      <h3 className="font-semibold text-gray-700 mb-3">Editar Peças do Outfit</h3>
      
      {/* Category Selection */}
      <div className="mb-4">
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
              className={`px-3 py-2 rounded-full whitespace-nowrap transition-colors text-sm ${
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

      {/* Items Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {categories.find(cat => cat.id === selectedCategory)?.items.map((item) => (
          <div 
            key={item.id}
            onClick={() => handleSelectItem(item.id)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
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
                  <Shirt className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <h4 className="font-medium text-gray-800 text-xs truncate">{item.name}</h4>
            <p className="text-gray-500 text-xs">{item.color}</p>
          </div>
        ))}
      </div>

      {categories.find(cat => cat.id === selectedCategory)?.items.length === 0 && (
        <div className="text-center py-6">
          <Shirt className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Nenhuma peça disponível nesta categoria</p>
          <button
            onClick={() => navigateToScreen('add-item')}
            className="mt-2 text-violet-600 text-sm underline"
          >
            Adicionar peças ao armário
          </button>
        </div>
      )}
    </div>

    {/* Action buttons */}
    <div className="flex space-x-3 pt-4">
      <button
        onClick={handleSave}
        disabled={isLoading}
        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <Save className="h-5 w-5" />
        <span>{isLoading ? 'A guardar...' : 'Guardar'}</span>
      </button>
      <button
        onClick={onCancel}
        className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
      >
        <X className="h-5 w-5" />
        <span>Cancelar</span>
      </button>
    </div>
  </div>
);

// Component for viewing mode
const ViewingMode = ({ selectedOutfit, outfitPieces, navigateToScreen, setSelectedItem }) => (
  <div className="space-y-4">
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedOutfit.name}</h2>
      {selectedOutfit.occasion && (
        <span className="bg-violet-100 text-violet-800 px-3 py-1 rounded-full text-sm">
          {selectedOutfit.occasion}
        </span>
      )}
    </div>

    {/* Outfit Pieces */}
    <div>
      <h3 className="font-semibold text-gray-700 mb-3">Peças do Outfit</h3>
      <div className="space-y-3">
        {outfitPieces.map((piece, index) => (
          <div 
            key={index}
            onClick={() => {
              setSelectedItem(piece);
              navigateToScreen('item-detail');
            }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {piece.imageUrl ? (
                <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shirt className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {piece.type}
                </span>
              </div>
              <h4 className="font-medium text-gray-800">{piece.name}</h4>
              <p className="text-gray-500 text-sm">{piece.color}</p>
            </div>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
        ))}
      </div>
    </div>

    {selectedOutfit.notes && (
      <div>
        <h3 className="font-semibold text-gray-700 mb-1">Notas</h3>
        <p className="text-gray-600">{selectedOutfit.notes}</p>
      </div>
    )}

    <div className="text-xs text-gray-400 pt-4 border-t">
      Criado em {new Date(selectedOutfit.createdAt).toLocaleDateString('pt-PT')}
    </div>
  </div>
);

export default OutfitDetailScreen;