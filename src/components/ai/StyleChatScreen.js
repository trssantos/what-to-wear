import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Camera, Upload, Send, X } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';
import CameraCapture from '../shared/CameraCapture';

const StyleChatScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Olá! Sou o teu consultor de estilo pessoal. Podes enviar-me fotos dos teus outfits para análise ou fazer qualquer pergunta sobre moda e estilo. Como posso ajudar?',
      timestamp: new Date()
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setSelectedImage(photoDataUrl);
    setShowCamera(false);
  };

  const handleImageClick = (imageUrl) => {
    setModalImage(imageUrl);
    setShowImageModal(true);
  };

  const sendMessage = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const newMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      image: selectedImage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Limpar imediatamente após enviar
    const messageText = inputText;
    const messageImage = selectedImage;
    setInputText('');
    setSelectedImage(null);
    
    setIsLoading(true);

    try {
      const systemContext = `És um consultor de moda expert e estilista pessoal. Analisas outfits, dás conselhos de estilo, respondes a perguntas sobre moda, cores, combinações, ocasiões, e ajudas com qualquer questão relacionada com estilo pessoal.

${wardrobe.length > 0 ? `ARMÁRIO DO UTILIZADOR:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'} - ${item.notes || 'Sem notas'}`).join('\n')}` : ''}

INSTRUÇÕES IMPORTANTES:
- Mantém sempre o contexto da conversa anterior
- Se uma imagem foi enviada anteriormente, lembra-te dela para responder a perguntas subsequentes
- Responde especificamente à pergunta feita, não repitas análises já feitas
- Sê conversacional e referencia mensagens anteriores quando relevante
- Se perguntarem sobre cores, combinações ou alternativas, foca apenas nisso`;

      // Coletar últimas mensagens para contexto (incluindo a nova)
      const allMessages = [...messages, newMessage];
      const recentMessages = allMessages.slice(-10);
      
      const conversationHistory = [];
      
      // Adicionar contexto do sistema
      conversationHistory.push({
        role: 'system',
        content: systemContext
      });

      // Processar mensagens mantendo contexto
      for (let i = 0; i < recentMessages.length; i++) {
        const msg = recentMessages[i];
        
        if (msg.type === 'user') {
          if (msg.image) {
            conversationHistory.push({
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: msg.content || 'Analisa esta imagem'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: msg.image
                  }
                }
              ]
            });
          } else {
            let textContent = msg.content;
            
            // Se não for a primeira mensagem e não tem imagem, adicionar contexto
            if (i > 0 && !msg.image) {
              const previousImageMessage = recentMessages.slice(0, i).reverse().find(m => m.image);
              if (previousImageMessage) {
                textContent = `Continuando sobre o outfit que mostrei anteriormente: ${textContent}`;
              }
            }
            
            conversationHistory.push({
              role: 'user',
              content: textContent
            });
          }
        } else if (msg.type === 'ai') {
          conversationHistory.push({
            role: 'assistant',
            content: msg.content
          });
        }
      }

      // Determinar se há imagens na conversa
      const hasImagesInConversation = conversationHistory.some(msg => 
        Array.isArray(msg.content) && msg.content.some(c => c.type === 'image_url')
      );

      // Chamar OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: hasImagesInConversation ? 'gpt-4o' : 'gpt-4o-mini',
          messages: conversationHistory,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Erro desconhecido'}`);
      }

      const data = await response.json();
      const responseContent = data.choices[0].message.content;

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('❌ Erro na mensagem do Style Chat:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `Erro: ${error.message}\n\nSugestões:\n• Verifica se a tua API key é válida\n• Confirma se tens acesso aos modelos GPT-4o\n• Tenta novamente em alguns segundos`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex flex-col">
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-4 pt-8">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white ml-4">Consultor de Estilo IA</h1>
          </div>
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
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.type === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Outfit" 
                      className="w-full rounded-lg mb-2 max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => handleImageClick(message.image)}
                    />
                  )}
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
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

          {/* Image Preview */}
          {selectedImage && (
            <div className="mb-4">
              <div className="bg-white p-3 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={selectedImage} alt="Preview" className="w-12 h-12 rounded object-cover" />
                  <span className="text-sm text-gray-600">Imagem selecionada</span>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="text-red-500 text-sm"
                >
                  Remover
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <div className="flex items-end space-x-2">
              <button
                onClick={() => setShowCamera(true)}
                className="p-2 text-gray-500 hover:text-blue-500 transition-colors flex-shrink-0"
              >
                <Camera className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 hover:text-green-500 transition-colors flex-shrink-0"
              >
                <Upload className="h-6 w-6" />
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Faz uma pergunta ou envia uma foto..."
                className="flex-1 resize-none border-none focus:outline-none text-sm min-h-[3rem] max-h-24 py-2"
                rows="2"
                style={{ lineHeight: '1.5' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              
              <button
                onClick={sendMessage}
                disabled={(!inputText.trim() && !selectedImage) || isLoading}
                className="p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && modalImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative bg-white rounded-2xl p-4 max-w-sm max-h-[80vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={modalImage}
              alt="Imagem ampliada"
              className="w-full h-auto object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleChatScreen;