import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Zap, Heart, Tag, Save, Wand2, Loader2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { OPENAI_API_KEY, getClothingCategoriesByGender, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';
import CameraCapture from '../shared/CameraCapture';
import BottomNavigation from '../shared/BottomNavigation';

const AddItemScreen = ({ navigateToScreen, screenData }) => {
  const { addWardrobeItem, userProfile } = useAppContext();
  const { generateGarmentMetadataWithFormData, generateGarmentMetadata } = useGarmentAI();
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    condition: 'Como Novo',
    tags: [],
    notes: '',
    imageUrl: null,
    aiMetadata: null
  });

  const [showCamera, setShowCamera] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false); // NOVO
  const [isRevealed, setIsRevealed] = useState(false);
  const [metadataEditing, setMetadataEditing] = useState(false);
  const [customMetadata, setCustomMetadata] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState(null); // NOVO para armazenar sugestões

  // Obter categorias baseadas no gênero do utilizador
  const availableCategories = getClothingCategoriesByGender(userProfile?.gender);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // ✨ NOVO: Pré-preencher com dados da análise rápida
  React.useEffect(() => {
    if (screenData?.fromQuickAnalysis && screenData?.smartData) {
      console.log('🚀 Preenchendo dados da análise rápida:', screenData.smartData);
      
      setNewItem(prev => ({
        ...prev,
        imageUrl: screenData.imageUrl || prev.imageUrl,
        name: screenData.smartData.formData?.name || prev.name,
        category: screenData.smartData.formData?.category || prev.category,
        color: screenData.smartData.formData?.color || prev.color,
        tags: screenData.smartData.formData?.suggestedTags || prev.tags,
        notes: screenData.smartData.formData?.notes || 'Adicionada via Análise Rápida'
      }));
      
      setCustomMetadata(screenData.smartData.aiMetadata || '');
      setAiSuggestions(screenData.smartData);
    }
  }, [screenData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor escolhe uma imagem menor que 5MB.');
        return;
      }

      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target.result;
        setNewItem(prev => ({ ...prev, imageUrl }));
        
        // ✨ NOVO: Auto-gerar metadata e pré-preencher automaticamente
        if (OPENAI_API_KEY) {
          await generateAutoFillData(imageUrl);
        }
        
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = async (imageUrl) => {
    setNewItem(prev => ({ ...prev, imageUrl }));
    setShowCamera(false);
    
    // ✨ NOVO: Auto-gerar metadata e pré-preencher automaticamente
    if (OPENAI_API_KEY) {
      await generateAutoFillData(imageUrl);
    }
  };

  // ✨ NOVA FUNÇÃO: Gerar dados de auto-preenchimento
  const generateAutoFillData = async (imageUrl) => {
    if (!imageUrl) return;
    
    setIsAutoFilling(true);
    
    try {
      console.log('🤖 Gerando auto-preenchimento...');
      const aiData = await generateGarmentMetadataWithFormData(
        imageUrl, 
        userProfile, 
        newItem
      );
      
      console.log('✅ Dados AI recebidos:', aiData);
      
      // Pré-preencher os campos automaticamente
      if (aiData.formData) {
        setNewItem(prev => ({
          ...prev,
          name: aiData.formData.name || prev.name,
          category: aiData.formData.category || prev.category,
          color: aiData.formData.color || prev.color,
          brand: aiData.formData.brand || prev.brand,
          tags: aiData.formData.suggestedTags || prev.tags,
          notes: aiData.formData.notes || prev.notes
        }));
      }
      
      // Definir metadata AI
      if (aiData.aiMetadata) {
        setCustomMetadata(aiData.aiMetadata);
      }
      
      // Armazenar sugestões para mostrar ao utilizador
      setAiSuggestions(aiData);
      
    } catch (error) {
      console.error('❌ Erro no auto-preenchimento:', error);
      // Em caso de erro, usar o método de metadata simples
      try {
        const simpleMetadata = await generateGarmentMetadata(imageUrl, newItem);
        setCustomMetadata(simpleMetadata);
      } catch (fallbackError) {
        console.error('❌ Erro também no fallback:', fallbackError);
      }
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Gerar metadata AI manualmente (botão)
  const generateAIMetadata = async () => {
    if (!newItem.imageUrl) {
      alert('Adiciona uma imagem primeiro!');
      return;
    }

    setIsGeneratingMetadata(true);
    
    try {
      const metadata = await generateGarmentMetadata(newItem.imageUrl, newItem);
      setCustomMetadata(metadata);
      setNewItem(prev => ({ ...prev, aiMetadata: metadata }));
    } catch (error) {
      console.error('❌ Erro ao gerar metadata AI:', error);
      alert('Erro ao gerar análise AI: ' + error.message);
    } finally {
      setIsGeneratingMetadata(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) {
      alert('Por favor adiciona um nome para a peça.');
      return;
    }
    
    if (!newItem.category) {
      alert('Por favor selecciona uma categoria.');
      return;
    }
    
    if (!newItem.imageUrl) {
      alert('Por favor adiciona uma imagem da peça.');
      return;
    }

    setIsUploading(true);
    
    try {
      const itemToAdd = {
        ...newItem,
        aiMetadata: customMetadata || newItem.aiMetadata,
        createdAt: new Date().toISOString()
      };
      
      console.log('➕ Adicionando peça ao armário:', itemToAdd);
      await addWardrobeItem(itemToAdd);
      
      alert('Peça adicionada com sucesso! ✨');
      navigateToScreen('wardrobe');
      
    } catch (error) {
      console.error('❌ Erro ao adicionar peça:', error);
      alert('Erro ao adicionar peça: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleTag = (tag) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 pb-24">
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className={`transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigateToScreen('wardrobe')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
            <Sparkles className="h-4 w-4" />
            <span className="font-bold tracking-wide text-sm">NOVA PEÇA</span>
          </div>
          <div className="w-6" />
        </div>

        <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-orange-200 bg-clip-text text-transparent mb-8 transform -rotate-1 text-center">
          ADICIONAR AO ARMÁRIO
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Camera className="h-5 w-5 mr-2" />
              Foto da Peça
            </h2>

            {!newItem.imageUrl ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Adiciona uma foto da tua peça</p>
                  
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => setShowCamera(true)}
                      className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4" />
                      Câmara
                    </button>
                    
                    <label className="bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors cursor-pointer flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Galeria
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={newItem.imageUrl}
                    alt="Peça selecionada"
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setNewItem(prev => ({ ...prev, imageUrl: null }))}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* ✨ LOADING de auto-preenchimento */}
                {isAutoFilling && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-xl">
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 text-blue-500 animate-spin mr-3" />
                      <div>
                        <p className="text-blue-800 font-semibold">Analisando imagem com AI...</p>
                        <p className="text-blue-600 text-sm">A pré-preencher automaticamente os campos</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✨ MOSTRAR confiança da AI se disponível */}
                {aiSuggestions?.confidence && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-xl">
                    <p className="text-green-800 font-semibold">✨ Campos pré-preenchidos automaticamente!</p>
                    <p className="text-green-600 text-sm">
                      Confiança: Categoria {aiSuggestions.confidence.category}/10, 
                      Cor {aiSuggestions.confidence.color}/10 
                      - Confirma e ajusta se necessário
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✨ Campos do formulário (com loading overlay durante auto-preenchimento) */}
          <div className={`space-y-6 transition-opacity duration-300 ${isAutoFilling ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Basic Info */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Tag className="h-5 w-5 mr-2" />
                Informações Básicas
              </h2>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nome da Peça *
                    {aiSuggestions?.formData?.name && (
                      <span className="text-green-600 text-sm ml-2">✨ Sugerido pela AI</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Camisa Azul Formal, Jeans Escuros..."
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Categoria *
                      {aiSuggestions?.formData?.category && (
                        <span className="text-green-600 text-sm ml-2">✨ AI</span>
                      )}
                    </label>
                    <select
                      value={newItem.category}
                      onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Seleccionar categoria</option>
                      {availableCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Cor *
                      {aiSuggestions?.formData?.color && (
                        <span className="text-green-600 text-sm ml-2">✨ AI</span>
                      )}
                    </label>
                    <select
                      value={newItem.color}
                      onChange={(e) => setNewItem(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    >
                      <option value="">Seleccionar cor</option>
                      {COMMON_COLORS.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Marca
                      {aiSuggestions?.formData?.brand && (
                        <span className="text-green-600 text-sm ml-2">✨ AI</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={newItem.brand}
                      onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="ex: Zara, H&M, Nike..."
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Condição</label>
                    <select
                      value={newItem.condition}
                      onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {CONDITION_OPTIONS.map(condition => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Tags e Estilo
                {aiSuggestions?.formData?.suggestedTags?.length > 0 && (
                  <span className="text-green-600 text-sm ml-2">✨ Sugeridas pela AI</span>
                )}
              </h2>

              <div className="flex flex-wrap gap-2">
                {AVAILABLE_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      newItem.tags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {newItem.tags.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                  <p className="text-orange-800 font-medium">Tags selecionadas:</p>
                  <p className="text-orange-600">{newItem.tags.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Notas</h2>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionais sobre a peça..."
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* AI Metadata */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Análise AI
                </h2>
                
                {newItem.imageUrl && !isAutoFilling && (
                  <button
                    type="button"
                    onClick={generateAIMetadata}
                    disabled={isGeneratingMetadata}
                    className="bg-purple-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGeneratingMetadata ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                    {isGeneratingMetadata ? 'Analisando...' : 'Gerar Análise'}
                  </button>
                )}
              </div>

              {customMetadata ? (
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 rounded-xl border-l-4 border-purple-400">
                    <p className="text-purple-800">{customMetadata}</p>
                  </div>
                  
                  {aiSuggestions?.confidence && (
                    <div className="text-sm text-gray-600">
                      <p>Confiança geral da análise: {aiSuggestions.confidence.overall}/10</p>
                    </div>
                  )}
                </div>
              ) : isAutoFilling ? (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin mr-3" />
                  <span>Gerando análise AI...</span>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Adiciona uma imagem para gerar análise AI automática</p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigateToScreen('wardrobe')}
              className="flex-1 bg-gray-500 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={isUploading || isAutoFilling}
              className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Adicionar ao Armário
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* ✨ NOVO: Barra de navegação sempre presente */}
      <BottomNavigation 
        currentScreen="add-item" 
        navigateToScreen={navigateToScreen}
      />
    </div>
  );
};

export default AddItemScreen;