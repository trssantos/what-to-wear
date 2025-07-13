import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bot, Send, ShoppingBag, Euro, Target, MapPin, Clock, Heart, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const PersonalShopperScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: '👋 Olá! Sou a tua personal shopper com IA. Posso ajudar-te a encontrar as peças perfeitas baseadas no teu estilo, orçamento e necessidades específicas. Em que posso ajudar hoje?',
      timestamp: new Date(),
      suggestions: [
        'Preciso de algo para uma entrevista de trabalho',
        'Quero renovar o meu guarda-roupa de verão',
        'Procuro peças versáteis para o dia-a-dia',
        'Tenho um orçamento de 200€ para gastar'
      ]
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState({ min: '', max: '' });
  const [preferences, setPreferences] = useState({
    occasion: '',
    style: '',
    urgency: '',
    stores: []
  });
  const [shoppingSession, setShoppingSession] = useState({
    isActive: false,
    items: [],
    totalBudget: 0,
    spent: 0
  });
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText, messageImage = null) => {
    if (!messageText.trim() && !messageImage) return;
  
    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      image: messageImage,
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);
  
    try {
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
  PERFIL DO UTILIZADOR:
  - Gênero: ${userProfile.gender}
  
  RECOMENDAÇÕES ESPECÍFICAS POR GÊNERO:
  ${userProfile.gender === 'female' ? `
  - PRIORIZAR: Roupas femininas, acessórios como brincos, colares, pulseiras, anéis
  - INCLUIR: Produtos de maquilhagem, cuidados de cabelo femininos, sapatos femininos
  - SUGERIR: Joias, carteiras femininas, lenços, vestidos, saias, tops femininos
  - MARCAS: Focar em marcas com boas opções femininas
  - STYLING: Dicas de como usar peças femininas, layering feminino
  ` : userProfile.gender === 'male' ? `
  - PRIORIZAR: Roupas masculinas, acessórios como relógios, cintos, sapatos formais
  - INCLUIR: Produtos de grooming masculino, cuidados de cabelo masculinos
  - SUGERIR: Relógios, cintos de couro, carteiras masculinas, camisas, calças, blazers
  - MARCAS: Focar em marcas com boas opções masculinas
  - STYLING: Dicas de styling masculino, dress codes profissionais
  ` : `
  - ADAPTAR: Recomendações neutras e inclusivas
  - INCLUIR: Peças versáteis adequadas a qualquer expressão de gênero
  - SUGERIR: Acessórios neutros e opções inclusivas
  `}
  ` : '';
  
      const systemContext = `És uma personal shopper expert e consultora de moda. Ajudas pessoas a encontrar as peças perfeitas considerando o seu estilo, orçamento e necessidades específicas baseadas no gênero.
  
  ${genderContext}
  
  INFORMAÇÕES DO CLIENTE:
  ARMÁRIO ATUAL (${wardrobe.length} peças):
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  PERFIL:
  ${userProfile ? `
  - Estação de cor: ${userProfile.colorSeason || 'N/A'}
  - Body shape: ${userProfile.bodyShape || 'N/A'}
  - Última análise: ${userProfile.analyzedAt || 'N/A'}
  ` : 'Perfil não disponível'}
  
  PREFERÊNCIAS ATUAIS:
  - Orçamento: ${budget.min && budget.max ? `€${budget.min}-${budget.max}` : 'Não definido'}
  - Ocasião: ${preferences.occasion || 'Não especificada'}
  - Estilo: ${preferences.style || 'Não especificado'}
  - Urgência: ${preferences.urgency || 'Não especificada'}
  - Lojas preferidas: ${preferences.stores.length ? preferences.stores.join(', ') : 'Nenhuma especificada'}
  
  INSTRUÇÕES:
  1. Sê conversacional, amigável e útil como uma personal shopper real
  2. Faz perguntas específicas para entender melhor as necessidades
  3. Sugere peças específicas com marcas, preços estimados e onde comprar considerando o gênero
  4. Considera o armário existente para evitar duplicações
  5. Respeita o orçamento e body shape/estação de cor se disponível
  6. Oferece alternativas em diferentes faixas de preço
  7. Inclui links ou direções para lojas quando relevante
  8. Mantém o contexto da conversa anterior
  9. IMPORTANTE: Adapta todas as sugestões ao gênero do cliente
  
  FORMATO DE RESPOSTA:
  - Responde naturalmente como uma conversa
  - Se sugerires peças específicas, inclui:
    * Nome da peça
    * Marca/loja
    * Preço estimado
    * Porque é adequada para o gênero
    * Como combinar
  - Oferece 2-3 opções sempre que possível
  - Pergunta follow-up quando necessário`;
  
      const conversationHistory = [
        {
          role: 'system',
          content: systemContext
        }
      ];
  
      // Add recent messages for context
      const recentMessages = messages.slice(-6).concat(newMessage);
      recentMessages.forEach(msg => {
        conversationHistory.push({
          role: msg.type === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
  
      const response = await callOpenAI(conversationHistory);
  
      // Check if response includes shopping recommendations
      const hasShoppingItems = response.includes('€') || response.includes('loja') || response.includes('marca');
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response,
        timestamp: new Date(),
        hasShoppingItems
      };
  
      // Generate suggestions based on context
      const suggestions = await generateContextualSuggestions(messageText, response);
      if (suggestions.length > 0) {
        aiMessage.suggestions = suggestions;
      }
  
      setMessages(prev => [...prev, aiMessage]);
  
    } catch (error) {
      console.error('❌ Erro na mensagem do Personal Shopper:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Desculpa, tive um problema técnico. Podes tentar de novo?`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setIsLoading(false);
  };

  const generateContextualSuggestions = async (userMessage, aiResponse) => {
    try {
      const prompt = `Baseado na mensagem do utilizador "${userMessage}" e na resposta dada "${aiResponse.substring(0, 200)}...", gera 3-4 sugestões relevantes de follow-up que o utilizador pode querer fazer.

Foca em:
- Refinar a pesquisa
- Explorar alternativas
- Perguntas sobre orçamento/lojas
- Próximos passos práticos

Responde apenas com as sugestões, uma por linha, sem numeração.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'Geras sugestões práticas e relevantes para continuar uma conversa de shopping.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      return response.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 4);
    } catch (error) {
      return [];
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const startShoppingSession = (budgetAmount) => {
    setShoppingSession({
      isActive: true,
      items: [],
      totalBudget: budgetAmount,
      spent: 0
    });
    
    const sessionMessage = {
      id: Date.now(),
      type: 'ai',
      content: `🛍️ Perfeito! Iniciámos uma sessão de shopping com orçamento de €${budgetAmount}. Vou ajudar-te a encontrar as melhores peças dentro deste valor. Que tipo de peças estás a procurar?`,
      timestamp: new Date(),
      isSessionStart: true
    };
    
    setMessages(prev => [...prev, sessionMessage]);
  };

  const addToShoppingList = (item) => {
    setShoppingSession(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now() }],
      spent: prev.spent + item.price
    }));
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: '👋 Olá! Sou a tua personal shopper com IA. Posso ajudar-te a encontrar as peças perfeitas baseadas no teu estilo, orçamento e necessidades específicas. Em que posso ajudar hoje?',
        timestamp: new Date(),
        suggestions: [
          'Preciso de algo para uma entrevista de trabalho',
          'Quero renovar o meu guarda-roupa de verão',
          'Procuro peças versáteis para o dia-a-dia',
          'Tenho um orçamento de 200€ para gastar'
        ]
      }
    ]);
    setShoppingSession({ isActive: false, items: [], totalBudget: 0, spent: 0 });
  };

  const storeOptions = [
    'Zara', 'H&M', 'Mango', 'Uniqlo', 'COS', 'Massimo Dutti', 
    'Stradivarius', 'Pull & Bear', 'Bershka', 'Reserved'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4 pt-8">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white ml-4">Personal Shopper IA</h1>
          </div>
          
          {/* Shopping Session Status */}
          {shoppingSession.isActive && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm">Sessão ativa</span>
                <span className="font-semibold">€{shoppingSession.spent}/€{shoppingSession.totalBudget}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2 mt-1">
                <div 
                  className="bg-white h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((shoppingSession.spent / shoppingSession.totalBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-6 pt-2 overflow-hidden">
        <div className="max-w-md mx-auto h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Bot className="h-4 w-4 text-purple-500" />
                      <span className="text-xs font-semibold text-purple-500">Personal Shopper</span>
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  
                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs text-purple-700 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  {message.hasShoppingItems && (
                    <div className="mt-3 flex space-x-2">
                      <button
                        onClick={() => navigateToScreen('smart-shopping')}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                      >
                        📝 Lista de Compras
                      </button>
                      <button
                        onClick={() => navigateToScreen('virtual-fitting')}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                      >
                        👗 Experimentar
                      </button>
                    </div>
                  )}
                  
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-PT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <Bot className="h-4 w-4 text-purple-500" />
                    <span className="text-xs font-semibold text-purple-500">Personal Shopper</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Setup */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mb-4">
            <div className="flex space-x-2 text-xs">
              <button
                onClick={() => sendMessage('Tenho um orçamento de 100€ para gastar')}
                className="bg-white/30 text-white px-2 py-1 rounded hover:bg-white/40"
              >
                💰 €100
              </button>
              <button
                onClick={() => sendMessage('Preciso de algo urgente para amanhã')}
                className="bg-white/30 text-white px-2 py-1 rounded hover:bg-white/40"
              >
                ⚡ Urgente
              </button>
              <button
                onClick={() => sendMessage('Quero peças versáteis para o trabalho')}
                className="bg-white/30 text-white px-2 py-1 rounded hover:bg-white/40"
              >
                💼 Trabalho
              </button>
              <button
                onClick={clearChat}
                className="bg-white/30 text-white px-2 py-1 rounded hover:bg-white/40"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Descreve o que procuras..."
                className="flex-1 border-none focus:outline-none text-sm"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              
              <button
                onClick={() => sendMessage()}
                disabled={!inputText.trim() || isLoading}
                className="p-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {/* Quick suggestions */}
            <div className="mt-2 text-xs text-gray-500">
              Exemplos: "Procuro uma camisa branca para entrevistas", "Tenho 50€ para sapatos casuais"
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Session Items */}
      {shoppingSession.isActive && shoppingSession.items.length > 0 && (
        <div className="p-6 pt-0">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <h3 className="font-semibold text-gray-800 mb-2">
                Itens na Sessão ({shoppingSession.items.length})
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {shoppingSession.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>{item.name}</span>
                    <span className="font-semibold">€{item.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-2 border-t flex justify-between">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-purple-600">€{shoppingSession.spent}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Panels */}
      <div className="p-6 pt-0">
        <div className="max-w-md mx-auto grid grid-cols-3 gap-2">
          <button
            onClick={() => navigateToScreen('smart-shopping')}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg text-center"
          >
            <ShoppingBag className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Lista</span>
          </button>
          <button
            onClick={() => navigateToScreen('style-chat')}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg text-center"
          >
            <Bot className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Stylist</span>
          </button>
          <button
            onClick={() => navigateToScreen('virtual-fitting')}
            className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-lg text-center"
          >
            <Target className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs">Fitting</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalShopperScreen;