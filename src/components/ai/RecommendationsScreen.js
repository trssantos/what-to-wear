import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const RecommendationsScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const { generateShoppingRecommendations } = useOpenAI(openaiApiKey);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const generateRecommendationsAI = async () => {
    setIsGenerating(true);
    try {
      const response = await generateShoppingRecommendations(wardrobe);
      setRecommendations(response);
    } catch (error) {
      alert('Erro na IA: ' + error.message);
    }
    setIsGenerating(false);
  };

  const resetRecommendations = () => {
    setRecommendations(null);
  };

  if (isGenerating) {
    return (
      <LoadingAnalysis />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Recomendações IA</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {!recommendations ? (
            <InitialPrompt 
              wardrobe={wardrobe}
              onGenerate={generateRecommendationsAI}
            />
          ) : (
            <RecommendationResults 
              recommendations={recommendations}
              onNewAnalysis={resetRecommendations}
              navigateToScreen={navigateToScreen}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component for initial prompt
const InitialPrompt = ({ wardrobe, onGenerate }) => (
  <div className="text-center">
    <ShoppingBag className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
    <h2 className="text-xl font-bold text-gray-800 mb-2">Análise Personalizada</h2>
    <p className="text-gray-600 mb-6">A IA vai analisar o teu armário e sugerir:</p>
    
    <div className="text-left space-y-2 mb-6">
      <FeaturePoint text="Peças em falta no teu guarda-roupa" />
      <FeaturePoint text="Recomendações de compra com prioridades" />
      <FeaturePoint text="Novas combinações criativas" />
      <FeaturePoint text="Dicas para maximizar o que tens" />
    </div>
    
    <button
      onClick={onGenerate}
      className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-6 rounded-lg font-semibold"
    >
      Gerar Análise Completa
    </button>

    {wardrobe.length === 0 && (
      <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
        <p className="text-yellow-800 text-sm">
          💡 Adiciona algumas peças ao teu armário primeiro para obteres recomendações mais precisas!
        </p>
      </div>
    )}
  </div>
);

// Component for feature points
const FeaturePoint = ({ text }) => (
  <div className="flex items-center space-x-2">
    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
    <span className="text-sm text-gray-700">{text}</span>
  </div>
);

// Component for loading state
const LoadingAnalysis = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 text-center">
      <div className="animate-spin mb-4">
        <Sparkles className="h-16 w-16 text-indigo-500 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">A IA está a analisar...</h2>
      <p className="text-gray-600">A criar recomendações personalizadas para ti</p>
      
      <div className="mt-4 space-y-2 text-sm text-gray-500">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse"></div>
          <span>Analisando o teu estilo pessoal...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <span>Identificando gaps no armário...</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          <span>Gerando novas combinações...</span>
        </div>
      </div>
    </div>
  </div>
);

// Component for recommendation results
const RecommendationResults = ({ recommendations, onNewAnalysis, navigateToScreen }) => (
  <div className="max-h-[70vh] overflow-y-auto">
    <div className="text-center mb-6">
      <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-gray-800">Análise Completa</h2>
      <p className="text-gray-600 text-sm mt-2">
        Recomendações personalizadas baseadas no teu armário
      </p>
    </div>

    <div className="prose max-w-none">
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
        {recommendations}
      </div>
    </div>

    <div className="flex space-x-3 mt-6 pt-4 border-t">
      <button
        onClick={onNewAnalysis}
        className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
      >
        Nova Análise
      </button>
      <button
        onClick={() => navigateToScreen('style-chat')}
        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold"
      >
        Discutir
      </button>
    </div>

    {/* Quick actions */}
    <div className="mt-4 pt-4 border-t">
      <h3 className="font-semibold text-gray-700 mb-3 text-sm">Ações Rápidas</h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => navigateToScreen('add-item')}
          className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          Adicionar Peça
        </button>
        <button
          onClick={() => navigateToScreen('create-outfit')}
          className="p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
        >
          Criar Outfit
        </button>
      </div>
    </div>
  </div>
);

export default RecommendationsScreen;