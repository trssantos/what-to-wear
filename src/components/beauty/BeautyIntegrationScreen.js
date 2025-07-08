import React, { useState } from 'react';
import { ArrowLeft, Palette, Scissors, Sparkles, Camera, Upload, Eye, Heart } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const BeautyIntegrationScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [activeTab, setActiveTab] = useState('makeup');
  const [selectedOutfit, setSelectedOutfit] = useState(null);
  const [faceImage, setFaceImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [beautyAnalysis, setBeautyAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [beautyProfile, setBeautyProfile] = useState({
    skinTone: '',
    eyeColor: '',
    hairColor: '',
    hairLength: '',
    makeupExperience: '',
    preferredStyle: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFaceImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setFaceImage(photoDataUrl);
    setShowCamera(false);
  };

  const generateBeautyRecommendations = async () => {
    if (!selectedOutfit && activeTab === 'outfit-coordination') {
      alert('Por favor seleciona um outfit primeiro');
      return;
    }

    setIsAnalyzing(true);
    try {
      let prompt;
      
      if (activeTab === 'makeup') {
        prompt = `Como makeup artist profissional e especialista em harmonia de cores, cria recomendações de maquilhagem personalizadas.

PERFIL DE BELEZA:
- Tom de pele: ${beautyProfile.skinTone}
- Cor dos olhos: ${beautyProfile.eyeColor}
- Cor do cabelo: ${beautyProfile.hairColor}
- Experiência: ${beautyProfile.makeupExperience}
- Estilo preferido: ${beautyProfile.preferredStyle}

PERFIL STYLE:
${userProfile?.colorSeason ? `- Estação de cor: ${userProfile.colorSeason}` : ''}

${selectedOutfit ? `
OUTFIT SELECIONADO:
- Nome: ${selectedOutfit.name}
- Ocasião: ${selectedOutfit.occasion || 'Casual'}
- Peças: ${selectedOutfit.pieces ? Object.values(selectedOutfit.pieces).filter(Boolean).join(', ') : 'N/A'}
` : ''}

Cria recomendações completas incluindo:

1. **LOOK DE MAQUILHAGEM**: Base, olhos, lábios
2. **PRODUTOS ESPECÍFICOS**: Marcas e tons recomendados
3. **TÉCNICAS**: Passo-a-passo simplificado
4. **VARIAÇÕES**: Para dia/noite/trabalho
5. **CORES PRINCIPAIS**: Paleta coordenada
6. **DICAS ESPECIAIS**: Para o tipo de pele/olhos

Formato JSON:
{
  "makeupLook": {
    "name": "nome do look",
    "description": "descrição geral",
    "occasion": "adequado para"
  },
  "products": {
    "base": {"type": "produto", "shade": "tom", "brand": "marca"},
    "eyes": [{"product": "produto", "color": "cor", "brand": "marca"}],
    "lips": {"type": "produto", "color": "cor", "brand": "marca"},
    "cheeks": {"type": "produto", "color": "cor", "brand": "marca"}
  },
  "technique": {
    "steps": ["passo1", "passo2", "passo3"],
    "difficulty": "Fácil|Médio|Difícil",
    "timeNeeded": "15 min"
  },
  "variations": [
    {"name": "Dia", "changes": "alterações"},
    {"name": "Noite", "changes": "alterações"}
  ],
  "colorPalette": ["#HEX1", "#HEX2", "#HEX3"],
  "tips": ["dica1", "dica2", "dica3"]
}`;
      } else if (activeTab === 'hair') {
        prompt = `Como hair stylist profissional, cria recomendações de penteados e cuidados capilares.

PERFIL:
- Cor do cabelo: ${beautyProfile.hairColor}
- Comprimento: ${beautyProfile.hairLength}
- Formato do rosto: ${userProfile?.bodyShape ? 'Baseado no body shape' : 'N/A'}

${selectedOutfit ? `
OUTFIT: ${selectedOutfit.name} - ${selectedOutfit.occasion}
` : ''}

Recomenda:
1. **PENTEADOS**: 3-4 opções adequadas
2. **PRODUTOS**: Específicos para o tipo de cabelo
3. **TÉCNICAS**: Como fazer cada penteado
4. **CUIDADOS**: Rotina de cuidados
5. **CORES**: Se mudança de cor for adequada

Formato JSON similar.`;
      } else if (activeTab === 'nails') {
        prompt = `Como nail artist, cria recomendações de nail art e cores.

${selectedOutfit ? `
OUTFIT: ${selectedOutfit.name}
CORES DO OUTFIT: [cores predominantes]
OCASIÃO: ${selectedOutfit.occasion}
` : ''}

ESTAÇÃO DE COR: ${userProfile?.colorSeason || 'N/A'}

Recomenda:
1. **CORES DE VERNIZ**: Específicas para o outfit
2. **NAIL ART**: Designs adequados à ocasião
3. **FORMATO**: Que formato de unha funciona melhor
4. **PRODUTOS**: Marcas e tipos de verniz
5. **CUIDADOS**: Rotina de cuidados das unhas

Formato JSON similar.`;
      } else {
        // outfit-coordination
        prompt = `Como beauty expert, cria uma coordenação completa de beleza para este outfit.

OUTFIT: ${selectedOutfit.name}
OCASIÃO: ${selectedOutfit.occasion}
PEÇAS: ${selectedOutfit.pieces ? Object.values(selectedOutfit.pieces).filter(Boolean).join(', ') : 'N/A'}

PERFIL: ${beautyProfile.skinTone}, ${beautyProfile.eyeColor}, ${beautyProfile.hairColor}

Cria uma coordenação COMPLETA:
1. **MAQUILHAGEM** coordenada com outfit
2. **CABELO** adequado à ocasião
3. **UNHAS** que complementem
4. **ACESSÓRIOS DE BELEZA** (perfume, etc.)
5. **HARMONIA GERAL** de todo o look

Formato JSON combinado.`;
      }

      let response;
      if (faceImage && activeTab === 'makeup') {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um makeup artist e beauty expert profissional. Crias recomendações personalizadas baseadas nas características faciais e estilo pessoal.'
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
            content: 'És um beauty expert profissional especializado em maquilhagem, cabelo e coordenação de looks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]);
      }

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setBeautyAnalysis(analysisData);
      } else {
        // Fallback to text response
        setBeautyAnalysis({ textResponse: response });
      }

    } catch (error) {
      alert('Erro na análise de beleza: ' + error.message);
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
      <div className="min-h-screen bg-gradient-to-br from-pink-400 to-rose-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Sparkles className="h-16 w-16 text-pink-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Criando look de beleza...</h2>
          <p className="text-gray-600 mb-4">A IA está a coordenar a maquilhagem perfeita</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>💄 Analisando tom de pele...</div>
            <div>🎨 Coordenando cores...</div>
            <div>✨ Criando variações...</div>
            <div>💡 Gerando dicas...</div>
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
          <h1 className="text-2xl font-bold text-white ml-4">Beauty Integration</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-xl mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('makeup')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'makeup' ? 'bg-pink-500 text-white' : 'text-gray-600'
              }`}
            >
              💄 Maquilhagem
            </button>
            <button
              onClick={() => setActiveTab('hair')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'hair' ? 'bg-pink-500 text-white' : 'text-gray-600'
              }`}
            >
              💇 Cabelo
            </button>
            <button
              onClick={() => setActiveTab('nails')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'nails' ? 'bg-pink-500 text-white' : 'text-gray-600'
              }`}
            >
              💅 Unhas
            </button>
            <button
              onClick={() => setActiveTab('outfit-coordination')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'outfit-coordination' ? 'bg-pink-500 text-white' : 'text-gray-600'
              }`}
            >
              👗 Coordenação
            </button>
          </div>
        </div>

        {!beautyAnalysis ? (
          <div className="space-y-4">
            {/* Beauty Profile Setup */}
            <BeautyProfileSetup
              beautyProfile={beautyProfile}
              setBeautyProfile={setBeautyProfile}
              faceImage={faceImage}
              onImageUpload={handleImageUpload}
              onCameraOpen={() => setShowCamera(true)}
            />

            {/* Outfit Selection (for coordination) */}
            {(activeTab === 'outfit-coordination' || activeTab === 'makeup') && (
              <OutfitSelection
                outfits={outfits}
                selectedOutfit={selectedOutfit}
                setSelectedOutfit={setSelectedOutfit}
              />
            )}

            {/* Generate Button */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <button
                onClick={generateBeautyRecommendations}
                disabled={!beautyProfile.skinTone || !beautyProfile.eyeColor}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                {activeTab === 'makeup' && 'Gerar Look de Maquilhagem'}
                {activeTab === 'hair' && 'Gerar Recomendações de Cabelo'}
                {activeTab === 'nails' && 'Gerar Nail Art'}
                {activeTab === 'outfit-coordination' && 'Coordenar Look Completo'}
              </button>
            </div>
          </div>
        ) : (
          <BeautyResults
            activeTab={activeTab}
            beautyAnalysis={beautyAnalysis}
            selectedOutfit={selectedOutfit}
            onNewAnalysis={() => setBeautyAnalysis(null)}
            navigateToScreen={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
};

// Beauty Profile Setup Component
const BeautyProfileSetup = ({ 
  beautyProfile, 
  setBeautyProfile, 
  faceImage, 
  onImageUpload, 
  onCameraOpen 
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-semibold text-gray-800 mb-4">Perfil de Beleza</h3>
    
    {/* Face Photo */}
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Foto do rosto (opcional)
      </label>
      
      {faceImage ? (
        <div className="relative">
          <img src={faceImage} alt="Face" className="w-24 h-24 rounded-full mx-auto object-cover" />
          <button
            onClick={() => setFaceImage(null)}
            className="absolute top-0 right-1/2 transform translate-x-12 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
          >
            ×
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onCameraOpen}
            className="flex flex-col items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Camera className="h-6 w-6 text-blue-500 mb-1" />
            <span className="text-xs text-blue-600">Tirar Foto</span>
          </button>
          
          <label className="flex flex-col items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
            <Upload className="h-6 w-6 text-green-500 mb-1" />
            <span className="text-xs text-green-600">Carregar</span>
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>

    {/* Profile Fields */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tom de pele</label>
        <select
          value={beautyProfile.skinTone}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, skinTone: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Cor dos olhos</label>
        <select
          value={beautyProfile.eyeColor}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, eyeColor: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Seleciona...</option>
          <option value="Castanho">Castanho</option>
          <option value="Azul">Azul</option>
          <option value="Verde">Verde</option>
          <option value="Avelã">Avelã</option>
          <option value="Cinza">Cinza</option>
          <option value="Preto">Preto</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cor do cabelo</label>
        <select
          value={beautyProfile.hairColor}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, hairColor: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Seleciona...</option>
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento</label>
        <select
          value={beautyProfile.hairLength}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, hairLength: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Seleciona...</option>
          <option value="Muito curto">Muito curto</option>
          <option value="Curto">Curto</option>
          <option value="Médio">Médio</option>
          <option value="Comprido">Comprido</option>
          <option value="Muito comprido">Muito comprido</option>
        </select>
      </div>
    </div>

    <div className="mt-3 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Experiência com maquilhagem</label>
        <select
          value={beautyProfile.makeupExperience}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, makeupExperience: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Seleciona...</option>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermédio">Intermédio</option>
          <option value="Avançado">Avançado</option>
          <option value="Profissional">Profissional</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estilo preferido</label>
        <select
          value={beautyProfile.preferredStyle}
          onChange={(e) => setBeautyProfile(prev => ({ ...prev, preferredStyle: e.target.value }))}
          className="w-full p-2 border rounded text-sm"
        >
          <option value="">Seleciona...</option>
          <option value="Natural">Natural</option>
          <option value="Glamouroso">Glamouroso</option>
          <option value="Dramático">Dramático</option>
          <option value="Vintage">Vintage</option>
          <option value="Moderno">Moderno</option>
          <option value="Minimalista">Minimalista</option>
        </select>
      </div>
    </div>
  </div>
);

// Outfit Selection Component
const OutfitSelection = ({ outfits, selectedOutfit, setSelectedOutfit }) => (
  <div className="bg-white rounded-2xl p-4 shadow-xl">
    <h3 className="font-semibold text-gray-800 mb-3">Selecionar Outfit</h3>
    
    {outfits.length > 0 ? (
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {outfits.map(outfit => (
          <button
            key={outfit.id}
            onClick={() => setSelectedOutfit(outfit)}
            className={`w-full p-3 text-left rounded-lg border transition-colors ${
              selectedOutfit?.id === outfit.id
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="font-medium text-gray-800">{outfit.name}</div>
            {outfit.occasion && (
              <div className="text-sm text-gray-600">{outfit.occasion}</div>
            )}
          </button>
        ))}
      </div>
    ) : (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">Nenhum outfit criado ainda</p>
        <button
          onClick={() => navigateToScreen('create-outfit')}
          className="mt-2 text-pink-600 text-sm underline"
        >
          Criar primeiro outfit
        </button>
      </div>
    )}
  </div>
);

// Beauty Results Component
const BeautyResults = ({ activeTab, beautyAnalysis, selectedOutfit, onNewAnalysis, navigateToScreen }) => {
  if (beautyAnalysis.textResponse) {
    // Fallback text response
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Recomendações de Beleza</h3>
        <div className="prose text-sm text-gray-700 whitespace-pre-wrap">
          {beautyAnalysis.textResponse}
        </div>
        <button
          onClick={onNewAnalysis}
          className="w-full mt-4 bg-pink-500 text-white py-2 rounded-lg font-semibold"
        >
          Nova Análise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {activeTab === 'makeup' && (
        <MakeupResults analysis={beautyAnalysis} />
      )}
      
      {activeTab === 'hair' && (
        <HairResults analysis={beautyAnalysis} />
      )}
      
      {activeTab === 'nails' && (
        <NailsResults analysis={beautyAnalysis} />
      )}
      
      {activeTab === 'outfit-coordination' && (
        <CoordinationResults analysis={beautyAnalysis} selectedOutfit={selectedOutfit} />
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="space-y-3">
          <button
            onClick={onNewAnalysis}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg font-semibold"
          >
            Nova Análise
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigateToScreen('style-chat')}
              className="bg-purple-100 text-purple-800 py-2 rounded-lg font-semibold text-sm"
            >
              💬 Chat Estilo
            </button>
            <button
              onClick={() => navigateToScreen('smart-shopping')}
              className="bg-green-100 text-green-800 py-2 rounded-lg font-semibold text-sm"
            >
              🛍️ Compras
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Makeup Results Component
const MakeupResults = ({ analysis }) => (
  <div className="space-y-4">
    {/* Makeup Look */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">{analysis.makeupLook?.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{analysis.makeupLook?.description}</p>
      <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded">
        {analysis.makeupLook?.occasion}
      </span>
    </div>

    {/* Color Palette */}
    {analysis.colorPalette && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Paleta de Cores</h4>
        <div className="flex space-x-2">
          {analysis.colorPalette.map((color, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full border-2 border-gray-200"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    )}

    {/* Products */}
    {analysis.products && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Produtos Recomendados</h4>
        <div className="space-y-3 text-sm">
          {analysis.products.base && (
            <div className="p-2 bg-gray-50 rounded">
              <strong>Base:</strong> {analysis.products.base.type} {analysis.products.base.shade}
              {analysis.products.base.brand && ` - ${analysis.products.base.brand}`}
            </div>
          )}
          
          {analysis.products.eyes && (
            <div className="p-2 bg-gray-50 rounded">
              <strong>Olhos:</strong>
              <ul className="list-disc list-inside ml-2">
                {analysis.products.eyes.map((eye, index) => (
                  <li key={index}>
                    {eye.product} {eye.color} {eye.brand && `- ${eye.brand}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {analysis.products.lips && (
            <div className="p-2 bg-gray-50 rounded">
              <strong>Lábios:</strong> {analysis.products.lips.type} {analysis.products.lips.color}
              {analysis.products.lips.brand && ` - ${analysis.products.lips.brand}`}
            </div>
          )}
        </div>
      </div>
    )}

    {/* Technique */}
    {analysis.technique && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Como Fazer</h4>
        <div className="mb-2 flex justify-between text-sm">
          <span>Dificuldade: <strong>{analysis.technique.difficulty}</strong></span>
          <span>Tempo: <strong>{analysis.technique.timeNeeded}</strong></span>
        </div>
        <ol className="list-decimal list-inside text-sm space-y-1">
          {analysis.technique.steps.map((step, index) => (
            <li key={index} className="text-gray-700">{step}</li>
          ))}
        </ol>
      </div>
    )}

    {/* Variations */}
    {analysis.variations && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Variações</h4>
        <div className="space-y-2">
          {analysis.variations.map((variation, index) => (
            <div key={index} className="p-2 bg-blue-50 rounded">
              <strong className="text-blue-800">{variation.name}:</strong>
              <p className="text-sm text-blue-700">{variation.changes}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Tips */}
    {analysis.tips && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h4 className="font-semibold text-gray-800 mb-3">Dicas Especiais</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {analysis.tips.map((tip, index) => (
            <li key={index} className="text-gray-700">{tip}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Hair Results Component (simplified)
const HairResults = ({ analysis }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-semibold text-gray-800 mb-3">Recomendações de Cabelo</h3>
    <div className="prose text-sm text-gray-700 whitespace-pre-wrap">
      {JSON.stringify(analysis, null, 2)}
    </div>
  </div>
);

// Nails Results Component (simplified)
const NailsResults = ({ analysis }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <h3 className="font-semibold text-gray-800 mb-3">Nail Art Recomendada</h3>
    <div className="prose text-sm text-gray-700 whitespace-pre-wrap">
      {JSON.stringify(analysis, null, 2)}
    </div>
  </div>
);

// Coordination Results Component (simplified)
const CoordinationResults = ({ analysis, selectedOutfit }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">
        Look Completo: {selectedOutfit?.name}
      </h3>
      <div className="prose text-sm text-gray-700 whitespace-pre-wrap">
        {JSON.stringify(analysis, null, 2)}
      </div>
    </div>
  </div>
);

export default BeautyIntegrationScreen;