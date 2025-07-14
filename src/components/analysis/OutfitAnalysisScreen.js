// src/components/analysis/OutfitAnalysisScreen.js
import React, { useState } from 'react';
import { 
  ArrowLeft, Camera, Upload, Star, Award, TrendingUp, 
  Eye, Palette, User, Lightbulb, Target, Heart, 
  CheckCircle, XCircle, AlertCircle, Zap, Crown,
  RotateCcw, Share2, Save
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import { OPENAI_API_KEY } from '../../utils/constants';
import CameraCapture from '../shared/CameraCapture';

const OutfitAnalysisScreen = ({ navigateToScreen }) => {
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

  const analyzeOutfit = async () => {
    if (!OPENAI_API_KEY) {
      alert('API key da OpenAI não configurada no sistema.');
      return;
    }

    if (!capturedImage) {
      alert('Adiciona uma foto do outfit primeiro.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Contexto do perfil do utilizador
      const profileContext = createProfileContext();
      
      const prompt = `Como personal stylist expert, analisa este outfit completo e dá um feedback detalhado USANDO A METADATA AI DO ARMÁRIO.

${profileContext}

ANÁLISE COMPLETA DO OUTFIT (APROVEITA A METADATA AI):

1. **IDENTIFICAÇÃO DAS PEÇAS**
   - Lista todas as peças visíveis no outfit
   - Cores predominantes e secundárias
   - Estilo geral (casual, formal, business, etc.)

2. **HARMONIA DE CORES**
   - Se as cores combinam harmoniosamente
   - Análise da paleta de cores usada
   - Sugestões de melhoria nas cores se necessário

3. **PROPORÇÕES E SILHUETA**
   - Como o outfit assenta na figura
   - Se as proporções estão equilibradas
   - Se favorece o tipo de corpo

4. **ADEQUAÇÃO E OCASIÃO**
   - Para que ocasiões este look é apropriado
   - Nível de formalidade adequado
   - Versatilidade do conjunto

5. **SCORE DETALHADO**
   - Harmonia de cores (1-10)
   - Proporções (1-10)
   - Estilo geral (1-10)
   - Score total (1-10)

6. **MELHORIAS ESPECÍFICAS (USAR METADATA AI)**
   - Adjustments simples (dobrar mangas, adicionar cinto, etc.)
   - Acessórios que melhorariam o look (baseado no gênero e análise AI)
   - Mudanças de cor específicas (baseado na compatibilidade AI das peças)
   - **ALTERNATIVAS INTELIGENTES DO ARMÁRIO**: 
     * Analisa a metadata AI de cada peça disponível
     * Para cada peça do outfit, sugere 1-2 alternativas específicas do armário
     * Explica PORQUÊ baseado na análise AI (tecido, ocasião, compatibilidade)
     * Exemplo: "Troca a camisa de poliéster por 'Camisa Branca de Algodão' - a análise AI indica que é mais respirável e adequada para trabalho"

7. **TIPS DE STYLING**
   - Como usar este outfit em diferentes contextos
   - Variações para diferentes ocasiões
   - Layering suggestions

IMPORTANTE: Se há peças COM análise AI no armário, usa SEMPRE essa informação para sugestões específicas. Se só há peças sem análise AI, usa apenas a informação básica.

FORMATO JSON:
{
  "identificacao": {
    "pecas": ["peça1", "peça2", "peça3"],
    "cores": ["cor1", "cor2"],
    "estilo": "style category"
  },
  "scores": {
    "harmoniaColors": number,
    "proporcoes": number,
    "estiloGeral": number,
    "scoreTotal": number
  },
  "analise": {
    "pontosForts": ["ponto1", "ponto2"],
    "areasImprovement": ["area1", "area2"],
    "harmoniaColors": "descrição",
    "adequacaoCorpo": "descrição"
  },
  "melhorias": {
    "adjustments": ["adjustment1", "adjustment2"],
    "acessorios": ["acessório1", "acessório2"],
    "mudancasCores": ["sugestão1", "sugestão2"],
    "alternativasInteligentes": [
      {
        "pecaOriginal": "nome da peça no outfit",
        "alternativaSugerida": "nome da peça do armário",
        "razaoIA": "explicação baseada na metadata AI",
        "beneficio": "como melhora o look"
      }
    ]
  },
  "styling": {
    "ocasioes": ["ocasião1", "ocasião2"],
    "variantes": ["variante1", "variante2"],
    "layering": ["tip1", "tip2"]
  },
  "feedback": "comentário geral do stylist"
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist profissional especializado em análise de outfits completos. Dás feedback construtivo e específico baseado em princípios de styling.'
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
                url: capturedImage
              }
            }
          ]
        }
      ], true);

      // Tentar extrair JSON da resposta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysisResult(analysisData);
      } else {
        // Fallback para resposta em texto
        setAnalysisResult({
          rawText: response,
          scores: { scoreTotal: 7 } // Score padrão para texto
        });
      }

    } catch (error) {
      console.error('❌ Erro na análise do outfit:', error);
      alert('Erro na análise: ' + error.message);
    }
    
    setIsAnalyzing(false);
  };

  const createProfileContext = () => {
    let context = '';
    
    if (userProfile?.gender) {
      context += `\nPERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE ESPECÍFICA POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Feminilidade, elegância, proporções femininas
- ACESSÓRIOS: Joias, carteiras, sapatos femininos, lenços
- STYLING: Layering feminino, color coordination, silhueta
- OCASIÕES: Trabalho feminino, social, casual elegante
` : userProfile.gender === 'male' ? `
- FOCAR EM: Masculinidade, sophistication, presença profissional
- ACESSÓRIOS: Relógios, cintos, sapatos formais, carteiras
- STYLING: Fit masculino, proporções, dress codes
- OCASIÕES: Business, casual masculino, social
` : `
- FOCAR EM: Styling neutro e inclusivo
- CONSIDERAR: Versatilidade para diferentes expressões
`}`;
    }

    if (userProfile?.colorSeason) {
      context += `\n- Estação de cor: ${userProfile.colorSeason}`;
    }

    if (userProfile?.bodyShape) {
      context += `\n- Tipo de corpo: ${userProfile.bodyShape}`;
    }

    if (userProfile?.preferredStyle) {
      context += `\n- Estilo preferido: ${userProfile.preferredStyle}`;
    }

    // ✨ NOVA SEÇÃO: Incluir metadata AI rica de todas as peças
    if (wardrobe && wardrobe.length > 0) {
      context += `\n\nARMÁRIO COMPLETO COM ANÁLISE AI:`;
      
      const aiAnalyzedItems = wardrobe.filter(item => item.aiMetadata);
      const basicItems = wardrobe.filter(item => !item.aiMetadata);
      
      // Peças com metadata AI (informação rica)
      if (aiAnalyzedItems.length > 0) {
        context += `\n\n🧠 PEÇAS COM ANÁLISE AI COMPLETA (${aiAnalyzedItems.length} peças):`;
        aiAnalyzedItems.slice(0, 15).forEach((item, index) => {
          context += `\n${index + 1}. **${item.name}** (${item.category}, ${item.color})
   📝 ANÁLISE AI: ${item.aiMetadata.substring(0, 200)}...`;
        });
      }
      
      // Peças sem metadata AI (informação básica)
      if (basicItems.length > 0) {
        context += `\n\n📋 PEÇAS SEM ANÁLISE AI (${basicItems.length} peças):`;
        basicItems.slice(0, 10).forEach((item, index) => {
          context += `\n${index + 1}. ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`;
        });
      }
      
      context += `\n\n💡 INSTRUÇÕES PARA SUGESTÕES INTELIGENTES:
- Para peças COM análise AI: Use a metadata completa para sugestões específicas de styling, ocasião e combinação
- Para peças SEM análise AI: Use apenas informação básica (categoria, cor)
- Priorize sempre peças com análise AI nas sugestões por terem informação mais rica
- Baseie as sugestões de alternativas na compatibilidade descrita na metadata AI`;
    }

    return context;
  };

  const resetAnalysis = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
  };

  const saveOutfitAnalysis = () => {
    if (!analysisResult) return;
    
    // Criar um "outfit analysis" que pode ser salvo para referência futura
    const savedAnalysis = {
      id: Date.now(),
      image: capturedImage,
      analysis: analysisResult,
      date: new Date().toISOString(),
      score: analysisResult.scores?.scoreTotal || 0
    };
    
    // Salvar no localStorage
    const savedAnalyses = JSON.parse(localStorage.getItem('whatToWear_outfitAnalyses') || '[]');
    savedAnalyses.unshift(savedAnalysis);
    localStorage.setItem('whatToWear_outfitAnalyses', JSON.stringify(savedAnalyses.slice(0, 50))); // Manter apenas 50
    
    alert('Análise guardada com sucesso!');
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score) => {
    if (score >= 9) return { text: 'PERFEITO', color: 'bg-green-500', icon: Crown };
    if (score >= 8) return { text: 'EXCELENTE', color: 'bg-emerald-500', icon: Award };
    if (score >= 7) return { text: 'BOM', color: 'bg-blue-500', icon: Star };
    if (score >= 6) return { text: 'OK', color: 'bg-yellow-500', icon: CheckCircle };
    if (score >= 4) return { text: 'PRECISA MELHORAR', color: 'bg-orange-500', icon: AlertCircle };
    return { text: 'REQUER MUDANÇAS', color: 'bg-red-500', icon: XCircle };
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 pb-20">
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
              Análise de Outfit
            </h1>
            <div className="w-12 h-12" />
          </div>
          
          <p className="text-white/90 text-center font-medium mb-2">
            Fotografa o teu look completo para análise detalhada
          </p>
          <p className="text-white/70 text-sm text-center mb-3">
            Score, harmonia de cores, proporções e tips de improvement
          </p>
          
          {/* AI Power Indicator */}
          {wardrobe && wardrobe.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 mt-4">
              <div className="flex items-center justify-center space-x-4 text-white/90 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>{wardrobe.filter(item => item.aiMetadata).length} peças com IA</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>{wardrobe.filter(item => !item.aiMetadata).length} peças básicas</span>
                </div>
              </div>
              <p className="text-white/70 text-xs text-center mt-2">
                ✨ Peças com IA geram sugestões mais inteligentes
              </p>
            </div>
          )}
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
                      alt="Outfit captured" 
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={analyzeOutfit}
                    disabled={isAnalyzing}
                    className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
                      isAnalyzing 
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg transform hover:scale-[1.02]'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Analisando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Analisar Outfit</span>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Captura o Teu Outfit
                    </h3>
                    <p className="text-white/80 text-sm">
                      Foto do corpo inteiro para melhor análise
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all flex flex-col items-center space-y-2"
                    >
                      <Camera className="h-8 w-8" />
                      <span>Câmara</span>
                    </button>
                    
                    <label className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl text-white font-semibold hover:bg-white/30 transition-all flex flex-col items-center space-y-2 cursor-pointer">
                      <Upload className="h-8 w-8" />
                      <span>Galeria</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-pulse"></div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">Análise em Progresso</h3>
                  <div className="space-y-1 text-white/80 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                      <span>Identificando peças e cores...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <span>Analisando harmonia e proporções...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                      <span>Processando metadata AI do armário...</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                      <span>Gerando sugestões inteligentes...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <AnalysisResults 
              analysis={analysisResult}
              image={capturedImage}
              onReset={resetAnalysis}
              onSave={saveOutfitAnalysis}
              getScoreColor={getScoreColor}
              getScoreBadge={getScoreBadge}
              wardrobe={wardrobe}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar os resultados da análise
const AnalysisResults = ({ analysis, image, onReset, onSave, getScoreColor, getScoreBadge, wardrobe }) => {
  // Se é resposta em JSON estruturado
  if (analysis.scores && analysis.identificacao) {
    return <StructuredResults analysis={analysis} image={image} onReset={onReset} onSave={onSave} getScoreColor={getScoreColor} getScoreBadge={getScoreBadge} wardrobe={wardrobe} />;
  }
  
  // Fallback para resposta em texto
  return <TextResults analysis={analysis} image={image} onReset={onReset} onSave={onSave} />;
};

// Resultados estruturados (JSON)
const StructuredResults = ({ analysis, image, onReset, onSave, getScoreColor, getScoreBadge, wardrobe }) => {
  const totalScore = analysis.scores.scoreTotal;
  const badge = getScoreBadge(totalScore);
  const BadgeIcon = badge.icon;

  return (
    <div className="space-y-6">
      {/* Header com imagem e score */}
      <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6">
        <div className="flex items-start space-x-4 mb-4">
          <img src={image} alt="Outfit analyzed" className="w-20 h-20 object-cover rounded-xl" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-bold text-lg">Resultado da Análise</h3>
              <div className={`${badge.color} text-white px-3 py-1 rounded-full flex items-center space-x-1`}>
                <BadgeIcon className="h-4 w-4" />
                <span className="text-xs font-bold">{badge.text}</span>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-black ${getScoreColor(totalScore)} bg-white rounded-2xl p-3 inline-block`}>
                {totalScore}/10
              </div>
              <p className="text-white/80 text-sm mt-1">Score Total</p>
            </div>
          </div>
        </div>

        {/* Identificação das peças */}
        <div className="bg-white/20 rounded-2xl p-4 mb-4">
          <h4 className="text-white font-semibold mb-2 flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Peças Identificadas
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {analysis.identificacao.pecas?.map((peca, index) => (
              <div key={index} className="bg-white/20 rounded-lg p-2 text-white text-sm text-center">
                {peca}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-center space-x-2">
            {analysis.identificacao.cores?.map((cor, index) => (
              <div key={index} className="bg-white/30 text-white text-xs px-2 py-1 rounded-full">
                {cor}
              </div>
            ))}
          </div>
        </div>

        {/* Scores detalhados */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <ScoreCard 
            title="Cores"
            score={analysis.scores.harmoniaColors}
            icon={<Palette className="h-4 w-4" />}
            getScoreColor={getScoreColor}
          />
          <ScoreCard 
            title="Proporções"
            score={analysis.scores.proporcoes}
            icon={<User className="h-4 w-4" />}
            getScoreColor={getScoreColor}
          />
          <ScoreCard 
            title="Estilo"
            score={analysis.scores.estiloGeral}
            icon={<Award className="h-4 w-4" />}
            getScoreColor={getScoreColor}
          />
        </div>
      </div>

      {/* Pontos fortes e melhorias */}
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Pontos fortes */}
          <div>
            <h4 className="font-bold text-green-800 mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Pontos Fortes
            </h4>
            <ul className="space-y-2">
              {analysis.analise.pontosForts?.map((ponto, index) => (
                <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{ponto}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Áreas de melhoria */}
          {analysis.analise.areasImprovement?.length > 0 && (
            <div>
              <h4 className="font-bold text-orange-800 mb-3 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Áreas de Melhoria
              </h4>
              <ul className="space-y-2">
                {analysis.analise.areasImprovement.map((area, index) => (
                  <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Melhorias específicas */}
      {analysis.melhorias && (
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h4 className="font-bold text-blue-800 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Melhorias Específicas
          </h4>
          
          <div className="space-y-4">
            {analysis.melhorias.adjustments?.length > 0 && (
              <ImprovementSection 
                title="Adjustments Rápidos"
                items={analysis.melhorias.adjustments}
                color="blue"
              />
            )}
            
            {analysis.melhorias.acessorios?.length > 0 && (
              <ImprovementSection 
                title="Acessórios Sugeridos"
                items={analysis.melhorias.acessorios}
                color="purple"
              />
            )}
            
            {analysis.melhorias.mudancasCores?.length > 0 && (
              <ImprovementSection 
                title="Melhorias de Cor"
                items={analysis.melhorias.mudancasCores}
                color="pink"
              />
            )}
            
            {analysis.melhorias.alternativasInteligentes?.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <h5 className="font-semibold text-emerald-800 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  🧠 Alternativas Inteligentes (baseadas na Análise AI)
                </h5>
                <div className="space-y-3">
                  {analysis.melhorias.alternativasInteligentes.map((alt, index) => (
                    <div key={index} className="bg-white rounded-xl p-3 border border-emerald-100">
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-emerald-800 text-sm">
                          {alt.pecaOriginal} → {alt.alternativaSugerida}
                        </span>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>AI</span>
                        </div>
                      </div>
                      <p className="text-emerald-700 text-sm mb-1">
                        <strong>Razão AI:</strong> {alt.razaoIA}
                      </p>
                      <p className="text-emerald-600 text-sm">
                        <strong>Benefício:</strong> {alt.beneficio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.melhorias.pecasAlternativas?.length > 0 && (
              <ImprovementSection 
                title="Outras Alternativas"
                items={analysis.melhorias.pecasAlternativas}
                color="green"
              />
            )}
          </div>
        </div>
      )}

      {/* Styling tips */}
      {analysis.styling && (
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <h4 className="font-bold text-purple-800 mb-4 flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Tips de Styling
          </h4>
          
          <div className="space-y-4">
            {analysis.styling.ocasioes?.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Ocasiões Adequadas:</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.styling.ocasioes.map((ocasiao, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      {ocasiao}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {analysis.styling.variantes?.length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-800 mb-2">Variações:</h5>
                <ul className="space-y-1">
                  {analysis.styling.variantes.map((variante, index) => (
                    <li key={index} className="text-gray-700 text-sm flex items-start space-x-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span>{variante}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback do stylist */}
      {analysis.feedback && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-3xl p-6 border border-teal-200">
          <h4 className="font-bold text-teal-800 mb-3 flex items-center">
            <Heart className="h-5 w-5 mr-2" />
            Feedback do Personal Stylist
          </h4>
          <p className="text-teal-700 text-sm italic leading-relaxed">
            "{analysis.feedback}"
          </p>
        </div>
      )}

      {/* AI Enhancement Notice */}
      {wardrobe && wardrobe.filter(item => item.aiMetadata).length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-3xl p-4 border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <h5 className="font-bold text-purple-800 text-sm">🧠 Powered by AI Metadata</h5>
          </div>
          <p className="text-purple-700 text-xs leading-relaxed">
            Esta análise foi enriquecida com metadata AI de {wardrobe.filter(item => item.aiMetadata).length} peças do teu armário, 
            permitindo sugestões mais específicas sobre tecidos, ocasiões e compatibilidade real entre peças.
          </p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex space-x-3">
        <button
          onClick={onReset}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Nova Análise</span>
        </button>
        
        <button
          onClick={onSave}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2 hover:shadow-lg transition-all"
        >
          <Save className="h-4 w-4" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
};

// Componente para score individual
const ScoreCard = ({ title, score, icon, getScoreColor }) => (
  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
    <div className="flex items-center justify-center space-x-1 mb-1">
      {icon}
      <span className="text-white text-xs font-semibold">{title}</span>
    </div>
    <div className={`text-xl font-bold ${getScoreColor(score)} bg-white rounded-lg py-1`}>
      {score}/10
    </div>
  </div>
);

// Componente para seções de melhoria
const ImprovementSection = ({ title, items, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    pink: 'bg-pink-50 border-pink-200 text-pink-800',
    green: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`${colorClasses[color]} rounded-2xl p-4 border`}>
      <h5 className="font-semibold mb-2">{title}:</h5>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm flex items-start space-x-2">
            <div className={`w-1 h-1 bg-${color}-600 rounded-full mt-2 flex-shrink-0`}></div>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Fallback para resposta em texto
const TextResults = ({ analysis, image, onReset, onSave }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-6">
        <div className="flex items-start space-x-4 mb-4">
          <img src={image} alt="Outfit analyzed" className="w-20 h-20 object-cover rounded-xl" />
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2">Análise do Outfit</h3>
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full inline-block">
              <span className="text-xs font-bold">ANÁLISE COMPLETA</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <Eye className="h-6 w-6 text-teal-500 mr-2" />
          Feedback Completo
        </h3>
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
            {analysis.rawText}
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={onReset}
          className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Nova Análise</span>
        </button>
        
        <button
          onClick={onSave}
          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-2xl font-semibold flex items-center justify-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>Guardar</span>
        </button>
      </div>
    </div>
  );
};

export default OutfitAnalysisScreen;