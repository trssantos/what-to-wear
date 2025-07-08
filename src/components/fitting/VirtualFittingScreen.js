import React, { useState, useRef } from 'react';
import { ArrowLeft, Eye, Camera, Upload, Ruler, RotateCcw, Share, Download, Sparkles } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const VirtualFittingScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [bodyImage, setBodyImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedPieces, setSelectedPieces] = useState([]);
  const [fittingResult, setFittingResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [measurements, setMeasurements] = useState({
    height: '',
    chest: '',
    waist: '',
    hips: '',
    shoulders: ''
  });
  const [activeTab, setActiveTab] = useState('body');
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBodyImage(e.target.result);
        setActiveTab('select');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setBodyImage(photoDataUrl);
    setShowCamera(false);
    setActiveTab('select');
  };

  const addPieceToFitting = (piece) => {
    if (!selectedPieces.find(p => p.id === piece.id)) {
      setSelectedPieces(prev => [...prev, piece]);
    }
  };

  const removePieceFromFitting = (pieceId) => {
    setSelectedPieces(prev => prev.filter(p => p.id !== pieceId));
  };

  const performVirtualFitting = async () => {
    if (!bodyImage || selectedPieces.length === 0) {
      alert('Precisas de uma foto corporal e pelo menos uma peça selecionada');
      return;
    }

    setIsProcessing(true);
    try {
      const prompt = `Como especialista em fitting virtual e análise de proporções corporais, analisa esta imagem corporal e fornece uma avaliação detalhada de como as peças selecionadas ficariam nesta pessoa.

PEÇAS SELECIONADAS:
${selectedPieces.map(piece => `- ${piece.name} (${piece.category}, ${piece.color}${piece.brand ? ', ' + piece.brand : ''})`).join('\n')}

MEDIDAS FORNECIDAS:
${measurements.height ? `- Altura: ${measurements.height}cm` : ''}
${measurements.chest ? `- Peito: ${measurements.chest}cm` : ''}
${measurements.waist ? `- Cintura: ${measurements.waist}cm` : ''}
${measurements.hips ? `- Quadris: ${measurements.hips}cm` : ''}
${measurements.shoulders ? `- Ombros: ${measurements.shoulders}cm` : ''}

PERFIL DO UTILIZADOR:
${userProfile?.bodyShape ? `- Body Shape: ${userProfile.bodyShape}` : ''}
${userProfile?.colorSeason ? `- Estação de cor: ${userProfile.colorSeason}` : ''}

Fornece:

1. **ANÁLISE DE FIT**: Como cada peça ficaria (tamanho, comprimento, largura)
2. **COMPATIBILIDADE CORPORAL**: Adequação ao body shape
3. **RECOMENDAÇÕES DE TAMANHO**: Que tamanho escolher para cada peça
4. **STYLING TIPS**: Como usar/ajustar para melhor resultado
5. **PROBLEMAS POTENCIAIS**: O que pode não funcionar bem
6. **ALTERNATIVAS**: Sugestões de peças similares que funcionem melhor
7. **CONFIDENCE SCORE**: De 1-10 para cada peça
8. **OVERALL LOOK**: Avaliação do conjunto completo

Formato JSON:
{
  "fittingAnalysis": [
    {
      "pieceId": "id",
      "pieceName": "nome",
      "fitQuality": "Excelente|Bom|Razoável|Problemático",
      "confidenceScore": 8,
      "sizeRecommendation": "S|M|L|XL",
      "fitNotes": "como fica na pessoa",
      "problems": ["problema1", "problema2"],
      "stylingTips": ["dica1", "dica2"]
    }
  ],
  "overallAssessment": {
    "lookRating": 8,
    "colorHarmony": 9,
    "styleCoherence": 7,
    "bodyFlattering": 8,
    "summary": "resumo geral"
  },
  "recommendations": {
    "adjust": ["ajuste1", "ajuste2"],
    "alternatives": ["alternativa1", "alternativa2"],
    "accessories": ["acessório1", "acessório2"]
  }
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em fitting virtual, análise de proporções corporais e personal styling. Avalias como roupas ficariam em diferentes tipos de corpo.'
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

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setFittingResult(analysisData);
        setActiveTab('result');
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      alert('Erro no fitting virtual: ' + error.message);
    }
    setIsProcessing(false);
  };

  const generateShoppingComparison = async (piece) => {
    try {
      const prompt = `Para a peça "${piece.name}", fornece uma comparação de como ficaria em diferentes marcas/lojas considerando variações de fit e corte.

PEÇA ORIGINAL: ${piece.name} (${piece.category})

Compara com alternativas de:
- Zara
- H&M  
- Mango
- Uniqlo
- COS
- Massimo Dutti

Para cada alternativa, indica:
- Diferenças de fit/corte
- Preço aproximado
- Qualidade esperada
- Como pode ficar diferente no corpo

Formato: texto descritivo e recomendações.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em diferentes marcas de moda e como os seus fits variam.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      alert(`Comparação de marcas para ${piece.name}:\n\n${response.substring(0, 500)}...`);
    } catch (error) {
      alert('Erro na comparação: ' + error.message);
    }
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Eye className="h-16 w-16 text-cyan-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Processando fitting virtual...</h2>
          <p className="text-gray-600 mb-4">A IA está a analisar como as peças ficarão em ti</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>👤 Analisando proporções corporais...</div>
            <div>📏 Calculando fit das peças...</div>
            <div>🎨 Avaliando harmonia de cores...</div>
            <div>✨ Gerando recomendações...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-blue-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Sala de Provas Virtual</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-xl mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('body')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'body' ? 'bg-cyan-500 text-white' : 'text-gray-600'
              }`}
            >
              Corpo
            </button>
            <button
              onClick={() => setActiveTab('select')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'select' ? 'bg-cyan-500 text-white' : 'text-gray-600'
              }`}
              disabled={!bodyImage}
            >
              Selecionar
            </button>
            <button
              onClick={() => setActiveTab('fitting')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'fitting' ? 'bg-cyan-500 text-white' : 'text-gray-600'
              }`}
              disabled={selectedPieces.length === 0}
            >
              Experimentar
            </button>
            <button
              onClick={() => setActiveTab('result')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'result' ? 'bg-cyan-500 text-white' : 'text-gray-600'
              }`}
              disabled={!fittingResult}
            >
              Resultado
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'body' && (
          <BodySetupTab
            bodyImage={bodyImage}
            measurements={measurements}
            setMeasurements={setMeasurements}
            onImageUpload={handleImageUpload}
            onCameraOpen={() => setShowCamera(true)}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'select' && (
          <PieceSelectionTab
            wardrobe={wardrobe}
            selectedPieces={selectedPieces}
            onAddPiece={addPieceToFitting}
            onRemovePiece={removePieceFromFitting}
          />
        )}

        {activeTab === 'fitting' && (
          <VirtualFittingTab
            bodyImage={bodyImage}
            selectedPieces={selectedPieces}
            measurements={measurements}
            onStartFitting={performVirtualFitting}
            canvasRef={canvasRef}
          />
        )}

        {activeTab === 'result' && fittingResult && (
          <FittingResultTab
            fittingResult={fittingResult}
            selectedPieces={selectedPieces}
            bodyImage={bodyImage}
            onGenerateComparison={generateShoppingComparison}
            navigateToScreen={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
};

// Body Setup Tab
const BodySetupTab = ({ 
  bodyImage, 
  measurements, 
  setMeasurements, 
  onImageUpload, 
  onCameraOpen, 
  userProfile 
}) => (
  <div className="space-y-4">
    {/* Photo Upload */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-4">Foto Corporal</h3>
      
      {bodyImage ? (
        <div className="relative mb-4">
          <img src={bodyImage} alt="Body" className="w-full h-64 object-cover rounded-lg" />
          <button
            onClick={() => setBodyImage(null)}
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

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        💡 <strong>Dica:</strong> Usa roupa justa ou underwear para melhor precisão. 
        Mantém-te em pé, braços ligeiramente afastados do corpo.
      </div>
    </div>

    {/* Measurements */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Ruler className="h-5 w-5 text-cyan-500" />
        <h3 className="font-semibold text-gray-800">Medidas (opcional)</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
          <input
            type="number"
            value={measurements.height}
            onChange={(e) => setMeasurements(prev => ({ ...prev, height: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="170"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peito (cm)</label>
          <input
            type="number"
            value={measurements.chest}
            onChange={(e) => setMeasurements(prev => ({ ...prev, chest: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="88"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cintura (cm)</label>
          <input
            type="number"
            value={measurements.waist}
            onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="68"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quadris (cm)</label>
          <input
            type="number"
            value={measurements.hips}
            onChange={(e) => setMeasurements(prev => ({ ...prev, hips: e.target.value }))}
            className="w-full p-2 border rounded"
            placeholder="92"
          />
        </div>
      </div>
    </div>

    {/* Profile Info */}
    {userProfile && (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Perfil Existente</h3>
        <div className="space-y-2 text-sm">
          {userProfile.bodyShape && (
            <div className="flex justify-between">
              <span>Body Shape:</span>
              <span className="font-medium">{userProfile.bodyShape}</span>
            </div>
          )}
          {userProfile.colorSeason && (
            <div className="flex justify-between">
              <span>Estação de cor:</span>
              <span className="font-medium">{userProfile.colorSeason}</span>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

// Piece Selection Tab
const PieceSelectionTab = ({ wardrobe, selectedPieces, onAddPiece, onRemovePiece }) => (
  <div className="space-y-4">
    {/* Selected Pieces */}
    {selectedPieces.length > 0 && (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">
          Peças Selecionadas ({selectedPieces.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedPieces.map(piece => (
            <div key={piece.id} className="flex items-center space-x-2 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full">
              <span className="text-sm">{piece.name}</span>
              <button
                onClick={() => onRemovePiece(piece.id)}
                className="text-cyan-600 hover:text-cyan-800"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Wardrobe Grid */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">Escolher Peças</h3>
      
      {wardrobe.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {wardrobe.map(piece => {
            const isSelected = selectedPieces.find(p => p.id === piece.id);
            return (
              <div
                key={piece.id}
                onClick={() => isSelected ? onRemovePiece(piece.id) : onAddPiece(piece)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-cyan-500 bg-cyan-50' 
                    : 'border-gray-200 hover:border-cyan-300'
                }`}
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                  {piece.imageUrl ? (
                    <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <h4 className="font-medium text-gray-800 text-sm truncate">{piece.name}</h4>
                <p className="text-gray-500 text-xs">{piece.color}</p>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {piece.category}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhuma peça no armário</p>
        </div>
      )}
    </div>
  </div>
);

// Virtual Fitting Tab
const VirtualFittingTab = ({ bodyImage, selectedPieces, measurements, onStartFitting, canvasRef }) => (
  <div className="space-y-4">
    {/* Preview */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">Preview</h3>
      
      <div className="relative">
        {bodyImage && (
          <img src={bodyImage} alt="Body" className="w-full h-64 object-cover rounded-lg opacity-80" />
        )}
        
        {/* Virtual overlay would go here */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-64 rounded-lg"
          style={{ mixBlendMode: 'multiply' }}
        />
      </div>
      
      <div className="mt-3 text-sm text-gray-600">
        <strong>Peças selecionadas:</strong> {selectedPieces.map(p => p.name).join(', ')}
      </div>
    </div>

    {/* Fitting Options */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">Opções de Fitting</h3>
      
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-1">Análise Inteligente</h4>
          <p className="text-sm text-blue-700">
            A IA vai analisar como cada peça fica no teu tipo de corpo
          </p>
        </div>
        
        <div className="p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 mb-1">Recomendações de Tamanho</h4>
          <p className="text-sm text-green-700">
            Sugestões de que tamanho escolher para cada peça
          </p>
        </div>
        
        <div className="p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-1">Dicas de Styling</h4>
          <p className="text-sm text-purple-700">
            Como ajustar e combinar para melhor resultado
          </p>
        </div>
      </div>
      
      <button
        onClick={onStartFitting}
        disabled={!bodyImage || selectedPieces.length === 0}
        className="w-full mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
      >
        Iniciar Fitting Virtual
      </button>
    </div>
  </div>
);

// Fitting Result Tab
const FittingResultTab = ({ 
  fittingResult, 
  selectedPieces, 
  bodyImage, 
  onGenerateComparison, 
  navigateToScreen 
}) => {
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'Excelente': return 'bg-green-100 text-green-800';
      case 'Bom': return 'bg-blue-100 text-blue-800';
      case 'Razoável': return 'bg-yellow-100 text-yellow-800';
      case 'Problemático': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Overall Assessment */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Avaliação Geral</h3>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600">
              {fittingResult.overallAssessment.lookRating}/10
            </div>
            <div className="text-sm text-gray-600">Look Geral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {fittingResult.overallAssessment.bodyFlattering}/10
            </div>
            <div className="text-sm text-gray-600">Favorece Corpo</div>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Harmonia de cores:</span>
            <span className="font-medium">{fittingResult.overallAssessment.colorHarmony}/10</span>
          </div>
          <div className="flex justify-between">
            <span>Coerência de estilo:</span>
            <span className="font-medium">{fittingResult.overallAssessment.styleCoherence}/10</span>
          </div>
        </div>
        
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{fittingResult.overallAssessment.summary}</p>
        </div>
      </div>

      {/* Individual Piece Analysis */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Análise por Peça</h3>
        
        <div className="space-y-3">
          {fittingResult.fittingAnalysis.map((analysis, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-800">{analysis.pieceName}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${getQualityColor(analysis.fitQuality)}`}>
                    {analysis.fitQuality}
                  </span>
                  <span className="text-sm font-bold text-cyan-600">
                    {analysis.confidenceScore}/10
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Tamanho recomendado:</strong> {analysis.sizeRecommendation}
                </div>
                <div>
                  <strong>Como fica:</strong> {analysis.fitNotes}
                </div>
                
                {analysis.problems.length > 0 && (
                  <div>
                    <strong className="text-red-700">Problemas:</strong>
                    <ul className="list-disc list-inside text-red-600 ml-2">
                      {analysis.problems.map((problem, i) => (
                        <li key={i}>{problem}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.stylingTips.length > 0 && (
                  <div>
                    <strong className="text-blue-700">Dicas:</strong>
                    <ul className="list-disc list-inside text-blue-600 ml-2">
                      {analysis.stylingTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => onGenerateComparison(selectedPieces.find(p => p.id === analysis.pieceId))}
                className="mt-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
              >
                Comparar Marcas
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Recomendações</h3>
        
        <div className="space-y-3">
          {fittingResult.recommendations.adjust.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-700 mb-1">🔧 Ajustes:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
                {fittingResult.recommendations.adjust.map((adjust, i) => (
                  <li key={i}>{adjust}</li>
                ))}
              </ul>
            </div>
          )}
          
          {fittingResult.recommendations.alternatives.length > 0 && (
            <div>
              <h4 className="font-medium text-orange-700 mb-1">🔄 Alternativas:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
                {fittingResult.recommendations.alternatives.map((alt, i) => (
                  <li key={i}>{alt}</li>
                ))}
              </ul>
            </div>
          )}
          
          {fittingResult.recommendations.accessories.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-700 mb-1">✨ Acessórios:</h4>
              <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
                {fittingResult.recommendations.accessories.map((acc, i) => (
                  <li key={i}>{acc}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="space-y-3">
          <button
            onClick={() => navigateToScreen('smart-shopping')}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold"
          >
            Ir às Compras
          </button>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigator.share && navigator.share({
                title: 'Meu Virtual Fitting',
                text: `Experimentei ${selectedPieces.length} peças virtualmente!`
              })}
              className="bg-blue-100 text-blue-800 py-2 rounded-lg font-semibold"
            >
              <Share className="h-4 w-4 inline mr-1" />
              Partilhar
            </button>
            <button
              onClick={() => {
                // Restart fitting
                window.location.reload();
              }}
              className="bg-gray-100 text-gray-800 py-2 rounded-lg font-semibold"
            >
              <RotateCcw className="h-4 w-4 inline mr-1" />
              Recomeçar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualFittingScreen;