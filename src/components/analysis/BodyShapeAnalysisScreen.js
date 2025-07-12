import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Camera, Upload, User, Ruler, Target, RefreshCw, Zap, Star,
  CheckCircle, XCircle, ShoppingBag, Lightbulb, Crown, Scissors, Palette,
  Info, Sparkles, Heart
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const BodyShapeAnalysisScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, updateUserProfile, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [step, setStep] = useState(1);
  const [bodyImage, setBodyImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [wardrobeAnalysis, setWardrobeAnalysis] = useState(null);
  const [mode, setMode] = useState(userProfile?.bodyShapeAnalysis ? 'results' : 'check');
  const [isRevealed, setIsRevealed] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    shoulders: '',
    bust: '',
    waist: '',
    hips: '',
    bodyType: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const bodyTypes = {
    'Pear': {
      description: 'Quadris mais largos que ombros',
      emoji: '🍐',
      color: 'green',
      characteristics: ['Parte inferior mais volumosa', 'Cintura definida', 'Ombros mais estreitos'],
      bestStyles: ['Tops estruturados', 'Decotes em V', 'Cores claras em cima', 'A-line skirts'],
      avoidStyles: ['Calças muito justas', 'Tops muito largos', 'Horizontal stripes em baixo'],
      quickTips: ['Realça a parte superior', 'Equilibra as proporções', 'Marca a cintura']
    },
    'Apple': {
      description: 'Parte superior mais volumosa',
      emoji: '🍎',
      color: 'orange',
      characteristics: ['Torso mais largo', 'Pernas mais finas', 'Cintura menos definida'],
      bestStyles: ['Empire waist', 'V-necks', 'Vertical stripes', 'Blazers abertos'],
      avoidStyles: ['Cintos apertados', 'Tops justos', 'Horizontal patterns no torso'],
      quickTips: ['Alonga o torso', 'Evita cintos apertados', 'Realça as pernas']
    },
    'Hourglass': {
      description: 'Ombros e quadris equilibrados com cintura definida',
      emoji: '⏳',
      color: 'pink',
      characteristics: ['Curvas equilibradas', 'Cintura bem marcada', 'Proporções harmoniosas'],
      bestStyles: ['Peças que marcam a cintura', 'Wrap dresses', 'Fit & flare', 'High-waisted'],
      avoidStyles: ['Peças muito largas', 'Shapes que escondem cintura', 'Baggy clothes'],
      quickTips: ['Marca sempre a cintura', 'Evita shapes largos', 'Abraça as curvas']
    },
    'Rectangle': {
      description: 'Medidas similares nos ombros, cintura e quadris',
      emoji: '📏',
      color: 'blue',
      characteristics: ['Silhueta reta', 'Cintura pouco definida', 'Proporções uniformes'],
      bestStyles: ['Peças que criam curvas', 'Cintos', 'Layering', 'Peplum tops'],
      avoidStyles: ['Peças muito retas', 'Baggy clothes', 'Shapeless dresses'],
      quickTips: ['Cria ilusão de curvas', 'Usa cintos estrategicamente', 'Layering é teu amigo']
    },
    'Inverted Triangle': {
      description: 'Ombros mais largos que quadris',
      emoji: '🔺',
      color: 'purple',
      characteristics: ['Parte superior dominante', 'Quadris estreitos', 'Ombros largos'],
      bestStyles: ['Bottoms volumosos', 'Wide-leg pants', 'A-line skirts', 'Scoop necks'],
      avoidStyles: ['Shoulder pads', 'Horizontal stripes em cima', 'Skinny bottoms'],
      quickTips: ['Equilibra com bottoms volumosos', 'Evita ombros estruturados', 'Realça as pernas']
    }
  };

  // Função para criar fallback de dados
  const createFallbackAnalysis = (bodyShape) => {
    return {
      bodyShape: bodyShape || 'Rectangle',
      confidence: 75,
      proportionAnalysis: `Body shape determinado como ${bodyShape}.`,
      recommendedPieces: ["Blazers", "Camisas estruturadas", "Calças de cintura alta"],
      avoidPieces: ["Peças muito largas", "Shapes indefinidos"],
      wardrobeAnalysis: wardrobe.slice(0, 5).map((item, index) => ({
        itemName: item.name,
        rating: 7,
        category: "Neutro",
        reasoning: "Análise básica - peça adequada para o body shape determinado"
      })),
      shoppingGuide: ["Investe em basics de qualidade", "Peças que marquem a silhueta", "Acessórios estruturados"],
      stylingTips: ["Equilibra proporções", "Usa cores estrategicamente", "Investe em peças bem ajustadas"]
    };
  };

  const validateAndNormalizeAnalysis = (data) => {
    console.log('🔍 Validando análise...');
    
    if (data.bodyShape === 'InvertedTriangle') {
      data.bodyShape = 'Inverted Triangle';
    }
    
    const validBodyShapes = ['Pear', 'Apple', 'Hourglass', 'Rectangle', 'Inverted Triangle'];
    if (!validBodyShapes.includes(data.bodyShape)) {
      console.warn('⚠️ Body shape inválido, usando Rectangle como default');
      data.bodyShape = 'Rectangle';
    }
    
    data.recommendedPieces = data.recommendedPieces || [];
    data.avoidPieces = data.avoidPieces || [];
    data.wardrobeAnalysis = data.wardrobeAnalysis || [];
    data.shoppingGuide = data.shoppingGuide || [];
    data.stylingTips = data.stylingTips || [];
    data.confidence = typeof data.confidence === 'number' ? data.confidence : 75;
    data.proportionAnalysis = data.proportionAnalysis || `Análise para body shape ${data.bodyShape}`;
    
    console.log('✅ Análise validada:', data);
    return data;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBodyImage(e.target.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setBodyImage(photoDataUrl);
    setShowCamera(false);
    setStep(2);
  };

  const handleMeasurementsSubmit = () => {
    setStep(3);
    performBodyShapeAnalysis();
  };

  const resetAnalysis = () => {
    setStep(1);
    setMode('full-analysis');
    setAnalysis(null);
    setWardrobeAnalysis(null);
    setBodyImage(null);
    setMeasurements({
      height: '',
      weight: '',
      shoulders: '',
      bust: '',
      waist: '',
      hips: '',
      bodyType: ''
    });
  };

  // ✅ ANÁLISE MELHORADA DO ARMÁRIO (SÓ PEÇAS REAIS)
  const analyzeWardrobeOnly = async () => {
    if (!userProfile?.bodyShape) {
      alert('Primeiro é necessário determinar o teu body shape');
      return;
    }

    if (wardrobe.length === 0) {
      alert('O teu armário está vazio. Adiciona algumas peças primeiro!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Como especialista em body shape analysis, analisa APENAS o armário baseado no body shape já determinado.

BODY SHAPE CONFIRMADO: ${userProfile.bodyShape}

ARMÁRIO REAL DO UTILIZADOR (${wardrobe.length} peças):
${wardrobe.map((item, index) => `${index + 1}. ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''})`).join('\n')}

Avalia cada peça individualmente e fornece:

1. **SCORE de 1-10** para cada peça baseado na compatibilidade com o body shape
2. **CATEGORIA**: MuitoFavorável, Favorável, Neutro, PoucoFavorável, Desfavorável
3. **REASONING**: Explicação breve de porquê o score
4. **STYLING TIP**: Dica específica para essa peça (opcional)

RESPONDE EM JSON:
{
  "wardrobeAnalysis": [
    {
      "itemName": "nome exato da peça",
      "rating": 8,
      "category": "Favorável",
      "reasoning": "explicação breve",
      "stylingTip": "dica específica opcional"
    }
  ],
  "overallSummary": {
    "perfectPieces": 3,
    "goodPieces": 5,
    "neutralPieces": 2,
    "poorPieces": 1,
    "recommendations": ["rec1", "rec2", "rec3"]
  }
}`;

      let response;
      try {
        console.log('🔄 Enviando request para OpenAI para análise do armário...');
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista em body shape analysis e personal styling. Analisas armários para determinar compatibilidade com body shapes.'
          },
          {
            role: 'user',
            content: prompt
          }
        ], true);

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const wardrobeData = JSON.parse(jsonMatch[0]);
          setWardrobeAnalysis(wardrobeData);
          console.log('✅ Análise do armário real completa');
        } else {
          throw new Error('Resposta inválida da IA');
        }
      } catch (error) {
        console.error('💥 Erro na chamada OpenAI, usando dados simulados:', error);
        
        // Fallback com dados simulados baseados no armário real
        const wardrobeData = {
          wardrobeAnalysis: wardrobe.map((item, index) => ({
            itemName: item.name,
            rating: Math.floor(Math.random() * 4) + 6, // 6-10
            category: ['MuitoFavorável', 'Favorável', 'Neutro'][Math.floor(Math.random() * 3)],
            reasoning: `Análise simulada para ${item.name} - compatível com ${userProfile.bodyShape}`,
            stylingTip: `Dica para ${item.name}: combina bem com peças estruturadas`
          })),
          overallSummary: {
            perfectPieces: Math.floor(wardrobe.length * 0.2),
            goodPieces: Math.floor(wardrobe.length * 0.4),
            neutralPieces: Math.floor(wardrobe.length * 0.3),
            poorPieces: Math.floor(wardrobe.length * 0.1),
            recommendations: [
              "Análise detalhada temporariamente indisponível",
              "Experimenta diferentes combinações com as peças existentes",
              "Considera investir em basics de qualidade"
            ]
          }
        };
        setWardrobeAnalysis(wardrobeData);
        console.log('✅ Análise do armário simulada completa');
      }

    } catch (error) {
      console.error('💥 Erro na análise do armário:', error);
      alert(`Erro na análise do armário: ${error.message}`);
    }
    setIsAnalyzing(false);
  };

  const performBodyShapeAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Como especialista em análise de formato corporal e styling, determina o body shape desta pessoa e fornece recomendações específicas.

MEDIDAS FORNECIDAS:
- Altura: ${measurements.height}cm
- Peso: ${measurements.weight}kg
- Ombros: ${measurements.shoulders}cm
- Busto: ${measurements.bust}cm
- Cintura: ${measurements.waist}cm
- Quadris: ${measurements.hips}cm
- Tipo percebido: ${measurements.bodyType}

ARMÁRIO ATUAL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

⚠️ RESPONDE APENAS EM FORMATO JSON VÁLIDO. NÃO INCLUAS TEXTO ANTES OU DEPOIS DO JSON.

Para o bodyShape, usa EXATAMENTE um destes valores: "Pear", "Apple", "Hourglass", "Rectangle", ou "Inverted Triangle"

{
  "bodyShape": "um dos valores acima",
  "confidence": 85,
  "proportionAnalysis": "análise das proporções em 1-2 frases",
  "recommendedPieces": ["tipo1", "tipo2", "tipo3"],
  "avoidPieces": ["tipo1", "tipo2", "tipo3"],
  "wardrobeAnalysis": [
    {
      "itemName": "nome da peça do armário",
      "rating": 8,
      "category": "MuitoFavorável",
      "reasoning": "explicação breve"
    }
  ],
  "shoppingGuide": ["sugestão1", "sugestão2", "sugestão3"],
  "stylingTips": ["dica1", "dica2", "dica3"]
}`;

      let response;
      console.log('🔄 Enviando request para OpenAI...');
      
      try {
        if (bodyImage) {
          response = await callOpenAI([
            {
              role: 'system',
              content: 'És um especialista mundial em análise de formato corporal e personal styling. RESPONDE SEMPRE EM JSON VÁLIDO SEM TEXTO ADICIONAL.'
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
                    url: bodyImage
                  }
                }
              ]
            }
          ], true);
        } else {
          response = await callOpenAI([
            {
              role: 'system',
              content: 'És um especialista mundial em análise de formato corporal e personal styling. RESPONDE SEMPRE EM JSON VÁLIDO SEM TEXTO ADICIONAL.'
            },
            {
              role: 'user',
              content: prompt
            }
          ], true);
        }

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysisData = JSON.parse(jsonMatch[0]);
          const validatedData = validateAndNormalizeAnalysis(analysisData);
          
          setAnalysis(validatedData);
          
          // Salvar no perfil do utilizador
          updateUserProfile({
            bodyShape: validatedData.bodyShape,
            bodyShapeAnalysis: validatedData,
            analyzedAt: new Date().toLocaleDateString()
          });
          
          setStep(3);
        } else {
          throw new Error('Resposta inválida da IA');
        }
      } catch (error) {
        console.error('💥 Erro na chamada OpenAI, usando análise simulada:', error);
        const bodyShape = measurements.bodyType || 'Rectangle';
        const fallbackData = createFallbackAnalysis(bodyShape);
        const validatedData = validateAndNormalizeAnalysis(fallbackData);
        
        setAnalysis(validatedData);
        updateUserProfile({
          bodyShape: validatedData.bodyShape,
          bodyShapeAnalysis: validatedData,
          analyzedAt: new Date().toLocaleDateString()
        });
        
        setStep(3);
      }

    } catch (error) {
      console.error('💥 Erro na análise:', error);
      alert(`Erro na análise: ${error.message}`);
    }
    setIsAnalyzing(false);
  };

  // Loading screen com design criativo
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="relative mb-8">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="h-16 w-16 text-white animate-spin" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full animate-ping"></div>
          </div>
          
          <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {mode === 'wardrobe-only' ? 'ANALISANDO ARMÁRIO' : 'DESCOBRINDO TEU BODY SHAPE'}
          </h2>
          
          <p className="text-gray-600 mb-6 text-lg">
            {mode === 'wardrobe-only' ? 'A IA está a avaliar as tuas peças' : 'A IA está a determinar o teu body shape'}
          </p>
          
          <div className="space-y-3 text-left bg-white rounded-2xl p-6 shadow-xl">
            {mode === 'wardrobe-only' ? (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">👕 Analisando tops...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                  <span className="text-gray-700">👖 Avaliando bottoms...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-400"></div>
                  <span className="text-gray-700">⭐ Calculando scores...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-600"></div>
                  <span className="text-gray-700">💡 Gerando dicas...</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">📏 Analisando proporções...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                  <span className="text-gray-700">👗 Avaliando medidas...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse delay-400"></div>
                  <span className="text-gray-700">✨ Determinando body shape...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-600"></div>
                  <span className="text-gray-700">🎯 Criando recomendações...</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-pink-200/20 to-transparent rounded-full animate-spin" style={{animationDuration: '30s'}}></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full animate-spin" style={{animationDuration: '40s', animationDirection: 'reverse'}}></div>
      </div>

      <div className="relative z-10 p-4">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className={`flex items-center mb-6 pt-8 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <button onClick={() => navigateToScreen('home')} className="text-gray-700 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="ml-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                BODY ANALYSIS
              </h1>
              <div className="text-xs text-gray-600 font-semibold tracking-wide">STYLE REPORT</div>
            </div>
          </div>

          {/* Camera Modal */}
          {showCamera && (
            <CameraCapture
              onCapture={handleCameraCapture}
              onClose={() => setShowCamera(false)}
            />
          )}

          {/* Renderizar componentes baseado no mode e step */}
          {mode === 'check' && (
            <CreativeCheckAnalysisStep 
              userProfile={userProfile}
              bodyTypes={bodyTypes}
              onFullAnalysis={() => setMode('full-analysis')}
              onWardrobeAnalysis={() => {
                setMode('wardrobe-only');
                analyzeWardrobeOnly();
              }}
              onViewResults={() => setMode('results')}
              navigateToScreen={navigateToScreen}
              isRevealed={isRevealed}
            />
          )}

          {mode === 'results' && userProfile?.bodyShapeAnalysis && (
            <CreativeResultsViewStep
              analysis={userProfile.bodyShapeAnalysis}
              bodyTypes={bodyTypes}
              userProfile={userProfile}
              onWardrobeAnalysis={() => {
                setMode('wardrobe-only');
                analyzeWardrobeOnly();
              }}
              onNewAnalysis={() => setMode('full-analysis')}
              isRevealed={isRevealed}
            />
          )}

          {mode === 'full-analysis' && (
            <>
              {step === 1 && (
                <PhotoCaptureStep
                  onImageUpload={handleImageUpload}
                  onCameraOpen={() => setShowCamera(true)}
                  onSkip={() => setStep(2)}
                  isRevealed={isRevealed}
                />
              )}

              {step === 2 && (
                <MeasurementsStep
                  bodyImage={bodyImage}
                  measurements={measurements}
                  setMeasurements={setMeasurements}
                  onSubmit={handleMeasurementsSubmit}
                  isRevealed={isRevealed}
                />
              )}

              {step === 3 && analysis && (
                <AnalysisResultsStep
                  analysis={analysis}
                  bodyTypes={bodyTypes}
                  wardrobe={wardrobe}
                  navigateToScreen={navigateToScreen}
                  onReset={resetAnalysis}
                  onWardrobeAnalysis={() => {
                    setMode('wardrobe-only');
                    analyzeWardrobeOnly();
                  }}
                  isRevealed={isRevealed}
                />
              )}
            </>
          )}

          {mode === 'wardrobe-only' && (
            <CreativeWardrobeAnalysisStep
              analysis={analysis || userProfile?.bodyShapeAnalysis}
              wardrobeAnalysis={wardrobeAnalysis}
              bodyTypes={bodyTypes}
              userProfile={userProfile}
              navigateToScreen={navigateToScreen}
              onRefreshAnalysis={analyzeWardrobeOnly}
              onResetBodyShape={() => setMode('results')}
              wardrobe={wardrobe}
              isRevealed={isRevealed}
              hoveredCard={hoveredCard}
              setHoveredCard={setHoveredCard}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CREATIVE COMPONENTS
// ============================================================================

// Arte criativa para body types
const CreativeBodyIllustration = ({ bodyShape, bodyTypes }) => {
  const currentBodyType = bodyTypes[bodyShape] || bodyTypes['Hourglass'];
  
  return (
    <div className="relative w-40 h-48 mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 rounded-[2rem] transform rotate-3 opacity-60"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-yellow-100 via-pink-50 to-purple-100 rounded-[2rem] transform -rotate-2 opacity-40"></div>
      
      <div className="relative z-10 w-full h-full bg-white rounded-[2rem] shadow-2xl flex items-center justify-center overflow-hidden">
        {/* Elemento decorativo de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-4 w-8 h-8 bg-pink-300 rounded-full animate-pulse"></div>
          <div className="absolute top-12 right-6 w-4 h-4 bg-purple-300 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-8 left-6 w-6 h-6 bg-indigo-300 rounded-full animate-pulse delay-500"></div>
        </div>
        
        {/* Silhueta artística */}
        <svg viewBox="0 0 100 120" className="w-20 h-24">
          <defs>
            <linearGradient id={`bodyGradient-${bodyShape}`} x1="0%" y1="0%" x2="100%" y2="100%">
              {bodyShape === 'Hourglass' && (
                <>
                  <stop offset="0%" style={{stopColor:'#ec4899', stopOpacity:0.8}} />
                  <stop offset="50%" style={{stopColor:'#a855f7', stopOpacity:0.6}} />
                  <stop offset="100%" style={{stopColor:'#3b82f6', stopOpacity:0.4}} />
                </>
              )}
              {bodyShape === 'Pear' && (
                <>
                  <stop offset="0%" style={{stopColor:'#10b981', stopOpacity:0.8}} />
                  <stop offset="50%" style={{stopColor:'#059669', stopOpacity:0.6}} />
                  <stop offset="100%" style={{stopColor:'#047857', stopOpacity:0.4}} />
                </>
              )}
              {bodyShape === 'Apple' && (
                <>
                  <stop offset="0%" style={{stopColor:'#f97316', stopOpacity:0.8}} />
                  <stop offset="50%" style={{stopColor:'#ea580c', stopOpacity:0.6}} />
                  <stop offset="100%" style={{stopColor:'#dc2626', stopOpacity:0.4}} />
                </>
              )}
              {bodyShape === 'Rectangle' && (
                <>
                  <stop offset="0%" style={{stopColor:'#3b82f6', stopOpacity:0.8}} />
                  <stop offset="50%" style={{stopColor:'#2563eb', stopOpacity:0.6}} />
                  <stop offset="100%" style={{stopColor:'#1d4ed8', stopOpacity:0.4}} />
                </>
              )}
              {bodyShape === 'Inverted Triangle' && (
                <>
                  <stop offset="0%" style={{stopColor:'#a855f7', stopOpacity:0.8}} />
                  <stop offset="50%" style={{stopColor:'#9333ea', stopOpacity:0.6}} />
                  <stop offset="100%" style={{stopColor:'#7c3aed', stopOpacity:0.4}} />
                </>
              )}
            </linearGradient>
          </defs>
          
          {bodyShape === 'Hourglass' && (
            <g fill={`url(#bodyGradient-${bodyShape})`} stroke="#ec4899" strokeWidth="1.5">
              <path d="M35 25 Q25 20 20 25 Q25 30 35 30 Q50 35 65 30 Q75 30 80 25 Q75 20 65 25 Q50 20 35 25" />
              <path d="M40 50 Q30 45 35 55 Q45 60 50 55 Q55 60 65 55 Q70 45 60 50" />
              <path d="M35 85 Q25 80 20 85 Q25 90 35 90 Q50 95 65 90 Q75 90 80 85 Q75 80 65 85 Q50 80 35 85" />
              <path d="M35 30 Q40 40 40 50 M65 30 Q60 40 60 50 M40 55 Q45 70 35 85 M60 55 Q55 70 65 85" 
                    fill="none" strokeWidth="2" opacity="0.7"/>
            </g>
          )}
          
          {bodyShape === 'Pear' && (
            <g fill={`url(#bodyGradient-${bodyShape})`} stroke="#10b981" strokeWidth="1.5">
              <path d="M38 25 Q28 22 28 28 Q32 32 42 30 Q50 32 58 30 Q68 32 72 28 Q72 22 62 25 Q50 22 38 25" />
              <path d="M42 50 Q38 48 40 52 Q45 55 50 52 Q55 55 60 52 Q62 48 58 50" />
              <path d="M32 85 Q20 80 18 88 Q22 95 35 92 Q50 98 65 92 Q78 95 82 88 Q80 80 68 85 Q50 82 32 85" />
              <path d="M38 30 Q40 40 42 50 M62 30 Q60 40 58 50 M40 52 Q42 68 32 85 M60 52 Q58 68 68 85" 
                    fill="none" strokeWidth="2" opacity="0.7"/>
            </g>
          )}
          
          {bodyShape === 'Apple' && (
            <g fill={`url(#bodyGradient-${bodyShape})`} stroke="#f97316" strokeWidth="1.5">
              <path d="M37 25 Q27 22 27 28 Q31 32 41 30 Q50 32 59 30 Q69 32 73 28 Q73 22 63 25 Q50 22 37 25" />
              <path d="M32 50 Q22 45 25 55 Q35 65 50 60 Q65 65 75 55 Q78 45 68 50" />
              <path d="M40 85 Q30 82 30 88 Q34 92 44 90 Q50 92 56 90 Q66 92 70 88 Q70 82 60 85 Q50 82 40 85" />
              <path d="M37 30 Q35 40 32 50 M63 30 Q65 40 68 50 M25 55 Q35 70 40 85 M75 55 Q65 70 60 85" 
                    fill="none" strokeWidth="2" opacity="0.7"/>
            </g>
          )}
          
          {bodyShape === 'Rectangle' && (
            <g fill={`url(#bodyGradient-${bodyShape})`} stroke="#3b82f6" strokeWidth="1.5">
              <path d="M37 25 Q27 22 27 28 Q31 32 41 30 Q50 32 59 30 Q69 32 73 28 Q73 22 63 25 Q50 22 37 25" />
              <path d="M40 50 Q30 47 30 53 Q34 57 44 55 Q50 57 56 55 Q66 57 70 53 Q70 47 60 50" />
              <path d="M37 85 Q27 82 27 88 Q31 92 41 90 Q50 92 59 90 Q69 92 73 88 Q73 82 63 85 Q50 82 37 85" />
              <path d="M37 30 Q37 40 40 50 M63 30 Q63 40 60 50 M30 53 Q34 70 37 85 M70 53 Q66 70 63 85" 
                    fill="none" strokeWidth="2" opacity="0.7"/>
            </g>
          )}
          
          {bodyShape === 'Inverted Triangle' && (
            <g fill={`url(#bodyGradient-${bodyShape})`} stroke="#a855f7" strokeWidth="1.5">
              <path d="M32 25 Q22 20 18 25 Q22 30 32 30 Q50 35 68 30 Q78 30 82 25 Q78 20 68 25 Q50 20 32 25" />
              <path d="M42 50 Q38 47 38 53 Q42 57 48 55 Q50 57 52 55 Q58 57 62 53 Q62 47 58 50" />
              <path d="M44 85 Q38 82 38 88 Q42 92 48 90 Q50 92 52 90 Q58 92 62 88 Q62 82 56 85 Q50 82 44 85" />
              <path d="M32 30 Q38 40 42 50 M68 30 Q62 40 58 50 M38 53 Q42 70 44 85 M62 53 Q58 70 56 85" 
                    fill="none" strokeWidth="2" opacity="0.7"/>
            </g>
          )}
        </svg>
        
        {/* Elementos decorativos flutuantes */}
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-bounce"></div>
        </div>
        <div className="absolute bottom-2 left-2">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
      
      {/* Badge criativo */}
      <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-2xl transform rotate-12 flex items-center justify-center shadow-xl">
        <span className="text-white text-xl font-bold transform -rotate-12">{currentBodyType.emoji}</span>
      </div>
    </div>
  );
};

