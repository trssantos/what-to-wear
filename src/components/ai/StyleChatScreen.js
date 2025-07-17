// src/components/ai/StyleChatScreen.js - VERSÃO COMPLETA COM ACESSÓRIOS

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot, Shirt, Watch, Palette, Plus, Target, X, ZoomIn, Eye } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import { OPENAI_API_KEY } from '../../utils/constants';
import BottomNavigation from '../shared/BottomNavigation';

const StyleChatScreen = ({ navigateToScreen }) => {
  const { 
    wardrobe, 
    accessories, 
    outfits, 
    userProfile,
    wardrobeAnalytics,
    accessoriesAnalytics 
  } = useAppContext();
  
  const { callOpenAI } = useOpenAI();
  
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas personalizada
    const welcomeMessage = {
      id: Date.now(),
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      isWelcome: true
    };
    setMessages([welcomeMessage]);
  }, []);

  const getWelcomeMessage = () => {
    const totalClothing = wardrobeAnalytics?.totalItems || 0;
    const totalAccessories = accessoriesAnalytics?.totalItems || 0;
    const totalOutfits = outfits?.length || 0;
    const userName = userProfile?.name?.split(' ')[0] || '';

    if (totalClothing === 0 && totalAccessories === 0) {
      return `Olá${userName ? `, ${userName}` : ''}! 👋 Sou o teu consultor de moda pessoal. Ainda não tens peças no teu armário digital, mas posso ajudar-te a planear um guarda-roupa incrível! Que tipo de estilo gostas?`;
    }

    return `Olá${userName ? `, ${userName}` : ''}! ✨ Sou o teu consultor de moda pessoal. Vejo que tens ${totalClothing} peças de roupa, ${totalAccessories} acessórios e ${totalOutfits} outfits criados. Como posso ajudar-te hoje com o teu estilo?`;
  };

  // Estatísticas da coleção
  const getCollectionStats = () => {
    const totalClothing = wardrobe.length;
    const totalAccessories = accessories.length;
    const totalOutfits = outfits.length;
    const aiAnalyzedClothing = wardrobeAnalytics?.aiAnalyzedItems || 0;
    const aiAnalyzedAccessories = accessoriesAnalytics?.aiAnalyzedItems || 0;

    return {
      totalItems: totalClothing + totalAccessories,
      totalClothing,
      totalAccessories,
      totalOutfits,
      aiAnalyzedTotal: aiAnalyzedClothing + aiAnalyzedAccessories,
      hasItems: totalClothing > 0 || totalAccessories > 0
    };
  };

  // Sistema de prompts atualizado
  const getSystemPrompt = () => {
    const stats = getCollectionStats();
    
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}
- Estilo preferido: ${userProfile.stylePreference || 'Não especificado'}
${userProfile.bodyShape ? `- Tipo de corpo: ${userProfile.bodyShape}` : ''}
${userProfile.colorSeason ? `- Estação de cor: ${userProfile.colorSeason}` : ''}
` : '';

    return `És um consultor de moda e estilo pessoal especializado. Tens acesso ao armário digital completo do utilizador.

${genderContext}

COLEÇÃO ATUAL:
- ${stats.totalClothing} peças de roupa
- ${stats.totalAccessories} acessórios
- ${stats.totalOutfits} outfits criados
- ${stats.aiAnalyzedTotal} itens analisados por AI

INSTRUÇÕES:
1. **PERSONALIZAÇÃO**: Adapta todos os conselhos ao gênero e preferências do utilizador
2. **ARMÁRIO REAL**: Refere-te às peças específicas que o utilizador tem
3. **ACESSÓRIOS**: Inclui sempre sugestões de acessórios nas recomendações de styling
4. **INTEGRAÇÃO**: Sugere como combinar roupas e acessórios para looks completos
5. **PRÁTICO**: Dá conselhos específicos e implementáveis
6. **OCASIÕES**: Considera diferentes ocasiões e contextos
7. **TENDÊNCIAS**: Incorpora tendências atuais quando relevante

