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
  
  // ✅ CORRIGIDO: Estados da modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const availableCategories = getClothingCategoriesByGender(userProfile?.gender);

  React.useEffect(() => {
    if (selectedItem) {
      setEditedItem(selectedItem);
      setCustomMetadata(selectedItem.aiMetadata || '');
    }
  }, [selectedItem]);

  // ✅ CORRIGIDO: Função para abrir modal
  const handleImageClick = (imageUrl) => {
    console.log('🖼️ Clicou na imagem:', imageUrl); // Debug
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  // ✅ CORRIGIDO: Função para fechar modal
  const closeModal = () => {
    setShowImageModal(false);
    setModalImage(null);
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
        <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Peça não encontrada</h2>
            <p className="text-gray-600 mb-6">A peça que procuras não foi encontrada.</p>
            <button
              onClick={() => navigateToScreen('wardrobe')}
              className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              Voltar ao Guarda-Roupa
            </button>
          </div>
        </div>
        
        <BottomNavigation 
          currentScreen="item-detail" 
          navigateToScreen={navigateToScreen}
        />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      console.log('💾 A guardar peça:', selectedItem.id);
      await updateWardrobeItem(selectedItem.id, {
        ...editedItem,
        aiMetadata: customMetadata
      });
      setIsEditing(false);
      setIsEditingMetadata(false);
      alert('Peça atualizada com sucesso! ✨');
    } catch (error) {
      console.error('❌ Erro ao atualizar peça:', error);
      alert('Erro ao atualizar a peça: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tens certeza que queres eliminar esta peça? Esta ação não pode ser desfeita.')) {
      try {
        console.log('🗑️ A eliminar peça:', selectedItem.id);
        await deleteWardrobeItem(selectedItem.id, selectedItem.imageUrl);
        alert('Peça eliminada com sucesso!');
        navigateToScreen('wardrobe');
      } catch (error) {
        console.error('❌ Erro ao eliminar peça:', error);
        alert('Erro ao eliminar a peça: ' + error.message);
      }
    }
  };

  const generateAIMetadata = async () => {
    if (!selectedItem.imageUrl) {
      alert('Esta peça não tem imagem para análise!');
      return;
    }

    setIsGeneratingMetadata(true);
    
    try {
      const metadata = await generateGarmentMetadata(selectedItem.imageUrl, selectedItem);
      setCustomMetadata(metadata);
      alert('Análise AI gerada com sucesso! ✨');
    } catch (error) {
      console.error('❌ Erro ao gerar metadata AI:', error);
      alert('Erro ao gerar análise AI: ' + error.message);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const toggleTag = (tag) => {
    setEditedItem(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateToScreen('wardrobe')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
          <Sparkles className="h-4 w-4" />
          <span className="font-bold tracking-wide text-sm">DETALHES</span>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-white text-orange-500 p-3 rounded-full shadow-xl"
        >
          {isEditing ? <Save className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
        </button>
      </div>

      <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-orange-200 bg-clip-text text-transparent mb-8 transform -rotate-1 text-center">
        {selectedItem.name}
      </h1>

      {/* ✅ CORRIGIDO: Image Section com Modal Funcional */}
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
          {/* ✅ CORRIGIDO: Imagem clicável */}
          <img
            src={selectedItem.imageUrl}
            alt={selectedItem.name}
            className="w-full h-80 object-cover rounded-xl cursor-pointer transition-all duration-300 shadow-lg group-hover:shadow-2xl"
            onClick={() => handleImageClick(selectedItem.imageUrl)}
            onError={(e) => console.log('Erro ao carregar imagem:', e)}
          />
          
          {/* Overlay de hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
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
              <label className="block text-gray-700 font-semibold mb-2">Nome</label>
              <input
                type="text"
                value={editedItem.name || ''}
                onChange={(e) => setEditedItem(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Categoria</label>
                <select
                  value={editedItem.category || ''}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Cor</label>
                <select
                  value={editedItem.color || ''}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  {COMMON_COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Marca</label>
                <input
                  type="text"
                  value={editedItem.brand || ''}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Condição</label>
                <select
                  value={editedItem.condition || ''}
                  onChange={(e) => setEditedItem(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                >
                  {CONDITION_OPTIONS.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600 text-sm">Categoria</span>
              <p className="font-semibold">{selectedItem.category}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Cor</span>
              <p className="font-semibold">{selectedItem.color}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Marca</span>
              <p className="font-semibold">{selectedItem.brand || 'Não especificada'}</p>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Condição</span>
              <p className="font-semibold">{selectedItem.condition}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tags Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Tags</h2>
        
        {isEditing ? (
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  editedItem.tags?.includes(tag)
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedItem.tags?.length > 0 ? (
              selectedItem.tags.map(tag => (
                <span key={tag} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-medium">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-500 italic">Nenhuma tag definida</span>
            )}
          </div>
        )}
      </div>

      {/* AI Metadata Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Análise AI
          </h2>
          
          {selectedItem.imageUrl && (
            <button
              onClick={generateAIMetadata}
              disabled={isGeneratingMetadata}
              className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isGeneratingMetadata ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isGeneratingMetadata ? 'Analisando...' : 'Regenerar'}
            </button>
          )}
        </div>

        {customMetadata ? (
          <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400">
            <p className="text-purple-800">{customMetadata}</p>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Análise AI não disponível</p>
          </div>
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
      
      {/* ✅ CORRIGIDO: Modal de Visualização de Imagem */}
      {showImageModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative bg-white rounded-2xl p-4 max-w-sm max-h-[80vh] w-full">
            <button
              onClick={closeModal}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={modalImage}
              alt={selectedItem.name}
              className="w-full h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {/* Info da peça na modal */}
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
              
              {/* ✅ Botões de ação na modal */}
              <div className="flex gap-2 mt-3">
                <button 
                  onClick={() => {
                    closeModal();
                    setIsEditing(true);
                  }}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Editar
                </button>
                <button 
                  onClick={() => {
                    closeModal();
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