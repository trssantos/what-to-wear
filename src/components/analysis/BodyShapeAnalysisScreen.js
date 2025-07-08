import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, User, Ruler, Target } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const BodyShapeAnalysisScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, updateUserProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [step, setStep] = useState(1);
  const [bodyImage, setBodyImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
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
    }
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

Fornece uma análise detalhada incluindo:

1. **BODY SHAPE**: Pear, Apple, Hourglass, Rectangle, ou Inverted Triangle
2. **CONFIANÇA**: Percentagem de certeza (0-100%)
3. **ANÁLISE DAS PROPORÇÕES**: Relação entre medidas
4. **PEÇAS RECOMENDADAS**: Tipos específicos que favorecem
5. **PEÇAS A EVITAR**: O que não funciona bem
6. **ANÁLISE DO ARMÁRIO**: Para cada peça, classificar como:
   - Muito favorável (9-10)
   - Favorável (7-8)
   - Neutro (5-6)
   - Pouco favorável (3-4)
   - Desfavorável (1-2)
7. **GUIA DE COMPRAS**: 5 tipos de peças prioritárias para comprar
8. **DICAS DE STYLING**: Como usar as peças existentes de forma mais favorável

Formato JSON:
{
  "bodyShape": "Pear|Apple|Hourglass|Rectangle|InvertedTriangle",
  "confidence": 85,
  "proportionAnalysis": "análise detalhada das proporções",
  "recommendedPieces": ["tipo1", "tipo2", ...],
  "avoidPieces": ["tipo1", "tipo2", ...],
  "wardrobeAnalysis": [
    {
      "itemId": "id",
      "itemName": "nome",
      "rating": 8,
      "category": "MuitoFavorável|Favorável|Neutro|PoucoFavorável|Desfavorável",
      "reasoning": "explicação"
    }
  ],
  "shoppingGuide": ["prioridade1", "prioridade2", ...],
  "stylingTips": ["dica1", "dica2", ...]
}`;

      let response;
      if (bodyImage) {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista mundial em análise de formato corporal e personal styling. Analisas proporções corporais e forneces recomendações específicas de moda.'
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
            content: 'És um especialista mundial em análise de formato corporal e personal styling.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]);
      }

      // Parse JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysis(analysisData);
        
        // Save to user profile
        await updateUserProfile({
          bodyShape: analysisData.bodyShape,
          bodyShapeAnalysis: analysisData,
          measurements: measurements,
          analyzedAt: new Date().toISOString()
        });
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      alert('Erro na análise: ' + error.message);
    }
    setIsAnalyzing(false);
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analisando formato corporal...</h2>
          <p className="text-gray-600 mb-4">A IA está a determinar o teu body shape</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>📏 Analisando proporções...</div>
            <div>👗 Avaliando medidas...</div>
            <div>✨ Determinando body shape...</div>
            <div>🎯 Criando recomendações...</div>
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
          />
        )}
      </div>
    </div>
  );
};

// Step 1: Photo Capture
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

// Step 2: Measurements
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

// Step 3: Analysis Results
const AnalysisResultsStep = ({ analysis, bodyTypes, wardrobe, navigateToScreen }) => {
  const bodyTypeData = bodyTypes[analysis.bodyShape];
  
  const getCategoryColor = (category) => {
    switch(category) {
      case 'MuitoFavorável': return 'bg-green-100 text-green-800';
      case 'Favorável': return 'bg-blue-100 text-blue-800';
      case 'Neutro': return 'bg-gray-100 text-gray-800';
      case 'PoucoFavorável': return 'bg-orange-100 text-orange-800';
      case 'Desfavorável': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Body Shape Result */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <User className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Body Shape: {analysis.bodyShape}</h2>
          <p className="text-gray-600 text-sm">Confiança: {analysis.confidence}%</p>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 text-sm text-center mb-3">{bodyTypeData.description}</p>
          <p className="text-gray-600 text-xs">{analysis.proportionAnalysis}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700">Características:</h4>
            <ul className="list-disc list-inside text-gray-600 ml-2">
              {bodyTypeData.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Recomendações de Styling</h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-green-700">✅ Peças recomendadas:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.recommendedPieces.map((piece, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {piece}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-red-700">❌ Evitar:</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {analysis.avoidPieces.map((piece, index) => (
                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  {piece}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wardrobe Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Análise do Teu Armário</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {analysis.wardrobeAnalysis?.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex-1">
                <span className="font-medium text-sm">{item.itemName}</span>
                <p className="text-xs text-gray-500">{item.reasoning}</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded text-xs font-bold ${getCategoryColor(item.category)}`}>
                  {item.rating}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shopping Guide */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Guia de Compras Prioritárias</h3>
        <div className="space-y-2">
          {analysis.shoppingGuide.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-blue-50 rounded">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <span className="text-sm text-blue-800">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Styling Tips */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Dicas de Styling</h3>
        <div className="space-y-2">
          {analysis.stylingTips.map((tip, index) => (
            <div key={index} className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">💡 {tip}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={() => navigateToScreen('smart-shopping')}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold"
        >
          Ir às Compras
        </button>
        <button
          onClick={() => navigateToScreen('virtual-fitting')}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
        >
          Sala de Provas
        </button>
      </div>
    </div>
  );
};

export default BodyShapeAnalysisScreen;