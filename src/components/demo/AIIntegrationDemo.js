import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Zap, Eye, Target, Lightbulb, RefreshCw, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';

const AIIntegrationDemo = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const { 
    generateGarmentMetadata, 
    generateStyleAnalysis, 
    analyzeCompatibility,
    generateOutfitSuggestions,
    analyzeWardrobeGaps,
    isAnalyzing 
  } = useGarmentAI(openaiApiKey);

  const [selectedDemo, setSelectedDemo] = useState('overview');
  const [demoResults, setDemoResults] = useState({});
  const [isRevealed, setIsRevealed] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const aiItemsCount = wardrobe.filter(item => item.aiMetadata).length;
  const totalItems = wardrobe.length;

  const demoSections = [
    {
      id: 'overview',
      title: 'Visão Geral da Integração AI',
      icon: <Eye className="h-5 w-5" />,
      description: 'Como a metadata AI potencia todas as funcionalidades'
    },
    {
      id: 'metadata',
      title: 'Geração de Metadata',
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Análise automática de peças com AI'
    },
    {
      id: 'styling',
      title: 'Styling Inteligente',
      icon: <Target className="h-5 w-5" />,
      description: 'Recomendações baseadas na metadata AI'
    },
    {
      id: 'compatibility',
      title: 'Análise de Compatibilidade',
      icon: <Zap className="h-5 w-5" />,
      description: 'Como peças combinam entre si'
    },
    {
      id: 'gaps',
      title: 'Análise de Gaps',
      icon: <Lightbulb className="h-5 w-5" />,
      description: 'Identificação de lacunas no armário'
    }
  ];

  const runMetadataDemo = async () => {
    if (wardrobe.length === 0) {
      alert('Adiciona algumas peças ao armário primeiro!');
      return;
    }

    const itemWithoutAI = wardrobe.find(item => !item.aiMetadata && item.imageUrl);
    if (!itemWithoutAI) {
      setDemoResults({
        ...demoResults,
        metadata: {
          success: false,
          message: 'Todas as peças com imagem já têm análise AI!'
        }
      });
      return;
    }

    try {
      const metadata = await generateGarmentMetadata(itemWithoutAI.imageUrl, itemWithoutAI);
      setDemoResults({
        ...demoResults,
        metadata: {
          success: true,
          item: itemWithoutAI.name,
          metadata: metadata.substring(0, 300) + '...'
        }
      });
    } catch (error) {
      setDemoResults({
        ...demoResults,
        metadata: {
          success: false,
          message: error.message
        }
      });
    }
  };

  const runCompatibilityDemo = async () => {
    const aiItems = wardrobe.filter(item => item.aiMetadata);
    if (aiItems.length < 2) {
      setDemoResults({
        ...demoResults,
        compatibility: {
          success: false,
          message: 'Precisas de pelo menos 2 peças com análise AI!'
        }
      });
      return;
    }

    try {
      const compatibility = await analyzeCompatibility(
        { name: aiItems[0].name, description: aiItems[0].aiMetadata },
        { name: aiItems[1].name, description: aiItems[1].aiMetadata }
      );
      
      setDemoResults({
        ...demoResults,
        compatibility: {
          success: true,
          item1: aiItems[0].name,
          item2: aiItems[1].name,
          score: compatibility.compatibility_score,
          assessment: compatibility.overall_assessment
        }
      });
    } catch (error) {
      setDemoResults({
        ...demoResults,
        compatibility: {
          success: false,
          message: error.message
        }
      });
    }
  };

  const runOutfitDemo = async () => {
    const aiItems = wardrobe.filter(item => item.aiMetadata);
    if (aiItems.length < 3) {
      setDemoResults({
        ...demoResults,
        outfits: {
          success: false,
          message: 'Precisas de pelo menos 3 peças com análise AI!'
        }
      });
      return;
    }

    try {
      const outfits = await generateOutfitSuggestions(aiItems[0], aiItems.slice(1), 'casual');
      setDemoResults({
        ...demoResults,
        outfits: {
          success: true,
          baseItem: aiItems[0].name,
          outfitCount: outfits.outfits?.length || 0,
          firstOutfit: outfits.outfits?.[0]?.name || 'Outfit gerado'
        }
      });
    } catch (error) {
      setDemoResults({
        ...demoResults,
        outfits: {
          success: false,
          message: error.message
        }
      });
    }
  };

  const runGapsDemo = async () => {
    if (wardrobe.length < 5) {
      setDemoResults({
        ...demoResults,
        gaps: {
          success: false,
          message: 'Adiciona mais peças ao armário para uma análise completa!'
        }
      });
      return;
    }

    try {
      const gaps = await analyzeWardrobeGaps(wardrobe);
      setDemoResults({
        ...demoResults,
        gaps: {
          success: true,
          missingBasics: gaps.missing_basics?.length || 0,
          priorityInvestments: gaps.priority_investments?.length || 0,
          assessment: gaps.overall_assessment
        }
      });
    } catch (error) {
      setDemoResults({
        ...demoResults,
        gaps: {
          success: false,
          message: error.message
        }
      });
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-4">
          🤖 Sistema de AI Integrado
        </h2>
        <p className="text-gray-600">
          Vê como a análise AI de cada peça potencia todas as funcionalidades da aplicação
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200">
          <div className="text-center">
            <div className="text-3xl font-black text-green-600">{aiItemsCount}</div>
            <div className="text-green-700 text-sm font-bold">Peças Analisadas</div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-2xl border border-blue-200">
          <div className="text-center">
            <div className="text-3xl font-black text-blue-600">{totalItems}</div>
            <div className="text-blue-700 text-sm font-bold">Total de Peças</div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-3 flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>Como Funciona a Integração</span>
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <div className="font-semibold text-gray-800">Análise Individual</div>
              <div className="text-gray-600">Cada peça é analisada pela AI quando adicionada</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <div className="font-semibold text-gray-800">Metadata Detalhada</div>
              <div className="text-gray-600">Descrição técnica completa é gerada e guardada</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <div className="font-semibold text-gray-800">Reutilização Inteligente</div>
              <div className="text-gray-600">Outras funcionalidades usam esta metadata sem reprocessar imagens</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">✨ Benefícios da Integração</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Análise uma vez, uso múltiplo</li>
          <li>• Recomendações mais precisas</li>
          <li>• Pesquisa inteligente por características</li>
          <li>• Styling automatizado baseado em dados reais</li>
        </ul>
      </div>
    </div>
  );

  const renderMetadataDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          📸 Demonstração de Metadata AI
        </h2>
        <p className="text-gray-600">
          Vê como a AI analisa uma peça e gera descrição detalhada
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3">Como Funciona</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. <strong>Imagem enviada</strong> - A foto da peça é analisada</p>
          <p>2. <strong>AI processa</strong> - Identifica materiais, cores, estilo, detalhes</p>
          <p>3. <strong>Metadata gerada</strong> - Descrição técnica completa criada</p>
          <p>4. <strong>Armazenamento</strong> - Guardada para uso futuro</p>
        </div>
      </div>

      <button
        onClick={runMetadataDemo}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analisando...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>DEMONSTRAR ANÁLISE</span>
          </>
        )}
      </button>

      {demoResults.metadata && (
        <div className={`rounded-2xl p-4 border ${demoResults.metadata.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {demoResults.metadata.success ? (
            <div>
              <div className="flex items-center space-x-2 text-green-800 font-bold mb-2">
                <CheckCircle className="h-4 w-4" />
                <span>Análise Concluída: {demoResults.metadata.item}</span>
              </div>
              <div className="text-sm text-green-700 bg-white rounded-lg p-3">
                {demoResults.metadata.metadata}
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <div className="font-bold mb-1">Erro na Demonstração</div>
              <div className="text-sm">{demoResults.metadata.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCompatibilityDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          🔗 Análise de Compatibilidade
        </h2>
        <p className="text-gray-600">
          Como a AI usa metadata para analisar se peças combinam
        </p>
      </div>

      <button
        onClick={runCompatibilityDemo}
        disabled={isAnalyzing}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isAnalyzing ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analisando...</span>
          </>
        ) : (
          <>
            <Target className="h-5 w-5" />
            <span>ANALISAR COMPATIBILIDADE</span>
          </>
        )}
      </button>

      {demoResults.compatibility && (
        <div className={`rounded-2xl p-4 border ${demoResults.compatibility.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          {demoResults.compatibility.success ? (
            <div>
              <div className="flex items-center space-x-2 text-green-800 font-bold mb-3">
                <CheckCircle className="h-4 w-4" />
                <span>Compatibilidade Analisada</span>
              </div>
              <div className="space-y-2 text-sm">
                <div><strong>Peças:</strong> {demoResults.compatibility.item1} + {demoResults.compatibility.item2}</div>
                <div><strong>Score:</strong> {demoResults.compatibility.score}/10</div>
                <div className="bg-white rounded-lg p-3">
                  <strong>Avaliação:</strong> {demoResults.compatibility.assessment}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-red-700">
              <div className="font-bold mb-1">Erro na Demonstração</div>
              <div className="text-sm">{demoResults.compatibility.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderCurrentDemo = () => {
    switch (selectedDemo) {
      case 'overview':
        return renderOverview();
      case 'metadata':
        return renderMetadataDemo();
      case 'compatibility':
        return renderCompatibilityDemo();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">AI INTEGRATION</span>
            </div>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-cyan-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            AI ECOSYSTEM
          </h1>
        </div>

        {/* Demo Tabs */}
        <div className={`mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2">
            <div className="grid grid-cols-2 gap-1">
              {demoSections.slice(0, 4).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setSelectedDemo(section.id)}
                  className={`p-3 rounded-xl text-sm font-bold transition-all ${
                    selectedDemo === section.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    {section.icon}
                    <span className="hidden sm:inline">{section.title.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {renderCurrentDemo()}
          </div>
        </div>

        {/* Quick Stats */}
        <div className={`mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center text-white">
            <div className="text-sm font-bold mb-2">Estado da AI no Teu Armário</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-lg font-black">{Math.round((aiItemsCount / Math.max(totalItems, 1)) * 100)}%</div>
                <div className="opacity-80">Analisado</div>
              </div>
              <div>
                <div className="text-lg font-black">{totalItems - aiItemsCount}</div>
                <div className="opacity-80">Pendente</div>
              </div>
              <div>
                <div className="text-lg font-black">{openaiApiKey ? '✓' : '✗'}</div>
                <div className="opacity-80">API Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIIntegrationDemo;