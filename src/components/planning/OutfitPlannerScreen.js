import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Edit, Trash2, Clock, MapPin, Sun, CloudRain, Snowflake } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const OutfitPlannerScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [plannedOutfits, setPlannedOutfits] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWeekView, setShowWeekView] = useState(false);
  const [weatherData, setWeatherData] = useState({});

  // Load planned outfits from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('whatToWear_plannedOutfits');
    if (saved) {
      setPlannedOutfits(JSON.parse(saved));
    }
  }, []);

  // Save planned outfits to localStorage
  const savePlannedOutfits = (newPlannedOutfits) => {
    setPlannedOutfits(newPlannedOutfits);
    localStorage.setItem('whatToWear_plannedOutfits', JSON.stringify(newPlannedOutfits));
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const addPlannedOutfit = (outfit) => {
    const dateKey = formatDateKey(selectedDate);
    const newPlannedOutfits = {
      ...plannedOutfits,
      [dateKey]: [...(plannedOutfits[dateKey] || []), { ...outfit, id: Date.now() }]
    };
    savePlannedOutfits(newPlannedOutfits);
    setShowAddModal(false);
  };

  const removePlannedOutfit = (date, outfitId) => {
    const dateKey = formatDateKey(date);
    const newPlannedOutfits = {
      ...plannedOutfits,
      [dateKey]: plannedOutfits[dateKey]?.filter(outfit => outfit.id !== outfitId) || []
    };
    savePlannedOutfits(newPlannedOutfits);
  };

  const generateWeekOutfits = async () => {
    try {
      const startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
      
      const prompt = `Como personal stylist, cria um plano de outfits para uma semana (7 dias) usando este armário.

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

OUTFITS EXISTENTES:
${outfits.map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'})`).join('\n')}

Cria um plano variado para:
- Segunda: Trabalho/profissional
- Terça: Casual elegante
- Quarta: Reuniões importantes
- Quinta: Casual criativo
- Sexta: Casual ou social
- Sábado: Relaxado/fim de semana
- Domingo: Casual confortável

Para cada dia, especifica:
1. Nome do outfit
2. Peças específicas
3. Ocasião/contexto
4. Dicas de styling

Formato JSON:
{
  "weekPlan": [
    {
      "day": "Segunda",
      "outfit": "nome",
      "pieces": ["peça1", "peça2", "peça3"],
      "occasion": "ocasião",
      "tips": "dicas",
      "weather": "ideal weather"
    }
  ]
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist expert em criar planos de outfits organizados e variados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const weekData = JSON.parse(jsonMatch[0]);
        
        // Add to planned outfits
        const newPlannedOutfits = { ...plannedOutfits };
        weekData.weekPlan.forEach((dayPlan, index) => {
          const date = new Date(startDate);
          date.setDate(date.getDate() + index);
          const dateKey = formatDateKey(date);
          
          newPlannedOutfits[dateKey] = [
            ...(newPlannedOutfits[dateKey] || []),
            {
              id: Date.now() + index,
              name: dayPlan.outfit,
              pieces: dayPlan.pieces,
              occasion: dayPlan.occasion,
              tips: dayPlan.tips,
              weather: dayPlan.weather,
              type: 'ai-generated'
            }
          ];
        });
        
        savePlannedOutfits(newPlannedOutfits);
        alert('Plano da semana criado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao gerar plano da semana: ' + error.message);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return date && 
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const getOutfitsForDate = (date) => {
    if (!date) return [];
    const dateKey = formatDateKey(date);
    return plannedOutfits[dateKey] || [];
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Planeador de Outfits</h1>
        </div>

        {/* View Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setShowWeekView(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                !showWeekView ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setShowWeekView(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                showWeekView ? 'bg-blue-500 text-white' : 'text-gray-600'
              }`}
            >
              Semana
            </button>
          </div>
        </div>

        {/* Calendar Header */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ‹
            </button>
            <h2 className="text-lg font-bold text-gray-800">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => {
                const newDate = new Date(currentDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDate(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded"
            >
              ›
            </button>
          </div>

          {showWeekView ? (
            <WeekView
              currentDate={currentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getOutfitsForDate={getOutfitsForDate}
              isToday={isToday}
              isSelected={isSelected}
              weekDayNames={weekDayNames}
              getWeekDays={getWeekDays}
            />
          ) : (
            <MonthView
              currentDate={currentDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              getOutfitsForDate={getOutfitsForDate}
              isToday={isToday}
              isSelected={isSelected}
              weekDayNames={weekDayNames}
              getDaysInMonth={getDaysInMonth}
            />
          )}
        </div>

        {/* AI Planning Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">Planeamento Inteligente</h3>
          <div className="space-y-2">
            <button
              onClick={generateWeekOutfits}
              disabled={wardrobe.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Gerar Plano da Semana
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 rounded-lg font-semibold"
            >
              Adicionar Outfit Manual
            </button>
          </div>
        </div>

        {/* Selected Date Outfits */}
        <SelectedDateOutfits
          selectedDate={selectedDate}
          outfits={getOutfitsForDate(selectedDate)}
          onRemoveOutfit={removePlannedOutfit}
          onAddOutfit={() => setShowAddModal(true)}
        />

        {/* Add Outfit Modal */}
        {showAddModal && (
          <AddOutfitModal
            selectedDate={selectedDate}
            existingOutfits={outfits}
            wardrobe={wardrobe}
            onAdd={addPlannedOutfit}
            onClose={() => setShowAddModal(false)}
            openaiApiKey={openaiApiKey}
          />
        )}
      </div>
    </div>
  );
};

// Month View Component
const MonthView = ({ 
  currentDate, 
  selectedDate, 
  setSelectedDate, 
  getOutfitsForDate, 
  isToday, 
  isSelected, 
  weekDayNames, 
  getDaysInMonth 
}) => {
  const days = getDaysInMonth(currentDate);

  return (
    <div>
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const outfits = getOutfitsForDate(date);
          return (
            <button
              key={index}
              onClick={() => date && setSelectedDate(date)}
              className={`aspect-square p-1 text-xs relative ${
                !date ? 'invisible' :
                isSelected(date) ? 'bg-blue-500 text-white' :
                isToday(date) ? 'bg-blue-100 text-blue-800 font-semibold' :
                'hover:bg-gray-100'
              } rounded transition-colors`}
            >
              {date && (
                <>
                  <div>{date.getDate()}</div>
                  {outfits.length > 0 && (
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Week View Component
const WeekView = ({ 
  currentDate, 
  selectedDate, 
  setSelectedDate, 
  getOutfitsForDate, 
  isToday, 
  isSelected, 
  weekDayNames, 
  getWeekDays 
}) => {
  const weekDays = getWeekDays(currentDate);

  return (
    <div className="space-y-2">
      {weekDays.map((date, index) => {
        const outfits = getOutfitsForDate(date);
        return (
          <button
            key={index}
            onClick={() => setSelectedDate(date)}
            className={`w-full p-3 text-left rounded-lg transition-colors ${
              isSelected(date) ? 'bg-blue-500 text-white' :
              isToday(date) ? 'bg-blue-100 text-blue-800' :
              'hover:bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{weekDayNames[date.getDay()]}</div>
                <div className="text-sm opacity-75">{date.getDate()}</div>
              </div>
              <div className="text-right">
                {outfits.length > 0 ? (
                  <div className="text-xs">
                    {outfits.length} outfit{outfits.length > 1 ? 's' : ''}
                  </div>
                ) : (
                  <div className="text-xs opacity-50">Sem planos</div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Selected Date Outfits Component
const SelectedDateOutfits = ({ selectedDate, outfits, onRemoveOutfit, onAddOutfit }) => {
  const formatSelectedDate = (date) => {
    return date.toLocaleDateString('pt-PT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          {formatSelectedDate(selectedDate)}
        </h3>
        <button
          onClick={onAddOutfit}
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {outfits.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Nenhum outfit planeado para este dia</p>
          <button
            onClick={onAddOutfit}
            className="mt-2 text-blue-600 text-sm underline"
          >
            Adicionar outfit
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {outfits.map(outfit => (
            <div key={outfit.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">{outfit.name}</h4>
                  {outfit.occasion && (
                    <p className="text-sm text-gray-600">{outfit.occasion}</p>
                  )}
                  {outfit.type === 'ai-generated' && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      IA
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveOutfit(selectedDate, outfit.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {outfit.pieces && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {outfit.pieces.map((piece, index) => (
                      <span key={index} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {outfit.tips && (
                <p className="text-xs text-gray-600 italic">{outfit.tips}</p>
              )}

              {outfit.weather && (
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <Sun className="h-3 w-3 mr-1" />
                  <span>{outfit.weather}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add Outfit Modal Component
const AddOutfitModal = ({ selectedDate, existingOutfits, wardrobe, onAdd, onClose, openaiApiKey }) => {
  const [mode, setMode] = useState('existing'); // 'existing' or 'custom' or 'ai'
  const [selectedOutfit, setSelectedOutfit] = useState('');
  const [customOutfit, setCustomOutfit] = useState({
    name: '',
    occasion: '',
    pieces: [],
    tips: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { callOpenAI } = useOpenAI(openaiApiKey);

  const generateAIOutfit = async () => {
    setIsGenerating(true);
    try {
      const dayName = selectedDate.toLocaleDateString('pt-PT', { weekday: 'long' });
      const prompt = `Cria um outfit específico para ${dayName}, ${selectedDate.toLocaleDateString('pt-PT')}.

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Considera:
- Dia da semana (${dayName})
- Estação do ano
- Versatilidade das peças
- Ocasiões típicas deste dia

Cria um outfit completo com nome, peças específicas e dicas.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist que cria outfits específicos para cada dia.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      // Extract outfit info from response
      const outfitMatch = response.match(/Nome:\s*(.+)/i);
      const piecesMatch = response.match(/Peças:\s*(.+)/i);
      const tipsMatch = response.match(/Dicas:\s*(.+)/i);

      const aiOutfit = {
        name: outfitMatch?.[1] || `Outfit IA ${dayName}`,
        occasion: `${dayName} - IA`,
        pieces: piecesMatch?.[1]?.split(',').map(p => p.trim()) || [],
        tips: tipsMatch?.[1] || response.substring(0, 100) + '...',
        type: 'ai-generated'
      };

      onAdd(aiOutfit);
    } catch (error) {
      alert('Erro ao gerar outfit: ' + error.message);
    }
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (mode === 'existing' && selectedOutfit) {
      const outfit = existingOutfits.find(o => o.id === selectedOutfit);
      onAdd({
        name: outfit.name,
        occasion: outfit.occasion,
        pieces: Object.values(outfit.pieces || {}).filter(Boolean),
        type: 'existing'
      });
    } else if (mode === 'custom' && customOutfit.name) {
      onAdd({
        ...customOutfit,
        type: 'custom'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Adicionar Outfit</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            {selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 px-3 rounded text-sm font-semibold ${
              mode === 'existing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Existente
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 px-3 rounded text-sm font-semibold ${
              mode === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Personalizado
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex-1 py-2 px-3 rounded text-sm font-semibold ${
              mode === 'ai' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            IA
          </button>
        </div>

        {mode === 'existing' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Escolher outfit existente:
            </label>
            <select
              value={selectedOutfit}
              onChange={(e) => setSelectedOutfit(e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Seleciona um outfit...</option>
              {existingOutfits.map(outfit => (
                <option key={outfit.id} value={outfit.id}>
                  {outfit.name} {outfit.occasion && `(${outfit.occasion})`}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'custom' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nome do outfit:
              </label>
              <input
                type="text"
                value={customOutfit.name}
                onChange={(e) => setCustomOutfit(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Ex: Look casual sexta"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Ocasião:
              </label>
              <input
                type="text"
                value={customOutfit.occasion}
                onChange={(e) => setCustomOutfit(prev => ({ ...prev, occasion: e.target.value }))}
                className="w-full p-2 border rounded"
                placeholder="Ex: Trabalho, Casual, Festa..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Peças (uma por linha):
              </label>
              <textarea
                value={customOutfit.pieces.join('\n')}
                onChange={(e) => setCustomOutfit(prev => ({ 
                  ...prev, 
                  pieces: e.target.value.split('\n').filter(p => p.trim()) 
                }))}
                className="w-full p-2 border rounded h-20"
                placeholder="Camisa branca&#10;Calças pretas&#10;Sapatos pretos"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Notas/Dicas:
              </label>
              <textarea
                value={customOutfit.tips}
                onChange={(e) => setCustomOutfit(prev => ({ ...prev, tips: e.target.value }))}
                className="w-full p-2 border rounded h-16"
                placeholder="Dicas de styling, acessórios, etc..."
              />
            </div>
          </div>
        )}

        {mode === 'ai' && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              A IA vai criar um outfit perfeito para este dia baseado no teu armário
            </p>
            <button
              onClick={generateAIOutfit}
              disabled={isGenerating || wardrobe.length === 0}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {isGenerating ? 'A gerar...' : 'Gerar Outfit com IA'}
            </button>
          </div>
        )}

        {(mode === 'existing' || mode === 'custom') && (
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                (mode === 'existing' && !selectedOutfit) ||
                (mode === 'custom' && !customOutfit.name)
              }
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitPlannerScreen;