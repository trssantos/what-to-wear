// src/components/accessories/AccessoryDetailScreen.js
import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Sparkles, RefreshCw, Wand2, Save, X, Camera, Eye, ZoomIn, Watch } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { 
  OPENAI_API_KEY, 
  getAccessoryCategoriesByGender, 
  COMMON_COLORS, 
  ACCESSORIES_TAGS, 
  CONDITION_OPTIONS 
} from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const AccessoryDetailScreen = ({ navigateToScreen, screenData }) => {
  const { updateAccessory, deleteAccessory, userProfile } = useAppContext();
  const { generateGarmentMetadata } = useGarmentAI();
  
  const selectedAccessory = screenData;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [editedAccessory, setEditedAccessory] = useState(selectedAccessory || {});
  const [customMetadata, setCustomMetadata] = useState(selectedAccessory?.aiMetadata || '');
  
  // Modal de imagem
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const availableCategories = getAccessoryCategoriesByGender(userProfile?.gender);

  React.useEffect(() => {
    if (selectedAccessory) {
      setEditedAccessory(selectedAccessory);
      setCustomMetadata(selectedAccessory.aiMetadata || '');
    }
  }, [selectedAccessory]);

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  const handleSave = async () => {
    try {
      const updatedAccessory = {
        ...editedAccessory,
        aiMetadata: customMetadata
      };
      
      await updateAccessory(editedAccessory.id, updatedAccessory);
      setIsEditing(false);
      setIsEditingMetadata(false);
      
      // Atualizar item local
      Object.assign(selectedAccessory, updatedAccessory);
    } catch (error) {
      console.error('Erro ao guardar acessório:', error);
      alert('Erro ao guardar alterações');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tens a certeza que queres eliminar este acessório? Esta ação não pode ser desfeita.')) {
      try {
        await deleteAccessory(selectedAccessory.id);
        navigateToScreen('accessories');
      } catch (error) {
        console.error('Erro ao eliminar acessório:', error);
        alert('Erro ao eliminar acessório');
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
      const metadata = await generateGarmentMetadata(selectedAccessory);
      setCustomMetadata(metadata);
      setIsEditingMetadata(true);
    } catch (error) {
      console.error('Erro ao gerar metadados:', error);
      alert('Erro ao gerar análise AI. Tenta novamente.');
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleTagToggle = (tag) => {
    setEditedAccessory(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  if (!selectedAccessory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
        <div className="text-white text-center">
          <Watch className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>Acessório não encontrado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-8">
        <button onClick={() => navigateToScreen('accessories')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        
        <h1 className="text-xl font-bold text-white truncate max-w-48">
          {selectedAccessory.name}
        </h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-xl max-h-[85vh] overflow-y-auto">
        
        {/* Image Section */}
        <div className="relative">
          {selectedAccessory.imageUrl ? (
            <div className="relative">
              <img
                src={selectedAccessory.imageUrl}
                alt={selectedAccessory.name}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => handleImageClick(selectedAccessory.imageUrl)}
              />
              <button
                onClick={() => handleImageClick(selectedAccessory.imageUrl)}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="h-64 bg-emerald-100 flex items-center justify-center">
              <Watch className="h-16 w-16 text-emerald-300" />
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute bottom-4 left-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            {selectedAccessory.category}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Basic Info */}
          {isEditing ? (
            <div className="space-y-4 mb-6">
              <input
                type="text"
                value={editedAccessory.name}
                onChange={(e) => setEditedAccessory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full text-2xl font-bold border-b-2 border-emerald-200 focus:border-emerald-500 outline-none bg-transparent"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={editedAccessory.category}
                  onChange={(e) => setEditedAccessory(prev => ({ ...prev, category: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {availableCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={editedAccessory.color}
                  onChange={(e) => setEditedAccessory(prev => ({ ...prev, color: e.target.value }))}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {COMMON_COLORS.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{selectedAccessory.name}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <span className="font-medium">{selectedAccessory.color}</span>
                {selectedAccessory.brand && <span>• {selectedAccessory.brand}</span>}
                {selectedAccessory.condition && <span>• {selectedAccessory.condition}</span>}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Tags</h3>
            
            {isEditing ? (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {ACCESSORIES_TAGS.slice(0, 12).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        editedAccessory.tags?.includes(tag)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                
                {editedAccessory.tags && editedAccessory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {editedAccessory.tags.map(tag => (
                      <div key={tag} className="flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                        <span>{tag}</span>
                        <button
                          onClick={() => handleTagToggle(tag)}
                          className="ml-2 text-emerald-600 hover:text-emerald-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedAccessory.tags && selectedAccessory.tags.length > 0 ? (
                  selectedAccessory.tags.map(tag => (
                    <span key={tag} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 italic">Nenhuma tag adicionada</span>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {(selectedAccessory.notes || isEditing) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Notas</h3>
              {isEditing ? (
                <textarea
                  value={editedAccessory.notes || ''}
                  onChange={(e) => setEditedAccessory(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Adiciona notas sobre este acessório..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {selectedAccessory.notes || <span className="italic text-gray-400">Sem notas</span>}
                </p>
              )}
            </div>
          )}

          {/* AI Metadata Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Sparkles className="h-5 w-5 text-emerald-500 mr-2" />
                Análise AI
              </h3>
              
              {!isEditingMetadata && (
                <div className="flex items-center space-x-2">
                  {selectedAccessory.imageUrl && OPENAI_API_KEY && (
                    <button
                      onClick={handleGenerateMetadata}
                      disabled={isGeneratingMetadata}
                      className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingMetadata ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {selectedAccessory.aiMetadata ? 'Regenerar' : 'Gerar'}
                      </span>
                    </button>
                  )}
                  
                  {selectedAccessory.aiMetadata && (
                    <button
                      onClick={() => setIsEditingMetadata(true)}
                      className="p-1 text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditingMetadata ? (
              <div className="space-y-3">
                <textarea
                  value={customMetadata}
                  onChange={(e) => setCustomMetadata(e.target.value)}
                  placeholder="Adiciona ou edita a análise AI do acessório..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setIsEditingMetadata(false);
                      if (isEditing) handleSave();
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingMetadata(false);
                      setCustomMetadata(selectedAccessory.aiMetadata || '');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                {selectedAccessory.aiMetadata ? (
                  <p className="text-emerald-800 leading-relaxed">{selectedAccessory.aiMetadata}</p>
                ) : (
                  <div className="text-center py-4">
                    <Sparkles className="h-8 w-8 text-emerald-300 mx-auto mb-2" />
                    <p className="text-emerald-600 text-sm">
                      {selectedAccessory.imageUrl 
                        ? 'Clica em "Gerar" para analisar este acessório com AI'
                        : 'Adiciona uma imagem para gerar análise AI'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Item Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Data de Adição</h4>
              <p className="text-gray-800">
                {selectedAccessory.createdAt 
                  ? new Date(selectedAccessory.createdAt.seconds ? selectedAccessory.createdAt.seconds * 1000 : selectedAccessory.createdAt).toLocaleDateString('pt-PT')
                  : 'N/A'
                }
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">Última Atualização</h4>
              <p className="text-gray-800">
                {selectedAccessory.updatedAt 
                  ? new Date(selectedAccessory.updatedAt.seconds ? selectedAccessory.updatedAt.seconds * 1000 : selectedAccessory.updatedAt).toLocaleDateString('pt-PT')
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Guardar Alterações
              </button>
              
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedAccessory(selectedAccessory);
                  setIsEditingMetadata(false);
                  setCustomMetadata(selectedAccessory.aiMetadata || '');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-400 transition-colors flex items-center justify-center"
              >
                <X className="h-5 w-5 mr-2" />
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && modalImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={modalImage}
              alt={selectedAccessory.name}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <BottomNavigation currentScreen="accessories" navigateToScreen={navigateToScreen} />
    </div>
  );
};

export default AccessoryDetailScreen;