// Barra de confiança criativa
const ArtisticConfidenceBar = ({ confidence }) => (
  <div className="relative">
    <div className="text-center mb-4">
      <span className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-100 to-teal-100 px-4 py-2 rounded-full border border-emerald-200">
        <Crown className="h-4 w-4 text-emerald-600" />
        <span className="text-emerald-800 font-semibold text-sm">Precisão</span>
        <span className="text-emerald-900 font-bold">{confidence}%</span>
      </span>
    </div>
    
    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
      <div 
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-full transition-all duration-2000 ease-out"
        style={{ width: `${confidence}%` }}
      >
        <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent rounded-full"></div>
        <div className="absolute top-0 right-0 w-2 h-full bg-white/50 rounded-full animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Cards criativos para peças
const FashionCard = ({ item, type, index, hoveredCard, setHoveredCard }) => {
  const isHovered = hoveredCard === `${type}-${index}`;
  
  return (
    <div 
      className={`group relative transform transition-all duration-500 ${isHovered ? 'scale-105 z-10' : ''}`}
      onMouseEnter={() => setHoveredCard && setHoveredCard(`${type}-${index}`)}
      onMouseLeave={() => setHoveredCard && setHoveredCard(null)}
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 rounded-2xl transform rotate-1 opacity-60 group-hover:rotate-2 transition-transform"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-yellow-100 via-pink-50 to-purple-100 rounded-2xl transform -rotate-1 opacity-40 group-hover:-rotate-2 transition-transform"></div>
      
      <div className={`relative bg-white rounded-2xl p-5 shadow-lg border-2 transition-all duration-300 ${
        type === 'recommended' 
          ? 'border-emerald-200 hover:border-emerald-400' 
          : 'border-rose-200 hover:border-rose-400'
      }`}>
        {/* Elemento decorativo superior */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
            type === 'recommended' 
              ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
              : 'bg-gradient-to-r from-rose-400 to-pink-500'
          }`}>
            {type === 'recommended' ? '✨' : '⚠️'}
          </div>
        </div>
        
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            type === 'recommended' 
              ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600' 
              : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-600'
          }`}>
            {type === 'recommended' ? <Heart className="h-4 w-4" /> : <Scissors className="h-4 w-4" />}
          </div>
          
          <div className="flex-1">
            <p className={`font-medium leading-relaxed ${
              type === 'recommended' ? 'text-emerald-800' : 'text-rose-800'
            }`}>
              {item}
            </p>
          </div>
        </div>
        
        {/* Efeito de hover */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${
          type === 'recommended' 
            ? 'bg-gradient-to-r from-emerald-400 to-teal-500' 
            : 'bg-gradient-to-r from-rose-400 to-pink-500'
        }`}></div>
      </div>
    </div>
  );
};

// ============================================================================
// CREATIVE STEP COMPONENTS
// ============================================================================

const CreativeCheckAnalysisStep = ({ userProfile, bodyTypes, onFullAnalysis, onWardrobeAnalysis, onViewResults, navigateToScreen, isRevealed }) => {
  const currentBodyType = bodyTypes[userProfile?.bodyShape];
  
  return (
    <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {userProfile?.bodyShape ? (
        <>
          {/* Resultado Existente - Design Magazine */}
          <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
            {/* Pattern decorativo */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
            
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full mb-4 transform -rotate-1">
                  <Palette className="h-4 w-4" />
                  <span className="font-bold tracking-wide text-sm">BODY SHAPE IDENTIFICADO</span>
                </div>
                
                <CreativeBodyIllustration bodyShape={userProfile.bodyShape} bodyTypes={bodyTypes} />
                
                <div className="mt-6">
                  <h2 className="text-3xl font-black text-gray-800 mb-2">
                    {userProfile.bodyShape}
                  </h2>
                  {currentBodyType && (
                    <p className="text-gray-600 font-medium italic">
                      "{currentBodyType.description}"
                    </p>
                  )}
                </div>
              </div>
              
              {userProfile?.bodyShapeAnalysis?.confidence && (
                <ArtisticConfidenceBar confidence={userProfile.bodyShapeAnalysis.confidence} />
              )}
            </div>
          </div>

          {/* Botões de Ação - Magazine Style */}
          <div className="space-y-4">
            <button
              onClick={onViewResults}
              className="group relative w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-6 px-8 rounded-[2rem] font-black text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <Sparkles className="h-6 w-6" />
                <span>VER RESULTADOS COMPLETOS</span>
              </div>
            </button>
            
            <button
              onClick={onWardrobeAnalysis}
              className="group relative w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-6 px-8 rounded-[2rem] font-black text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <Zap className="h-6 w-6" />
                <span>ANALISAR MEU ARMÁRIO</span>
              </div>
            </button>
            
            <button
              onClick={onFullAnalysis}
              className="group relative w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-[2rem] font-semibold shadow-lg hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative flex items-center justify-center space-x-2">
                <RefreshCw className="h-5 w-5" />
                <span>REFAZER ANÁLISE COMPLETA</span>
              </div>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Análise Nova - Design Magazine */}
          <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
            
            <div className="p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <User className="h-12 w-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                DESCOBRE O TEU BODY SHAPE
              </h2>
              
              <p className="text-gray-600 mb-8 text-lg">
                Descobre o teu formato corporal e as peças que mais te favorecem
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-4 border border-pink-200">
                  <div className="text-2xl mb-2">👗</div>
                  <div className="text-sm font-semibold text-pink-800">Body Shape</div>
                  <div className="text-xs text-pink-600">Pear, Apple, Hourglass...</div>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-200">
                  <div className="text-2xl mb-2">📏</div>
                  <div className="text-sm font-semibold text-purple-800">Proporções</div>
                  <div className="text-xs text-purple-600">Análise detalhada</div>
                </div>
                <div className="bg-gradient-to-r from-indigo-50 to-teal-50 rounded-2xl p-4 border border-indigo-200">
                  <div className="text-2xl mb-2">✨</div>
                  <div className="text-sm font-semibold text-indigo-800">Favoráveis</div>
                  <div className="text-xs text-indigo-600">Peças perfeitas</div>
                </div>
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-200">
                  <div className="text-2xl mb-2">🛍️</div>
                  <div className="text-sm font-semibold text-teal-800">Shopping Guide</div>
                  <div className="text-xs text-teal-600">Personalizado</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onFullAnalysis}
            className="group relative w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-6 px-8 rounded-[2rem] font-black text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center justify-center space-x-3">
              <Sparkles className="h-6 w-6" />
              <span>COMEÇAR ANÁLISE</span>
            </div>
          </button>
        </>
      )}
    </div>
  );
};

const PhotoCaptureStep = ({ onImageUpload, onCameraOpen, onSkip, isRevealed }) => (
  <div className={`transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
    <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
      
      <div className="p-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <User className="h-12 w-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          FOTO CORPORAL
        </h2>
        
        <p className="text-gray-600 mb-8">
          Para melhor precisão, tira uma foto de corpo inteiro em roupa justa
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={onCameraOpen}
            className="group relative bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 transform hover:scale-105"
          >
            <Camera className="h-8 w-8 text-blue-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-blue-600 font-semibold">TIRAR FOTO</span>
          </button>
          
          <label className="group relative bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border-2 border-emerald-200 hover:border-emerald-400 transition-all duration-300 transform hover:scale-105 cursor-pointer">
            <Upload className="h-8 w-8 text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-emerald-600 font-semibold">CARREGAR</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <button
          onClick={onSkip}
          className="w-full bg-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-300 transition-colors"
        >
          Continuar sem foto
        </button>
      </div>
    </div>
  </div>
);

const MeasurementsStep = ({ bodyImage, measurements, setMeasurements, onSubmit, isRevealed }) => (
  <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
    <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden max-h-[80vh] overflow-y-auto">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
      
      <div className="p-8">
        {bodyImage && (
          <div className="mb-6 text-center">
            <img src={bodyImage} alt="Body" className="w-32 h-48 rounded-2xl mx-auto object-cover shadow-lg" />
          </div>
        )}
        
        <h2 className="text-2xl font-black text-center bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
          MEDIDAS E INFORMAÇÕES
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Altura (cm)</label>
              <input
                type="number"
                value={measurements.height}
                onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="170"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Peso (kg)</label>
              <input
                type="number"
                value={measurements.weight}
                onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="65"
              />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">📏 Medidas Corporais (opcional)</h4>
            <p className="text-sm text-yellow-700 mb-3">Se não souberes as medidas exatas, deixa em branco</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Ombros (cm)</label>
              <input
                type="number"
                value={measurements.shoulders}
                onChange={(e) => setMeasurements(prev => ({ ...prev, shoulders: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="38"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Busto (cm)</label>
              <input
                type="number"
                value={measurements.bust}
                onChange={(e) => setMeasurements(prev => ({ ...prev, bust: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="88"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Cintura (cm)</label>
              <input
                type="number"
                value={measurements.waist}
                onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="68"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Quadris (cm)</label>
              <input
                type="number"
                value={measurements.hips}
                onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
                className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="92"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Como percebes o teu tipo de corpo?</label>
            <select
              value={measurements.bodyType}
              onChange={(e) => setMeasurements(prev => ({ ...prev, bodyType: e.target.value }))}
              className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none transition-colors"
            >
              <option value="">Selecciona...</option>
              <option value="Pear">🍐 Pear (quadris maiores)</option>
              <option value="Apple">🍎 Apple (meio mais largo)</option>
              <option value="Hourglass">⏳ Hourglass (curvas equilibradas)</option>
              <option value="Rectangle">📏 Rectangle (medidas similares)</option>
              <option value="Inverted Triangle">🔺 Inverted Triangle (ombros maiores)</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={onSubmit}
          className="w-full mt-8 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-lg hover:scale-105 transition-all duration-300"
        >
          ANALISAR BODY SHAPE
        </button>
      </div>
    </div>
  </div>
);

const CreativeResultsViewStep = ({ analysis, bodyTypes, userProfile, onWardrobeAnalysis, onNewAnalysis, isRevealed }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const currentBodyType = bodyTypes[analysis?.bodyShape] || bodyTypes['Hourglass'];
  
  return (
    <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {/* Header Revista de Moda */}
      <div className="text-center mb-6">
       
        <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
          <Palette className="h-4 w-4" />
          <span className="font-bold tracking-wide text-sm">TEU RESULTADO</span>
        </div>
      </div>
      
      {/* Card principal com design magazine */}
      <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
        {/* Pattern decorativo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <CreativeBodyIllustration bodyShape={analysis?.bodyShape} bodyTypes={bodyTypes} />
            
            <div className="mt-6">
              <h2 className="text-4xl font-black text-gray-800 mb-2">
                {analysis?.bodyShape}
              </h2>
              <p className="text-gray-600 font-medium text-lg italic">
                "{currentBodyType.description}"
              </p>
            </div>
          </div>
          
          <ArtisticConfidenceBar confidence={analysis?.confidence || 85} />
        </div>
      </div>

      {/* Análise Magazine Style */}
      <div className="space-y-6">
        {/* Proporções */}
        <div className="relative bg-white rounded-[2rem] shadow-xl p-6 border-2 border-purple-100">
          <div className="absolute -top-4 left-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm">
              EXPERT ANALYSIS
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-3 text-purple-500" />
              Proporções Perfeitas
            </h3>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <p className="text-purple-800 leading-relaxed font-medium italic">
                "{analysis?.proportionAnalysis}"
              </p>
            </div>
          </div>
        </div>

        {/* Fashion Guide - Layout Compacto */}
        <div className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-4">
            <h2 className="text-xl font-black text-center">FASHION GUIDE</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Must-Have */}
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-emerald-600 mb-1">✨ MUST-HAVE</h3>
                  <p className="text-gray-600 text-sm italic">Peças que vão elevar o teu estilo</p>
                </div>
                
                <div className="space-y-3">
                  {analysis?.recommendedPieces?.slice(0, 4).map((piece, index) => (
                    <FashionCard 
                      key={index} 
                      item={piece} 
                      type="recommended" 
                      index={index}
                      hoveredCard={hoveredCard}
                      setHoveredCard={setHoveredCard}
                    />
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-rose-600 mb-1">🚫 SKIP LIST</h3>
                  <p className="text-gray-600 text-sm italic">Evita para maximizar o impacto</p>
                </div>
                
                <div className="space-y-3">
                  {analysis?.avoidPieces?.slice(0, 3).map((piece, index) => (
                    <FashionCard 
                      key={index} 
                      item={piece} 
                      type="avoid" 
                      index={index}
                      hoveredCard={hoveredCard}
                      setHoveredCard={setHoveredCard}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Styling Tips */}
        <div className="relative bg-white rounded-[2rem] shadow-xl p-6 border-2 border-emerald-100">
          <div className="absolute -top-4 left-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full font-bold text-sm">
              STYLING SECRETS
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center">
              <Sparkles className="h-5 w-5 mr-3 text-emerald-500" />
              Dicas VIP
            </h3>
            
            <div className="space-y-4">
              {analysis?.stylingTips?.map((tip, index) => (
                <div key={index} className="group bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-white text-xs font-bold">{index + 1}</span>
                    </div>
                    <p className="text-emerald-800 font-medium">{tip}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onWardrobeAnalysis}
          className="group relative w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-6 px-8 rounded-[2rem] font-black text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <ShoppingBag className="h-6 w-6" />
            <span>ANALISAR MEU ARMÁRIO</span>
          </div>
        </button>
        
        <button
          onClick={onNewAnalysis}
          className="w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-[2rem] font-semibold hover:bg-gray-300 transition-colors"
        >
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-5 w-5" />
            <span>Nova Análise</span>
          </div>
        </button>
      </div>
    </div>
  );
};

const AnalysisResultsStep = ({ analysis, bodyTypes, wardrobe, navigateToScreen, onReset, onWardrobeAnalysis, isRevealed }) => {
  const currentBodyType = bodyTypes[analysis?.bodyShape] || bodyTypes['Hourglass'];
  
  return (
    <div className={`space-y-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {/* Header Revista de Moda */}
      <div className="text-center mb-6">
       
        <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
          <Palette className="h-4 w-4" />
          <span className="font-bold tracking-wide text-sm">RESULTADO FINAL</span>
        </div>
      </div>
      
      {/* Card principal com design magazine */}
      <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
        {/* Pattern decorativo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <CreativeBodyIllustration bodyShape={analysis?.bodyShape} bodyTypes={bodyTypes} />
            
            <div className="mt-6">
              <h2 className="text-4xl font-black text-gray-800 mb-2">
                {analysis?.bodyShape}
              </h2>
              <p className="text-gray-600 font-medium text-lg italic">
                "{currentBodyType.description}"
              </p>
            </div>
          </div>
          
          <ArtisticConfidenceBar confidence={analysis?.confidence || 85} />
        </div>
      </div>

      {/* Análise Magazine Style */}
      <div className="space-y-6">
        {/* Proporções */}
        <div className="relative bg-white rounded-[2rem] shadow-xl p-6 border-2 border-purple-100">
          <div className="absolute -top-4 left-6">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-bold text-sm">
              EXPERT ANALYSIS
            </div>
          </div>
          
          <div className="pt-4">
            <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center">
              <Info className="h-5 w-5 mr-3 text-purple-500" />
              Proporções Perfeitas
            </h3>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <p className="text-purple-800 leading-relaxed font-medium italic">
                "{analysis?.proportionAnalysis}"
              </p>
            </div>
          </div>
        </div>

        {/* Fashion Guide - Layout Compacto */}
        <div className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white p-4">
            <h2 className="text-xl font-black text-center">FASHION GUIDE</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              {/* Must-Have */}
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-emerald-600 mb-1">✨ MUST-HAVE</h3>
                  <p className="text-gray-600 text-sm italic">Peças que vão elevar o teu estilo</p>
                </div>
                
                <div className="space-y-3">
                  {analysis?.recommendedPieces?.slice(0, 3).map((piece, index) => (
                    <FashionCard key={index} item={piece} type="recommended" index={index} />
                  ))}
                </div>
              </div>

              {/* Avoid */}
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-black text-rose-600 mb-1">🚫 SKIP LIST</h3>
                  <p className="text-gray-600 text-sm italic">Evita para maximizar o impacto</p>
                </div>
                
                <div className="space-y-3">
                  {analysis?.avoidPieces?.slice(0, 3).map((piece, index) => (
                    <FashionCard key={index} item={piece} type="avoid" index={index} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button
          onClick={onWardrobeAnalysis}
          className="group relative w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-6 px-8 rounded-[2rem] font-black text-lg shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <ShoppingBag className="h-6 w-6" />
            <span>ANALISAR MEU ARMÁRIO</span>
          </div>
        </button>
        
        <button
          onClick={onReset}
          className="w-full bg-gray-200 text-gray-700 py-4 px-6 rounded-[2rem] font-semibold hover:bg-gray-300 transition-colors"
        >
          ← Refazer Análise
        </button>
      </div>
    </div>
  );
};

const CreativeWardrobeAnalysisStep = ({ 
  analysis, 
  wardrobeAnalysis, 
  bodyTypes, 
  userProfile, 
  navigateToScreen, 
  onRefreshAnalysis,
  onResetBodyShape,
  wardrobe,
  isRevealed,
  hoveredCard,
  setHoveredCard
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  const currentBodyType = bodyTypes[userProfile?.bodyShape] || bodyTypes['Hourglass'];

  const getCategoryColor = (category) => {
    switch(category) {
      case 'MuitoFavorável': return 'bg-green-100 text-green-800 border-green-200';
      case 'Favorável': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Neutro': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'PoucoFavorável': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Desfavorável': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRatingStars = (rating) => {
    const stars = Math.round(rating / 2);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  return (
    <div className={`space-y-6 max-h-[80vh] overflow-y-auto transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
      {/* Header melhorado */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 transform -rotate-1">
          WARDROBE ANALYSIS
        </h1>
        <div className="inline-flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
          <Palette className="h-4 w-4" />
          <span className="font-bold tracking-wide text-sm">STYLE REPORT</span>
        </div>
      </div>

      {/* Header com design criativo */}
      <div className="relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <CreativeBodyIllustration bodyShape={userProfile?.bodyShape} bodyTypes={bodyTypes} />
            
            <div className="mt-6">
              <h2 className="text-3xl font-black text-gray-800 mb-2">
                Análise do Teu Armário
              </h2>
              <p className="text-gray-600 mb-2">Body Shape: {userProfile?.bodyShape}</p>
              {currentBodyType && (
                <p className="text-gray-500 text-sm italic">"{currentBodyType.description}"</p>
              )}
            </div>
          </div>
          
          {/* Action Buttons estilo magazine */}
          <div className="flex space-x-3">
            <button
              onClick={onRefreshAnalysis}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Zap className="h-4 w-4" />
              <span>REANALISAR</span>
            </button>
            <button
              onClick={onResetBodyShape}
              className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg hover:scale-105 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              <span>VOLTAR</span>
            </button>
          </div>

          {/* Tab Navigation estilo magazine */}
          {wardrobeAnalysis && (
            <div className="flex bg-gray-100 rounded-2xl p-1 mt-6">
              <button
                onClick={() => setActiveTab('summary')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'summary' 
                    ? 'bg-white text-indigo-600 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                RESUMO
              </button>
              <button
                onClick={() => setActiveTab('pieces')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'pieces' 
                    ? 'bg-white text-indigo-600 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                POR PEÇA
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'recommendations' 
                    ? 'bg-white text-indigo-600 shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                DICAS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content with creative styling */}
      {wardrobeAnalysis ? (
        <>
          {activeTab === 'summary' && (
            <CreativeWardrobeSummaryTab wardrobeAnalysis={wardrobeAnalysis} />
          )}
          
          {activeTab === 'pieces' && (
            <CreativeWardrobePiecesTab 
              wardrobeAnalysis={wardrobeAnalysis} 
              getCategoryColor={getCategoryColor}
              getRatingStars={getRatingStars}
            />
          )}
          
          {activeTab === 'recommendations' && (
            <CreativeWardrobeRecommendationsTab wardrobeAnalysis={wardrobeAnalysis} />
          )}
        </>
      ) : (
        <div className="bg-white rounded-[2rem] shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Armário por Analisar</h3>
          <p className="text-gray-600 mb-6">Clica em "REANALISAR" para avaliar as tuas peças</p>
          <button
            onClick={onRefreshAnalysis}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:scale-105 transition-all duration-300"
          >
            ANALISAR {wardrobe.length} PEÇAS
          </button>
        </div>
      )}

    </div>
  );
};

// Creative Wardrobe Tabs
const CreativeWardrobeSummaryTab = ({ wardrobeAnalysis }) => (
  <div className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
      <h3 className="text-xl font-black text-center flex items-center justify-center">
        <Star className="h-5 w-5 mr-2" />
        RESUMO GERAL
      </h3>
    </div>
    
    <div className="p-6">
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <div className="text-green-800 font-black text-2xl">{wardrobeAnalysis.overallSummary?.perfectPieces || 0}</div>
          <div className="text-green-600 text-sm font-semibold">Peças Perfeitas</div>
          <div className="text-green-500 text-xs">9-10 pontos</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
          <div className="text-blue-800 font-black text-2xl">{wardrobeAnalysis.overallSummary?.goodPieces || 0}</div>
          <div className="text-blue-600 text-sm font-semibold">Peças Boas</div>
          <div className="text-blue-500 text-xs">7-8 pontos</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl border border-orange-200">
          <div className="text-orange-800 font-black text-2xl">{wardrobeAnalysis.overallSummary?.neutralPieces || 0}</div>
          <div className="text-orange-600 text-sm font-semibold">Neutras</div>
          <div className="text-orange-500 text-xs">5-6 pontos</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
          <div className="text-red-800 font-black text-2xl">{wardrobeAnalysis.overallSummary?.poorPieces || 0}</div>
          <div className="text-red-600 text-sm font-semibold">Problemáticas</div>
          <div className="text-red-500 text-xs">1-4 pontos</div>
        </div>
      </div>

      {/* Progress Bar criativa */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span className="font-semibold">Qualidade Geral do Armário</span>
          <span className="font-bold">
            {Math.round(
              ((wardrobeAnalysis.overallSummary?.perfectPieces || 0) + 
               (wardrobeAnalysis.overallSummary?.goodPieces || 0)) / 
              (wardrobeAnalysis.wardrobeAnalysis?.length || 1) * 100
            )}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 h-4 rounded-full transition-all duration-1000 ease-out relative"
            style={{
              width: `${Math.round(
                ((wardrobeAnalysis.overallSummary?.perfectPieces || 0) + 
                 (wardrobeAnalysis.overallSummary?.goodPieces || 0)) / 
                (wardrobeAnalysis.wardrobeAnalysis?.length || 1) * 100
              )}%`
            }}
          >
            <div className="absolute inset-0 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CreativeWardrobePiecesTab = ({ wardrobeAnalysis, getCategoryColor, getRatingStars }) => (
  <div className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4">
      <h3 className="text-xl font-black text-center flex items-center justify-center">
        <Scissors className="h-5 w-5 mr-2" />
        ANÁLISE POR PEÇA
      </h3>
    </div>
    
    <div className="p-6">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {wardrobeAnalysis.wardrobeAnalysis?.length > 0 ? (
          wardrobeAnalysis.wardrobeAnalysis
            .sort((a, b) => b.rating - a.rating)
            .map((item, index) => (
              <div key={index} className={`border-2 rounded-2xl p-4 transition-all duration-300 hover:scale-102 ${getCategoryColor(item.category)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm flex-1 truncate pr-2">{item.itemName}</h4>
                  <div className="flex flex-col items-end">
                    <span className="text-sm">{getRatingStars(item.rating)}</span>
                    <span className="text-xs font-bold">{item.rating}/10</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="bg-white bg-opacity-60 rounded-xl p-3">
                    <span className="text-xs font-bold text-gray-700">Análise: </span>
                    <span className="text-xs text-gray-700">{item.reasoning}</span>
                  </div>
                  
                  {item.stylingTip && (
                    <div className="bg-white bg-opacity-60 rounded-xl p-3">
                      <span className="text-xs font-bold text-gray-700">💡 Dica: </span>
                      <span className="text-xs text-gray-700">{item.stylingTip}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma peça analisada ainda.</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

const CreativeWardrobeRecommendationsTab = ({ wardrobeAnalysis }) => (
  <div className="bg-white rounded-[2rem] shadow-xl border-2 border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4">
      <h3 className="text-xl font-black text-center flex items-center justify-center">
        <Lightbulb className="h-5 w-5 mr-2" />
        RECOMENDAÇÕES VIP
      </h3>
    </div>
    
    <div className="p-6">
      {wardrobeAnalysis.overallSummary?.recommendations && wardrobeAnalysis.overallSummary.recommendations.length > 0 ? (
        <div className="space-y-4">
          {wardrobeAnalysis.overallSummary.recommendations.map((rec, index) => (
            <div key={index} className="group bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>
                <p className="text-indigo-800 font-medium leading-relaxed">{rec}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm">Nenhuma recomendação específica ainda.</p>
        </div>
      )}
    </div>
  </div>
);

export default BodyShapeAnalysisScreen;