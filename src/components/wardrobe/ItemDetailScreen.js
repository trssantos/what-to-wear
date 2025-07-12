import React, { useState } from 'react';
import { ArrowLeft, Edit3, Save, X, Trash2, Sparkles, Wand2, Eye, Camera, Upload, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import { CLOTHING_CATEGORIES, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';

const ItemDetailScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { selectedItem, updateWardrobeItem, deleteWardrobeItem } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [editedItem, setEditedItem] = useState(selectedItem || {});
  const [editedMetadata, setEditedMetadata] = useState(selectedItem?.aiMetadata || '');
  const [isRevealed, setIsRevealed] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (selectedItem) {
      setEditedItem(selectedItem);
      setEditedMetadata(selectedItem.aiMetadata || '');
    }
  }, [selectedItem]);

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800">Peça não encontrada</h2>
          <button 
            onClick={() => navigateToScreen('wardrobe')}
            className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg"
          >
            Voltar ao Armário
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateWardrobeItem(selectedItem.id, {
        ...editedItem,
        aiMetadata: editedMetadata
      });
      setIsEditing(false);
      setIsEditingMetadata(false);
      alert('Peça atualizada com sucesso! ✨');
    } catch (error) {
      alert('Erro ao atualizar peça: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Tens a certeza que queres eliminar esta peça?')) {
      try {
        await deleteWardrobeItem(selectedItem.id, selectedItem.imageUrl);
        alert('Peça eliminada com sucesso!');
        navigateToScreen('wardrobe');
      } catch (error) {
        alert('Erro ao eliminar peça: ' + error.message);
      }
    }
  };

  const regenerateAIMetadata = async () => {
    if (!selectedItem.imageUrl || !openaiApiKey) {
      alert('Não é possível regenerar: imagem ou API key em falta');
      return;
    }

    setIsGeneratingMetadata(true);
    try {
      const prompt = `Como especialista em análise de vestuário e moda, analisa esta imagem de uma peça de roupa e gera uma descrição detalhada e metadata para catalogação digital.

INFORMAÇÕES ATUAIS DA PEÇA:
- Nome: ${editedItem.name}
- Categoria: ${editedItem.category}
- Cor: ${editedItem.color}
- Marca: ${editedItem.brand || 'Não especificada'}
- Estado: ${editedItem.condition}
- Tags: ${editedItem.tags?.join(', ') || 'Nenhuma'}
- Notas: ${editedItem.notes || 'Nenhuma'}

ANÁLISE REQUERIDA:
Cria uma descrição completa e técnica da peça que inclua:

1. **DESCRIÇÃO DETALHADA**: Tipo de peça, corte, estilo específico
2. **CARACTERÍSTICAS VISUAIS**: Cores exatas, padrões, texturas, acabamentos
3. **MATERIAIS E TECIDOS**: Que materiais aparenta ter (algodão, poliéster, etc.)
4. **DETALHES CONSTRUTIVOS**: Costuras, botões, fechos, bolsos, decotes, mangas
5. **ESTADO E CONDIÇÃO**: Avaliação visual do estado da peça
6. **ESTILO E OCASIÃO**: Para que ocasiões é adequada, estilo (casual, formal, etc.)
7. **CARACTERÍSTICAS DISTINTIVAS**: Elementos únicos ou marcantes
8. **COMBINAÇÕES SUGERIDAS**: Com que tipo de peças combina bem

FORMATO DA RESPOSTA:
Fornece uma descrição corrida e natural (não em pontos) que seja suficientemente detalhada para que outras AIs possam entender completamente a peça sem ver a imagem. Atualiza e melhora com base nas informações fornecidas pelo utilizador.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em análise de vestuário, catalogação de moda e personal styling. Crias descrições técnicas detalhadas de peças de roupa para sistemas de gestão de armário digital.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: selectedItem.imageUrl
              }
            }
          ]
        }
      ], true);

      setEditedMetadata(response);
      setIsEditingMetadata(true);
      
    } catch (error) {
      console.error('Erro ao regenerar metadata AI:', error);
      alert('Erro ao regenerar descrição automática: ' + error.message);
    }
    setIsGeneratingMetadata(false);
  };

  const toggleTag = (tag) => {
    const newTags = editedItem.tags?.includes(tag)
      ? editedItem.tags.filter(t => t !== tag)
      : [...(editedItem.tags || []), tag];
    setEditedItem({ ...editedItem, tags: newTags });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('wardrobe')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Eye className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">DETALHES</span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-purple-500 p-2 rounded-full shadow-xl"
              >
                <Edit3 className="h-5 w-5" />
              </button>
              <button 
                onClick={handleDelete}
                className="bg-red-500 text-white p-2 rounded-full shadow-xl"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-300 via-white to-pink-200 bg-clip-text text-transparent text-center transform -rotate-1">
            {isEditing ? 'EDIT MODE' : selectedItem.name.toUpperCase()}
          </h1>
        </div>

        {/* Main Content Card */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          
          <div className="p-6">
            
            {/* Image Section */}
            <div className="relative mb-6">
              {selectedItem.imageUrl ? (
                <div className="relative">
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={selectedItem.name}
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                  {selectedItem.aiMetadata && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <Sparkles className="h-3 w-3" />
                      <span>AI ANALISADA</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <Eye className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4 mb-6">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Nome da Peça</label>
                    <input
                      type="text"
                      value={editedItem.name || ''}
                      onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2">Categoria</label>
                      <select
                        value={editedItem.category || ''}
                        onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        {CLOTHING_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-800 font-bold mb-2">Cor</label>
                      <select
                        value={editedItem.color || ''}
                        onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        {COMMON_COLORS.map(color => (
                          <option key={color} value={color}>{color}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-800 font-bold mb-2">Marca</label>
                      <input
                        type="text"
                        value={editedItem.brand || ''}
                        onChange={(e) => setEditedItem({ ...editedItem, brand: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-800 font-bold mb-2">Estado</label>
                      <select
                        value={editedItem.condition || ''}
                        onChange={(e) => setEditedItem({ ...editedItem, condition: e.target.value })}
                        className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                      >
                        {CONDITION_OPTIONS.map(condition => (
                          <option key={condition} value={condition}>{condition}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tags Editing */}
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                            editedItem.tags?.includes(tag)
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-bold mb-2">Notas</label>
                    <textarea
                      value={editedItem.notes || ''}
                      onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
                      className="w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
                      rows="3"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">{selectedItem.name}</h2>
                    <div className="flex justify-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{selectedItem.category}</span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{selectedItem.color}</span>
                      {selectedItem.brand && (
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">{selectedItem.brand}</span>
                      )}
                    </div>
                  </div>

                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map(tag => (
                          <span key={tag} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.notes && (
                    <div>
                      <h3 className="font-bold text-gray-800 mb-2">Notas</h3>
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
                  {selectedItem.imageUrl && openaiApiKey && (
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
                <div>
                  <textarea
                    value={editedMetadata}
                    onChange={(e) => setEditedMetadata(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                    rows="10"
                    placeholder="Edita ou adiciona uma descrição detalhada da peça..."
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => {
                        setEditedItem({ ...editedItem, aiMetadata: editedMetadata });
                        setIsEditingMetadata(false);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-1"
                    >
                      <Save className="h-4 w-4" />
                      <span>Guardar</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditedMetadata(selectedItem.aiMetadata || '');
                        setIsEditingMetadata(false);
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-1"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancelar</span>
                    </button>
                  </div>
                </div>
              ) : editedMetadata ? (
                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {editedMetadata}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-3 text-sm text-gray-500 text-center">
                  Nenhuma análise AI disponível. 
                  {selectedItem.imageUrl && openaiApiKey && (
                    <button 
                      onClick={regenerateAIMetadata}
                      className="text-purple-600 font-bold ml-1 hover:underline"
                    >
                      Gerar agora
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Save className="h-4 w-4" />
                  <span>GUARDAR ALTERAÇÕES</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setIsEditingMetadata(false);
                    setEditedItem(selectedItem);
                    setEditedMetadata(selectedItem.aiMetadata || '');
                  }}
                  className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg"
                >
                  <X className="h-4 w-4" />
                  <span>CANCELAR</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className={`mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-white transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center text-sm">
            <p className="font-medium">Adicionada em: {new Date(selectedItem.createdAt || Date.now()).toLocaleDateString('pt-PT')}</p>
            {selectedItem.updatedAt && (
              <p className="opacity-80">Última atualização: {new Date(selectedItem.updatedAt).toLocaleDateString('pt-PT')}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;