CONTEXTO ESPECIAL:
${stats.totalAccessories === 0 ? '- O utilizador ainda não tem acessórios catalogados. Sugere categorias essenciais para começar.' : ''}
${stats.totalClothing === 0 ? '- O utilizador ainda não tem roupas catalogadas. Foca em peças essenciais para construir um guarda-roupa base.' : ''}

Responde sempre de forma amigável, entusiástica e profissional. Se não tiveres informação suficiente, pergunta detalhes específicos.`;
  };

  // Sugestões rápidas atualizadas
  const quickSuggestions = [
    {
      title: "Outfit do Dia",
      prompt: `Com base no meu armário atual (${getCollectionStats().totalClothing} roupas + ${getCollectionStats().totalAccessories} acessórios), sugere um outfit completo para hoje. Inclui peças principais e acessórios que complementem o look.`,
      icon: "🌟"
    },
    {
      title: "Combinações com Acessórios",
      prompt: "Como posso usar os meus acessórios para transformar looks básicos em algo mais interessante? Dá exemplos específicos com as peças que tenho.",
      icon: "⌚"
    },
    {
      title: "Análise do Armário",
      prompt: `Analisa a minha coleção completa (${getCollectionStats().totalClothing} roupas + ${getCollectionStats().totalAccessories} acessórios) e identifica lacunas. O que devo comprar a seguir?`,
      icon: "📊"
    },
    {
      title: "Styling para Ocasião",
      prompt: "Preciso de ajuda para criar um look para uma ocasião específica. Podes sugerir combinações usando o que já tenho?",
      icon: "🎯"
    },
    {
      title: "Organização por Cores",
      prompt: "Como posso organizar melhor as cores no meu armário? Quais combinações funcionam melhor com os acessórios que tenho?",
      icon: "🎨"
    },
    {
      title: "Essenciais em Falta",
      prompt: "Quais são os acessórios essenciais que me faltam para completar o meu guarda-roupa? Considera o meu estilo e as roupas que já tenho.",
      icon: "📝"
    }
  ];

  const sendMessage = async (message, isUser = true) => {
    if (!message.trim() || isLoading) return;

    const newMessage = {
      id: Date.now(),
      text: message,
      isUser,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    if (isUser) {
      setCurrentMessage('');
      setIsLoading(true);

      try {
        // Contexto expandido incluindo acessórios
        const wardrobeContext = wardrobe.length > 0 ? `
