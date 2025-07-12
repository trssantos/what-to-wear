import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, CheckCircle, Zap, Target, Brain, Camera, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';
import { OPENAI_API_KEY } from '../../utils/constants';

const AISetupScreen = ({ navigateToScreen }) => {
  const { wardrobe } = useAppContext();
  const [isRevealed, setIsRevealed] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const { generateGarmentMetadata } = useGarmentAI();

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const testWithActualItem = async () => {
    const itemWithImage = wardrobe.find(item => item.imageUrl && !item.aiMetadata);
    
    if (!itemWithImage) {
      setTestResult({
        success: false,
        message: 'Não há peças com imagem disponíveis para teste'
      });
      return;
    }

    setIsTesting(true);
    try {
      const metadata = await generateGarmentMetadata(itemWithImage.imageUrl, itemWithImage);
      setTestResult({
        success: true,
        message: `Teste bem-sucedido! Gerada análise para "${itemWithImage.name}".`,
        preview: metadata.substring(0, 200) + '...'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erro no teste: ${error.message}`
      });
    }
    setIsTesting(false);
  };

  const isConfigured = !!OPENAI_API_KEY;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-6">
      <div className={`max-w-2xl mx-auto transform transition-all duration-700 ${
        isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigateToScreen('home')}
            className="mr-4 p-3 bg-white bg-opacity-20 rounded-2xl text-white hover:bg-opacity-30 transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-black text-white">
            Funcionalidades de IA
          </h1>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 ${isConfigured ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} rounded-[2rem] flex items-center justify-center mx-auto mb-4 transform rotate-3`}>
              {isConfigured ? <CheckCircle className="h-10 w-10 text-white" /> : <Sparkles className="h-10 w-10 text-white" />}
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              {isConfigured ? 'IA Configurada ✓' : 'IA Não Configurada'}
            </h2>
            <p className="text-gray-600">
              {isConfigured 
                ? 'Todas as funcionalidades de IA estão disponíveis'
                : 'Contacta o administrador para configurar a API da OpenAI'
              }
            </p>
          </div>

          {isConfigured && (
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200 mb-6">
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-bold text-sm">API Key configurada automaticamente no sistema</span>
              </div>
              <p className="text-green-700 text-xs mt-1">
                A integração com OpenAI está ativa e pronta para uso.
              </p>
            </div>
          )}
        </div>

        {/* AI Features Overview */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-purple-500" />
            Funcionalidades Disponíveis
          </h3>
          
          <div className="grid gap-4">
            {[
              {
                icon: Camera,
                title: 'Análise Automática de Peças',
                description: 'IA analisa fotos e gera descrições detalhadas das tuas roupas',
                status: isConfigured
              },
              {
                icon: Sparkles,
                title: 'Recomendações Inteligentes',
                description: 'Sugestões personalizadas baseadas no teu estilo e ocasião',
                status: isConfigured
              },
              {
                icon: MessageSquare,
                title: 'Chat de Estilo',
                description: 'Conversa com a IA sobre moda e recebe conselhos personalizados',
                status: isConfigured
              },
              {
                icon: Target,
                title: 'Coordenação de Outfits',
                description: 'IA ajuda a criar combinações perfeitas do teu guarda-roupa',
                status: isConfigured
              }
            ].map((feature, index) => (
              <div key={index} className={`p-4 rounded-2xl border-2 ${
                feature.status 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <feature.icon className={`h-6 w-6 mt-1 ${
                    feature.status ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-bold ${
                      feature.status ? 'text-green-800' : 'text-gray-600'
                    }`}>
                      {feature.title}
                      {feature.status && <span className="ml-2 text-xs">✓</span>}
                    </h4>
                    <p className={`text-sm ${
                      feature.status ? 'text-green-700' : 'text-gray-500'
                    }`}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Section */}
        {isConfigured && wardrobe.length > 0 && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-blue-500" />
              Testar Funcionalidade
            </h3>
            
            <p className="text-gray-600 mb-6">
              Testa a análise de IA numa peça do teu guarda-roupa
            </p>

            {testResult && (
              <div className={`rounded-2xl p-4 border mb-6 ${
                testResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`flex items-center space-x-2 ${
                  testResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-bold text-sm">{testResult.message}</span>
                </div>
                {testResult.preview && (
                  <p className="text-green-700 text-xs mt-2 italic">
                    "{testResult.preview}"
                  </p>
                )}
              </div>
            )}

            <button
              onClick={testWithActualItem}
              disabled={isTesting}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>A testar...</span>
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5" />
                  <span>Testar Análise de IA</span>
                </>
              )}
            </button>
          </div>
        )}

        {!isConfigured && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Como Ativar a IA?
            </h3>
            <p className="text-gray-600 mb-6">
              Para usar as funcionalidades de IA, é necessário configurar uma API key da OpenAI no ficheiro .env do projeto.
            </p>
            <div className="bg-blue-50 rounded-2xl p-4 text-left">
              <p className="text-blue-800 font-mono text-sm">
                REACT_APP_OPENAI_API_KEY=sk-sua-chave-aqui
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigateToScreen('home')}
            className="bg-white bg-opacity-20 text-white px-8 py-3 rounded-2xl font-bold hover:bg-opacity-30 transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISetupScreen;