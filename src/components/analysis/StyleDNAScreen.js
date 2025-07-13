import React, { useState, useRef } from 'react';
import { ArrowLeft, Dna, Share, Download, Sparkles, Star, Palette } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const StyleDNAScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [styleDNA, setStyleDNA] = useState(null);
  const [activeTab, setActiveTab] = useState('dna');
  const dnaRef = useRef(null);

  const celebrities = [
    { name: 'Emma Stone', style: 'Classic Chic' },
    { name: 'Zendaya', style: 'Bold Trendsetter' },
    { name: 'Taylor Swift', style: 'Feminine Romantic' },
    { name: 'Rihanna', style: 'Edgy Fashion Forward' },
    { name: 'Kate Middleton', style: 'Elegant Timeless' },
    { name: 'Blake Lively', style: 'Glamorous Sophisticated' },
    { name: 'Emma Watson', style: 'Minimalist Modern' },
    { name: 'Gigi Hadid', style: 'Street Style Cool' }
  ];

  const generateStyleDNA = async () => {
    setIsGenerating(true);
    try {
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
  PERFIL DO UTILIZADOR:
  - Gênero: ${userProfile.gender}
  
  ANÁLISE ESPECÍFICA POR GÊNERO:
  ${userProfile.gender === 'female' ? `
  - CELEBRITY MATCHES: Focar em celebridades femininas com estilos similares
  - STYLE TRAITS: Incluir características femininas como elegância, feminilidade, versatilidade
  - ACESSÓRIOS: Considerar joias, maquilhagem, sapatos femininos na análise
  - STYLE EVOLUTION: Tendências femininas e como adaptar o estilo
  ` : userProfile.gender === 'male' ? `
  - CELEBRITY MATCHES: Focar em celebridades masculinas com estilos similares  
  - STYLE TRAITS: Incluir características masculinas como sophistication, masculinidade
  - ACESSÓRIOS: Considerar relógios, cintos, sapatos masculinos na análise
  - STYLE EVOLUTION: Tendências masculinas e grooming na evolução do estilo
  ` : `
  - CELEBRITY MATCHES: Incluir celebridades de diferentes expressões de gênero
  - STYLE TRAITS: Características neutras e inclusivas
  - ACESSÓRIOS: Considerar acessórios versáteis e neutros
  `}
  ` : '';
  
      const prompt = `Como especialista em análise de estilo pessoal, cria um "Style DNA" único e viral para esta pessoa baseado no seu armário e outfits.
  
  ${genderContext}
  
  ARMÁRIO (${wardrobe.length} peças):
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  OUTFITS CRIADOS (${outfits.length}):
  ${outfits.map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'})`).join('\n')}
  
  PERFIL EXISTENTE:
  - Estação de cor: ${userProfile?.colorSeason || 'N/A'}
  - Body shape: ${userProfile?.bodyShape || 'N/A'}
  
  Cria um Style DNA completo e partilhável com:
  
  1. **DNA IDENTIFIER**: Código único tipo "STYLE-DNA-XXXX"
  2. **STYLE ARCHETYPE**: Nome criativo do estilo considerando o gênero (ex: "Minimalist Powerhouse", "Boho Maximalist")
  3. **DNA HELIXES**: 6 características principais que definem o estilo baseadas no gênero
  4. **STYLE PERCENTAGE**: Breakdown por categorias (ex: 40% Classic, 30% Trendy, 20% Boho, 10% Edgy)
  5. **COLOR SIGNATURE**: 5 cores dominantes extraídas do armário
  6. **CELEBRITY MATCHES**: Top 3 celebridades do mesmo gênero com estilo similar (com % compatibilidade)
  7. **STYLE TRAITS**: 8 características únicas do estilo pessoal adaptadas ao gênero
  8. **FASHION FUTURE**: Previsão de evolução do estilo considerando tendências do gênero
  9. **STYLE MOTTO**: Frase que define a abordagem à moda
  10. **SIGNATURE ACCESSORIES**: Acessórios essenciais baseados no gênero
  11. **STYLE POWER SCORE**: Score de 1-100 da força do estilo pessoal
  12. **WARDROBE EFFICIENCY**: Análise da eficiência atual do armário
  
  FORMATO: Texto viral e partilhável, como se fosse um perfil de rede social. Usa emojis e linguagem cativante.
  Foca na personalidade única de cada gênero e como o estilo reflete isso.
  
  Faz isto parecer um resultado de teste de personalidade super cool que a pessoa vai querer partilhar!`;
  
      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um especialista em análise de estilo e criação de conteúdo viral. Crias perfis de estilo únicos e partilháveis que capturam a essência da personalidade de moda de cada pessoa, adaptados ao seu gênero.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
  
      setStyleDNA(response);
    } catch (error) {
      console.error('Error generating Style DNA:', error);
      alert('Erro ao gerar Style DNA. Tenta novamente.');
    }
    setIsGenerating(false);
  };

  const shareStyleDNA = async () => {
    if (navigator.share && styleDNA) {
      try {
        await navigator.share({
          title: `Meu Style DNA: ${styleDNA.archetype}`,
          text: `Descobri o meu Style DNA! Sou ${styleDNA.archetype} com ${styleDNA.styleBreakdown.Classic || 0}% Classic e ${styleDNA.styleBreakdown.Trendy || 0}% Trendy. Motto: "${styleDNA.styleMotto}"`,
          url: window.location.href
        });
      } catch (err) {
        // Fallback para copy to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = `🧬 MEU STYLE DNA 🧬\n\nArchetype: ${styleDNA.archetype}\nDNA ID: ${styleDNA.dnaId}\n\nStyle Breakdown:\n${Object.entries(styleDNA.styleBreakdown).map(([key, value]) => `${key}: ${value}%`).join('\n')}\n\nMotto: "${styleDNA.styleMotto}"\n\nDescoberto com What to Wear - IA Fashion Assistant`;
    
    navigator.clipboard.writeText(text);
    alert('Style DNA copiado para clipboard!');
  };

  const downloadDNA = () => {
    // Create a downloadable image/PDF of the Style DNA
    // This would require html2canvas or similar library
    alert('Download feature coming soon!');
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Dna className="h-16 w-16 text-emerald-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Criando o teu Style DNA...</h2>
          <p className="text-gray-600 mb-4">A IA está a analisar o teu estilo único</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>🧬 Sequenciando DNA de estilo...</div>
            <div>🎨 Analisando paleta de cores...</div>
            <div>✨ Identificando traits únicos...</div>
            <div>🌟 Comparando com celebrities...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-teal-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Style DNA</h1>
        </div>

        {!styleDNA ? (
          <InitialPrompt 
            wardrobe={wardrobe}
            outfits={outfits}
            onGenerate={generateStyleDNA}
          />
        ) : (
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('dna')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    activeTab === 'dna'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600'
                  }`}
                >
                  DNA Profile
                </button>
                <button
                  onClick={() => setActiveTab('compare')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    activeTab === 'compare'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600'
                  }`}
                >
                  Celebrity Match
                </button>
                <button
                  onClick={() => setActiveTab('share')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    activeTab === 'share'
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-600'
                  }`}
                >
                  Share
                </button>
              </div>
            </div>

            {activeTab === 'dna' && (
              <DNAProfileTab styleDNA={styleDNA} dnaRef={dnaRef} />
            )}

            {activeTab === 'compare' && (
              <CelebrityMatchTab styleDNA={styleDNA} />
            )}

            {activeTab === 'share' && (
              <ShareTab 
                styleDNA={styleDNA}
                onShare={shareStyleDNA}
                onDownload={downloadDNA}
                navigateToScreen={navigateToScreen}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Initial Prompt Component
const InitialPrompt = ({ wardrobe, outfits, onGenerate }) => (
  <div className="bg-white rounded-2xl p-6 shadow-xl">
    <div className="text-center mb-6">
      <Dna className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Descobre o Teu Style DNA</h2>
      <p className="text-gray-600">Cria o teu perfil de estilo único e partilhável</p>
    </div>

    <div className="space-y-4 mb-6">
      <div className="p-4 bg-emerald-50 rounded-lg">
        <h3 className="font-semibold text-emerald-800 mb-2">O que vais descobrir:</h3>
        <ul className="text-sm text-emerald-700 space-y-1">
          <li>🧬 O teu arquétipo de estilo único</li>
          <li>🎨 Assinatura de cores personalizada</li>
          <li>⭐ Compatibilidade com celebridades</li>
          <li>📊 Breakdown detalhado do teu estilo</li>
          <li>🔮 Previsão da evolução do teu estilo</li>
          <li>💫 Infográfico partilhável</li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{wardrobe.length}</div>
          <div className="text-sm text-gray-600">Peças no Armário</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">{outfits.length}</div>
          <div className="text-sm text-gray-600">Outfits Criados</div>
        </div>
      </div>
    </div>

    <button
      onClick={onGenerate}
      disabled={wardrobe.length === 0}
      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {wardrobe.length === 0 ? 'Adiciona peças ao armário primeiro' : 'Gerar Style DNA'}
    </button>
  </div>
);

// DNA Profile Tab
const DNAProfileTab = ({ styleDNA, dnaRef }) => (
  <div ref={dnaRef} className="space-y-4">
    {/* DNA Header */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <Dna className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{styleDNA.archetype}</h2>
        <p className="text-gray-600 text-sm mb-2">{styleDNA.description}</p>
        <div className="bg-gray-100 rounded-lg p-2 inline-block">
          <span className="text-xs font-mono text-gray-700">ID: {styleDNA.dnaId}</span>
        </div>
      </div>
    </div>

    {/* DNA Helixes */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">DNA Helixes</h3>
      <div className="grid grid-cols-2 gap-2">
        {styleDNA.helixes.map((helix, index) => (
          <div key={index} className="p-3 bg-emerald-50 rounded-lg text-center">
            <div className="font-semibold text-emerald-800 text-sm">{helix}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Style Breakdown */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Style Breakdown</h3>
      <div className="space-y-3">
        {Object.entries(styleDNA.styleBreakdown).map(([style, percentage]) => (
          <div key={style}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{style}</span>
              <span className="text-sm text-gray-600">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Color Signature */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Color Signature</h3>
      <div className="flex justify-center space-x-2">
        {styleDNA.colorSignature.map((color, index) => (
          <div
            key={index}
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>

    {/* Style Traits */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Style Traits</h3>
      <div className="flex flex-wrap gap-2">
        {styleDNA.styleTraits.map((trait, index) => (
          <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
            {trait}
          </span>
        ))}
      </div>
    </div>

    {/* Style Motto */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <div className="text-center">
        <Sparkles className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
        <h3 className="font-bold text-gray-800 mb-2">Style Motto</h3>
        <p className="text-lg font-italic text-gray-700 italic">"{styleDNA.styleMotto}"</p>
      </div>
    </div>

    {/* Fashion Future */}
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Fashion Future</h3>
      <p className="text-gray-700 text-sm">{styleDNA.fashionFuture}</p>
    </div>
  </div>
);

// Celebrity Match Tab
const CelebrityMatchTab = ({ styleDNA }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Celebrity Style Matches</h3>
      <div className="space-y-4">
        {styleDNA.celebrityMatches.map((celeb, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-800">{celeb.name}</h4>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(celeb.compatibility / 20) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">{celeb.compatibility}% match</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700">{celeb.reason}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Shareable Stats</h3>
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(styleDNA.shareableStats).map(([key, value]) => (
          <div key={key} className="p-3 bg-gray-50 rounded-lg text-center">
            <div className="font-bold text-emerald-600">{value}</div>
            <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Share Tab
const ShareTab = ({ styleDNA, onShare, onDownload, navigateToScreen }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-4 text-center">Partilha o Teu Style DNA</h3>
      
      <div className="space-y-3">
        <button
          onClick={onShare}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
        >
          <Share className="h-5 w-5" />
          <span>Partilhar</span>
        </button>
        
        <button
          onClick={onDownload}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
        >
          <Download className="h-5 w-5" />
          <span>Download Infográfico</span>
        </button>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Quick Share Text</h3>
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700 mb-2">
          🧬 Descobri o meu Style DNA! Sou <strong>{styleDNA.archetype}</strong> com {Object.entries(styleDNA.styleBreakdown)[0][1]}% {Object.entries(styleDNA.styleBreakdown)[0][0]}.
        </p>
        <p className="text-sm text-gray-700">
          Motto: "<em>{styleDNA.styleMotto}</em>"
        </p>
      </div>
    </div>

    <div className="bg-white rounded-2xl p-6 shadow-xl">
      <h3 className="font-bold text-gray-800 mb-3">Explorar Mais</h3>
      <div className="space-y-2">
        <button
          onClick={() => navigateToScreen('color-analysis')}
          className="w-full bg-pink-100 text-pink-800 py-2 rounded-lg text-sm font-semibold"
        >
          Análise de Cores
        </button>
        <button
          onClick={() => navigateToScreen('body-shape-analysis')}
          className="w-full bg-indigo-100 text-indigo-800 py-2 rounded-lg text-sm font-semibold"
        >
          Body Shape Analysis
        </button>
        <button
          onClick={() => navigateToScreen('style-twin-finder')}
          className="w-full bg-orange-100 text-orange-800 py-2 rounded-lg text-sm font-semibold"
        >
          Style Twin Finder
        </button>
      </div>
    </div>
  </div>
);

export default StyleDNAScreen;