ARMÁRIO ATUAL (${wardrobe.length} peças):
${wardrobe.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
${wardrobe.length > 10 ? `... e mais ${wardrobe.length - 10} peças` : ''}
` : '';

        const accessoriesContext = accessories.length > 0 ? `
ACESSÓRIOS ATUAIS (${accessories.length} itens):
${accessories.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
${accessories.length > 10 ? `... e mais ${accessories.length - 10} acessórios` : ''}
` : '';

        const outfitsContext = outfits.length > 0 ? `
OUTFITS CRIADOS (${outfits.length}):
${outfits.slice(0, 5).map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'})`).join('\n')}
` : '';

        const fullContext = `${getSystemPrompt()}

${wardrobeContext}
${accessoriesContext}
${outfitsContext}

PERGUNTA DO UTILIZADOR: ${message}`;

        const response = await callOpenAI([
          {
            role: 'system',
            content: fullContext
          },
          {
            role: 'user', 
            content: message
          }
        ]);

        const aiMessage = {
          id: Date.now() + 1,
          text: response,
          isUser: false,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Desculpa, ocorreu um erro ao processar a tua mensagem. Tenta novamente.',
          isUser: false,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  // Resumo da coleção
  const CollectionOverview = () => {
    const stats = getCollectionStats();
    
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
          <span className="mr-2">📊</span>
          Resumo da Coleção
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.totalClothing}</div>
            <div className="text-sm text-gray-600">Roupas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{stats.totalAccessories}</div>
            <div className="text-sm text-gray-600">Acessórios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-violet-600">{stats.totalOutfits}</div>
            <div className="text-sm text-gray-600">Outfits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.aiAnalyzedTotal}</div>
            <div className="text-sm text-gray-600">AI Analisados</div>
          </div>
        </div>
        
        {!stats.hasItems && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              💡 Adiciona algumas roupas e acessórios para receberes conselhos mais personalizados!
            </p>
          </div>
        )}
      </div>
    );
  };

  // Botões de acesso rápido
  const QuickAccessButtons = () => (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <button
        onClick={() => navigateToScreen('wardrobe')}
        className="flex items-center justify-center p-3 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors"
      >
        <span className="text-orange-600 mr-2">👕</span>
        <span className="text-sm font-medium text-orange-800">Ver Roupas</span>
      </button>
      <button
        onClick={() => navigateToScreen('accessories')}
        className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
      >
        <span className="text-emerald-600 mr-2">⌚</span>
        <span className="text-sm font-medium text-emerald-800">Ver Acessórios</span>
      </button>
      <button
        onClick={() => navigateToScreen('create-outfit')}
        className="flex items-center justify-center p-3 bg-violet-50 border border-violet-200 rounded-xl hover:bg-violet-100 transition-colors"
      >
        <span className="text-violet-600 mr-2">🎨</span>
        <span className="text-sm font-medium text-violet-800">Criar Outfit</span>
      </button>
      <button
        onClick={() => sendMessage("Dá-me 3 dicas rápidas de styling com base na minha coleção atual.")}
        className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
      >
        <span className="text-blue-600 mr-2">💡</span>
        <span className="text-sm font-medium text-blue-800">Dicas Rápidas</span>
      </button>
    </div>
  );

  if (!OPENAI_API_KEY) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 p-6 pb-24 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-auto">
          <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Funcionalidade AI Indisponível</h2>
          <p className="text-gray-600 mb-6">
            Para usar o consultor de moda AI, é necessário configurar uma API key do OpenAI.
          </p>
          <button
            onClick={() => navigateToScreen('ai-setup')}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            Configurar AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 p-6 pb-24">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-8">
        <button onClick={() => navigateToScreen('home')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
          <Sparkles className="h-4 w-4" />
          <span className="font-bold tracking-wide text-sm">STYLE CHAT</span>
        </div>
        <button
          onClick={() => navigateToScreen('personal-stylist')}
          className="bg-white/20 text-white p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors"
        >
          <User className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Collection Overview */}
        <CollectionOverview />
        
        {/* Quick Access Buttons */}
        <QuickAccessButtons />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-96">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.isUser ? 'order-2' : 'order-1'}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white ml-4'
                      : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200 mr-4'
                        : 'bg-gray-100 text-gray-800 mr-4'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.text}
                  </p>
                  <p className={`text-xs mt-2 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString('pt-PT', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser ? 'order-1 bg-gradient-to-r from-green-500 to-blue-500' : 'order-2 bg-gray-200'
              }`}>
                {message.isUser ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-600" />
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-full p-3 mr-4">
                <Bot className="h-4 w-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-2xl p-4">
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

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sugestões rápidas:</h3>
            <div className="grid grid-cols-2 gap-2">
              {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(suggestion.prompt)}
                  className="text-left p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={isLoading}
                >
                  <div className="flex items-center mb-1">
                    <span className="mr-2 text-sm">{suggestion.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{suggestion.title}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{suggestion.prompt.substring(0, 60)}...</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage(currentMessage)}
            placeholder="Pergunta algo sobre moda e estilo..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => sendMessage(currentMessage)}
            disabled={!currentMessage.trim() || isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-3 rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>

        {/* More Suggestions */}
        {messages.length > 1 && (
          <div className="mt-4">
            <details className="group">
              <summary className="flex items-center justify-center p-2 text-sm text-gray-600 hover:text-gray-800 cursor-pointer">
                <span>Mais sugestões</span>
                <Plus className="h-4 w-4 ml-1 group-open:rotate-45 transition-transform" />
              </summary>
              <div className="mt-3 grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {quickSuggestions.slice(4).map((suggestion, index) => (
                  <button
                    key={index + 4}
                    onClick={() => sendMessage(suggestion.prompt)}
                    className="text-left p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    disabled={isLoading}
                  >
                    <span className="mr-2">{suggestion.icon}</span>
                    {suggestion.title}
                  </button>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && modalImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-colors z-10"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={modalImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      <BottomNavigation currentScreen="style-chat" navigateToScreen={navigateToScreen} />
    </div>
  );
};

export default StyleChatScreen;