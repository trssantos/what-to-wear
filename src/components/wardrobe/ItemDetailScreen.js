import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Sparkles, RefreshCw, Wand2, Save, X, Camera, Eye, ZoomIn } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { OPENAI_API_KEY, getClothingCategoriesByGender, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const ItemDetailScreen = ({ navigateToScreen, screenData }) => {
  const { updateWardrobeItem, deleteWardrobeItem, userProfile } = useAppContext();
  const { generateGarmentMetadata } = useGarmentAI();
  
  const selectedItem = screenData;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [editedItem, setEditedItem] = useState(selectedItem || {});
  const [customMetadata, setCustomMetadata] = useState(selectedItem?.aiMetadata || '');
  
  // ✅ EXATAMENTE IGUAL AO STYLECHATSCREEN
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const availableCategories = getClothingCategoriesByGender(userProfile?.gender);

  React.useEffect(() => {
    if (selectedItem) {
      setEditedItem(selectedItem);
      setCustomMetadata(selectedItem.aiMetadata || '');
    }
  }, [selectedItem]);

  // ✅ EXATAMENTE IGUAL AO STYLECHATSCREEN
  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  const handleSave = async () => {
    try {
      const updatedItem = {
        ...editedItem,
        aiMetadata: customMetadata
      };
      
      await updateWardrobeItem(editedItem.id, updatedItem);
      setIsEditing(false);
      setIsEditingMetadata(false);
      
      // Atualizar item local
      Object.assign(selectedItem, updatedItem);
    } catch (error) {
      console.error('Erro ao guardar item:', error);
      alert('Erro ao guardar alterações');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tens a certeza que queres eliminar esta peça? Esta ação não pode ser desfeita.')) {
      try {
        await deleteWardrobeItem(selectedItem.id);
        navigateToScreen('wardrobe');
      } catch (error) {
        console.error('Erro ao eliminar item:', error);
        alert('Erro ao eliminar peça');
      }
    }
  };

  const handleGenerateMetadata = async () => {
    if (!OPENAI_API_KEY) {
      alert('API Key do OpenAI não configurada');
      return;
    }

    setIsGeneratingMetadata(true);
    try {
      const metadata = await generateGarmentMetadata(selectedItem);
      setCustomMetadata(metadata);
      setIsEditingMetadata(true);
    } catch (error) {
      console.error('Erro ao gerar metadados:', error);
      alert('Erro ao gerar análise AI. Tenta novamente.');
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="text-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Peça não encontrada</h2>
              <p className="text-gray-600 mb-6">A peça que procuras não foi encontrada.</p>
              <button
                onClick={() => navigateToScreen('wardrobe')}
                className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors"
              >
                Voltar ao Armário
              </button>
            </div>
          </div>
        </div>
        <BottomNavigation currentScreen="item-detail" navigateToScreen={navigateToScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
      {/* Header com botão de voltar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateToScreen('wardrobe')}
          className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-colors shadow-lg"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl hover:bg-white/30 transition-colors shadow-lg flex items-center gap-2"
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
        </button>
      </div>

      <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-orange-200 bg-clip-text text-transparent mb-8 transform -rotate-1 text-center">
        {selectedItem.name}
      </h1>

      {/* ✅ IMAGEM COM MODAL - EXATAMENTE IGUAL AO STYLECHATSCREEN */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Foto da Peça
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ZoomIn className="h-4 w-4" />
            <span>Toca para ampliar</span>
          </div>
        </div>
        
        <div className="relative group">
          {/* ✅ IMAGEM CLICÁVEL - EXATAMENTE IGUAL AO STYLECHATSCREEN */}
          <img
            src={selectedItem.imageUrl}
            alt={selectedItem.name}
            className="w-full h-80 object-cover rounded-xl cursor-pointer transition-all duration-300 shadow-lg group-hover:shadow-2xl hover:opacity-90"
            onError={(e) => console.log('Erro ao carregar imagem:', e)}
          />
          
          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100" onClick={() => handleImageClick(selectedItem.imageUrl)}>
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
              <Eye className="h-8 w-8 text-gray-700" />
            </div>
          </div>
          
          {/* Badge AI */}
          {selectedItem.aiMetadata && (
            <div className="absolute top-4 right-4 bg-purple-500 p-2 rounded-full shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          )}
          
          {/* Badge de zoom */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <ZoomIn className="h-4 w-4 text-gray-700" />
          </div>
        </div>
      </div>

      {/* Basic Info Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Informações Básicas</h2>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
              <input
                type="text"
                value={editedItem.name || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={editedItem.category || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecionar categoria</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
              <select
                value={editedItem.color || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, color: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecionar cor</option>
                {COMMON_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marca (opcional)</label>
              <input
                type="text"
                value={editedItem.brand || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, brand: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={editedItem.condition || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Selecionar estado</option>
                {CONDITION_OPTIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Categoria</p>
              <p className="font-semibold text-gray-800">{selectedItem.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cor</p>
              <p className="font-semibold text-gray-800">{selectedItem.color}</p>
            </div>
            {selectedItem.brand && (
              <div>
                <p className="text-sm text-gray-600">Marca</p>
                <p className="font-semibold text-gray-800">{selectedItem.brand}</p>
              </div>
            )}
            {selectedItem.condition && (
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <p className="font-semibold text-gray-800">{selectedItem.condition}</p>
              </div>
            )}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedItem.tags.map(tag => (
                    <span key={tag} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Metadata Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
            Análise AI
          </h2>
          
          <div className="flex gap-2">
            {OPENAI_API_KEY && (
              <button
                onClick={handleGenerateMetadata}
                disabled={isGeneratingMetadata}
                className="bg-purple-500 text-white px-4 py-2 rounded-xl hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingMetadata ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {isGeneratingMetadata ? 'A gerar...' : 'Gerar'}
              </button>
            )}
            
            {selectedItem.aiMetadata && (
              <button
                onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                className="bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 transition-colors"
              >
                {isEditingMetadata ? 'Cancelar' : 'Editar'}
              </button>
            )}
          </div>
        </div>

        {isEditingMetadata ? (
          <textarea
            value={customMetadata}
            onChange={(e) => setCustomMetadata(e.target.value)}
            placeholder="Adicionar análise personalizada..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        ) : (
          <p className="text-gray-700 whitespace-pre-wrap">
            {selectedItem.aiMetadata || 'Nenhuma análise AI disponível. Clica em "Gerar" para criar uma análise automática desta peça.'}
          </p>
        )}
      </div>

      {/* Notes Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Notas</h2>
        
        {isEditing ? (
          <textarea
            value={editedItem.notes || ''}
            onChange={(e) => setEditedItem(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Adicionar notas sobre a peça..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
          />
        ) : (
          <p className="text-gray-700">
            {selectedItem.notes || 'Nenhuma nota adicionada'}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        {isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Guardar
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Eliminar
            </button>
            
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-blue-500 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              Editar
            </button>
          </>
        )}
      </div>

      {/* ✅ MODAL EXATAMENTE IGUAL AO STYLECHATSCREEN */}
      {showImageModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative bg-white rounded-2xl p-4 max-w-sm max-h-[80vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={modalImage}
              alt="Imagem ampliada"
              className="w-full h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* ✅ INFORMAÇÕES ADICIONAIS NA MODAL */}
            <div className="mt-3 text-center">
              <h3 className="font-semibold text-gray-800">{selectedItem.name}</h3>
              <p className="text-sm text-gray-600">{selectedItem.category} • {selectedItem.color}</p>
              {selectedItem.brand && (
                <p className="text-xs text-gray-500 mt-1">{selectedItem.brand}</p>
              )}
              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {selectedItem.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                  {selectedItem.tags.length > 3 && (
                    <span className="text-gray-400 text-xs">+{selectedItem.tags.length - 3}</span>
                  )}
                </div>
              )}
              
              {/* Botões de ação na modal */}
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    setShowImageModal(false);
                    setIsEditing(true);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => {
                    setShowImageModal(false);
                    navigateToScreen('create-outfit', { preSelectedItem: selectedItem });
                  }}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Criar Outfit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de navegação sempre presente */}
      <BottomNavigation 
        currentScreen="item-detail" 
        navigateToScreen={navigateToScreen}
      />
    </div>
  );
};

export default ItemDetailScreen;