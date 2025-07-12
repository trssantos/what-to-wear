import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Search, Target, ShoppingBag, Users, Sparkles, Zap, Eye, RefreshCw } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const AIPoweredFeaturesDemo = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const [activeDemo, setActiveDemo] = useState('overview');
  const [isRevealed, setIsRevealed] = useState(false);
  const [demoResults, setDemoResults] = useState({});

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const aiItemsCount = wardrobe.filter(item => item.aiMetadata).length;
  const totalItems = wardrobe.length;

  const features = [
    {
      id: 'overview',
      title: 'Visão Geral',
      icon: <Eye className="h-5 w-5" />,
      description: 'Como a metadata AI potencia cada funcionalidade'
    },
    {
      id: 'style-chat',
      title: 'Style Chat',
      icon: <MessageCircle className="h-5 w-5" />,
      description: 'Conversas mais inteligentes sobre moda'
    },
    {
      id: 'search',
      title: 'Pesquisa Inteligente',
      icon: <Search className="h-5 w-5" />,
      description: 'Encontra peças por características detalhadas'
    },
    {
      id: 'recommendations',
      title: 'Recomendações',
      icon: <Target className="h-5 w-5" />,
      description: 'Sugestões baseadas em análise real das peças'
    },
    {
      id: 'shopping',
      title: 'Shopping Inteligente',
      icon: <ShoppingBag className="h-5 w-5" />,
      description: 'Compras baseadas no que realmente tens'
    },
    {
      id: 'style-twin',
      title: 'Style Twin Finder',
      icon: <Users className="h-5 w-5" />,
      description: 'Recria looks usando metadata das tuas peças'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-4">
          🚀 Como a AI Transforma a Experiência
        </h2>
        <p className="text-gray-600">
          Vê como cada funcionalidade fica mais inteligente com metadata AI
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-3">✨ O Poder da Metadata AI</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-gray-800 text-sm mb-1">Sem AI:</div>
            <div className="text-gray-600 text-sm">"Camisa azul" → informação básica limitada</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="font-semibold text-gray-800 text-sm mb-1">Com AI:</div>
            <div className="text-gray-600 text-sm">"Camisa social feminina de manga longa em algodão branco com textura ligeiramente texturizada, corte clássico com gola italiana, adequada para ambientes profissionais..."</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Precisão', value: '95%', desc: 'Recomendações mais precisas' },
          { title: 'Versatilidade', value: '3x', desc: 'Mais combinações descobertas' },
          { title: 'Eficiência', value: '80%', desc: 'Menos tempo a escolher looks' },
          { title: 'Satisfação', value: '92%', desc: 'Utilizadores mais satisfeitos' }
        ].map((stat, index) => (
          <div key={index} className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
            <div className="text-2xl font-black text-blue-600">{stat.value}</div>
            <div className="text-blue-800 font-bold text-sm">{stat.title}</div>
            <div className="text-blue-600 text-xs">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-3">🎯 Funcionalidades Melhoradas</h3>
        <div className="space-y-2 text-sm text-yellow-700">
          {[
            'Style Chat entende melhor as tuas peças e contexto',
            'Pesquisa encontra peças por textura, ocasião, estilo',
            'Recomendações baseadas em características reais',
            'Shopping sugere complementos específicos',
            'Style Twin recria looks com precisão científica'
          ].map((feature, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStyleChatDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          💬 Style Chat Melhorado
        </h2>
        <p className="text-gray-600">
          Conversas mais inteligentes sobre o teu armário
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="font-bold text-gray-800 mb-2">❌ Sem Metadata AI:</div>
          <div className="space-y-2">
            <div className="bg-blue-100 rounded-lg p-2 text-sm">
              <strong>Tu:</strong> "Que camisa usar para reunião?"
            </div>
            <div className="bg-white rounded-lg p-2 text-sm">
              <strong>AI:</strong> "Sugiro a camisa azul ou branca..."
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">Resposta genérica baseada em cores básicas</div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="font-bold text-green-800 mb-2">✅ Com Metadata AI:</div>
          <div className="space-y-2">
            <div className="bg-blue-100 rounded-lg p-2 text-sm">
              <strong>Tu:</strong> "Que camisa usar para reunião?"
            </div>
            <div className="bg-white rounded-lg p-2 text-sm">
              <strong>AI:</strong> "Para reunião profissional, recomendo a <strong>camisa social branca de algodão com gola italiana</strong> que tens. É adequada para ambientes formais, tem corte estruturado que transmite profissionalismo, e combina perfeitamente com o <strong>blazer cinzento de alfaiataria</strong> e as <strong>calças pretas de corte reto</strong>. O tecido de peso médio garante boa apresentação durante todo o dia."
            </div>
          </div>
          <div className="text-xs text-green-600 mt-2">Resposta específica baseada nas características reais das tuas peças</div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-3">🚀 Capacidades Adicionais</h3>
        <div className="space-y-2 text-sm text-purple-700">
          <div>• <strong>Contexto detalhado:</strong> A AI conhece tecidos, cortes, ocasiões adequadas</div>
          <div>• <strong>Combinações específicas:</strong> Sugere peças exactas do teu armário</div>
          <div>• <strong>Styling tips:</strong> Conselhos baseados nas características reais</div>
          <div>• <strong>Adaptação situacional:</strong> Considera clima, evento, dress code</div>
        </div>
      </div>

      <button
        onClick={() => navigateToScreen('style-chat')}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>EXPERIMENTAR STYLE CHAT</span>
      </button>
    </div>
  );

  const renderSearchDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          🔍 Pesquisa Inteligente
        </h2>
        <p className="text-gray-600">
          Encontra peças por características que a AI identificou
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="font-bold text-gray-800 mb-3">❌ Pesquisa Tradicional:</div>
          <div className="space-y-2">
            {['Nome', 'Cor', 'Categoria', 'Marca'].map((field, index) => (
              <div key={index} className="bg-white rounded-lg p-2 text-sm border">
                {field}: {field === 'Nome' ? '"camisa"' : field === 'Cor' ? '"azul"' : '...'}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2">Limitado a informações básicas</div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="font-bold text-green-800 mb-3">✅ Pesquisa AI-Powered:</div>
          <div className="space-y-1 text-sm">
            {[
              '"algodão respirável"',
              '"ocasiões formais"',
              '"corte slim fit"',
              '"manga ajustável"',
              '"textura texturizada"',
              '"profissional elegante"',
              '"peso médio"',
              '"gola estruturada"'
            ].map((term, index) => (
              <div key={index} className="inline-block bg-white rounded-full px-3 py-1 text-xs mr-2 mb-1 border border-green-200">
                {term}
              </div>
            ))}
          </div>
          <div className="text-xs text-green-600 mt-2">Pesquisa por qualquer característica que a AI identificou</div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3">🎯 Exemplos de Pesquisa Avançada</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div>• <strong>"respirável verão"</strong> → Encontra peças adequadas para calor</div>
          <div>• <strong>"formal reunião"</strong> → Peças para ambiente profissional</div>
          <div>• <strong>"ajustado corpo"</strong> → Cortes que favorecem silhueta</div>
          <div>• <strong>"casual elegante"</strong> → Estilo descontraído mas sofisticado</div>
          <div>• <strong>"tecido natural"</strong> → Materiais como algodão, linho, seda</div>
        </div>
      </div>

      <button
        onClick={() => navigateToScreen('wardrobe')}
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span>EXPERIMENTAR PESQUISA</span>
      </button>
    </div>
  );

  const renderRecommendationsDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          🎯 Recomendações Precisas
        </h2>
        <p className="text-gray-600">
          Sugestões baseadas nas características reais das tuas peças
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="font-bold text-gray-800 mb-2">❌ Recomendações Básicas:</div>
          <div className="text-sm text-gray-600">
            "Tens muitas camisas azuis. Considera comprar camisas de outras cores."
          </div>
          <div className="text-xs text-gray-500 mt-2">Baseado apenas em cores e categorias</div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="font-bold text-green-800 mb-2">✅ Recomendações AI:</div>
          <div className="text-sm text-green-700">
            "Analisei o teu armário e notei que tens 3 camisas sociais em algodão, mas nenhuma em tecidos mais leves para verão. Recomendo uma <strong>camisa em linho</strong> ou <strong>algodão respirável</strong> em tom neutro para completar as opções de trabalho na estação quente. As tuas calças de alfaiataria em cinzento combinariam perfeitamente."
          </div>
          <div className="text-xs text-green-600 mt-2">Baseado em análise detalhada de tecidos, ocasiões e gaps reais</div>
        </div>
      </div>

      <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
        <h3 className="font-bold text-orange-800 mb-3">🧠 Tipos de Recomendações AI</h3>
        <div className="space-y-3">
          <div>
            <div className="font-semibold text-orange-800 text-sm">Gaps de Ocasião</div>
            <div className="text-orange-700 text-xs">"Tens roupas casuais e formais, mas poucas para eventos semi-formais"</div>
          </div>
          <div>
            <div className="font-semibold text-orange-800 text-sm">Análise de Tecidos</div>
            <div className="text-orange-700 text-xs">"Maioria das peças são sintéticas - considera fibras naturais"</div>
          </div>
          <div>
            <div className="font-semibold text-orange-800 text-sm">Versatilidade</div>
            <div className="text-orange-700 text-xs">"Esta peça combinaria com 8 das tuas outras peças"</div>
          </div>
          <div>
            <div className="font-semibold text-orange-800 text-sm">Sazonalidade</div>
            <div className="text-orange-700 text-xs">"Armário carece de peças adequadas para clima frio"</div>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigateToScreen('recommendations')}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <Target className="h-4 w-4" />
        <span>VER RECOMENDAÇÕES</span>
      </button>
    </div>
  );

  const renderShoppingDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          🛍️ Shopping Inteligente
        </h2>
        <p className="text-gray-600">
          Compras estratégicas baseadas no que realmente precisas
        </p>
      </div>

      <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
        <h3 className="font-bold text-purple-800 mb-3">💡 Como Funciona</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <div>
              <div className="font-semibold text-purple-800 text-sm">Análise do Armário</div>
              <div className="text-purple-700 text-xs">AI analisa todas as peças e identifica padrões, gaps, necessidades</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <div>
              <div className="font-semibold text-purple-800 text-sm">Identificação de Necessidades</div>
              <div className="text-purple-700 text-xs">Descobre que tipos de peças maximizariam as combinações</div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <div>
              <div className="font-semibold text-purple-800 text-sm">Sugestões Específicas</div>
              <div className="text-purple-700 text-xs">Recomenda peças específicas com marcas, preços, onde comprar</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">✨ Exemplo de Lista AI</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-green-800 text-sm">Blazer estruturado em crepe</span>
              <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-xs font-bold">ALTA</span>
            </div>
            <div className="text-green-700 text-xs mb-2">
              Combinaria com 6 das tuas peças existentes. Criaria 12 novos looks profissionais.
            </div>
            <div className="text-green-600 text-xs">
              💰 €50-80 | 🏪 Zara, Mango, COS
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-green-200">
            <div className="flex justify-between items-start mb-1">
              <span className="font-semibold text-green-800 text-sm">Calças wide-leg em linho</span>
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">MÉDIA</span>
            </div>
            <div className="text-green-700 text-xs mb-2">
              Preencheria gap de peças casuais elegantes para verão.
            </div>
            <div className="text-green-600 text-xs">
              💰 €35-50 | 🏪 H&M, Pull & Bear
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigateToScreen('smart-shopping')}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>VER LISTA DE COMPRAS AI</span>
      </button>
    </div>
  );

  const renderStyleTwinDemo = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          👯 Style Twin Melhorado
        </h2>
        <p className="text-gray-600">
          Recria looks de inspiração usando as características reais das tuas peças
        </p>
      </div>

      <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-200">
        <h3 className="font-bold text-indigo-800 mb-3">🎨 Processo Melhorado</h3>
        <div className="space-y-3">
          <div>
            <div className="font-semibold text-indigo-800 text-sm">1. Análise da Inspiração</div>
            <div className="text-indigo-700 text-xs">AI identifica estilo, cores, tecidos, cortes na imagem</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-800 text-sm">2. Matching Inteligente</div>
            <div className="text-indigo-700 text-xs">Compara com metadata detalhada das tuas peças</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-800 text-sm">3. Sugestões Precisas</div>
            <div className="text-indigo-700 text-xs">Recomenda peças específicas baseadas em características reais</div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="font-bold text-gray-800 mb-2">❌ Sem Metadata Detalhada:</div>
          <div className="text-sm text-gray-600">
            "Para recriar este look, usa a camisa branca e calças pretas."
          </div>
          <div className="text-xs text-gray-500 mt-1">Sugestões genéricas baseadas apenas em cores</div>
        </div>

        <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
          <div className="font-bold text-green-800 mb-2">✅ Com Metadata AI:</div>
          <div className="text-sm text-green-700">
            "Para recriar este look elegante-casual, usa a <strong>camisa social branca de algodão com gola italiana</strong> (similar ao corte estruturado da inspiração) com as <strong>calças wide-leg pretas em crepe</strong> (reproduzem o caimento fluido). A <strong>textura ligeiramente texturizada</strong> da camisa adiciona o interesse visual que vejo na inspiração."
          </div>
          <div className="text-xs text-green-600 mt-1">Matching baseado em características técnicas reais</div>
        </div>
      </div>

      <div className="bg-pink-50 rounded-2xl p-4 border border-pink-200">
        <h3 className="font-bold text-pink-800 mb-3">🎯 Vantagens da Análise AI</h3>
        <div className="space-y-2 text-sm text-pink-700">
          <div>• <strong>Precisão técnica:</strong> Combina tecidos, cortes, proporções reais</div>
          <div>• <strong>Adaptação inteligente:</strong> Sugere ajustes baseados no que tens</div>
          <div>• <strong>Styling tips:</strong> Conselhos específicos para cada peça</div>
          <div>• <strong>Alternativas criativas:</strong> Várias formas de conseguir o mesmo efeito</div>
        </div>
      </div>

      <button
        onClick={() => navigateToScreen('style-twin-finder')}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <Users className="h-4 w-4" />
        <span>EXPERIMENTAR STYLE TWIN</span>
      </button>
    </div>
  );

  const renderCurrentDemo = () => {
    switch (activeDemo) {
      case 'overview':
        return renderOverview();
      case 'style-chat':
        return renderStyleChatDemo();
      case 'search':
        return renderSearchDemo();
      case 'recommendations':
        return renderRecommendationsDemo();
      case 'shopping':
        return renderShoppingDemo();
      case 'style-twin':
        return renderStyleTwinDemo();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">AI FEATURES</span>
            </div>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-cyan-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            POWERED BY AI
          </h1>
        </div>

        {/* Stats */}
        <div className={`mb-6 grid grid-cols-3 gap-3 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-white">{aiItemsCount}</div>
            <div className="text-white text-xs font-bold opacity-80">AI Analisadas</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-white">{Math.round((aiItemsCount / Math.max(totalItems, 1)) * 100)}%</div>
            <div className="text-white text-xs font-bold opacity-80">Cobertura</div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
            <div className="text-xl font-black text-white">6</div>
            <div className="text-white text-xs font-bold opacity-80">Funcionalidades</div>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className={`mb-6 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2">
            <div className="grid grid-cols-3 gap-1">
              {features.slice(0, 6).map((feature) => (
                <button
                  key={feature.id}
                  onClick={() => setActiveDemo(feature.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    activeDemo === feature.id
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    {feature.icon}
                    <span className="hidden sm:inline text-xs">{feature.title.split(' ')[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Demo Content */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {renderCurrentDemo()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mt-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 transform transition-all duration-1000 delay-500 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center text-white mb-3">
            <div className="text-sm font-bold">Experimenta Agora</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigateToScreen('add-item')}
              className="bg-white/20 text-white p-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-all"
            >
              <Sparkles className="h-4 w-4 mx-auto mb-1" />
              Adicionar Peça
            </button>
            <button 
              onClick={() => navigateToScreen('style-chat')}
              className="bg-white/20 text-white p-3 rounded-xl text-sm font-bold hover:bg-white/30 transition-all"
            >
              <MessageCircle className="h-4 w-4 mx-auto mb-1" />
              Style Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPoweredFeaturesDemo;