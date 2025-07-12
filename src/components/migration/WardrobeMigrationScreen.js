import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, CheckCircle, AlertCircle, ArrowRight, Zap, Eye, Target } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useGarmentAI } from '../../hooks/useGarmentAI';

const WardrobeMigrationScreen = ({ onComplete, navigateToScreen, openaiApiKey }) => {
  const { wardrobe, bulkUpdateAIMetadata } = useAppContext();
  const { generateGarmentMetadata, isAnalyzing } = useGarmentAI(openaiApiKey);
  
  const [migrationStep, setMigrationStep] = useState('welcome'); // welcome, analyze, progress, complete
  const [selectedItems, setSelectedItems] = useState([]);
  const [migrationProgress, setMigrationProgress] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate migration stats
  const itemsWithoutAI = wardrobe.filter(item => !item.aiMetadata && item.imageUrl);
  const itemsWithAI = wardrobe.filter(item => item.aiMetadata);
  const totalItems = wardrobe.length;
  const itemsWithImages = wardrobe.filter(item => item.imageUrl).length;

  // Auto-select items that can be migrated
  useEffect(() => {
    if (itemsWithoutAI.length > 0 && selectedItems.length === 0) {
      setSelectedItems(itemsWithoutAI.map(item => item.id));
    }
  }, [wardrobe]);

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectAll = () => {
    setSelectedItems(itemsWithoutAI.map(item => item.id));
  };

  const selectNone = () => {
    setSelectedItems([]);
  };

  const startMigration = async () => {
    if (selectedItems.length === 0) {
      alert('Seleciona pelo menos uma peça para migração');
      return;
    }

    setIsRunning(true);
    setMigrationStep('progress');
    const selectedItemsData = wardrobe.filter(item => selectedItems.includes(item.id));
    const updates = [];

    for (let i = 0; i < selectedItemsData.length; i++) {
      const item = selectedItemsData[i];
      
      try {
        setMigrationProgress(prev => [
          ...prev,
          {
            itemId: item.id,
            itemName: item.name,
            status: 'processing',
            message: 'A analisar com AI...'
          }
        ]);

        const metadata = await generateGarmentMetadata(item.imageUrl, item);
        
        updates.push({
          itemId: item.id,
          aiMetadata: metadata
        });

        setMigrationProgress(prev => prev.map(p => 
          p.itemId === item.id 
            ? { ...p, status: 'completed', message: 'Análise completa!' }
            : p
        ));

        // Small delay to prevent rate limiting
        if (i < selectedItemsData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Erro na migração da peça ${item.name}:`, error);
        
        setMigrationProgress(prev => prev.map(p => 
          p.itemId === item.id 
            ? { ...p, status: 'error', message: `Erro: ${error.message}` }
            : p
        ));
      }
    }

    // Bulk update all successful analyses
    try {
      const successfulUpdates = updates.filter(update => update.aiMetadata);
      if (successfulUpdates.length > 0) {
        await bulkUpdateAIMetadata(successfulUpdates);
        console.log(`✅ Migração completa: ${successfulUpdates.length} peças atualizadas`);
      }
    } catch (error) {
      console.error('Erro no bulk update:', error);
    }

    setIsRunning(false);
    setMigrationStep('complete');
  };

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4 transform rotate-3">
          <RefreshCw className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          Atualização do Armário
        </h2>
        <p className="text-gray-600">
          Vamos adicionar análise AI às tuas peças existentes para melhorar todas as funcionalidades
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-200">
          <div className="text-3xl font-black text-blue-600">{totalItems}</div>
          <div className="text-blue-800 text-sm font-bold">Total de Peças</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
          <div className="text-3xl font-black text-green-600">{itemsWithAI.length}</div>
          <div className="text-green-800 text-sm font-bold">Já Analisadas</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-200">
          <div className="text-3xl font-black text-orange-600">{itemsWithoutAI.length}</div>
          <div className="text-orange-800 text-sm font-bold">Para Migrar</div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-200">
          <div className="text-3xl font-black text-purple-600">{itemsWithImages}</div>
          <div className="text-purple-800 text-sm font-bold">Com Imagens</div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-200">
        <h3 className="font-bold text-yellow-800 mb-3 flex items-center space-x-2">
          <Sparkles className="h-4 w-4" />
          <span>O que vai ser migrado?</span>
        </h3>
        <div className="space-y-2 text-sm text-yellow-700">
          <div>• <strong>Análise detalhada</strong> - Tecidos, cortes, estilos, ocasiões</div>
          <div>• <strong>Metadata inteligente</strong> - Descrição completa para cada peça</div>
          <div>• <strong>Pesquisa melhorada</strong> - Encontra peças por características</div>
          <div>• <strong>Recomendações precisas</strong> - Sugestões baseadas em dados reais</div>
        </div>
      </div>

      {itemsWithoutAI.length > 0 ? (
        <button
          onClick={() => setMigrationStep('analyze')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
        >
          <ArrowRight className="h-5 w-5" />
          <span>COMEÇAR MIGRAÇÃO</span>
        </button>
      ) : (
        <div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="font-bold text-green-800">Tudo atualizado!</div>
            <div className="text-green-700 text-sm">Todas as tuas peças já têm análise AI</div>
          </div>
          <button
            onClick={onComplete}
            className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold"
          >
            CONTINUAR
          </button>
        </div>
      )}
    </div>
  );

  const renderAnalyzeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          Seleciona Peças para Migrar
        </h2>
        <p className="text-gray-600">
          Escolhe quais peças queres analisar com AI
        </p>
      </div>

      {!openaiApiKey && (
        <div className="bg-red-50 rounded-2xl p-4 border border-red-200">
          <div className="flex items-center space-x-2 text-red-800 mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-bold">API Key Necessária</span>
          </div>
          <div className="text-red-700 text-sm mb-3">
            Precisas de configurar a OpenAI API key para continuar com a migração.
          </div>
          <button
            onClick={() => navigateToScreen('ai-setup')}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            Configurar Agora
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedItems.length} de {itemsWithoutAI.length} selecionadas
        </div>
        <div className="flex space-x-2">
          <button
            onClick={selectAll}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold"
          >
            Todas
          </button>
          <button
            onClick={selectNone}
            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-bold"
          >
            Nenhuma
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-3">
        {itemsWithoutAI.map(item => (
          <div
            key={item.id}
            className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
              selectedItems.includes(item.id)
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => toggleItemSelection(item.id)}
          >
            <input
              type="checkbox"
              checked={selectedItems.includes(item.id)}
              onChange={() => toggleItemSelection(item.id)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{item.name}</div>
              <div className="text-gray-500 text-xs">{item.category} • {item.color}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setMigrationStep('welcome')}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold"
        >
          Voltar
        </button>
        <button
          onClick={startMigration}
          disabled={selectedItems.length === 0 || !openaiApiKey}
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Zap className="h-4 w-4" />
          <span>MIGRAR {selectedItems.length} PEÇAS</span>
        </button>
      </div>
    </div>
  );

  const renderProgressStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
          {isRunning ? (
            <RefreshCw className="h-10 w-10 text-white animate-spin" />
          ) : (
            <CheckCircle className="h-10 w-10 text-white" />
          )}
        </div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">
          {isRunning ? 'Migrando Armário...' : 'Migração Completa!'}
        </h2>
        <p className="text-gray-600">
          {isRunning 
            ? 'A AI está a analisar as tuas peças. Isto pode demorar alguns minutos.'
            : 'Todas as peças foram processadas com sucesso!'
          }
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-2">
        {migrationProgress.map((progress, index) => (
          <div key={progress.itemId} className="flex items-center space-x-3 p-3 bg-white rounded-xl border">
            <div className="flex-shrink-0">
              {progress.status === 'processing' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
              {progress.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
              {progress.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800 text-sm">{progress.itemName}</div>
              <div className={`text-xs ${
                progress.status === 'processing' ? 'text-blue-600' :
                progress.status === 'completed' ? 'text-green-600' :
                'text-red-600'
              }`}>
                {progress.message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isRunning && (
        <button
          onClick={() => setMigrationStep('complete')}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold"
        >
          CONTINUAR
        </button>
      )}
    </div>
  );

  const renderCompleteStep = () => {
    const successCount = migrationProgress.filter(p => p.status === 'completed').length;
    const errorCount = migrationProgress.filter(p => p.status === 'error').length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            🎉 Migração Concluída!
          </h2>
          <p className="text-gray-600">
            O teu armário foi atualizado com inteligência artificial
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-4 text-center border border-green-200">
            <div className="text-3xl font-black text-green-600">{successCount}</div>
            <div className="text-green-800 text-sm font-bold">Migradas</div>
          </div>
          {errorCount > 0 && (
            <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-200">
              <div className="text-3xl font-black text-red-600">{errorCount}</div>
              <div className="text-red-800 text-sm font-bold">Erros</div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-3">✨ Funcionalidades Melhoradas</h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div>• <strong>Pesquisa inteligente</strong> por tecidos, estilos, ocasiões</div>
            <div>• <strong>Recomendações precisas</strong> baseadas em características reais</div>
            <div>• <strong>Style Chat melhorado</strong> com contexto detalhado</div>
            <div>• <strong>Análise de compatibilidade</strong> entre peças</div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onComplete}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
          >
            <Target className="h-5 w-5" />
            <span>EXPLORAR ARMÁRIO</span>
          </button>
          
          <button
            onClick={() => navigateToScreen('ai-features-demo')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-2xl font-bold"
          >
            Ver Funcionalidades AI
          </button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (migrationStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'analyze':
        return renderAnalyzeStep();
      case 'progress':
        return renderProgressStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className={`pt-8 mb-6 transform transition-all duration-1000 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center mb-4">
            <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-full transform rotate-1 inline-flex">
              <RefreshCw className="h-4 w-4" />
              <span className="font-bold tracking-wide text-sm">MIGRATION</span>
            </div>
          </div>

          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-white to-cyan-200 bg-clip-text text-transparent mb-2 transform -rotate-1 text-center">
            UPGRADE TIME
          </h1>
        </div>

        {/* Progress Indicator */}
        <div className={`mb-6 transform transition-all duration-1000 delay-200 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              {['Bem-vindo', 'Selecionar', 'Migrar', 'Concluído'].map((step, index) => (
                <div key={step} className={`flex items-center ${index < 3 ? 'flex-1' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    (migrationStep === 'welcome' && index === 0) ||
                    (migrationStep === 'analyze' && index === 1) ||
                    (migrationStep === 'progress' && index === 2) ||
                    (migrationStep === 'complete' && index === 3) ||
                    (migrationStep === 'complete' && index < 3)
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${
                      migrationStep === 'complete' || 
                      (migrationStep === 'progress' && index < 2) ||
                      (migrationStep === 'analyze' && index === 0)
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-white text-sm text-center font-medium">
              {migrationStep === 'welcome' ? 'Passo 1' : 
               migrationStep === 'analyze' ? 'Passo 2' : 
               migrationStep === 'progress' ? 'Passo 3' : 'Passo 4'} de 4
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className={`relative bg-white rounded-[3rem] shadow-2xl border-4 border-gray-100 overflow-hidden transform transition-all duration-1000 delay-400 ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-6">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobeMigrationScreen;