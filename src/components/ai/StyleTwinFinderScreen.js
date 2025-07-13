import React, { useState } from 'react';
import { ArrowLeft, Users, Search, Camera, Upload, Heart, Copy, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const StyleTwinFinderScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [mode, setMode] = useState('inspiration'); // 'inspiration' or 'reverse'
  const [inspirationImage, setInspirationImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [savedLooks, setSavedLooks] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInspirationImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setInspirationImage(photoDataUrl);
    setShowCamera(false);
  };

  const analyzeStyle = async () => {
    if (!inspirationImage && mode === 'inspiration') {
      alert('Por favor adiciona uma imagem de inspiração');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

ANÁLISE ESPECÍFICA POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR EM: Recreação feminina do look, acessórios femininos necessários
- INCLUIR: Sugestões de maquilhagem, joias, sapatos femininos que combinem
- STYLING: Técnicas femininas de layering, proporções, styling tips
- SHOPPING: Prioritizar peças femininas, underwear adequado se necessário
` : userProfile.gender === 'male' ? `
- FOCAR EM: Adaptação masculina do look, acessórios masculinos
- INCLUIR: Grooming suggestions, relógios, cintos, sapatos masculinos
- STYLING: Técnicas masculinas, fit requirements, formal/casual balance
- SHOPPING: Prioritizar peças masculinas, tailoring considerations
` : `
- FOCAR EM: Adaptação neutra do look, acessórios versáteis
- INCLUIR: Styling tips inclusivos, peças adaptáveis
- STYLING: Técnicas neutras adequadas a qualquer expressão
`}
` : '';

      let prompt;
      
      if (mode === 'inspiration' && inspirationImage) {
        prompt = `Como especialista em análise de moda, analisa este look de inspiração e ajuda a recriá-lo usando o armário disponível.

${genderContext}

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Para a imagem de inspiração fornecida, cria:

1. **ANÁLISE DO LOOK**: Descreve o estilo, cores, peças principais considerando o gênero
2. **RECREAÇÃO COM ARMÁRIO**: Como recriar usando peças disponíveis, adaptado ao gênero
3. **PEÇAS EM FALTA**: O que precisas de comprar para completar, específico para o gênero
4. **ALTERNATIVAS CRIATIVAS**: Outras formas de conseguir o mesmo efeito para o gênero
5. **STYLING TIPS**: Como adaptar o look ao teu corpo e ocasiões, considerando o gênero
6. **SIMILAR LOOKS**: 3 variações do mesmo estilo apropriadas para o gênero
7. **SHOPPING LIST**: Links ou descrições de peças para comprar específicas para o gênero

Formato JSON:
{
  "styleAnalysis": {
    "styleType": "nome do estilo",
    "keyElements": ["elemento1", "elemento2", ...],
    "colorPalette": ["cor1", "cor2", ...],
    "vibe": "descrição do vibe considerando gênero"
  },
  "recreation": {
    "availablePieces": [{"item": "nome", "role": "função no look"}],
    "missingPieces": [{"piece": "nome específico para gênero", "importance": "alta/média/baixa", "alternatives": "alternativas"}],
    "substitutions": [{"original": "peça original", "substitute": "substituto do armário", "reason": "motivo"}]
  },
  "stylingTips": ["dica1 específica para gênero", "dica2", ...],
  "similarLooks": [
    {"name": "nome do look", "pieces": ["peça1", "peça2"], "occasion": "ocasião apropriada para gênero"},
    {"name": "nome do look 2", "pieces": ["peça1", "peça2"], "occasion": "ocasião"}
  ],
  "shoppingList": [
    {"item": "nome específico para gênero", "priority": "alta/média/baixa", "price": "faixa de preço", "where": "onde comprar"}
  ]
}`;
      } else {
        // Reverse mode - generate looks based on wardrobe
        prompt = `Como especialista em styling, cria 5 looks inspiradores usando apenas peças deste armário.

${genderContext}

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Cria looks diversos para diferentes ocasiões, maximizando a versatilidade do armário e considerando o gênero.

Formato JSON:
{
  "generatedLooks": [
    {
      "name": "nome do look apropriado para gênero",
      "occasion": "ocasião específica considerando gênero",
      "pieces": ["peça1", "peça2", "peça3"],
      "styleType": "tipo de estilo",
      "description": "descrição considerando styling para gênero",
      "tips": "dicas de styling específicas para gênero"
    }
  ]
}`;
      }

      let response;
      if (inspirationImage && mode === 'inspiration') {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista em análise de moda e styling. Analisas looks e recrias usando peças disponíveis, adaptando sempre ao gênero do cliente.'
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
                  url: inspirationImage
                }
              }
            ]
          }
        ], true);
      } else {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista em styling e criação de looks, adaptando sempre as sugestões ao gênero do cliente.'
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
        setAnalysisResult(analysisData);
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      console.error('❌ Erro na análise de estilo:', error);
      alert('Erro na análise: ' + error.message);
    }
    setIsAnalyzing(false);
  };

  const saveLook = (look) => {
    setSavedLooks(prev => [...prev, { ...look, id: Date.now() }]);
    alert('Look guardado com sucesso!');
  };

  const copyLook = (look) => {
    const lookText = `Look: ${look.name}\nPeças: ${look.pieces?.join(', ')}\nOcasião: ${look.occasion}`;
    navigator.clipboard.writeText(lookText);
    alert('Look copiado para a área de transferência!');
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
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {mode === 'inspiration' ? 'Analisando inspiração...' : 'Criando looks...'}
          </h2>
          <p className="text-gray-600 mb-4">A IA está a trabalhar na tua style twin</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>🔍 Analisando estilo...</div>
            <div>👗 Combinando peças...</div>
            <div>✨ Criando alternativas...</div>
            <div>🎯 Finalizando sugestões...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Style Twin Finder</h1>
        </div>

        {!analysisResult ? (
          <InitialModeSelection
            mode={mode}
            setMode={setMode}
            inspirationImage={inspirationImage}
            setInspirationImage={setInspirationImage}
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setShowCamera(true)}
            onAnalyze={analyzeStyle}
            wardrobeCount={wardrobe.length}
          />
        ) : (
          <ResultsDisplay
            mode={mode}
            results={analysisResult}
            inspirationImage={inspirationImage}
            wardrobe={wardrobe}
            savedLooks={savedLooks}
            onSaveLook={saveLook}
            onCopyLook={copyLook}
            onNewSearch={() => {
              setAnalysisResult(null);
              setInspirationImage(null);
            }}
            setInspirationImage={setInspirationImage}
            navigateToScreen={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
};

// Initial Mode Selection Component
const InitialModeSelection = ({ 
  mode, 
  setMode, 
  inspirationImage, 
  setInspirationImage,
  onImageUpload, 
  onCameraOpen, 
  onAnalyze, 
  wardrobeCount 
}) => (
  <div className="space-y-4">
    {/* Mode Selection */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Como queres encontrar inspiração?</h2>
      
      <div className="space-y-3">
        <button
          onClick={() => setMode('inspiration')}
          className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
            mode === 'inspiration'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Search className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Recrear Look</h3>
              <p className="text-sm text-gray-600">Envia uma foto e eu ajudo-te a recriar</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setMode('reverse')}
          className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
            mode === 'reverse'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-orange-500" />
            <div>
              <h3 className="font-semibold text-gray-800">Gerar Looks</h3>
              <p className="text-sm text-gray-600">Crio looks inspiradores com o teu armário</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    {/* Image Upload Section */}
    {mode === 'inspiration' && (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Adiciona uma foto de inspiração</h3>
        
        {!inspirationImage ? (
          <div className="space-y-3">
            <button
              onClick={onCameraOpen}
              className="w-full bg-orange-100 border-2 border-dashed border-orange-300 rounded-lg p-6 text-center"
            >
              <Camera className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-orange-700 font-medium">Tirar Foto</p>
            </button>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-700 font-medium">Enviar da Galeria</p>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <img
              src={inspirationImage}
              alt="Inspiração"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={() => setInspirationImage(null)}
              className="w-full text-red-600 text-sm"
            >
              Remover imagem
            </button>
          </div>
        )}
      </div>
    )}

    {/* Action Button */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <button
        onClick={onAnalyze}
        disabled={wardrobeCount === 0 || (mode === 'inspiration' && !inspirationImage)}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {wardrobeCount === 0 
          ? 'Adiciona peças ao armário primeiro'
          : mode === 'inspiration' && !inspirationImage
          ? 'Adiciona uma imagem primeiro'
          : 'Encontrar Style Twin'
        }
      </button>

      {wardrobeCount > 0 && (
        <div className="mt-3 text-center text-sm text-gray-600">
          Usando {wardrobeCount} peças do teu armário
        </div>
      )}
    </div>
  </div>
);

// Results Display Component
const ResultsDisplay = ({ 
  mode, 
  results, 
  inspirationImage, 
  wardrobe, 
  savedLooks, 
  onSaveLook, 
  onCopyLook, 
  onNewSearch, 
  setInspirationImage,
  navigateToScreen 
}) => {
  const [activeTab, setActiveTab] = useState(mode === 'inspiration' ? 'recreation' : 'looks');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {mode === 'inspiration' ? 'Look Recriado' : 'Looks Inspiradores'}
          </h2>
          <button
            onClick={onNewSearch}
            className="text-orange-600 text-sm font-semibold"
          >
            Nova Busca
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      {mode === 'inspiration' && (
        <div className="bg-white rounded-2xl p-2 shadow-xl">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('recreation')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'recreation'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600'
              }`}
            >
              Recreação
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'shopping'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600'
              }`}
            >
              Shopping
            </button>
            <button
              onClick={() => setActiveTab('similar')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'similar'
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600'
              }`}
            >
              Similares
            </button>
          </div>
        </div>
      )}

      {/* Content based on active tab */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {mode === 'inspiration' ? (
          <>
            {activeTab === 'recreation' && <RecreationTab results={results} onSaveLook={onSaveLook} onCopyLook={onCopyLook} />}
            {activeTab === 'shopping' && <ShoppingTab results={results} />}
            {activeTab === 'similar' && <SimilarLooksTab results={results} onSaveLook={onSaveLook} onCopyLook={onCopyLook} />}
          </>
        ) : (
          <GeneratedLooksTab results={results} onSaveLook={onSaveLook} onCopyLook={onCopyLook} />
        )}
      </div>
    </div>
  );
};

// Recreation Tab
const RecreationTab = ({ results, onSaveLook, onCopyLook }) => (
  <div className="space-y-4">
    {/* Style Analysis */}
    {results.styleAnalysis && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Análise do Look</h3>
        <div className="space-y-2">
          <div>
            <strong className="text-sm">Estilo:</strong>
            <span className="ml-2 text-sm">{results.styleAnalysis.styleType}</span>
          </div>
          <div>
            <strong className="text-sm">Vibe:</strong>
            <p className="text-sm text-gray-600 mt-1">{results.styleAnalysis.vibe}</p>
          </div>
          <div>
            <strong className="text-sm">Cores:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {results.styleAnalysis.colorPalette?.map((color, index) => (
                <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Available Pieces */}
    {results.recreation?.availablePieces && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Peças que Tens</h3>
        <div className="space-y-2">
          {results.recreation.availablePieces.map((piece, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
              <span className="text-sm font-medium">{piece.item}</span>
              <span className="text-xs text-green-600">{piece.role}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Styling Tips */}
    {results.stylingTips && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Dicas de Styling</h3>
        <div className="space-y-2">
          {results.stylingTips.map((tip, index) => (
            <div key={index} className="text-sm text-gray-600 flex items-start">
              <span className="mr-2">💡</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Shopping Tab
const ShoppingTab = ({ results }) => (
  <div className="space-y-4">
    {results.recreation?.missingPieces && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Peças em Falta</h3>
        <div className="space-y-3">
          {results.recreation.missingPieces.map((piece, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{piece.piece}</h4>
                <span className={`text-xs px-2 py-1 rounded ${
                  piece.importance === 'alta' ? 'bg-red-100 text-red-800' :
                  piece.importance === 'média' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {piece.importance}
                </span>
              </div>
              {piece.alternatives && (
                <p className="text-sm text-gray-600">
                  <strong>Alternativas:</strong> {piece.alternatives}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {results.shoppingList && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Lista de Compras</h3>
        <div className="space-y-3">
          {results.shoppingList.map((item, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{item.item}</h4>
                <span className="text-sm text-blue-600">{item.price}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Onde:</strong> {item.where}
              </p>
              <span className={`text-xs px-2 py-1 rounded ${
                item.priority === 'alta' ? 'bg-red-100 text-red-800' :
                item.priority === 'média' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Prioridade {item.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Similar Looks Tab
const SimilarLooksTab = ({ results, onSaveLook, onCopyLook }) => (
  <div className="space-y-4">
    {results.similarLooks?.map((look, index) => (
      <div key={index} className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">{look.name}</h3>
            <p className="text-sm text-gray-600">{look.occasion}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSaveLook(look)}
              className="p-2 text-pink-600 hover:bg-pink-50 rounded-full"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCopyLook(look)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <strong className="text-sm">Peças:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {look.pieces?.map((piece, pieceIndex) => (
                <span key={pieceIndex} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {piece}
                </span>
              ))}
            </div>
          </div>
          
          {look.tips && (
            <div>
              <strong className="text-sm">Dicas:</strong>
              <p className="text-sm text-gray-600 mt-1">{look.tips}</p>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

// Generated Looks Tab (for reverse mode)
const GeneratedLooksTab = ({ results, onSaveLook, onCopyLook }) => (
  <div className="space-y-4">
    {results.generatedLooks?.map((look, index) => (
      <div key={index} className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-800">{look.name}</h3>
            <p className="text-sm text-gray-600">{look.occasion}</p>
            <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded mt-1">
              {look.styleType}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onSaveLook(look)}
              className="p-2 text-pink-600 hover:bg-pink-50 rounded-full"
            >
              <Heart className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCopyLook(look)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div>
            <strong className="text-sm">Peças:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {look.pieces?.map((piece, pieceIndex) => (
                <span key={pieceIndex} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                  {piece}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <strong className="text-sm">Descrição:</strong>
            <p className="text-sm text-gray-600 mt-1">{look.description}</p>
          </div>
          
          {look.tips && (
            <div>
              <strong className="text-sm">Dicas:</strong>
              <p className="text-sm text-gray-600 mt-1">{look.tips}</p>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default StyleTwinFinderScreen;