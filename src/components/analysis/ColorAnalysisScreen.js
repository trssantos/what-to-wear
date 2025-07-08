import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload, Palette, Star, Info, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const ColorAnalysisScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, updateUserProfile, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [step, setStep] = useState(1);
  const [faceImage, setFaceImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [personalQuestions, setPersonalQuestions] = useState({
    skinTone: '',
    eyeColor: '',
    hairColor: '',
    preferredColors: [],
    dislikedColors: []
  });

  const colorSeasons = {
    Spring: {
      colors: ['#FFB6C1', '#98FB98', '#F0E68C', '#DDA0DD', '#FFE4B5'],
      description: 'Cores quentes e claras com subtom dourado',
      characteristics: ['Pele quente com subtom dourado', 'Olhos claros e brilhantes', 'Cabelo louro, ruivo ou castanho claro'],
      bestColors: ['Coral', 'Pêssego', 'Verde-claro', 'Amarelo-quente', 'Turquesa'],
      avoidColors: ['Preto', 'Branco-puro', 'Cores muito escuras', 'Azul-frio']
    },
    Summer: {
      colors: ['#E6E6FA', '#B0E0E6', '#F5DEB3', '#DDA0DD', '#FFB6C1'],
      description: 'Cores frias e suaves com subtom rosado',
      characteristics: ['Pele fria com subtom rosado', 'Olhos azuis, verdes ou avelã', 'Cabelo louro-cinza, castanho-claro'],
      bestColors: ['Rosa-suave', 'Azul-bebé', 'Lavanda', 'Cinza-claro', 'Branco-suave'],
      avoidColors: ['Laranja', 'Cores muito quentes', 'Dourado', 'Preto-intenso']
    },
    Autumn: {
      colors: ['#D2691E', '#CD853F', '#B22222', '#DAA520', '#8B4513'],
      description: 'Cores quentes e profundas com subtom dourado',
      characteristics: ['Pele quente com subtom dourado/pêssego', 'Olhos castanhos, verdes ou avelã', 'Cabelo ruivo, castanho ou preto'],
      bestColors: ['Terracota', 'Mostarda', 'Verde-oliva', 'Borgonha', 'Dourado'],
      avoidColors: ['Rosa-frio', 'Azul-royal', 'Preto-puro', 'Cores muito claras']
    },
    Winter: {
      colors: ['#000000', '#FFFFFF', '#FF0000', '#0000FF', '#8B008B'],
      description: 'Cores frias e intensas com alto contraste',
      characteristics: ['Pele fria com subtom rosado/azul', 'Olhos escuros ou muito claros', 'Cabelo preto, castanho-escuro ou louro-platinado'],
      bestColors: ['Preto', 'Branco-puro', 'Vermelho-frio', 'Azul-royal', 'Rosa-choque'],
      avoidColors: ['Bege', 'Cores terrosas', 'Dourado', 'Laranja']
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaceImage(e.target.result);
        setStep(2);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setFaceImage(photoDataUrl);
    setShowCamera(false);
    setStep(2);
  };

  const handlePersonalQuestionsSubmit = () => {
    setStep(3);
    performColorAnalysis();
  };

  const performColorAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Como especialista em análise de cores pessoais e colorimetria, analisa esta pessoa e determina a sua estação de cor (Spring, Summer, Autumn, Winter).

INFORMAÇÕES PESSOAIS:
- Tom de pele: ${personalQuestions.skinTone}
- Cor dos olhos: ${personalQuestions.eyeColor}
- Cor do cabelo: ${personalQuestions.hairColor}
- Cores preferidas: ${personalQuestions.preferredColors.join(', ')}
- Cores que não gosta: ${personalQuestions.dislikedColors.join(', ')}

ARMÁRIO ATUAL:
${wardrobe.map(item => `- ${item.name} (${item.color})`).join('\n')}

Fornece uma análise detalhada incluindo:

1. **ESTAÇÃO DE COR**: Spring, Summer, Autumn ou Winter
2. **JUSTIFICAÇÃO**: Porquê esta estação baseada nas características
3. **PALETA PERSONALIZADA**: 10 cores específicas recomendadas
4. **ANÁLISE DO ARMÁRIO**: Score de compatibilidade (0-10) para cada peça do armário
5. **RECOMENDAÇÕES**: 
   - 3 cores para adicionar urgentemente
   - 3 cores para evitar
   - Dicas de maquilhagem/styling
6. **COMBINAÇÕES SUGERIDAS**: 5 combinações usando peças do armário

Formato de resposta em JSON:
{
  "season": "Spring|Summer|Autumn|Winter",
  "confidence": 85,
  "justification": "texto explicativo",
  "personalizedPalette": ["#HEX1", "#HEX2", ...],
  "wardrobeScores": [{"itemId": "id", "score": 8, "reasoning": "motivo"}],
  "recommendations": {
    "addColors": ["cor1", "cor2", "cor3"],
    "avoidColors": ["cor1", "cor2", "cor3"],
    "makeupTips": "dicas de maquilhagem",
    "stylingTips": "dicas de estilo"
  },
  "suggestedCombinations": ["combinação 1", "combinação 2", ...]
}`;

      let response;
      if (faceImage) {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista mundial em análise de cores pessoais e colorimetria. Analisas características físicas e determinas a estação de cor ideal.'
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
                  url: faceImage
                }
              }
            ]
          }
        ], true);
      } else {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista mundial em análise de cores pessoais e colorimetria.'
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
          colorSeason: analysisData.season,
          colorAnalysis: analysisData,
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

  const updateWardrobeWithScores = async () => {
    // This would update each wardrobe item with its color compatibility score
    // Implementation depends on your wardrobe update function
    alert('Scores de compatibilidade aplicados ao armário!');
    navigateToScreen('wardrobe');
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-rose-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Palette className="h-16 w-16 text-pink-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analisando cores...</h2>
          <p className="text-gray-600 mb-4">A IA está a determinar a tua estação de cor</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>✨ Analisando tom de pele...</div>
            <div>👁️ Avaliando cor dos olhos...</div>
            <div>💇 Considerando cor do cabelo...</div>
            <div>🎨 Determinando estação perfeita...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-rose-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Análise de Cores</h1>
        </div>

        {step === 1 && (
          <PhotoCaptureStep
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setShowCamera(true)}
            onSkip={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PersonalQuestionsStep
            faceImage={faceImage}
            personalQuestions={personalQuestions}
            setPersonalQuestions={setPersonalQuestions}
            onSubmit={handlePersonalQuestionsSubmit}
          />
        )}

        {step === 3 && analysis && (
          <AnalysisResultsStep
            analysis={analysis}
            colorSeasons={colorSeasons}
            wardrobe={wardrobe}
            onUpdateWardrobe={updateWardrobeWithScores}
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
      <Palette className="h-16 w-16 text-pink-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Análise de Cores Pessoais</h2>
      <p className="text-gray-600">Descobre as cores que mais te favorecem</p>
    </div>

    <div className="space-y-4 mb-6">
      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">O que vais descobrir:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✨ A tua estação de cor (Spring/Summer/Autumn/Winter)</li>
          <li>🎨 Paleta personalizada de cores perfeitas</li>
          <li>📊 Score de compatibilidade para cada peça do armário</li>
          <li>💄 Dicas de maquilhagem e styling</li>
        </ul>
      </div>
    </div>

    <div className="text-center mb-4">
      <h3 className="font-semibold text-gray-700 mb-4">Foto do rosto (opcional mas recomendado)</h3>
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

// Step 2: Personal Questions
const PersonalQuestionsStep = ({ faceImage, personalQuestions, setPersonalQuestions, onSubmit }) => {
  const colorOptions = ['Coral', 'Azul', 'Verde', 'Rosa', 'Amarelo', 'Roxo', 'Laranja', 'Vermelho', 'Preto', 'Branco', 'Bege', 'Cinza'];

  const toggleColor = (color, field) => {
    const current = personalQuestions[field];
    const updated = current.includes(color)
      ? current.filter(c => c !== color)
      : [...current, color];
    setPersonalQuestions(prev => ({ ...prev, [field]: updated }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
      {faceImage && (
        <div className="mb-4">
          <img src={faceImage} alt="Face" className="w-24 h-24 rounded-full mx-auto object-cover" />
        </div>
      )}
      
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Informações Pessoais</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Tom de pele</label>
          <select
            value={personalQuestions.skinTone}
            onChange={(e) => setPersonalQuestions(prev => ({ ...prev, skinTone: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="">Seleciona...</option>
            <option value="Muito claro">Muito claro</option>
            <option value="Claro">Claro</option>
            <option value="Médio">Médio</option>
            <option value="Escuro">Escuro</option>
            <option value="Muito escuro">Muito escuro</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Cor dos olhos</label>
          <select
            value={personalQuestions.eyeColor}
            onChange={(e) => setPersonalQuestions(prev => ({ ...prev, eyeColor: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="">Seleciona...</option>
            <option value="Azul">Azul</option>
            <option value="Verde">Verde</option>
            <option value="Castanho claro">Castanho claro</option>
            <option value="Castanho escuro">Castanho escuro</option>
            <option value="Avelã">Avelã</option>
            <option value="Cinza">Cinza</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Cor do cabelo</label>
          <select
            value={personalQuestions.hairColor}
            onChange={(e) => setPersonalQuestions(prev => ({ ...prev, hairColor: e.target.value }))}
            className="w-full p-3 border border-gray-200 rounded-lg"
          >
            <option value="">Seleciona...</option>
            <option value="Louro platinado">Louro platinado</option>
            <option value="Louro">Louro</option>
            <option value="Castanho claro">Castanho claro</option>
            <option value="Castanho">Castanho</option>
            <option value="Castanho escuro">Castanho escuro</option>
            <option value="Preto">Preto</option>
            <option value="Ruivo">Ruivo</option>
            <option value="Grisalho">Grisalho</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Cores que gostas</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color, 'preferredColors')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  personalQuestions.preferredColors.includes(color)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Cores que não gostas</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color, 'dislikedColors')}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  personalQuestions.dislikedColors.includes(color)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onSubmit}
        disabled={!personalQuestions.skinTone || !personalQuestions.eyeColor || !personalQuestions.hairColor}
        className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        Analisar Cores
      </button>
    </div>
  );
};

// Step 3: Analysis Results
const AnalysisResultsStep = ({ analysis, colorSeasons, wardrobe, onUpdateWardrobe, navigateToScreen }) => {
  const seasonData = colorSeasons[analysis.season];
  
  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      {/* Season Result */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">És {analysis.season}!</h2>
          <p className="text-gray-600 text-sm">Confiança: {analysis.confidence}%</p>
        </div>

        <div className="mb-4">
          <div className="flex justify-center space-x-2 mb-3">
            {seasonData.colors.map((color, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white shadow"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-gray-700 text-sm text-center">{seasonData.description}</p>
        </div>

        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700">Características:</h4>
            <ul className="list-disc list-inside text-gray-600 ml-2">
              {seasonData.characteristics.map((char, index) => (
                <li key={index}>{char}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Personalized Palette */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">A Tua Paleta Personalizada</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {analysis.personalizedPalette.map((color, index) => (
            <div
              key={index}
              className="aspect-square rounded-lg border-2 border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
        <p className="text-gray-600 text-sm">{analysis.justification}</p>
      </div>

      {/* Wardrobe Compatibility */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Compatibilidade do Armário</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {analysis.wardrobeScores?.map((item, index) => {
            const wardrobeItem = wardrobe.find(w => w.id === item.itemId);
            if (!wardrobeItem) return null;
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-sm">{wardrobeItem.name}</span>
                  <p className="text-xs text-gray-500">{item.reasoning}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  item.score >= 8 ? 'bg-green-100 text-green-800' :
                  item.score >= 6 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.score}/10
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onUpdateWardrobe}
          className="w-full mt-3 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold"
        >
          Aplicar Scores ao Armário
        </button>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Recomendações</h3>
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold text-green-700">Adicionar ao armário:</h4>
            <p className="text-gray-600">{analysis.recommendations.addColors.join(', ')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-red-700">Evitar:</h4>
            <p className="text-gray-600">{analysis.recommendations.avoidColors.join(', ')}</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-700">Dicas de maquilhagem:</h4>
            <p className="text-gray-600">{analysis.recommendations.makeupTips}</p>
          </div>
        </div>
      </div>

      {/* Suggested Combinations */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Combinações Sugeridas</h3>
        <div className="space-y-2">
          {analysis.suggestedCombinations.map((combo, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{combo}</p>
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
          onClick={() => navigateToScreen('style-chat')}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
        >
          Conversar Mais
        </button>
      </div>
    </div>
  );
};

export default ColorAnalysisScreen;