// src/components/accessories/AddAccessoryScreen.js
import React, { useState, useRef } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Save, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { 
  getAccessoryCategoriesByGender, 
  COMMON_COLORS, 
  ACCESSORIES_TAGS, 
  CONDITION_OPTIONS,
  POPULAR_BRANDS,
  OPENAI_API_KEY
} from '../../utils/constants';
import CameraCapture from '../shared/CameraCapture';

const AddAccessoryScreen = ({ navigateToScreen, user }) => {
  const { addAccessory, userProfile } = useAppContext();
  const { uploadImageToStorage, dataURLtoFile } = useStorage();
  const { generateGarmentMetadataWithFormData, isAnalyzing } = useGarmentAI();
  
  const [accessoryData, setAccessoryData] = useState({
    name: '',
    category: '',
    color: '',
    brand: '',
    condition: 'Novo',
    notes: '',
    tags: [],
    imageUrl: null
  });
  
  const [aiMetadata, setAiMetadata] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [autoFillSuggested, setAutoFillSuggested] = useState(false);
  
  const fileInputRef = useRef(null);
  const availableCategories = getAccessoryCategoriesByGender(userProfile?.gender);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Por favor escolhe uma imagem menor que 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAccessoryData(prev => ({ ...prev, imageUrl: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setAccessoryData(prev => ({ ...prev, imageUrl: photoDataUrl }));
    setShowCamera(false);
  };

  const handleTagToggle = (tag) => {
    setAccessoryData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleCustomTagAdd = () => {
    if (customTag.trim() && !accessoryData.tags.includes(customTag.trim())) {
      setAccessoryData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
      setShowTagInput(false);
    }
  };

  const handleAIAnalysis = async () => {
    if (!accessoryData.imageUrl) {
      alert('Por favor adiciona uma imagem primeiro.');
      return;
    }

    if (!OPENAI_API_KEY) {
      alert('API Key do OpenAI não configurada.');
      return;
    }

    try {
      const analysis = await generateGarmentMetadataWithFormData(
        accessoryData.imageUrl,
        userProfile,
        accessoryData
      );

      // Auto-preencher campos se análise bem-sucedida
      if (analysis.formData) {
        setAccessoryData(prev => ({
          ...prev,
          name: analysis.formData.name || prev.name,
          category: analysis.formData.category || prev.category,
          color: analysis.formData.color || prev.color,
          brand: analysis.formData.brand || prev.brand,
          tags: analysis.formData.suggestedTags || prev.tags,
          notes: analysis.formData.notes || prev.notes
        }));
        setAutoFillSuggested(true);
      }

      if (analysis.aiMetadata) {
        setAiMetadata(analysis.aiMetadata);
      }

    } catch (error) {
      console.error('Erro na análise AI:', error);
      alert('Erro ao analisar acessório. Tenta novamente.');
    }
  };

  const handleSave = async () => {
    if (!accessoryData.name.trim()) {
      alert('Por favor insere um nome para o acessório.');
      return;
    }

    if (!accessoryData.category) {
      alert('Por favor seleciona uma categoria.');
      return;
    }

    if (!accessoryData.color) {
      alert('Por favor seleciona uma cor.');
      return;
    }

    setIsLoading(true);

    try {
      let finalImageUrl = null;

      // Upload da imagem se disponível
      if (accessoryData.imageUrl) {
        const imageFile = dataURLtoFile(accessoryData.imageUrl, 'accessory.jpg');
        const imagePath = `accessories/${user.uid}/${Date.now()}_${imageFile.name}`;
        finalImageUrl = await uploadImageToStorage(imageFile, imagePath);
      }

      // Dados finais do acessório
      const finalAccessoryData = {
        ...accessoryData,
        imageUrl: finalImageUrl,
        aiMetadata: aiMetadata || null,
        aiAnalysisDate: aiMetadata ? new Date() : null
      };

      await addAccessory(finalAccessoryData);
      
      alert('Acessório adicionado com sucesso!');
      navigateToScreen('accessories');
      
    } catch (error) {
      console.error('Erro ao adicionar acessório:', error);
      alert('Erro ao adicionar acessório. Tenta novamente.');
    } finally {
      setIsLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 p-6 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('accessories')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Adicionar Acessório</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-y-auto">
          
          {/* Image Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Foto do Acessório</h3>
            
            {accessoryData.imageUrl ? (
              <div className="relative">
                <img
                  src={accessoryData.imageUrl}
                  alt="Acessório"
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={() => setAccessoryData(prev => ({ ...prev, imageUrl: null }))}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                
                {/* AI Analysis Button */}
                {OPENAI_API_KEY && (
                  <button
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition-all disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowCamera(true)}
                  className="flex flex-col items-center justify-center h-32 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Camera className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="text-sm text-emerald-700">Fotografar</span>
                </button>
                
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-32 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <Upload className="h-8 w-8 text-emerald-500 mb-2" />
                  <span className="text-sm text-emerald-700">Galeria</span>
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Auto-fill notification */}
          {autoFillSuggested && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-emerald-500 mr-2" />
                <span className="text-sm text-emerald-800">
                  Campos preenchidos automaticamente pela análise AI. Podes editá-los se necessário.
                </span>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Acessório *
              </label>
              <input
                type="text"
                value={accessoryData.name}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Relógio dourado, Brincos pérola..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                value={accessoryData.category}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Seleciona uma categoria</option>
                {availableCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Cor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Principal *
              </label>
              <select
                value={accessoryData.color}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, color: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Seleciona uma cor</option>
                {COMMON_COLORS.map(color => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                value={accessoryData.brand}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Ex: Pandora, Casio, Ray-Ban..."
                list="brands-list"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <datalist id="brands-list">
                {POPULAR_BRANDS.map(brand => (
                  <option key={brand} value={brand} />
                ))}
              </datalist>
            </div>

            {/* Condição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condição
              </label>
              <select
                value={accessoryData.condition}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CONDITION_OPTIONS.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {ACCESSORIES_TAGS.slice(0, 12).map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      accessoryData.tags.includes(tag)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              {showTagInput ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Tag personalizada"
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomTagAdd()}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleCustomTagAdd}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                  >
                    Adicionar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTagInput(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTagInput(true)}
                  className="text-emerald-600 text-sm hover:underline"
                >
                  + Adicionar tag personalizada
                </button>
              )}

              {/* Selected Tags */}
              {accessoryData.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {accessoryData.tags.map(tag => (
                    <div key={tag} className="flex items-center bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      <span>{tag}</span>
                      <button
                        type="button"
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

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={accessoryData.notes}
                onChange={(e) => setAccessoryData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informações adicionais, ocasiões de uso, cuidados especiais..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* AI Metadata Preview */}
            {aiMetadata && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Análise AI
                </label>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-500 mr-2" />
                    <span className="text-sm font-medium text-emerald-800">Detalhes identificados pela AI</span>
                  </div>
                  <p className="text-sm text-emerald-700 leading-relaxed">{aiMetadata}</p>
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading || !accessoryData.name.trim() || !accessoryData.category || !accessoryData.color}
            className="w-full mt-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                Guardando...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Save className="h-5 w-5 mr-2" />
                Guardar Acessório
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAccessoryScreen;