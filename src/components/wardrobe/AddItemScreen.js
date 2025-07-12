import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Zap, Heart, Tag, Save, Wand2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';
import { CLOTHING_CATEGORIES, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';

const AddItemScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { addWardrobeItem } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    condition: 'Como Novo',
    tags: [],
    notes: '',
    imageUrl: null,
    aiMetadata: null // Nova propriedade para metadata AI
  });

  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [metadataEditing, setMetadataEditing] = useState(false);
  const [customMetadata, setCustomMetadata] = useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor escolhe uma imagem menor que 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewItem({ ...newItem, imageUrl: e.target.result });
        // Auto-generate metadata when image is uploaded
        if (openaiApiKey) {
          generateAIMetadata(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setNewItem({ ...newItem, imageUrl: photoDataUrl });
    setShowCamera(false);
    // Auto-generate metadata when photo is captured
    if (openaiApiKey) {
      generateAIMetadata(photoDataUrl);
    }
  };

  const generateAIMetadata = async (imageData) => {
    if (!openaiApiKey) return;
    
    setIsGeneratingMetadata(true);
    try {
      const prompt = `Como especialista em análise de vestuário e moda, analisa esta imagem de uma peça de roupa e gera uma descrição detalhada e metadata para catalogação digital.

INFORMAÇÕES FORNECIDAS PELO UTILIZADOR:
- Nome: ${newItem.name || 'Não especificado'}
- Categoria: ${newItem.category || 'Não especificada'}
- Cor: ${newItem.color || 'Não especificada'}
- Marca: ${newItem.brand || 'Não especificada'}
- Notas: ${newItem.notes || 'Não especificadas'}

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
Fornece uma descrição corrida e natural (não em pontos) que seja suficientemente detalhada para que outras AIs possam entender completamente a peça sem ver a imagem. Foca em características que são importantes para styling e coordenação de outfits.

EXEMPLO DE BOA DESCRIÇÃO:
"Camisa social feminina de manga longa em algodão branco com textura ligeiramente texturizada. Apresenta corte clássico com gola italiana tradicional, abotoamento frontal com botões brancos nacarados e punhos ajustáveis. O tecido é de peso médio com caimento fluido, ideal para looks profissionais ou semi-formais. A peça encontra-se em excelente estado sem sinais de desgaste visíveis. É uma peça versátil que combina perfeitamente com calças de alfaiataria, saias lápis ou jeans dark wash, podendo ser usada tanto por dentro como por fora da calça. O estilo clássico torna-a apropriada para ambientes de trabalho, reuniões formais ou eventos casuais elegantes."`;

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
                url: imageData
              }
            }
          ]
        }
      ], true);

      setNewItem(prev => ({ ...prev, aiMetadata: response }));
      setCustomMetadata(response);
      
    } catch (error) {
      console.error('Erro ao gerar metadata AI:', error);
      alert('Erro ao gerar descrição automática. Podes adicionar uma descrição manual.');
    }
    setIsGeneratingMetadata(false);
  };

  const regenerateMetadata = async () => {
    if (!newItem.imageUrl) {
      alert('Adiciona primeiro uma imagem da peça');
      return;
    }
    await generateAIMetadata(newItem.imageUrl);
  };

  const toggleTag = (tag) => {
    const newTags = newItem.tags.includes(tag)
      ? newItem.tags.filter(t => t !== tag)
      : [...newItem.tags, tag];
    setNewItem({ ...newItem, tags: newTags });
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.color) {
      alert('Por favor preenche pelo menos o nome e a cor da peça');
      return;
    }

    setIsUploading(true);
    try {
      const itemToAdd = {
        ...newItem,
        aiMetadata: metadataEditing ? customMetadata : newItem.aiMetadata,
        hasAIAnalysis: !!newItem.aiMetadata
      };

      await addWardrobeItem(itemToAdd);
      alert('Peça adicionada com sucesso! ✨');
      navigateToScreen('wardrobe');
    } catch (error) {
      console.error('Erro ao adicionar peça:', error);
      alert('Erro ao adicionar peça: ' + error.message);
    }
    setIsUploading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header Magazine Style */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('wardrobe')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">NOVA PEÇA</span>
            </div>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-pink-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            ADD TO WARDROBE
          </h1>
        </div>

        {/* Main Card */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-6">
              
              {/* Image Upload Section */}
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-lg">📸 Foto da Peça</label>
                <div className="border-2 border-dashed border-purple-200 rounded-3xl p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                  {newItem.imageUrl ? (
                    <div className="relative">
                      <img src={newItem.imageUrl} alt="Preview" className="w-full h-64 object-cover rounded-2xl shadow-lg" />
                      <button
                        onClick={() => setNewItem({ ...newItem, imageUrl: null, aiMetadata: null })}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold shadow-lg transform hover:scale-110 transition-all"
                      >
                        ×
                      </button>
                      
                      {/* AI Analysis Status */}
                      {isGeneratingMetadata && (
                        <div className="absolute bottom-3 left-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Wand2 className="h-3 w-3 animate-spin" />
                          <span>Analisando com AI...</span>
                        </div>
                      )}
                      
                      {newItem.aiMetadata && !isGeneratingMetadata && (
                        <div className="absolute bottom-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                          <Sparkles className="h-3 w-3" />
                          <span>AI Análise Completa</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="flex justify-center space-x-4 mb-6">
                        <button
                          onClick={() => setShowCamera(true)}
                          className="flex flex-col items-center p-6 bg-blue-100 rounded-2xl hover:bg-blue-200 transition-all transform hover:scale-105 shadow-lg"
                        >
                          <Camera className="h-10 w-10 text-blue-600 mb-2" />
                          <span className="text-sm font-bold text-blue-700">Tirar Foto</span>
                        </button>
                        
                        <label className="flex flex-col items-center p-6 bg-green-100 rounded-2xl hover:bg-green-200 transition-all transform hover:scale-105 shadow-lg cursor-pointer">
                          <Upload className="h-10 w-10 text-green-600 mb-2" />
                          <span className="text-sm font-bold text-green-700">Carregar</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-gray-600 text-sm font-medium">Adiciona uma foto para análise automática com AI 🤖</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Metadata Section */}
              {(newItem.aiMetadata || isGeneratingMetadata) && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2 text-gray-800 font-bold">
                      <Sparkles className="h-5 w-5 text-purple-600" />
                      <span>Análise AI da Peça</span>
                    </label>
                    <div className="flex space-x-2">
                      <button
                        onClick={regenerateMetadata}
                        disabled={isGeneratingMetadata}
                        className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg text-xs font-bold flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Wand2 className="h-3 w-3" />
                        <span>Regenerar</span>
                      </button>
                      <button
                        onClick={() => setMetadataEditing(!metadataEditing)}
                        className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg text-xs font-bold"
                      >
                        {metadataEditing ? 'Guardar' : 'Editar'}
                      </button>
                    </div>
                  </div>
                  
                  {isGeneratingMetadata ? (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Wand2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">A AI está a analisar a imagem...</span>
                    </div>
                  ) : metadataEditing ? (
                    <textarea
                      value={customMetadata}
                      onChange={(e) => setCustomMetadata(e.target.value)}
                      className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      rows="8"
                      placeholder="Edita a descrição AI da peça..."
                    />
                  ) : (
                    <div className="bg-white rounded-lg p-3 text-sm text-gray-700 max-h-32 overflow-y-auto">
                      {newItem.aiMetadata}
                    </div>
                  )}
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-800 font-bold mb-2">✨ Nome da Peça *</label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    placeholder="Ex: Camisa azul listrada"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">🏷️ Categoria</label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    >
                      <option value="">Escolher...</option>
                      {CLOTHING_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-800 font-bold mb-2">🎨 Cor *</label>
                    <select
                      value={newItem.color}
                      onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    >
                      <option value="">Escolher...</option>
                      {COMMON_COLORS.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-800 font-bold mb-2">👔 Marca</label>
                    <input
                      type="text"
                      value={newItem.brand}
                      onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                      placeholder="Ex: Zara"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-bold mb-2">⭐ Estado</label>
                    <select
                      value={newItem.condition}
                      onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                      className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent font-medium"
                    >
                      {CONDITION_OPTIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-gray-800 font-bold mb-3">🏷️ Tags de Estilo</label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all transform hover:scale-105 ${
                        newItem.tags.includes(tag)
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-gray-800 font-bold mb-2">📝 Notas Pessoais</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-medium"
                  rows="3"
                  placeholder="Ex: Corte slim fit, combina bem com jeans..."
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.color || isUploading || isGeneratingMetadata}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                {isUploading ? (
                  <>
                    <Zap className="h-5 w-5 animate-spin" />
                    <span>A adicionar...</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-5 w-5" />
                    <span>ADICIONAR AO ARMÁRIO</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className={`mt-6 grid grid-cols-2 gap-3 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Sparkles className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-white text-xs font-bold">Análise AI Automática</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
            <Wand2 className="h-6 w-6 text-white mx-auto mb-2" />
            <p className="text-white text-xs font-bold">Metadata Inteligente</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemScreen;