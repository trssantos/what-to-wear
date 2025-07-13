import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Sparkles, Zap, Star, Target, Heart, ShoppingBag, Eye, TrendingUp, Award, CheckCircle, XCircle, Lightbulb, Palette, Crown } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import { OPENAI_API_KEY } from '../../utils/constants';
import CameraCapture from '../shared/CameraCapture';

const QuickAnalysisScreen = ({ navigateToScreen }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI();
  
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);

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
        setCapturedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setCapturedImage(photoDataUrl);
    setShowCamera(false);
  };

  const runQuickAnalysis = async () => {
    if (!OPENAI_API_KEY) {
      alert('API key da OpenAI não configurada no sistema.');
      return;
    }
  
    if (!capturedImage) {
      alert('Adiciona uma foto da peça primeiro.');
      return;
    }
  
    setIsAnalyzing(true);
    
    try {
      const hasWardrobe = wardrobe.length > 0;
      const hasOutfits = outfits.length > 0;
      const hasProfile = userProfile?.colorSeason || userProfile?.bodyShape;
  
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
  PERFIL DO UTILIZADOR:
  - Gênero: ${userProfile.gender}
  
  ANÁLISE ESPECÍFICA POR GÊNERO:
  ${userProfile.gender === 'female' ? `
  - FOCAR EM: Compatibilidade com styling feminino, acessórios femininos, versatilidade
  - AVALIAR: Como a peça se adequa ao guarda-roupa feminino, potencial para layering
  - SUGERIR: Combinações com joias, sapatos femininos, outras peças femininas
  - CONSIDERAR: Ocasiões femininas (trabalho, casual, eventos), comfort e elegância
  ` : userProfile.gender === 'male' ? `
  - FOCAR EM: Compatibilidade com styling masculino, dress codes, versatilidade
  - AVALIAR: Como a peça se adequa ao guarda-roupa masculino, formalidade
  - SUGERIR: Combinações com acessórios masculinos (relógios, cintos), sapatos
  - CONSIDERAR: Ocasiões masculinas (profissional, casual, formal), sophistication
  ` : `
  - FOCAR EM: Styling neutro e inclusivo, versatilidade universal
  - AVALIAR: Adequação a diferentes expressões de gênero
  - SUGERIR: Combinações versáteis e acessórios neutros
  `}
  ` : '';
  
      const prompt = `Como especialista em análise de vestuário e fashion advisor, analisa APENAS a peça de roupa nesta imagem e fornece recomendações de compra.
  
  IMPORTANTE: Foca apenas na análise da ROUPA/PEÇA DE VESTUÁRIO na imagem, não em pessoas.
  DISCLAIMER: Esta é uma consultoria puramente estética de styling e teoria das cores, não uma análise médica ou física.
  
  ${genderContext}
  
  CONTEXTO DO UTILIZADOR:
  ${hasWardrobe ? `
  ARMÁRIO ATUAL (${wardrobe.length} peças):
  ${wardrobe.map((item, index) => 
    `${index + 1}. ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`
  ).join('\n')}` : 'ARMÁRIO: Ainda não tem peças catalogadas (primeiro armário!)'}
  
  ${hasOutfits ? `
  OUTFITS CRIADOS (${outfits.length}):
  ${outfits.map((outfit, index) => 
    `${index + 1}. ${outfit.name} (${outfit.occasion || 'casual'})`
  ).join('\n')}` : 'OUTFITS: Ainda não criou nenhum outfit'}
  
  ${hasProfile ? `
  PERFIL PESSOAL:
  - Estação de cor: ${userProfile?.colorSeason || 'Não definido'}
  - Body shape: ${userProfile?.bodyShape || 'Não definido'}` : 'PERFIL: Ainda não fez análises pessoais'}
  
  RESPOSTA REQUERIDA EM JSON:
  {
    "identificacao": {
      "tipo": "string (ex: Moletom, Camisa, Calças)",
      "cor": "string (cor principal)",
      "material": "string (material aparente)",
      "estilo": "string (casual, formal, desportivo)"
    },
    "score": {
      "pontuacao": "number (1-10)",
      "justificacao": "string (porquê este score considerando o gênero)"
    },
    "compatibilidade": {
      ${hasProfile && userProfile?.colorSeason ? `"estacaoCor": {
        "nivel": "string (EXCELENTE, BOM, NEUTRO)",
        "explicacao": "string"
      },` : ''}
      ${hasProfile && userProfile?.bodyShape ? `"bodyShape": {
        "nivel": "string (FAVORÁVEL, ADEQUADO, NEUTRO)",
        "explicacao": "string"
      },` : ''}
      "versatilidade": "string (análise geral considerando o gênero)"
    },
    "combinaCom": [
      ${hasWardrobe ? `{
        "peca": "string (nome exato da peça do armário)",
        "tipoLook": "string (que tipo de look criaria considerando o gênero)"
      }` : `{
        "categoria": "string (tipo de peça necessária para o gênero)",
        "sugestao": "string (sugestão específica baseada no gênero)"
      }`}
    ],
    "versatilidade": {
      "ocasioes": ["string", "string"],
      "estilos": ["string", "string"],
      "layering": "string (considerando o gênero)"
    },
    "decisao": {
      "recomendacao": "string (COMPRAR ou NÃO_COMPRAR)",
      "razoes": ["string (razão 1 considerando gênero)", "string (razão 2)", "string (razão 3)"]
    },
    "catalogacao": {
      "categoria": "string",
      "cor": "string", 
      "tags": ["string", "string"]
    }
  }
  
  IMPORTANTE: Responde APENAS com JSON válido. Considera sempre o gênero do utilizador nas recomendações.`;
  
      const messages = [
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
                url: capturedImage
              }
            }
          ]
        }
      ];
  
      const response = await callOpenAI(messages, true);
      
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          setAnalysisResult(result);
        } else {
          throw new Error('Resposta não contém JSON válido');
        }
      } catch (parseError) {
        console.error('Erro ao parsear JSON:', parseError);
        throw new Error('Erro na análise da IA. Tenta novamente.');
      }
  
    } catch (error) {
      console.error('❌ Erro na Quick Analysis:', error);
      alert('Erro na análise: ' + error.message);
    }
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const handleSmartAdd = () => {
    // Extrair dados da análise para pré-preencher o formulário
    const analysisData = extractDataFromAnalysis(analysisResult);
    
    // Navegar para AddItemScreen com dados pré-preenchidos
    navigateToScreen('add-item', {
      imageUrl: capturedImage,
      smartData: analysisData,
      fromQuickAnalysis: true
    });
  };

  const extractDataFromAnalysis = (analysisData) => {
    if (!analysisData) return {};
    
    const data = {};
    
    // Se é JSON estruturado
    if (analysisData.catalogacao) {
      data.category = analysisData.catalogacao.categoria;
      data.color = analysisData.catalogacao.cor;
      data.tags = analysisData.catalogacao.tags || [];
      
      if (analysisData.identificacao) {
        data.name = `${analysisData.identificacao.tipo} ${analysisData.identificacao.cor}`;
      }
      
      return data;
    }
    
    // Fallback para texto (caso a AI não responda em JSON)
    const analysisText = analysisData.rawText || JSON.stringify(analysisData);
    
    // Extrair categoria
    const categories = ['Camisa', 'Camisas', 'Calças', 'Calca', 'Vestido', 'Saia', 'Blazer', 'Casaco', 'Sapatos', 'Acessórios', 'Moletom'];
    for (const category of categories) {
      if (analysisText.toLowerCase().includes(category.toLowerCase())) {
        data.category = category === 'Calca' ? 'Calças' : category;
        break;
      }
    }
    
    // Extrair cor
    const colors = ['branco', 'preto', 'azul', 'vermelho', 'verde', 'amarelo', 'rosa', 'roxo', 'cinza', 'castanho', 'bege', 'laranja'];
    for (const color of colors) {
      if (analysisText.toLowerCase().includes(color)) {
        data.color = color.charAt(0).toUpperCase() + color.slice(1);
        break;
      }
    }
    
    // Extrair estilo/tags
    const styles = ['casual', 'formal', 'desportivo', 'business', 'elegante', 'clássico', 'moderno'];
    data.tags = [];
    for (const style of styles) {
      if (analysisText.toLowerCase().includes(style)) {
        data.tags.push(style.charAt(0).toUpperCase() + style.slice(1));
      }
    }
    
    // Nome sugerido baseado na análise
    if (data.category && data.color) {
      data.name = `${data.category} ${data.color}`;
    }
    
    return data;
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 p-6 pb-20">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => navigateToScreen('home')}
              className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-black text-white">
              Análise Rápida
            </h1>
            <div className="w-12 h-12" />
          </div>
          
          <p className="text-white/90 text-center font-medium mb-2">
            Fotografia uma peça e descobre se vale a pena comprar
          </p>
          <p className="text-white/70 text-sm text-center">
            Considera o teu armário, body shape e estilo pessoal
          </p>
        </div>

        {/* Content */}
        <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Image Capture Section */}
          {!analysisResult && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
              {capturedImage ? (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={capturedImage} 
                      alt="Peça para análise" 
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  
                  <button
                    onClick={runQuickAnalysis}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center space-x-2 disabled:opacity-50 transform hover:scale-105 transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Sparkles className="h-5 w-5 animate-spin" />
                        <span>Analisando...</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-5 w-5" />
                        <span>ANALISAR PEÇA</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-[2rem] flex items-center justify-center mx-auto mb-4 transform rotate-3">
                      <Camera className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Captura ou Upload</h3>
                    <p className="text-white/80 text-sm">
                      Tira uma foto da peça ou faz upload de uma imagem
                    </p>
                  </div>
                  
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
                    <div className="w-full bg-white/20 backdrop-blur-sm text-white p-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-white/30 transition-all cursor-pointer border-2 border-dashed border-white/30">
                      <Upload className="h-5 w-5" />
                      <span>Upload Imagem</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Análise em Progresso</h3>
                  <div className="space-y-1 text-white/80 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse"></div>
                      <span>Analisando a peça...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <span>Comparando com o armário...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span>Calculando compatibilidade...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-purple-300 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span>Gerando recomendações...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6">
              {/* Header com imagem */}
              <div className="bg-white/15 backdrop-blur-lg rounded-3xl p-6 text-center">
                <div className="relative inline-block mb-4">
                  <img 
                    src={capturedImage} 
                    alt="Peça analisada" 
                    className="w-32 h-32 object-cover rounded-2xl shadow-lg border-4 border-white/30"
                  />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white mb-2">Análise Completa</h2>
                <p className="text-white/80 text-sm">
                  Baseada no contexto de {wardrobe.length} peças e {outfits.length} outfits
                </p>
              </div>

              {/* Resultado da Análise Estruturado */}
              <AnalysisResultsStructured 
                analysisText={analysisResult}
                wardrobe={wardrobe}
                userProfile={userProfile}
              />

              {/* Action Buttons Principais */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={resetAnalysis}
                  className="bg-white/20 backdrop-blur-sm text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-white/30 transition-all border border-white/30"
                >
                  <Camera className="h-5 w-5" />
                  <span>Nova Análise</span>
                </button>
                <button
                  onClick={handleSmartAdd}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transform hover:scale-105 transition-all shadow-lg"
                >
                  <ShoppingBag className="h-5 w-5" />
                  <span>Adicionar Smart</span>
                </button>
              </div>

              {/* Ações Secundárias */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Próximos Passos</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => navigateToScreen('create-outfit')}
                    className="bg-white/20 text-white p-3 rounded-xl text-xs font-bold hover:bg-white/30 transition-all flex flex-col items-center space-y-1"
                  >
                    <Heart className="h-4 w-4" />
                    <span>Criar Look</span>
                  </button>
                  <button 
                    onClick={() => navigateToScreen('style-chat')}
                    className="bg-white/20 text-white p-3 rounded-xl text-xs font-bold hover:bg-white/30 transition-all flex flex-col items-center space-y-1"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Discutir</span>
                  </button>
                  <button 
                    onClick={() => navigateToScreen('smart-shopping')}
                    className="bg-white/20 text-white p-3 rounded-xl text-xs font-bold hover:bg-white/30 transition-all flex flex-col items-center space-y-1"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Lista Compras</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context Info */}
          {!analysisResult && !isAnalyzing && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <h3 className="text-white font-bold mb-3 flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>O que será analisado</span>
              </h3>
              <div className="space-y-2 text-white/80 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{wardrobe.length} peças no armário</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>{outfits.length} outfits criados</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Análise de cor: {userProfile?.colorSeason || 'Não feita'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span>Body shape: {userProfile?.bodyShape || 'Não analisado'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Espaço extra no final para scroll completo */}
        <div className="h-20"></div>
      </div>
    </div>
  );
};

// Componente para estruturar os resultados da análise em seções bonitas
const AnalysisResultsStructured = ({ analysisText, wardrobe, userProfile }) => {
  // Se analysisText é um objeto JSON estruturado
  if (analysisText && typeof analysisText === 'object' && !analysisText.rawText) {
    return <StructuredJSONResults data={analysisText} wardrobe={wardrobe} userProfile={userProfile} />;
  }
  
  // Fallback para texto não estruturado (versão antiga)
  return <LegacyTextResults analysisText={analysisText?.rawText || analysisText} wardrobe={wardrobe} userProfile={userProfile} />;
};

// Componente para resultados JSON estruturados
const StructuredJSONResults = ({ data, wardrobe, userProfile }) => {
  const getScoreColor = (score) => {
    if (score >= 8) return 'from-green-500 to-emerald-600';
    if (score >= 6) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 8) return <Award className="h-6 w-6" />;
    if (score >= 6) return <Star className="h-6 w-6" />;
    return <Target className="h-6 w-6" />;
  };

  const getCompatibilityColor = (nivel) => {
    switch (nivel) {
      case 'EXCELENTE': return 'bg-green-100 text-green-800 border-green-200';
      case 'BOM': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAVORÁVEL': return 'bg-green-100 text-green-800 border-green-200';
      case 'ADEQUADO': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Identificação da Peça */}
      {data.identificacao && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <h3 className="text-white font-bold text-lg flex items-center space-x-2">
              <Eye className="h-6 w-6" />
              <span>Identificação da Peça</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm font-medium">Tipo</p>
                <p className="text-gray-900 font-bold">{data.identificacao.tipo}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Cor</p>
                <p className="text-gray-900 font-bold">{data.identificacao.cor}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Material</p>
                <p className="text-gray-900 font-bold">{data.identificacao.material}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium">Estilo</p>
                <p className="text-gray-900 font-bold">{data.identificacao.estilo}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Score de Compra */}
      {data.score && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`bg-gradient-to-r ${getScoreColor(data.score.pontuacao)} p-4`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                {getScoreIcon(data.score.pontuacao)}
                <h3 className="font-bold text-lg">Score de Compra</h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black">{data.score.pontuacao}/10</div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-700 text-sm">{data.score.justificacao}</p>
          </div>
        </div>
      )}

      {/* Compatibilidade */}
      {data.compatibilidade && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Palette className="h-6 w-6 text-purple-500 mr-2" />
            Análise de Compatibilidade
          </h3>
          <div className="space-y-3">
            {data.compatibilidade.estacaoCor && (
              <div className={`p-4 rounded-xl border-2 ${getCompatibilityColor(data.compatibilidade.estacaoCor.nivel)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Estação de Cor ({userProfile?.colorSeason || 'N/A'})</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/70">
                    {data.compatibilidade.estacaoCor.nivel}
                  </span>
                </div>
                <p className="text-sm opacity-90">{data.compatibilidade.estacaoCor.explicacao}</p>
              </div>
            )}
            {data.compatibilidade.bodyShape && (
              <div className={`p-4 rounded-xl border-2 ${getCompatibilityColor(data.compatibilidade.bodyShape.nivel)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Body Shape ({userProfile?.bodyShape || 'N/A'})</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/70">
                    {data.compatibilidade.bodyShape.nivel}
                  </span>
                </div>
                <p className="text-sm opacity-90">{data.compatibilidade.bodyShape.explicacao}</p>
              </div>
            )}
            {data.compatibilidade.versatilidade && (
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-gray-700 text-sm">{data.compatibilidade.versatilidade}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Combina Com */}
      {data.combinaCom && data.combinaCom.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <Crown className="h-6 w-6 text-pink-500 mr-2" />
            Combina Com ({data.combinaCom.length} {wardrobe.length > 0 ? 'peças' : 'sugestões'})
          </h3>
          <div className="space-y-3">
            {data.combinaCom.map((item, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-pink-800 font-bold text-sm">
                      {item.peca || item.categoria}
                    </p>
                    <p className="text-pink-600 text-xs mt-1">
                      {item.tipoLook || item.sugestao}
                    </p>
                  </div>
                  <Heart className="h-4 w-4 text-pink-500 flex-shrink-0 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Versatilidade */}
      {data.versatilidade && (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
            Versatilidade
          </h3>
          <div className="space-y-4">
            {data.versatilidade.ocasioes && (
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Ocasiões</p>
                <div className="flex flex-wrap gap-2">
                  {data.versatilidade.ocasioes.map((ocasiao, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {ocasiao}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.versatilidade.estilos && (
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Estilos</p>
                <div className="flex flex-wrap gap-2">
                  {data.versatilidade.estilos.map((estilo, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      {estilo}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.versatilidade.layering && (
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Layering</p>
                <p className="text-gray-700 text-sm">{data.versatilidade.layering}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Decisão Final */}
      {data.decisao && (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`p-4 ${
            data.decisao.recomendacao === 'COMPRAR' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
            'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-2">
                {data.decisao.recomendacao === 'COMPRAR' ? 
                  <CheckCircle className="h-6 w-6" /> : 
                  <XCircle className="h-6 w-6" />
                }
                <h3 className="font-bold text-lg">Decisão Final</h3>
              </div>
              <div className="text-right">
                <div className="text-xl font-black">
                  {data.decisao.recomendacao === 'COMPRAR' ? '✅ COMPRAR' : '❌ NÃO COMPRAR'}
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600 text-sm font-medium mb-2">Razões:</p>
            <ul className="space-y-1">
              {data.decisao.razoes.map((razao, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                  <span className="font-bold text-gray-500">{index + 1}.</span>
                  <span>{razao}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center space-x-2 text-gray-500 text-sm mt-3 pt-3 border-t">
              <TrendingUp className="h-4 w-4" />
              <span>Baseado em {wardrobe.length} peças do teu armário</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de fallback para texto não estruturado
const LegacyTextResults = ({ analysisText, wardrobe, userProfile }) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center">
        <Eye className="h-6 w-6 text-indigo-500 mr-2" />
        Análise Completa
      </h3>
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
          {analysisText}
        </div>
      </div>
    </div>
  );
};

export default QuickAnalysisScreen;