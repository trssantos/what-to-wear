import React from 'react';
import { Sparkles } from 'lucide-react';

const ApiSetupModal = ({ openaiApiKey, setOpenaiApiKey, setShowApiSetup }) => {
  const hasHardcodedKey = openaiApiKey && !localStorage.getItem('whatToWear_openai_key');
  
  const handleSave = () => {
    if (openaiApiKey) {
      localStorage.setItem('whatToWear_openai_key', openaiApiKey);
    }
    setShowApiSetup(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <div className="text-center mb-6">
          <Sparkles className="h-16 w-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Configurar IA</h2>
          <p className="text-gray-600">Para usar as funcionalidades de IA</p>
        </div>
        
        {hasHardcodedKey && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-800 text-sm font-medium">OpenAI API configurada automaticamente</span>
            </div>
            <p className="text-green-700 text-xs mt-1">
              A key está hardcoded no código. Podes substituir se quiseres usar outra.
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">OpenAI API Key</label>
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={hasHardcodedKey ? "Key já configurada automaticamente" : "sk-..."}
            />
            <p className="text-xs text-gray-500 mt-1">
              {hasHardcodedKey ? 
                "Deixa em branco para usar a key automática ou substitui por outra" :
                "Obtém em platform.openai.com"
              }
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
            >
              {hasHardcodedKey ? 'OK' : 'Guardar'}
            </button>
            <button
              onClick={() => setShowApiSetup(false)}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiSetupModal;