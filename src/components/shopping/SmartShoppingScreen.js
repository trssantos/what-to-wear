import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Plus, Trash2, Check, Euro, Target, TrendingUp, AlertCircle, Star } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const SmartShoppingScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [shoppingList, setShoppingList] = useState([]);
  const [budget, setBudget] = useState({ total: 0, spent: 0, remaining: 0 });
  const [activeTab, setActiveTab] = useState('list');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [shoppingHistory, setShoppingHistory] = useState([]);

  // Load shopping data
  useEffect(() => {
    const savedList = localStorage.getItem('whatToWear_shoppingList');
    const savedBudget = localStorage.getItem('whatToWear_budget');
    const savedHistory = localStorage.getItem('whatToWear_shoppingHistory');
    
    if (savedList) setShoppingList(JSON.parse(savedList));
    if (savedBudget) setBudget(JSON.parse(savedBudget));
    if (savedHistory) setShoppingHistory(JSON.parse(savedHistory));
  }, []);

  // Save shopping data
  const saveShoppingData = (list, budgetData, history) => {
    localStorage.setItem('whatToWear_shoppingList', JSON.stringify(list));
    localStorage.setItem('whatToWear_budget', JSON.stringify(budgetData));
    localStorage.setItem('whatToWear_shoppingHistory', JSON.stringify(history));
    setShoppingList(list);
    setBudget(budgetData);
    setShoppingHistory(history);
  };

  const generateSmartShoppingList = async () => {
    setIsAnalyzing(true);
    try {
      const prompt = `Como personal shopper expert e analista de armário, cria uma lista de compras inteligente baseada neste armário.

ARMÁRIO ATUAL (${wardrobe.length} peças):
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

PERFIL DO UTILIZADOR:
${userProfile ? `
- Estação de cor: ${userProfile.colorSeason || 'N/A'}
- Body shape: ${userProfile.bodyShape || 'N/A'}
- Última análise: ${userProfile.analyzedAt || 'N/A'}
` : 'Perfil não disponível'}

Analisa e fornece:

1. **GAP ANALYSIS**: Que tipos de peças/categorias estão em falta
2. **LISTA DE PRIORIDADES**: 10-15 peças específicas para comprar
3. **ORÇAMENTO SUGERIDO**: Por categoria e total
4. **ESTRATÉGIA DE COMPRA**: Quando e onde comprar
5. **PEÇAS VERSÁTEIS**: Que maximizam combinações
6. **INVESTMENT PIECES**: Peças de qualidade para durar anos

Para cada item da lista, inclui:
- Nome específico da peça
- Prioridade (Alta/Média/Baixa)
- Preço estimado em euros
- Onde comprar (tipo de loja)
- Como usar/combinar
- Porque é importante

Formato JSON:
{
  "gapAnalysis": {
    "missingCategories": ["categoria1", "categoria2"],
    "weakAreas": ["área1", "área2"],
    "strengths": ["força1", "força2"],
    "versatilityScore": 75
  },
  "shoppingList": [
    {
      "item": "nome específico",
      "category": "categoria",
      "priority": "Alta|Média|Baixa",
      "estimatedPrice": 50,
      "whereToBy": "tipo de loja",
      "reasoning": "porque é importante",
      "combinations": "como usar",
      "season": "estação ideal",
      "investment": true/false
    }
  ],
  "budgetBreakdown": {
    "total": 500,
    "byCategory": {"Tops": 150, "Bottoms": 100},
    "byPriority": {"Alta": 200, "Média": 200, "Baixa": 100}
  },
  "shoppingStrategy": {
    "timeline": "quando comprar",
    "tips": ["dica1", "dica2"],
    "salesSeasons": "melhores épocas"
  }
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal shopper expert com conhecimento de moda, tendências e orçamentos. Crias listas de compras estratégicas e inteligentes.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setGapAnalysis(analysisData);
        
        // Convert to shopping list format
        const newShoppingList = analysisData.shoppingList.map(item => ({
          id: Date.now() + Math.random(),
          ...item,
          purchased: false,
          addedAt: new Date().toISOString()
        }));
        
        const newBudget = {
          total: analysisData.budgetBreakdown.total,
          spent: 0,
          remaining: analysisData.budgetBreakdown.total
        };
        
        saveShoppingData(newShoppingList, newBudget, shoppingHistory);
      } else {
        throw new Error('Resposta inválida da IA');
      }
    } catch (error) {
      alert('Erro na análise: ' + error.message);
    }
    setIsAnalyzing(false);
  };

  const addCustomItem = (item) => {
    const newItem = {
      id: Date.now(),
      ...item,
      purchased: false,
      addedAt: new Date().toISOString()
    };
    const newList = [...shoppingList, newItem];
    saveShoppingData(newList, budget, shoppingHistory);
    setShowAddModal(false);
  };

  const togglePurchased = (itemId, price) => {
    const newList = shoppingList.map(item => {
      if (item.id === itemId) {
        const wasPurchased = item.purchased;
        const newPurchased = !wasPurchased;
        
        // Update budget
        const priceChange = newPurchased ? price : -price;
        const newSpent = budget.spent + priceChange;
        const newRemaining = budget.total - newSpent;
        
        const newBudget = {
          ...budget,
          spent: Math.max(0, newSpent),
          remaining: newRemaining
        };
        
        // Add to history if purchased
        let newHistory = shoppingHistory;
        if (newPurchased) {
          newHistory = [...shoppingHistory, {
            id: Date.now(),
            item: item.item,
            price: price,
            category: item.category,
            purchasedAt: new Date().toISOString()
          }];
        } else {
          newHistory = shoppingHistory.filter(h => h.item !== item.item);
        }
        
        saveShoppingData(
          shoppingList.map(i => i.id === itemId ? { ...i, purchased: newPurchased } : i),
          newBudget,
          newHistory
        );
        
        return { ...item, purchased: newPurchased };
      }
      return item;
    });
  };

  const removeItem = (itemId) => {
    const newList = shoppingList.filter(item => item.id !== itemId);
    saveShoppingData(newList, budget, shoppingHistory);
  };

  const setPriorityFilter = (priority) => {
    // This would filter the list by priority
  };

  const getBudgetStatus = () => {
    const percentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
    if (percentage > 90) return { color: 'text-red-600', bg: 'bg-red-100' };
    if (percentage > 70) return { color: 'text-orange-600', bg: 'bg-orange-100' };
    return { color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <ShoppingBag className="h-16 w-16 text-green-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analisando armário...</h2>
          <p className="text-gray-600 mb-4">A IA está a criar a tua lista inteligente</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>🔍 Identificando gaps...</div>
            <div>📊 Calculando prioridades...</div>
            <div>💰 Otimizando orçamento...</div>
            <div>🎯 Criando estratégia...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Lista de Compras Inteligente</h1>
        </div>

        {/* Budget Overview */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">Orçamento</h2>
            <button
              onClick={() => {
                const newBudget = prompt('Novo orçamento total (€):', budget.total);
                if (newBudget && !isNaN(newBudget)) {
                  const updatedBudget = {
                    ...budget,
                    total: parseFloat(newBudget),
                    remaining: parseFloat(newBudget) - budget.spent
                  };
                  saveShoppingData(shoppingList, updatedBudget, shoppingHistory);
                }
              }}
              className="text-sm text-blue-600 underline"
            >
              Editar
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total:</span>
              <span className="font-semibold">€{budget.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Gasto:</span>
              <span className="font-semibold">€{budget.spent}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Restante:</span>
              <span className={`font-semibold ${getBudgetStatus().color}`}>
                €{budget.remaining}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  budget.total > 0 && (budget.spent / budget.total) > 0.9 
                    ? 'bg-red-500' 
                    : budget.total > 0 && (budget.spent / budget.total) > 0.7 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                }`}
                style={{ width: `${budget.total > 0 ? Math.min((budget.spent / budget.total) * 100, 100) : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-xl mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'list' ? 'bg-green-500 text-white' : 'text-gray-600'
              }`}
            >
              Lista
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'analysis' ? 'bg-green-500 text-white' : 'text-gray-600'
              }`}
            >
              Análise
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'history' ? 'bg-green-500 text-white' : 'text-gray-600'
              }`}
            >
              Histórico
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'list' && (
          <ShoppingListTab
            shoppingList={shoppingList}
            onTogglePurchased={togglePurchased}
            onRemoveItem={removeItem}
            onAddItem={() => setShowAddModal(true)}
            onGenerateList={generateSmartShoppingList}
            wardrobeCount={wardrobe.length}
            getPriorityColor={getPriorityColor}
          />
        )}

        {activeTab === 'analysis' && (
          <AnalysisTab
            gapAnalysis={gapAnalysis}
            wardrobe={wardrobe}
            onGenerateAnalysis={generateSmartShoppingList}
          />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            shoppingHistory={shoppingHistory}
            budget={budget}
          />
        )}

        {/* Add Item Modal */}
        {showAddModal && (
          <AddItemModal
            onAdd={addCustomItem}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Shopping List Tab
const ShoppingListTab = ({ 
  shoppingList, 
  onTogglePurchased, 
  onRemoveItem, 
  onAddItem, 
  onGenerateList, 
  wardrobeCount,
  getPriorityColor 
}) => (
  <div className="space-y-4">
    {/* Actions */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <div className="space-y-3">
        <button
          onClick={onGenerateList}
          disabled={wardrobeCount === 0}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {wardrobeCount === 0 ? 'Adiciona peças ao armário primeiro' : 'Gerar Lista Inteligente'}
        </button>
        <button
          onClick={onAddItem}
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold"
        >
          Adicionar Item Manual
        </button>
      </div>
    </div>

    {/* Shopping List Items */}
    {shoppingList.length > 0 ? (
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">
          Lista de Compras ({shoppingList.filter(item => !item.purchased).length} pendentes)
        </h3>
        <div className="space-y-3">
          {shoppingList.map(item => (
            <div key={item.id} className={`p-3 rounded-lg border ${
              item.purchased ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onTogglePurchased(item.id, item.estimatedPrice)}
                    className={`p-1 rounded ${
                      item.purchased ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </button>
                  
                  <div className="flex-1">
                    <h4 className={`font-semibold ${item.purchased ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {item.item}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className="text-sm text-gray-600">€{item.estimatedPrice}</span>
                      <span className="text-xs text-gray-500">{item.category}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              {item.reasoning && (
                <p className="text-xs text-gray-600 ml-8">{item.reasoning}</p>
              )}
              
              {item.combinations && (
                <p className="text-xs text-blue-700 ml-8 mt-1">💡 {item.combinations}</p>
              )}
              
              {item.whereToBy && (
                <p className="text-xs text-purple-700 ml-8">📍 {item.whereToBy}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Lista vazia</h3>
        <p className="text-gray-600 mb-4">Gera uma lista inteligente ou adiciona itens manualmente</p>
      </div>
    )}
  </div>
);

// Analysis Tab
const AnalysisTab = ({ gapAnalysis, wardrobe, onGenerateAnalysis }) => {
  if (!gapAnalysis) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Análise não disponível</h3>
        <p className="text-gray-600 mb-4">Gera uma lista inteligente para ver a análise completa</p>
        <button
          onClick={onGenerateAnalysis}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-6 rounded-lg font-semibold"
        >
          Gerar Análise
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gap Analysis */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Análise de Gaps</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-red-700 mb-1">❌ Categorias em Falta:</h4>
            <div className="flex flex-wrap gap-1">
              {gapAnalysis.gapAnalysis.missingCategories.map((cat, index) => (
                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  {cat}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-700 mb-1">⚠️ Áreas Fracas:</h4>
            <div className="flex flex-wrap gap-1">
              {gapAnalysis.gapAnalysis.weakAreas.map((area, index) => (
                <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                  {area}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-700 mb-1">✅ Pontos Fortes:</h4>
            <div className="flex flex-wrap gap-1">
              {gapAnalysis.gapAnalysis.strengths.map((strength, index) => (
                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  {strength}
                </span>
              ))}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Score de Versatilidade:</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${gapAnalysis.gapAnalysis.versatilityScore}%` }}
                  />
                </div>
                <span className="text-sm font-bold">{gapAnalysis.gapAnalysis.versatilityScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Orçamento Sugerido</h3>
        
        <div className="space-y-2">
          <div className="text-center">
            <span className="text-2xl font-bold text-green-600">€{gapAnalysis.budgetBreakdown.total}</span>
            <p className="text-sm text-gray-600">Total recomendado</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Por Categoria:</h4>
              {Object.entries(gapAnalysis.budgetBreakdown.byCategory || {}).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span>{cat}:</span>
                  <span>€{amount}</span>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Por Prioridade:</h4>
              {Object.entries(gapAnalysis.budgetBreakdown.byPriority || {}).map(([priority, amount]) => (
                <div key={priority} className="flex justify-between text-sm">
                  <span>{priority}:</span>
                  <span>€{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Strategy */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Estratégia de Compras</h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-blue-700">📅 Timeline:</h4>
            <p className="text-sm text-gray-700">{gapAnalysis.shoppingStrategy.timeline}</p>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-700">💡 Dicas:</h4>
            <ul className="list-disc list-inside text-sm text-gray-700 ml-2">
              {gapAnalysis.shoppingStrategy.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-700">🏷️ Épocas de Saldos:</h4>
            <p className="text-sm text-gray-700">{gapAnalysis.shoppingStrategy.salesSeasons}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// History Tab
const HistoryTab = ({ shoppingHistory, budget }) => {
  const thisMonth = shoppingHistory.filter(item => {
    const purchaseDate = new Date(item.purchasedAt);
    const now = new Date();
    return purchaseDate.getMonth() === now.getMonth() && 
           purchaseDate.getFullYear() === now.getFullYear();
  });

  const totalSpentThisMonth = thisMonth.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-4">
      {/* Monthly Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-bold text-gray-800 mb-3">Resumo Mensal</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{thisMonth.length}</div>
            <div className="text-sm text-gray-600">Itens comprados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">€{totalSpentThisMonth}</div>
            <div className="text-sm text-gray-600">Gasto este mês</div>
          </div>
        </div>
      </div>

      {/* Purchase History */}
      {shoppingHistory.length > 0 ? (
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <h3 className="font-bold text-gray-800 mb-3">Histórico de Compras</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {shoppingHistory
              .sort((a, b) => new Date(b.purchasedAt) - new Date(a.purchasedAt))
              .map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-800">{item.item}</span>
                    <div className="text-xs text-gray-500">
                      {new Date(item.purchasedAt).toLocaleDateString('pt-PT')} • {item.category}
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">€{item.price}</span>
                </div>
              ))
            }
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Sem histórico</h3>
          <p className="text-gray-600">As tuas compras aparecerão aqui</p>
        </div>
      )}
    </div>
  );
};

// Add Item Modal
const AddItemModal = ({ onAdd, onClose }) => {
  const [item, setItem] = useState({
    item: '',
    category: '',
    priority: 'Média',
    estimatedPrice: '',
    whereToBy: '',
    reasoning: ''
  });

  const categories = ['Tops', 'Bottoms', 'Shoes', 'Accessories', 'Outerwear', 'Underwear'];

  const handleSubmit = () => {
    if (!item.item || !item.category || !item.estimatedPrice) {
      alert('Por favor preenche os campos obrigatórios');
      return;
    }
    
    onAdd({
      ...item,
      estimatedPrice: parseFloat(item.estimatedPrice)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Adicionar Item</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Nome do item *
            </label>
            <input
              type="text"
              value={item.item}
              onChange={(e) => setItem(prev => ({ ...prev, item: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              placeholder="Ex: Camisa branca básica"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                value={item.category}
                onChange={(e) => setItem(prev => ({ ...prev, category: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Seleciona...</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                value={item.priority}
                onChange={(e) => setItem(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              >
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Preço estimado (€) *
              </label>
              <input
                type="number"
                value={item.estimatedPrice}
                onChange={(e) => setItem(prev => ({ ...prev, estimatedPrice: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="50"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Onde comprar
              </label>
              <input
                type="text"
                value={item.whereToBy}
                onChange={(e) => setItem(prev => ({ ...prev, whereToBy: e.target.value }))}
                className="w-full p-3 border rounded-lg"
                placeholder="Zara, H&M..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Motivo/Notas
            </label>
            <textarea
              value={item.reasoning}
              onChange={(e) => setItem(prev => ({ ...prev, reasoning: e.target.value }))}
              className="w-full p-3 border rounded-lg h-20 resize-none"
              placeholder="Porque precisas desta peça..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartShoppingScreen;