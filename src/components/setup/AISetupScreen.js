import React, { useState, useEffect } from 'react';
import { ArrowLeft, Key, Sparkles, CheckCircle, AlertCircle, Zap, Eye, Target, Lightbulb } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';

const AISetupScreen = ({ navigateToScreen, openaiApiKey, setOpenaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const [tempApiKey, setTempApiKey] = useState(openaiApiKey || '');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [setupStep, setSetupStep] = useState('config'); // config, test, complete

  const { generateGarmentMetadata } = useGarmentAI(tempApiKey);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const validateApiKey = async () => {
    if (!tempApiKey.trim()) {
      setValidationResult({
        valid: false,
        message: 'Por favor, introduze uma API key'
      });
      return;
    }

    if (!tempApiKey.startsWith('sk-')) {
      setValidationResult({
        valid: false,
        message: 'A API key deve começar com "sk-"'
      });
      return;
    }

    setIsValidating(true);
    try {
      // Test with a simple AI call
      const testPrompt = "Responde apenas com 'OK' se recebeste esta mensagem.";
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempApiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        setValidationResult({
          valid: true,
          message: 'API key válida! Configuração concluída.'
        });
        setOpenaiApiKey(tempApiKey);
        localStorage.setItem('whatToWear_openai_key', tempApiKey);
      } else {
        const errorData = await response.json();
        setValidationResult({
          valid: false,
          message: `Erro: ${errorData.error?.message || 'API key inválida'}`
        });
      }
    } catch (error) {
      setValidationResult({
        valid: false,
        message: 'Erro de conectividade. Verifica a tua ligação à internet.'
      });
    }
    setIsValidating(false);
  };

  const testWithActualItem = async () => {
    const itemWithImage = wardrobe.find(item => item.imageUrl && !item.aiMetadata);
    
    if (!itemWithImage) {
      setValidationResult({
        valid: false,
        message: 'Não há peças com imagem disponíveis para teste'
      });
      return;
    }

    setIsValidating(true);
    try {
      const metadata = await generateGarmentMetadata(itemWithImage.imageUrl, itemWithImage);
      setValidationResult({
        valid: true,
        message: `Teste bem-sucedido! Gerada análise para "${itemWithImage.name}".`,
        testResult: metadata.substring(0, 200) + '...'
      });
      setSetupStep('complete');
    } catch (error) {
      setValidationResult({
        valid: false,
        message: `Erro no teste: ${error.message}`
      });
    }
    setIsValidating(false);
  };

  const renderConfigStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4 transform rotate-3">
          <Key className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          Configuração da AI
        </h2>
        <p className="text-gray-600">
          Configura a tua API key da OpenAI para ativar análise automática de peças
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-3 flex items-center space-x-2">
          <Lightbulb className="h-4 w-4" />
          <span>Como obter a API Key</span>
        </h3>
        <div className="space-y-2 text-sm text-blue-700">
          <p>1. <strong>Visita</strong> platform.openai.com</p>
          <p>2. <strong>Cria conta</strong> ou faz login</p>
          <p>3. <strong>Vai para</strong> API Keys nas definições</p>
          <p>4. <strong>Cria nova</strong> API key</p>
          <p>5. <strong>Copia</strong> e cola aqui abaixo</p>
        </div>
      </div>

      <div>
        <label className="block text-gray-800 font-bold mb-2">OpenAI API Key</label>
        <div className="relative">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={tempApiKey}
            onChange={(e) => {
              setTempApiKey(e.target.value);
              setValidationResult(null);
            }}
            className="w-full p-4 border-2 border-purple-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12"
            placeholder="sk-..."
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Eye className="h-5 w-5" />
          </button>
        </div>
      </div>

      {validationResult && (
        <div className={`rounded-2xl p-4 border ${validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`flex items-center space-x-2 ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
            {validationResult.valid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="font-bold text-sm">{validationResult.message}</span>
          </div>
        </div>
      )}

      <button
        onClick={validateApiKey}
        disabled={isValidating || !tempApiKey.trim()}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isValidating ? (
          <>
            <Zap className="h-5 w-5 animate-spin" />
            <span>Validando...</span>
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>VALIDAR API KEY</span>
          </>
        )}
      </button>

      {validationResult?.valid && (
        <button
          onClick={() => setSetupStep('test')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
        >
          <Target className="h-5 w-5" />
          <span>TESTAR COM PEÇA REAL</span>
        </button>
      )}
    </div>
  );

  const renderTestStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4 transform rotate-3">
          <Zap className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          Teste da Integração
        </h2>
        <p className="text-gray-600">
          Vamos testar a análise AI com uma peça real do teu armário
        </p>
      </div>

      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-2">O que vamos fazer:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Encontrar uma peça com foto sem análise AI</li>
          <li>• Enviar a imagem para análise</li>
          <li>• Gerar metadata detalhada</li>
          <li>• Verificar que tudo funciona perfeitamente</li>
        </ul>
      </div>

      {validationResult && (
        <div className={`rounded-2xl p-4 border ${validationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className={`flex items-center space-x-2 mb-2 ${validationResult.valid ? 'text-green-800' : 'text-red-800'}`}>
            {validationResult.valid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <span className="font-bold text-sm">{validationResult.message}</span>
          </div>
          {validationResult.testResult && (
            <div className="bg-white rounded-lg p-3 mt-2">
              <p className="text-sm text-gray-700">
                <strong>Preview da análise:</strong><br />
                {validationResult.testResult}
              </p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={testWithActualItem}
        disabled={isValidating}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isValidating ? (
          <>
            <Sparkles className="h-5 w-5 animate-spin" />
            <span>Analisando peça...</span>
          </>
        ) : (
          <>
            <Zap className="h-5 w-5" />
            <span>TESTAR ANÁLISE AI</span>
          </>
        )}
      </button>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          🎉 Configuração Completa!
        </h2>
        <p className="text-gray-600">
          A integração AI está ativa e funcional
        </p>
      </div>

      <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
        <h3 className="font-bold text-green-800 mb-3">✨ Funcionalidades Ativadas</h3>
        <div className="space-y-2 text-sm text-green-700">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Análise automática de novas peças</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Metadata detalhada gerada por AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Pesquisa inteligente melhorada</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Recomendações de styling baseadas em AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Análise de compatibilidade entre peças</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
        <h3 className="font-bold text-blue-800 mb-2">🚀 Próximos Passos</h3>
        <div className="space-y-1 text-sm text-blue-700">
          <p>• Adiciona novas peças para análise automática</p>
          <p>• Regenera análise de peças existentes</p>
          <p>• Experimenta a pesquisa inteligente</p>
          <p>• Explora recomendações de styling AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigateToScreen('add-item')}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold text-sm"
        >
          Adicionar Peça
        </button>
        <button
          onClick={() => navigateToScreen('wardrobe')}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-2xl font-bold text-sm"
        >
          Ver Armário
        </button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (setupStep) {
      case 'config':
        return renderConfigStep();
      case 'test':
        return renderTestStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderConfigStep();
    }
  };

  const aiItemsCount = wardrobe.filter(item => item.aiMetadata).length;
  const totalItems = wardrobe.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1">
              <Sparkles className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">AI SETUP</span>
            </div>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-cyan-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            AI INTEGRATION
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className={`mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              {['Configurar', 'Testar', 'Concluído'].map((step, index) => (
                <div key={step} className={`flex items-center ${index < 2 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    (setupStep === 'config' && index === 0) ||
                    (setupStep === 'test' && index === 1) ||
                    (setupStep === 'complete' && index === 2) ||
                    (setupStep === 'complete' && index < 2)
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      setupStep === 'complete' || (setupStep === 'test' && index === 0)
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-white text-sm text-center font-medium">
              Passo {setupStep === 'config' ? '1' : setupStep === 'test' ? '2' : '3'} de 3
            </div>
          </div>
        </div>

        {/* Stats */}
        {totalItems > 0 && (
          <div className={`mb-6 grid grid-cols-3 gap-3 transform transition-all duration-1000 delay-300 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-white">{totalItems}</div>
              <div className="text-white text-xs font-bold opacity-80">Peças</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-white">{aiItemsCount}</div>
              <div className="text-white text-xs font-bold opacity-80">AI Analisadas</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 text-center">
              <div className="text-xl font-black text-white">{openaiApiKey ? '✓' : '✗'}</div>
              <div className="text-white text-xs font-bold opacity-80">API Ready</div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
          
          <div className="p-6">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISetupScreen;