import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Zap, Heart, Tag, Save, Wand2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { OPENAI_API_KEY } from '../../utils/constants';
import CameraCapture from '../shared/CameraCapture';
import { CLOTHING_CATEGORIES, COMMON_COLORS, AVAILABLE_TAGS, CONDITION_OPTIONS } from '../../utils/constants';

const AddItemScreen = ({ navigateToScreen, screenData }) => {
  const { addWardrobeItem } = useAppContext();
  const { generateGarmentMetadata } = useGarmentAI();
  
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
  const [isRevealed, setIsRevealed] = useState(false);
  const [metadataEditing, setMetadataEditing] = useState(false);
  const [customMetadata, setCustomMetadata] = useState('');

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
        name: screenData.smartData.name || prev.name,
        category: screenData.smartData.category || prev.category,
        color: screenData.smartData.color || prev.color,
        tags: screenData.smartData.tags || prev.tags,
        notes: 'Adicionada via Análise Rápida - Recomendação AI'
      }));
      
      // Se não tem metadata AI ainda, gerar automaticamente
      if (screenData.imageUrl && !screenData.smartData.aiMetadata && OPENAI_API_KEY) {
        generateAIMetadata(screenData.imageUrl);
      }
    }
  }, [screenData]);

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
        if (OPENAI_API_KEY) {
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
    if (OPENAI_API_KEY) {
      generateAIMetadata(photoDataUrl);
    }
  };

  const generateAIMetadata = async (imageData) => {
    if (!OPENAI_API_KEY) return;
    
    setIsGeneratingMetadata(true);
    try {
      const metadata = await generateGarmentMetadata(imageData, newItem);
      setNewItem(prev => ({ ...prev, aiMetadata: metadata }));
      console.log('✅ Metadata AI gerada:', metadata.substring(0, 100));
    } catch (error) {
      console.error('❌ Erro na geração de metadata:', error);
      alert('Erro ao gerar análise AI: ' + error.message);
    }
    setIsGeneratingMetadata(false);
  };

  const handleTagToggle = (tag) => {
    setNewItem(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSave = async () => {
    if (!newItem.name.trim()) {
      alert('Por favor dá um nome à peça.');
      return;
    }

    if (!newItem.category) {
      alert('Por favor seleciona uma categoria.');
      return;
    }

    setIsUploading(true);
    
    try {
      const itemToSave = {
        ...newItem,
        aiMetadata: metadataEditing ? customMetadata : newItem.aiMetadata,
        createdAt: new Date().toISOString()
      };

      console.log('💾 A guardar peça:', itemToSave.name);
      await addWardrobeItem(itemToSave);
      
      console.log('✅ Peça guardada com sucesso');
      
      // Se veio da análise rápida, mostrar mensagem específica
      if (screenData?.fromQuickAnalysis) {
        alert('✨ Peça adicionada com sucesso baseada na análise rápida!');
      }
      
      navigateToScreen('wardrobe');
      
    } catch (error) {
      console.error('❌ Erro ao guardar peça:', error);
      alert('Erro ao guardar a peça. Tenta novamente.');
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
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6">
      <div className={`max-w-lg mx-auto transform transition-all duration-700 ${
        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-8">
          <div className="flex items-center">
            <button 
              onClick={() => navigateToScreen(screenData?.fromQuickAnalysis ? 'quick-analysis' : 'wardrobe')}
              className="mr-4 p-3 bg-white bg-opacity-20 rounded-2xl text-white hover:bg-opacity-30 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">
                {screenData?.fromQuickAnalysis ? 'Adicionar Smart' : 'Nova Peça'}
              </h1>
              {screenData?.fromQuickAnalysis && (
                <p className="text-white/80 text-sm">Dados preenchidos pela análise IA</p>
              )}
            </div>
          </div>
        </div>

        {/* Notification para Smart Add */}
        {screenData?.fromQuickAnalysis && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-bold">Adicionar Inteligente</span>
            </div>
            <p className="text-white/90 text-sm">
              Dados extraídos automaticamente da análise. Confirma e ajusta se necessário.
            </p>
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          
          {/* Image Upload Section */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Camera className="h-5 w-5 text-orange-600" />
              <span>Foto da Peça</span>
              {screenData?.fromQuickAnalysis && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  Auto-preenchida
                </span>
              )}
            </h3>
            
            {newItem.imageUrl ? (
              <div className="relative">
                <img 
                  src={newItem.imageUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  onClick={() => setNewItem({ ...newItem, imageUrl: null, aiMetadata: null })}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
                
                {/* AI Analysis Status */}
                {OPENAI_API_KEY && (
                  <div className="mt-3">
                    {isGeneratingMetadata ? (
                      <div className="flex items-center space-x-2 text-purple-600 bg-purple-50 p-3 rounded-xl">
                        <Wand2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">A IA está a analisar a peça...</span>
                      </div>
                    ) : newItem.aiMetadata ? (
                      <div className="bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center space-x-2 text-green-600 mb-2">
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-bold">Análise IA concluída ✓</span>
                        </div>
                      </div>
                    ) : !screenData?.fromQuickAnalysis && (
                      <button
                        onClick={() => generateAIMetadata(newItem.imageUrl)}
                        className="w-full bg-purple-100 text-purple-700 p-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-purple-200 transition-colors"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Gerar Análise IA</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <button 
                  onClick={() => setShowCamera(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <Camera className="h-5 w-5" />
                  <span>Tirar Foto</span>
                </button>
                
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-full bg-gray-100 text-gray-700 p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 cursor-pointer hover:bg-gray-200 transition-colors">
                    <Upload className="h-5 w-5" />
                    <span>Carregar da Galeria</span>
                  </div>
                </label>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Tag className="h-5 w-5 text-orange-600" />
              <span>Informações Básicas</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-bold mb-2">Nome da Peça*</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Camisa branca básica"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Categoria*</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
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
                  <label className="block text-gray-700 font-bold mb-2">Cor Principal</label>
                  <select
                    value={newItem.color}
                    onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
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
                    value={newItem.condition}
                    onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                    className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {CONDITION_OPTIONS.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-2">Marca (opcional)</label>
                <input
                  type="text"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                  className="w-full p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: Zara, H&M, Nike..."
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Tags de Estilo</h3>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`p-2 rounded-xl text-sm font-bold transition-all ${
                    newItem.tags.includes(tag)
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* AI Metadata Section */}
          {newItem.aiMetadata && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-6 shadow-2xl border border-purple-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>Análise IA da Peça</span>
                <button
                  onClick={() => setMetadataEditing(!metadataEditing)}
                  className="ml-auto text-sm bg-purple-500 text-white px-3 py-1 rounded-full hover:bg-purple-600 transition-colors"
                >
                  {metadataEditing ? 'Cancelar' : 'Editar'}
                </button>
              </h3>
              
              {metadataEditing ? (
                <textarea
                  value={customMetadata}
                  onChange={(e) => setCustomMetadata(e.target.value)}
                  className="w-full h-32 p-3 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Edita a análise da IA..."
                />
              ) : (
                <div className="bg-white rounded-2xl p-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {newItem.aiMetadata}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Notas Pessoais</h3>
            <textarea
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              className="w-full h-24 p-3 border-2 border-orange-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              placeholder="Observações sobre a peça, ocasiões de uso, combinações..."
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isUploading || !newItem.name.trim() || !newItem.category}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-3xl font-black text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            {isUploading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>A guardar...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>{screenData?.fromQuickAnalysis ? 'Confirmar & Adicionar' : 'Guardar Peça'}</span>
              </>
            )}
          </button>

          <div className="pb-8"></div>
        </div>
      </div>
    </div>
  );
};

export default AddItemScreen;