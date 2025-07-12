import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Camera, Upload, User, Ruler, Target, RefreshCw, Zap, Star,
  CheckCircle, XCircle, ShoppingBag, Lightbulb 
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
  const [mode, setMode] = useState('check');
  const [measurements, setMeasurements] = useState({
    height: '',
    weight: '',
    shoulders: '',
    bust: '',
    waist: '',
    hips: '',
    bodyType: ''
  });

  const bodyTypes = {
    'Pear': {
      description: 'Quadris mais largos que ombros',
      characteristics: ['Parte inferior mais volumosa', 'Cintura definida', 'Ombros mais estreitos'],
      bestStyles: ['Tops estruturados', 'Decotes em V', 'Cores claras em cima', 'A-line skirts'],
      avoidStyles: ['Calças muito justas', 'Tops muito largos', 'Horizontal stripes em baixo']
    },
    'Apple': {
      description: 'Parte superior mais volumosa',
      characteristics: ['Torso mais largo', 'Pernas mais finas', 'Cintura menos definida'],
      bestStyles: ['Empire waist', 'V-necks', 'Verticais stripes', 'Blazers abertos'],
      avoidStyles: ['Cintos apertados', 'Tops justos', 'Horizontal patterns no torso']
    },
    'Hourglass': {
      description: 'Ombros e quadris proporcionais com cintura definida',
      characteristics: ['Curvas equilibradas', 'Cintura bem marcada', 'Proporções harmoniosas'],
      bestStyles: ['Peças que marcam a cintura', 'Wrap dresses', 'Fit & flare', 'High-waisted'],
      avoidStyles: ['Peças muito largas', 'Shapes que escondem cintura', 'Baggy clothes']
    },
    'Rectangle': {
      description: 'Medidas similares nos ombros, cintura e quadris',
      characteristics: ['Silhueta reta', 'Cintura pouco definida', 'Proporções uniformes'],
      bestStyles: ['Peças que criam curvas', 'Cintos', 'Layering', 'Peplum tops'],
      avoidStyles: ['Peças muito retas', 'Baggy clothes', 'Shapeless dresses']
    },
    'Inverted Triangle': {
      description: 'Ombros mais largos que quadris',
      characteristics: ['Parte superior dominante', 'Quadris estreitos', 'Ombros largos'],
      bestStyles: ['Bottoms volumosos', 'Wide-leg pants', 'A-line skirts', 'Scoop necks'],
      avoidStyles: ['Shoulder pads', 'Horizontal stripes em cima', 'Skinny bottoms']
    },
    'InvertedTriangle': {
      description: 'Ombros mais largos que quadris',
      characteristics: ['Parte superior dominante', 'Quadris estreitos', 'Ombros largos'],
      bestStyles: ['Bottoms volumosos', 'Wide-leg pants', 'A-line skirts', 'Scoop necks'],
      avoidStyles: ['Shoulder pads', 'Horizontal stripes em cima', 'Skinny bottoms']
    }
  };

  useEffect(() => {
    if (userProfile?.bodyShape && userProfile?.bodyShapeAnalysis) {
      setAnalysis(userProfile.bodyShapeAnalysis);
      // Se já tem análise do armário, vai direto para wardrobe-only
      // Senão, vai para check para escolher
      setMode('check');
    } else {
      setMode('full-analysis');
    }
  }, [userProfile]);

  const createFallbackAnalysis = (measurements, wardrobe) => {
    console.log('🆘 Criando análise fallback...');
    
    let bodyShape = "Rectangle";
    
    if (measurements.bust && measurements.waist && measurements.hips) {
      const bust = parseFloat(measurements.bust);
      const waist = parseFloat(measurements.waist);
      const hips = parseFloat(measurements.hips);
      
      const bustWaistDiff = bust - waist;
      const hipWaistDiff = hips - waist;
      const bustHipDiff = Math.abs(bust - hips);
      
      if (hips > bust && hipWaistDiff > 2) {
        bodyShape = "Pear";
      } else if (bust > hips && bustWaistDiff > 2) {
        bodyShape = "Apple";
      } else if (bustHipDiff <= 2 && bustWaistDiff > 2) {
        bodyShape = "Hourglass";
      } else if (measurements.shoulders && parseFloat(measurements.shoulders) > hips) {
        bodyShape = "Inverted Triangle";
      }
    }
    
    return {
      bodyShape: bodyShape,
      confidence: 70,
      proportionAnalysis: `Análise baseada nas medidas fornecidas. Body shape determinado como ${bodyShape}.`,
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
${wardrobe.map((item, index) => `${index + 1}. ${item.name} 
   - Categoria: ${item.category}
   - Cor: ${item.color}
   - Marca: ${item.brand || 'N/A'}
   - Condição: ${item.condition || 'N/A'}
   - Tags: ${item.tags?.join(', ') || 'N/A'}
   - Notas: ${item.notes || 'N/A'}`).join('\n')}

⚠️ IMPORTANTE: 
- Analisa APENAS as peças listadas acima
- NÃO inventes peças que não existem no armário
- Usa os nomes EXATOS das peças como aparecem na lista
- Se o armário estiver vazio, diz que não há peças para analisar

⚠️ RESPONDE APENAS EM FORMATO JSON VÁLIDO. NÃO INCLUAS TEXTO ANTES OU DEPOIS DO JSON.

{
  "wardrobeAnalysis": [
    {
      "itemName": "nome EXATO da peça como na lista",
      "rating": 8,
      "category": "MuitoFavorável|Favorável|Neutro|PoucoFavorável|Desfavorável",
      "reasoning": "explicação específica para esta peça e body shape ${userProfile.bodyShape}",
      "stylingTip": "dica específica para usar esta peça de forma favorável"
    }
  ],
  "overallSummary": {
    "perfectPieces": 3,
    "goodPieces": 5,
    "neutralPieces": 2,
    "poorPieces": 1,
    "recommendations": [
      "recomendação específica baseada nas peças existentes",
      "sugestão de compra baseada nos gaps identificados",
      "dica de styling para otimizar o armário atual"
    ]
  }
}`;

      console.log('🔄 Analisando armário real para body shape:', userProfile.bodyShape);
      console.log('📦 Peças a analisar:', wardrobe.length);

      const response = await callOpenAI([
        {
          role: 'system',
          content: `És um especialista em análise de armário e body shape. O body shape desta pessoa já foi determinado como ${userProfile.bodyShape}. 

REGRAS CRÍTICAS:
- Analisa APENAS as peças fornecidas na lista
- NUNCA inventes ou menciones peças que não existem
- Usa nomes EXATOS das peças
- Se armário vazio, diz que não há peças

RESPONDE SEMPRE EM JSON VÁLIDO SEM TEXTO ADICIONAL.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      console.log('✅ Resposta da análise do armário real:', response);

      let wardrobeData;
      
      try {
        const cleanResponse = response.trim();
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          wardrobeData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON da análise do armário parseado:', wardrobeData);
          
          // Validar que só tem peças que realmente existem
          if (wardrobeData.wardrobeAnalysis) {
            const realItemNames = wardrobe.map(item => item.name.toLowerCase());
            wardrobeData.wardrobeAnalysis = wardrobeData.wardrobeAnalysis.filter(analyzed => 
              realItemNames.some(realName => 
                realName.includes(analyzed.itemName.toLowerCase()) || 
                analyzed.itemName.toLowerCase().includes(realName)
              )
            );
            console.log('✅ Filtradas apenas peças reais:', wardrobeData.wardrobeAnalysis.length);
          }
          
        } else {
          throw new Error('Nenhum JSON encontrado na resposta do armário');
        }
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse da análise do armário:', parseError);
        console.error('📄 Resposta completa:', response);
        
        // Fallback usando peças reais
        wardrobeData = {
          wardrobeAnalysis: wardrobe.map(item => ({
            itemName: item.name,
            rating: 7,
            category: "Neutro",
            reasoning: `Esta peça pode funcionar bem com o body shape ${userProfile.bodyShape}, mas análise detalhada indisponível.`,
            stylingTip: "Use com confiança e experimente diferentes combinações."
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
      }

      setWardrobeAnalysis(wardrobeData);
      console.log('✅ Análise do armário real completa');

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
        ]);
      }

      console.log('✅ Resposta recebida da OpenAI:', response);

      let analysisData;
      
      try {
        const cleanResponse = response.trim();
        console.log('🧹 Resposta limpa:', cleanResponse);
        
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          console.log('🔍 JSON encontrado:', jsonMatch[0]);
          analysisData = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON parseado com sucesso:', analysisData);
        } else {
          console.error('❌ Nenhum JSON encontrado na resposta');
          throw new Error('Nenhum JSON válido encontrado na resposta');
        }
      } catch (parseError) {
        console.error('❌ Erro ao fazer parse do JSON:', parseError);
        console.error('📄 Resposta completa que causou erro:', response);
        
        analysisData = createFallbackAnalysis(measurements, wardrobe);
        console.log('🆘 Usando análise fallback:', analysisData);
      }

      analysisData = validateAndNormalizeAnalysis(analysisData);

      setAnalysis(analysisData);
      
      await updateUserProfile({
        bodyShape: analysisData.bodyShape,
        bodyShapeAnalysis: analysisData,
        measurements: measurements,
        analyzedAt: new Date().toISOString()
      });

      setMode('wardrobe-only');
      console.log('✅ Análise completa e guardada');

    } catch (error) {
      console.error('💥 Erro completo na análise:', error);
      alert(`Erro na análise: ${error.message}\n\nTenta novamente ou contacta o suporte se o problema persistir.`);
    }
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setWardrobeAnalysis(null);
    setMode('full-analysis');
    setStep(1);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <User className="h-16 w-16 text-indigo-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {mode === 'wardrobe-only' ? 'Analisando armário...' : 'Analisando formato corporal...'}
          </h2>
          <p className="text-gray-600 mb-4">
            {mode === 'wardrobe-only' ? 'A IA está a avaliar as tuas peças' : 'A IA está a determinar o teu body shape'}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            {mode === 'wardrobe-only' ? (
              <>
                <div>👕 Analisando tops...</div>
                <div>👖 Avaliando bottoms...</div>
                <div>⭐ Calculando scores...</div>
                <div>💡 Gerando dicas...</div>
              </>
            ) : (
              <>
                <div>📏 Analisando proporções...</div>
                <div>👗 Avaliando medidas...</div>
                <div>✨ Determinando body shape...</div>
                <div>🎯 Criando recomendações...</div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Body Shape Analysis</h1>
        </div>

        {mode === 'check' && (
          <CheckAnalysisStep 
            userProfile={userProfile}
            onFullAnalysis={() => setMode('full-analysis')}
            onWardrobeAnalysis={() => {
              setMode('wardrobe-only');
              analyzeWardrobeOnly();
            }}
            navigateToScreen={navigateToScreen}
          />
        )}

        {mode === 'full-analysis' && (
          <>
            {step === 1 && (
              <PhotoCaptureStep
                onImageUpload={handleImageUpload}
                onCameraOpen={() => setShowCamera(true)}
                onSkip={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <MeasurementsStep
                bodyImage={bodyImage}
                measurements={measurements}
                setMeasurements={setMeasurements}
                onSubmit={handleMeasurementsSubmit}
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
              />
            )}
          </>
        )}

        {mode === 'wardrobe-only' && (
          <WardrobeAnalysisStep
            analysis={analysis || userProfile?.bodyShapeAnalysis}
            wardrobeAnalysis={wardrobeAnalysis}
            bodyTypes={bodyTypes}
            userProfile={userProfile}
            navigateToScreen={navigateToScreen}
            onRefreshAnalysis={analyzeWardrobeOnly}
            onResetBodyShape={resetAnalysis}
            wardrobe={wardrobe}
          />
        )}
      </div>
    </div>
  );
};

// CheckAnalysisStep Component - VERSÃO RICA
const CheckAnalysisStep = ({ userProfile, onFullAnalysis, onWardrobeAnalysis, navigateToScreen }) => {
  const bodyTypes = {
    'Pear': {
      description: 'Quadris mais largos que ombros',
      characteristics: ['Parte inferior mais volumosa', 'Cintura definida', 'Ombros mais estreitos'],
      bestStyles: ['Tops estruturados', 'Decotes em V', 'Cores claras em cima', 'A-line skirts'],
      quickTips: ['Realça a parte superior', 'Equilibra as proporções', 'Marca a cintura']
    },
    'Apple': {
      description: 'Parte superior mais volumosa',
      characteristics: ['Torso mais largo', 'Pernas mais finas', 'Cintura menos definida'],
      bestStyles: ['Empire waist', 'V-necks', 'Verticais stripes', 'Blazers abertos'],
      quickTips: ['Alonga o torso', 'Evita cintos apertados', 'Realça as pernas']
    },
    'Hourglass': {
      description: 'Ombros e quadris proporcionais com cintura definida',
      characteristics: ['Curvas equilibradas', 'Cintura bem marcada', 'Proporções harmoniosas'],
      bestStyles: ['Peças que marcam a cintura', 'Wrap dresses', 'Fit & flare', 'High-waisted'],
      quickTips: ['Marca sempre a cintura', 'Evita shapes largos', 'Abraça as curvas']
    },
    'Rectangle': {
      description: 'Medidas similares nos ombros, cintura e quadris',
      characteristics: ['Silhueta reta', 'Cintura pouco definida', 'Proporções uniformes'],
      bestStyles: ['Peças que criam curvas', 'Cintos', 'Layering', 'Peplum tops'],
      quickTips: ['Cria ilusão de curvas', 'Usa cintos estrategicamente', 'Layering é teu amigo']
    },
    'Inverted Triangle': {
      description: 'Ombros mais largos que quadris',
      characteristics: ['Parte superior dominante', 'Quadris estreitos', 'Ombros largos'],
      bestStyles: ['Bottoms volumosos', 'Wide-leg pants', 'A-line skirts', 'Scoop necks'],
      quickTips: ['Equilibra com bottoms volumosos', 'Evita ombros estruturados', 'Realça as pernas']
    }
  };

  const bodyTypeData = bodyTypes[userProfile?.bodyShape];

  return (
    <div className="space-y-4">
      {/* Body Shape Info Card */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Body Shape Analysis</h2>
          
          {userProfile?.bodyShape ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-green-800 font-bold text-xl mb-1">✅ {userProfile.bodyShape}</div>
                {bodyTypeData && (
                  <div className="text-green-700 text-sm mb-3">{bodyTypeData.description}</div>
                )}
                <div className="text-green-600 text-xs">
                  Analisado em: {userProfile.analyzedAt ? new Date(userProfile.analyzedAt).toLocaleDateString('pt-PT') : 'N/A'}
                </div>
              </div>

              {/* Características */}
              {bodyTypeData && (
                <div className="p-4 bg-blue-50 rounded-lg text-left">
                  <h4 className="font-semibold text-blue-800 mb-2">✨ Características</h4>
                  <div className="space-y-1">
                    {bodyTypeData.characteristics.map((char, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-blue-700 text-sm">{char}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dicas Rápidas */}
              {bodyTypeData && (
                <div className="p-4 bg-amber-50 rounded-lg text-left">
                  <h4 className="font-semibold text-amber-800 mb-2">💡 Dicas Rápidas</h4>
                  <div className="space-y-1">
                    {bodyTypeData.quickTips.map((tip, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-amber-600 text-sm font-bold">{index + 1}.</span>
                        <span className="text-amber-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estilos Favoráveis */}
              {bodyTypeData && (
                <div className="p-4 bg-green-50 rounded-lg text-left">
                  <h4 className="font-semibold text-green-800 mb-2">👗 Estilos que Te Favorecem</h4>
                  <div className="flex flex-wrap gap-1">
                    {bodyTypeData.bestStyles.map((style, index) => (
                      <span key={index} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-yellow-800 font-semibold">⚠️ Análise Necessária</div>
              <div className="text-yellow-700">Ainda não foi determinado o teu body shape</div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {userProfile?.bodyShape ? (
            <>
              <button
                onClick={onWardrobeAnalysis}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Zap className="h-5 w-5" />
                <span>Analisar Meu Armário</span>
              </button>
              <button
                onClick={onFullAnalysis}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-5 w-5" />
                <span>Refazer Análise Completa</span>
              </button>
            </>
          ) : (
            <button
              onClick={onFullAnalysis}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
            >
              Começar Análise de Body Shape
            </button>
          )}
        </div>
      </div>

      {/* Back to Home */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <button
          onClick={() => navigateToScreen('home')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
        >
          Voltar ao Menu Principal
        </button>
      </div>
    </div>
  );
};

// PhotoCaptureStep Component
const PhotoCaptureStep = ({ onImageUpload, onCameraOpen, onSkip }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <div className="text-center mb-6">
      <User className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Análise de Formato Corporal</h2>
      <p className="text-gray-600">Descobre o teu body shape e as peças que mais te favorecem</p>
    </div>

    <div className="space-y-4 mb-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">O que vais descobrir:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>👗 O teu body shape (Pear, Apple, Hourglass...)</li>
          <li>📏 Análise detalhada de proporções</li>
          <li>✨ Peças que mais te favorecem</li>
          <li>🛍️ Guia de compras personalizado</li>
          <li>💡 Dicas de styling específicas</li>
        </ul>
      </div>
    </div>

    <div className="text-center mb-4">
      <h3 className="font-semibold text-gray-700 mb-4">Foto corpo inteiro (opcional)</h3>
      <p className="text-sm text-gray-500 mb-4">Para melhor precisão, tira uma foto de corpo inteiro em roupa justa</p>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCameraOpen}
          className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Camera className="h-8 w-8 text-blue-500 mb-2" />
          <span className="text-sm text-blue-600">Tirar Foto</span>
        </button>
        
        <label className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
          <Upload className="h-8 w-8 text-green-500 mb-2" />
          <span className="text-sm text-green-600">Carregar</span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
          />
        </label>
      </div>
    </div>

    <button
      onClick={onSkip}
      className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
    >
      Continuar sem foto
    </button>
  </div>
);

// MeasurementsStep Component
const MeasurementsStep = ({ bodyImage, measurements, setMeasurements, onSubmit }) => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
      {bodyImage && (
        <div className="mb-4">
          <img src={bodyImage} alt="Body" className="w-32 h-48 rounded-lg mx-auto object-cover" />
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Medidas e Informações</h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Altura (cm)</label>
            <input
              type="number"
              value={measurements.height}
              onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="170"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Peso (kg)</label>
            <input
              type="number"
              value={measurements.weight}
              onChange={(e) => setMeasurements(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="65"
            />
          </div>
        </div>

        <div className="p-4 bg-yellow-50 rounded-lg">
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
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="38"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Busto (cm)</label>
            <input
              type="number"
              value={measurements.bust}
              onChange={(e) => setMeasurements(prev => ({ ...prev, bust: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
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
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="68"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Quadris (cm)</label>
            <input
              type="number"
              value={measurements.hips}
              onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
              className="w-full p-3 border border-gray-200 rounded-lg"
              placeholder="92"
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Como percebes o teu corpo?</label>
          <select
            value={measurements.bodyType}
            onChange={(e) => setMeasurements(prev => ({ ...prev, bodyType: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="">Seleciona...</option>
            <option value="Pear">Pera (quadris mais largos)</option>
            <option value="Apple">Maçã (parte superior mais volumosa)</option>
            <option value="Hourglass">Ampulheta (curvas equilibradas)</option>
            <option value="Rectangle">Retângulo (medidas similares)</option>
            <option value="Inverted Triangle">Triângulo invertido (ombros mais largos)</option>
            <option value="Não sei">Não sei</option>
          </select>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!measurements.height || !measurements.weight}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        Analisar Body Shape
      </button>
    </div>
  );
};

// ✅ ANALYSIS RESULTS STEP - VERSÃO RICA
const AnalysisResultsStep = ({ analysis, bodyTypes, wardrobe, navigateToScreen, onReset, onWardrobeAnalysis }) => {
  const bodyTypeData = bodyTypes[analysis?.bodyShape];
  const [activeTab, setActiveTab] = useState('overview');
  
  if (!analysis || !analysis.bodyShape || !bodyTypeData) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erro na Análise</h2>
          <p className="text-gray-600">
            Houve um problema ao processar a análise. Por favor, tenta novamente.
          </p>
          <button
            onClick={onReset}
            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header with Body Shape */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{analysis.bodyShape}</h1>
          <p className="text-lg text-gray-600 mb-2">{bodyTypeData.description}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>Confiança: {analysis.confidence}%</span>
            <span>•</span>
            <span>{wardrobe.length} peças analisadas</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'guidelines' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Guidelines
          </button>
          <button
            onClick={() => setActiveTab('wardrobe')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'wardrobe' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Teu Armário
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab analysis={analysis} bodyTypeData={bodyTypeData} />
        )}
        
        {activeTab === 'guidelines' && (
          <GuidelinesTab analysis={analysis} bodyTypeData={bodyTypeData} />
        )}
        
        {activeTab === 'wardrobe' && (
          <WardrobeTab analysis={analysis} wardrobe={wardrobe} />
        )}

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onWardrobeAnalysis}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 mb-3"
          >
            <Zap className="h-5 w-5" />
            <span>Analisar Meu Armário em Detalhe</span>
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigateToScreen('home')}
              className="bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold"
            >
              Menu Principal
            </button>
            <button
              onClick={onReset}
              className="bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold"
            >
              Refazer Análise
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analysis, bodyTypeData }) => (
  <div className="space-y-4">
    {/* Body Shape Description */}
    <div className="bg-indigo-50 rounded-lg p-4">
      <h3 className="font-semibold text-indigo-800 mb-2">📏 Análise das Tuas Proporções</h3>
      <p className="text-indigo-700 text-sm leading-relaxed">{analysis.proportionAnalysis}</p>
    </div>

    {/* Characteristics */}
    <div className="bg-blue-50 rounded-lg p-4">
      <h3 className="font-semibold text-blue-800 mb-3">✨ Características do {analysis.bodyShape}</h3>
      <div className="grid grid-cols-1 gap-2">
        {bodyTypeData.characteristics.map((char, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-700 text-sm">{char}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Tips */}
    {analysis.stylingTips && analysis.stylingTips.length > 0 && (
      <div className="bg-amber-50 rounded-lg p-4">
        <h3 className="font-semibold text-amber-800 mb-3">💡 Dicas Rápidas de Styling</h3>
        <div className="space-y-2">
          {analysis.stylingTips.slice(0, 3).map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-amber-600 text-sm font-bold">{index + 1}.</span>
              <span className="text-amber-700 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Guidelines Tab Component
const GuidelinesTab = ({ analysis, bodyTypeData }) => (
  <div className="space-y-4">
    {/* What to Wear */}
    <div className="bg-green-50 rounded-lg p-4">
      <h3 className="font-semibold text-green-800 mb-3 flex items-center">
        <CheckCircle className="h-5 w-5 mr-2" />
        O Que Te Favorece
      </h3>
      
      {/* From bodyTypes data */}
      <div className="mb-3">
        <h4 className="text-green-700 font-medium text-sm mb-2">Estilos Ideais:</h4>
        <div className="flex flex-wrap gap-1">
          {bodyTypeData.bestStyles.map((style, index) => (
            <span key={index} className="bg-green-200 text-green-800 text-xs px-2 py-1 rounded-full">
              {style}
            </span>
          ))}
        </div>
      </div>

      {/* From AI analysis */}
      {analysis.recommendedPieces && analysis.recommendedPieces.length > 0 && (
        <div>
          <h4 className="text-green-700 font-medium text-sm mb-2">Peças Recomendadas pela IA:</h4>
          <div className="flex flex-wrap gap-1">
            {analysis.recommendedPieces.map((piece, index) => (
              <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                {piece}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* What to Avoid */}
    <div className="bg-red-50 rounded-lg p-4">
      <h3 className="font-semibold text-red-800 mb-3 flex items-center">
        <XCircle className="h-5 w-5 mr-2" />
        O Que Evitar
      </h3>
      
      {/* From bodyTypes data */}
      <div className="mb-3">
        <h4 className="text-red-700 font-medium text-sm mb-2">Estilos a Evitar:</h4>
        <div className="flex flex-wrap gap-1">
          {bodyTypeData.avoidStyles.map((style, index) => (
            <span key={index} className="bg-red-200 text-red-800 text-xs px-2 py-1 rounded-full">
              {style}
            </span>
          ))}
        </div>
      </div>

      {/* From AI analysis */}
      {analysis.avoidPieces && analysis.avoidPieces.length > 0 && (
        <div>
          <h4 className="text-red-700 font-medium text-sm mb-2">Peças Menos Favoráveis:</h4>
          <div className="flex flex-wrap gap-1">
            {analysis.avoidPieces.map((piece, index) => (
              <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                {piece}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* Shopping Guide */}
    {analysis.shoppingGuide && analysis.shoppingGuide.length > 0 && (
      <div className="bg-purple-50 rounded-lg p-4">
        <h3 className="font-semibold text-purple-800 mb-3 flex items-center">
          <ShoppingBag className="h-5 w-5 mr-2" />
          Guia de Compras
        </h3>
        <div className="space-y-2">
          {analysis.shoppingGuide.map((item, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-purple-600 text-sm font-bold">{index + 1}.</span>
              <span className="text-purple-700 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* All Styling Tips */}
    {analysis.stylingTips && analysis.stylingTips.length > 0 && (
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
          <Lightbulb className="h-5 w-5 mr-2" />
          Todas as Dicas de Styling
        </h3>
        <div className="space-y-2">
          {analysis.stylingTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-600 text-sm">💡</span>
              <span className="text-blue-700 text-sm">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Wardrobe Tab Component
const WardrobeTab = ({ analysis, wardrobe }) => {
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
    <div className="space-y-4">
      {analysis.wardrobeAnalysis && analysis.wardrobeAnalysis.length > 0 ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-green-800 font-bold text-lg">
                {analysis.wardrobeAnalysis.filter(item => item.rating >= 8).length}
              </div>
              <div className="text-green-600 text-xs">Peças Excelentes</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-red-800 font-bold text-lg">
                {analysis.wardrobeAnalysis.filter(item => item.rating <= 4).length}
              </div>
              <div className="text-red-600 text-xs">Peças Problemáticas</div>
            </div>
          </div>

          {/* Individual Pieces */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {analysis.wardrobeAnalysis
              .sort((a, b) => b.rating - a.rating)
              .map((item, index) => (
              <div key={index} className={`border rounded-lg p-3 ${getCategoryColor(item.category)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm truncate flex-1">{item.itemName}</h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <span className="text-xs">{getRatingStars(item.rating)}</span>
                    <span className="text-xs font-bold">{item.rating}/10</span>
                  </div>
                </div>
                <p className="text-xs opacity-90 mb-2">{item.reasoning}</p>
                <div className="bg-white bg-opacity-50 rounded p-2">
                  <span className="text-xs font-medium">💡 </span>
                  <span className="text-xs">{item.reasoning}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600 mb-2">Sem Análise do Armário</h3>
          <p className="text-gray-500 text-sm">
            Clica em "Analisar Meu Armário" para ver como cada peça funciona com o teu body shape.
          </p>
        </div>
      )}
    </div>
  );
};

// ✅ WARDROBE ANALYSIS STEP MELHORADO
const WardrobeAnalysisStep = ({ 
  analysis, 
  wardrobeAnalysis, 
  bodyTypes, 
  userProfile, 
  navigateToScreen, 
  onRefreshAnalysis,
  onResetBodyShape,
  wardrobe
}) => {
  const bodyTypeData = bodyTypes[userProfile?.bodyShape];
  const [activeTab, setActiveTab] = useState('summary');

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
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Análise do Teu Armário</h2>
          <p className="text-gray-600 mb-2">Body Shape: {userProfile?.bodyShape}</p>
          {bodyTypeData && (
            <p className="text-gray-500 text-sm">{bodyTypeData.description}</p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={onRefreshAnalysis}
            className="flex-1 bg-green-100 text-green-800 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1"
          >
            <Zap className="h-4 w-4" />
            <span>Reanalisar</span>
          </button>
          <button
            onClick={onResetBodyShape}
            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refazer Body Shape</span>
          </button>
        </div>

        {/* Tab Navigation */}
        {wardrobeAnalysis && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'summary' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Resumo
            </button>
            <button
              onClick={() => setActiveTab('pieces')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pieces' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Por Peça
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'recommendations' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Dicas
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {wardrobeAnalysis ? (
        <>
          {activeTab === 'summary' && (
            <WardrobeSummaryTab wardrobeAnalysis={wardrobeAnalysis} />
          )}
          
          {activeTab === 'pieces' && (
            <WardrobePiecesTab 
              wardrobeAnalysis={wardrobeAnalysis} 
              getCategoryColor={getCategoryColor}
              getRatingStars={getRatingStars}
            />
          )}
          
          {activeTab === 'recommendations' && (
            <WardrobeRecommendationsTab wardrobeAnalysis={wardrobeAnalysis} />
          )}
        </>
      ) : (
        <div className="space-y-4">
          {/* Show basic body shape info */}
          {userProfile?.bodyShapeAnalysis && (
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-gray-800 mb-4">📋 Resumo do Teu Body Shape</h3>
              
              {/* Proportion Analysis */}
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-indigo-800 mb-2">📏 Análise das Proporções</h4>
                <p className="text-indigo-700 text-sm leading-relaxed">
                  {userProfile.bodyShapeAnalysis.proportionAnalysis}
                </p>
              </div>

              {/* Quick recommendations */}
              {userProfile.bodyShapeAnalysis.stylingTips && userProfile.bodyShapeAnalysis.stylingTips.length > 0 && (
                <div className="bg-amber-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-amber-800 mb-2">💡 Dicas de Styling</h4>
                  <div className="space-y-1">
                    {userProfile.bodyShapeAnalysis.stylingTips.slice(0, 3).map((tip, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-amber-600 text-sm font-bold">{index + 1}.</span>
                        <span className="text-amber-700 text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shopping guide */}
              {userProfile.bodyShapeAnalysis.shoppingGuide && userProfile.bodyShapeAnalysis.shoppingGuide.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">🛍️ Guia de Compras</h4>
                  <div className="space-y-1">
                    {userProfile.bodyShapeAnalysis.shoppingGuide.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-purple-600 text-sm font-bold">{index + 1}.</span>
                        <span className="text-purple-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Call to action */}
          <div className="bg-white rounded-2xl p-6 shadow-xl text-center">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-800 mb-2">Análise Detalhada do Armário</h3>
            <p className="text-gray-600 text-sm mb-4">
              Obtém uma análise peça por peça do teu armário com scoring detalhado e dicas personalizadas.
            </p>
            <button
              onClick={onRefreshAnalysis}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 mx-auto"
            >
              <Zap className="h-5 w-5" />
              <span>Analisar {wardrobe.length} Peças do Armário</span>
            </button>
          </div>
        </div>
      )}

      {/* Back to Home */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <button
          onClick={() => navigateToScreen('home')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-lg font-semibold"
        >
          Voltar ao Menu Principal
        </button>
      </div>
    </div>
  );
};

// Wardrobe Summary Tab
const WardrobeSummaryTab = ({ wardrobeAnalysis }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-bold text-gray-800 mb-4">📊 Resumo Geral</h3>
    
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-green-800 font-bold text-2xl">{wardrobeAnalysis.overallSummary?.perfectPieces || 0}</div>
        <div className="text-green-600 text-sm">Peças Perfeitas</div>
        <div className="text-green-500 text-xs">9-10 pontos</div>
      </div>
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-blue-800 font-bold text-2xl">{wardrobeAnalysis.overallSummary?.goodPieces || 0}</div>
        <div className="text-blue-600 text-sm">Peças Boas</div>
        <div className="text-blue-500 text-xs">7-8 pontos</div>
      </div>
      <div className="text-center p-4 bg-orange-50 rounded-lg">
        <div className="text-orange-800 font-bold text-2xl">{wardrobeAnalysis.overallSummary?.neutralPieces || 0}</div>
        <div className="text-orange-600 text-sm">Neutras</div>
        <div className="text-orange-500 text-xs">5-6 pontos</div>
      </div>
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <div className="text-red-800 font-bold text-2xl">{wardrobeAnalysis.overallSummary?.poorPieces || 0}</div>
        <div className="text-red-600 text-sm">Problemáticas</div>
        <div className="text-red-500 text-xs">1-4 pontos</div>
      </div>
    </div>

    {/* Progress Bar */}
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Qualidade Geral do Armário</span>
        <span>
          {Math.round(
            ((wardrobeAnalysis.overallSummary?.perfectPieces || 0) + 
             (wardrobeAnalysis.overallSummary?.goodPieces || 0)) / 
            (wardrobeAnalysis.wardrobeAnalysis?.length || 1) * 100
          )}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
          style={{
            width: `${Math.round(
              ((wardrobeAnalysis.overallSummary?.perfectPieces || 0) + 
               (wardrobeAnalysis.overallSummary?.goodPieces || 0)) / 
              (wardrobeAnalysis.wardrobeAnalysis?.length || 1) * 100
            )}%`
          }}
        ></div>
      </div>
    </div>
  </div>
);

// Wardrobe Pieces Tab
const WardrobePiecesTab = ({ wardrobeAnalysis, getCategoryColor, getRatingStars }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-bold text-gray-800 mb-4">👕 Análise por Peça</h3>
    
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {wardrobeAnalysis.wardrobeAnalysis?.length > 0 ? (
        wardrobeAnalysis.wardrobeAnalysis
          .sort((a, b) => b.rating - a.rating)
          .map((item, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getCategoryColor(item.category)}`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm flex-1 truncate pr-2">{item.itemName}</h4>
                <div className="flex flex-col items-end">
                  <span className="text-sm">{getRatingStars(item.rating)}</span>
                  <span className="text-xs font-bold">{item.rating}/10</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-white bg-opacity-60 rounded p-2">
                  <span className="text-xs font-medium text-gray-700">Análise: </span>
                  <span className="text-xs text-gray-700">{item.reasoning}</span>
                </div>
                
                {item.stylingTip && (
                  <div className="bg-white bg-opacity-60 rounded p-2">
                    <span className="text-xs font-medium text-gray-700">💡 Dica: </span>
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
);

// Wardrobe Recommendations Tab
const WardrobeRecommendationsTab = ({ wardrobeAnalysis }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-bold text-gray-800 mb-4">💡 Recomendações Personalizadas</h3>
    
    {wardrobeAnalysis.overallSummary?.recommendations && wardrobeAnalysis.overallSummary.recommendations.length > 0 ? (
      <div className="space-y-3">
        {wardrobeAnalysis.overallSummary.recommendations.map((rec, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
            <p className="text-blue-800 text-sm leading-relaxed">{rec}</p>
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
);

export default BodyShapeAnalysisScreen;