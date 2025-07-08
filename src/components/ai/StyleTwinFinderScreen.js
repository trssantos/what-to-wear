import React, { useState } from 'react';
import { ArrowLeft, Users, Search, Camera, Upload, Heart, Copy, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const StyleTwinFinderScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [mode, setMode] = useState('inspiration'); // 'inspiration' or 'reverse'
  const [inspirationImage, setInspirationImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
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

  const findStyleTwin = async () => {
    if (!inspirationImage && mode === 'inspiration') {
      alert('Por favor adiciona uma imagem de inspiração');
      return;
    }

    setIsAnalyzing(true);
    try {
      let prompt;
      
      if (mode === 'inspiration') {
        prompt = `Como especialista em análise de moda e styling, analisa esta imagem de inspiração e recria o look usando peças do armário disponível.

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Para a imagem de inspiração fornecida, cria:

1. **ANÁLISE DO LOOK**: Descreve o estilo, cores, peças principais
2. **RECREAÇÃO COM ARMÁRIO**: Como recriar usando peças disponíveis
3. **PEÇAS EM FALTA**: O que precisas de comprar para completar
4. **ALTERNATIVAS CRIATIVAS**: Outras formas de conseguir o mesmo efeito
5. **STYLING TIPS**: Como adaptar o look ao teu corpo e ocasiões
6. **SIMILAR LOOKS**: 3 variações do mesmo estilo
7. **SHOPPING LIST**: Links ou descrições de peças para comprar

Formato JSON:
{
  "styleAnalysis": {
    "styleType": "nome do estilo",
    "keyElements": ["elemento1", "elemento2", ...],
    "colorPalette": ["cor1", "cor2", ...],
    "vibe": "descrição do vibe"
  },
  "recreation": {
    "availablePieces": [{"item": "nome", "role": "função no look"}],
    "missingPieces": [{"piece": "nome", "importance": "alta/média/baixa", "alternatives": "alternativas"}],
    "substitutions": [{"original": "peça original", "substitute": "substituto", "reason": "motivo"}]
  },
  "stylingTips": ["dica1", "dica2", ...],
  "similarLooks": [
    {"name": "nome do look", "pieces": ["peça1", "peça2"], "occasion": "ocasião"},
    {"name": "nome do look 2", "pieces": ["peça1", "peça2"], "occasion": "ocasião"}
  ],
  "shoppingList": [
    {"item": "nome", "priority": "alta/média/baixa", "price": "faixa de preço", "where": "onde comprar"}
  ]
}`;
      } else {
        // Reverse mode - generate looks based on wardrobe
        prompt = `Como especialista em styling, cria 5 looks inspiradores usando apenas peças deste armário.

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Cria looks diversos para diferentes ocasiões, maximizando a versatilidade do armário.

Formato JSON:
{
  "generatedLooks": [
    {
      "name": "nome do look",
      "occasion": "ocasião",
      "pieces": ["peça1", "peça2", "peça3"],
      "styleType": "tipo de estilo",
      "description": "descrição",
      "tips": "dicas de styling"
    }
  ]
}`;
      }

      let response;
      if (inspirationImage && mode === 'inspiration') {
        response = await callOpenAI([
          {
            role: 'system',
            content: 'És um especialista em análise de moda e styling. Analisas looks e recrias usando peças disponíveis.'
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
            content: 'És um especialista em styling e criação de looks. Crias outfits inspiradores usando peças disponíveis.'
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
        const resultsData = JSON.parse(jsonMatch[0]);
        setResults(resultsData);
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      alert('Erro na análise: ' + error.message);
    }
    setIsAnalyzing(false);
  };

  const saveLook = (look) => {
    setSavedLooks(prev => [...prev, { ...look, id: Date.now() }]);
    alert('Look guardado nos favoritos!');
  };

  const copyLook = (look) => {
    const text = `Look: ${look.name}\nPeças: ${look.pieces?.join(', ')}\nOcasião: ${look.occasion}\nDicas: ${look.tips || look.description}`;
    navigator.clipboard.writeText(text);
    alert('Look copiado para clipboard!');
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
      <div className="min-h-screen bg-gradient-to-br from-orange-400 to-red-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Users className="h-16 w-16 text-orange-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
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

        {!results ? (
          <InitialModeSelection
            mode={mode}
            setMode={setMode}
            inspirationImage={inspirationImage}
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setShowCamera(true)}
            onAnalyze={findStyleTwin}
            wardrobeCount={wardrobe.length}
          />
        ) : (
          <ResultsDisplay
            mode={mode}
            results={results}
            inspirationImage={inspirationImage}
            wardrobe={wardrobe}
            savedLooks={savedLooks}
            onSaveLook={saveLook}
            onCopyLook={copyLook}
            onNewSearch={() => {
              setResults(null);
              setInspirationImage(null);
            }}
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
              <h3 className="font-semibold text-gray-800">"Copy This Look"</h3>
              <p className="text-sm text-gray-600">Envia uma foto de inspiração e recria com o teu armário</p>
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
              <h3 className="font-semibold text-gray-800">Inspiração do Armário</h3>
              <p className="text-sm text-gray-600">Cria looks inspiradores com as peças que tens</p>
            </div>
          </div>
        </button>
      </div>
    </div>

    {/* Image Upload (if inspiration mode) */}
    {mode === 'inspiration' && (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-700 mb-4">Adiciona imagem de inspiração</h3>
        
        {inspirationImage ? (
          <div className="relative mb-4">
            <img src={inspirationImage} alt="Inspiration" className="w-full h-64 object-cover rounded-lg" />
            <button
              onClick={() => setInspirationImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-4">
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
        )}

        <div className="text-center text-sm text-gray-500">
          Podes usar fotos do Pinterest, Instagram, revistas ou qualquer inspiração!
        </div>
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

      {/* Content based on mode and tab */}
      <div className="max-h-[70vh] overflow-y-auto space-y-4">
        {mode === 'inspiration' && activeTab === 'recreation' && (
          <InspirationRecreationTab 
            results={results}
            inspirationImage={inspirationImage}
            wardrobe={wardrobe}
          />
        )}

        {mode === 'inspiration' && activeTab === 'shopping' && (
          <ShoppingTab results={results} navigateToScreen={navigateToScreen} />
        )}

        {mode === 'inspiration' && activeTab === 'similar' && (
          <SimilarLooksTab 
            results={results}
            onSaveLook={onSaveLook}
            onCopyLook={onCopyLook}
          />
        )}

        {mode === 'reverse' && (
          <GeneratedLooksTab 
            results={results}
            onSaveLook={onSaveLook}
            onCopyLook={onCopyLook}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigateToScreen('create-outfit')}
            className="bg-blue-100 text-blue-800 py-2 rounded-lg text-sm font-semibold"
          >
            Criar Outfit
          </button>
          <button
            onClick={() => navigateToScreen('smart-shopping')}
            className="bg-green-100 text-green-800 py-2 rounded-lg text-sm font-semibold"
          >
            Lista de Compras
          </button>
        </div>
      </div>
    </div>
  );
};

// Inspiration Recreation Tab
const InspirationRecreationTab = ({ results, inspirationImage, wardrobe }) => (
  <div className="space-y-4">
    {/* Original Inspiration */}
    {inspirationImage && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Inspiração Original</h3>
        <img src={inspirationImage} alt="Inspiration" className="w-full h-48 object-cover rounded-lg mb-3" />
        <div className="space-y-2 text-sm">
          <div><strong>Estilo:</strong> {results.styleAnalysis?.styleType}</div>
          <div><strong>Vibe:</strong> {results.styleAnalysis?.vibe}</div>
          <div>
            <strong>Elementos chave:</strong> 
            <div className="flex flex-wrap gap-1 mt-1">
              {results.styleAnalysis?.keyElements?.map((element, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                  {element}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Recreation with Available Pieces */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">✅ Peças que tens</h3>
      <div className="space-y-2">
        {results.recreation?.availablePieces?.map((piece, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
            <span className="text-sm font-medium">{piece.item}</span>
            <span className="text-xs text-green-700 bg-green-200 px-2 py-1 rounded">
              {piece.role}
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Missing Pieces */}
    {results.recreation?.missingPieces?.length > 0 && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">❌ Peças em falta</h3>
        <div className="space-y-2">
          {results.recreation.missingPieces.map((piece, index) => (
            <div key={index} className="p-3 bg-red-50 rounded">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium">{piece.piece}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  piece.importance === 'alta' ? 'bg-red-200 text-red-800' :
                  piece.importance === 'média' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {piece.importance}
                </span>
              </div>
              {piece.alternatives && (
                <p className="text-xs text-gray-600">Alternativas: {piece.alternatives}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Substitutions */}
    {results.recreation?.substitutions?.length > 0 && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">🔄 Substituições inteligentes</h3>
        <div className="space-y-2">
          {results.recreation.substitutions.map((sub, index) => (
            <div key={index} className="p-3 bg-blue-50 rounded">
              <div className="text-sm">
                <strong>{sub.original}</strong> → <strong>{sub.substitute}</strong>
              </div>
              <p className="text-xs text-gray-600 mt-1">{sub.reason}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Styling Tips */}
    {results.stylingTips?.length > 0 && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">💡 Dicas de Styling</h3>
        <div className="space-y-2">
          {results.stylingTips.map((tip, index) => (
            <div key={index} className="p-2 bg-yellow-50 rounded">
              <p className="text-sm text-yellow-800">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Shopping Tab
const ShoppingTab = ({ results, navigateToScreen }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">🛍️ Lista de Compras</h3>
      <div className="space-y-3">
        {results.shoppingList?.map((item, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-800">{item.item}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                item.priority === 'alta' ? 'bg-red-100 text-red-800' :
                item.priority === 'média' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {item.priority}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>💰 {item.price}</div>
              <div>📍 {item.where}</div>
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => navigateToScreen('smart-shopping')}
        className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold"
      >
        Ir à Lista de Compras Inteligente
      </button>
    </div>
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