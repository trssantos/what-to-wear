import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Sparkles, RefreshCw, Wand2, Save, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { OPENAI_API_KEY } from '../../utils/constants';
import { CLOTHING_CATEGORIES, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';

const ItemDetailScreen = ({ navigateToScreen, screenData }) => {
  const { updateWardrobeItem, deleteWardrobeItem } = useAppContext();
  const { generateGarmentMetadata } = useGarmentAI();
  
  // ✅ CORREÇÃO: usar screenData em vez de selectedItem do contexto
  const selectedItem = screenData;
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [editedItem, setEditedItem] = useState(selectedItem || {});
  const [customMetadata, setCustomMetadata] = useState(selectedItem?.aiMetadata || '');

  React.useEffect(() => {
    if (selectedItem) {
      setEditedItem(selectedItem);
      setCustomMetadata(selectedItem.aiMetadata || '');
    }
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 flex items-center justify-center">
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

  const regenerateAIMetadata = async () => {
    if (!OPENAI_API_KEY) {
      alert('API key da OpenAI não configurada no sistema.');
      return;
    }
    
    if (!selectedItem.imageUrl) {
      alert('Esta peça não tem imagem para análise.');
      return;
    }

    setIsGeneratingMetadata(true);
    try {
      console.log('🔄 A regenerar metadata AI para:', selectedItem.name);
      const metadata = await generateGarmentMetadata(selectedItem.imageUrl, selectedItem);
      
      // Atualizar no servidor
      await updateWardrobeItem(selectedItem.id, {
        ...selectedItem,
        aiMetadata: metadata
      });
      
      // Atualizar estado local
      setCustomMetadata(metadata);
      alert('Análise AI regenerada com sucesso! ✨');
    } catch (error) {
      console.error('❌ Erro ao regenerar metadata:', error);
      alert('Erro ao regenerar análise: ' + error.message);
    }
    setIsGeneratingMetadata(false);
  };

  const saveCustomMetadata = async () => {
    try {
      await updateWardrobeItem(selectedItem.id, {
        ...selectedItem,
        aiMetadata: customMetadata
      });
      setIsEditingMetadata(false);
      alert('Análise atualizada com sucesso! ✨');
    } catch (error) {
      console.error('❌ Erro ao salvar metadata:', error);
      alert('Erro ao atualizar análise: ' + error.message);
    }
  };

  const handleTagToggle = (tag) => {
    setEditedItem(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6">
      <div className="max-w-lg mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigateToScreen('wardrobe')}
              className="mr-4 p-3 bg-white bg-opacity-20 rounded-2xl text-white hover:bg-opacity-30 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">Detalhes da Peça</h1>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setEditedItem(selectedItem);
                }}
                className="p-3 bg-white bg-opacity-20 rounded-2xl text-white hover:bg-opacity-30 transition-all"
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 bg-red-500 bg-opacity-80 rounded-2xl text-white hover:bg-opacity-100 transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          
          {/* Image */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {selectedItem.imageUrl ? (
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.name}
                className="w-full h-64 object-cover rounded-2xl"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center">
                <span className="text-gray-400 text-lg">Sem imagem</span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">Nome da Peça</label>
                  <input
                    type="text"
                    value={editedItem.name || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                    className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Categoria</label>
                  <select
                    value={editedItem.category || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                    className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Seleciona uma categoria</option>
                    {CLOTHING_CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Cor</label>
                    <select
                      value={editedItem.color || ''}
                      onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
                      className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Seleciona a cor</option>
                      {COMMON_COLORS.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-bold mb-2">Estado</label>
                    <select
                      value={editedItem.condition || ''}
                      onChange={(e) => setEditedItem({ ...editedItem, condition: e.target.value })}
                      className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {CONDITION_OPTIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Marca</label>
                  <input
                    type="text"
                    value={editedItem.brand || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, brand: e.target.value })}
                    className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Tags</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AVAILABLE_TAGS.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`p-2 rounded-xl text-sm font-bold transition-all ${
                          editedItem.tags?.includes(tag)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-2">Notas</label>
                  <textarea
                    value={editedItem.notes || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
                    className="w-full h-24 p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-green-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancelar</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedItem.name}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-gray-700">Categoria</h3>
                    <p className="text-gray-600">{selectedItem.category || 'Não especificada'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Cor</h3>
                    <p className="text-gray-600">{selectedItem.color || 'Não especificada'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Marca</h3>
                    <p className="text-gray-600">{selectedItem.brand || 'Não especificada'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-700">Estado</h3>
                    <p className="text-gray-600">{selectedItem.condition || 'Não especificado'}</p>
                  </div>
                </div>

                {selectedItem.tags && selectedItem.tags.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-700 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.tags.map((tag, index) => (
                        <span key={index} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItem.notes && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">Notas</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-xl">{selectedItem.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* AI Metadata Section */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center space-x-2 text-gray-800 font-bold">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Análise AI da Peça</span>
              </h3>
              <div className="flex space-x-2">
                {selectedItem.imageUrl && OPENAI_API_KEY && (
                  <button
                    onClick={regenerateAIMetadata}
                    disabled={isGeneratingMetadata}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${isGeneratingMetadata ? 'animate-spin' : ''}`} />
                    <span>Regenerar</span>
                  </button>
                )}
                <button
                  onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                  className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg text-xs font-bold"
                >
                  {isEditingMetadata ? 'Cancelar' : 'Editar'}
                </button>
              </div>
            </div>
            
            {isGeneratingMetadata ? (
              <div className="flex items-center space-x-2 text-purple-600">
                <Wand2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">A AI está a regenerar a análise...</span>
              </div>
            ) : isEditingMetadata ? (
              <div className="space-y-3">
                <textarea
                  value={customMetadata}
                  onChange={(e) => setCustomMetadata(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                  placeholder="Edita ou adiciona a análise da peça..."
                />
                <button
                  onClick={saveCustomMetadata}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                >
                  Guardar Análise
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-3">
                {selectedItem.aiMetadata ? (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {selectedItem.aiMetadata}
                  </p>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm mb-2">Nenhuma análise AI disponível</p>
                    {selectedItem.imageUrl && OPENAI_API_KEY ? (
                      <button
                        onClick={regenerateAIMetadata}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Gerar Análise
                      </button>
                    ) : (
                      <p className="text-xs text-gray-400">
                        {!selectedItem.imageUrl ? 'Imagem necessária para análise' : 'API key não configurada'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;