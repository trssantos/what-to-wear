import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Star, Search, Plus, Edit, Trash2, Camera, Heart, Share2 } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const EventPlannerScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [activeTab, setActiveTab] = useState('upcoming');
  const [events, setEvents] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('whatToWear_events');
    if (saved) {
      setEvents(JSON.parse(saved));
    }
  }, []);

  // Save events to localStorage
  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('whatToWear_events', JSON.stringify(newEvents));
  };

  const eventTypes = [
    { id: 'wedding', name: 'Casamento', icon: '💒', description: 'Cerimónia e receção', dressCode: 'Formal/Semi-formal' },
    { id: 'party', name: 'Festa', icon: '🎉', description: 'Festa de aniversário ou celebração', dressCode: 'Casual elegante' },
    { id: 'dinner', name: 'Jantar Formal', icon: '🍽️', description: 'Jantar elegante ou negócios', dressCode: 'Business formal' },
    { id: 'cocktail', name: 'Cocktail Party', icon: '🍸', description: 'Evento social após trabalho', dressCode: 'Cocktail attire' },
    { id: 'gala', name: 'Gala/Baile', icon: '🎭', description: 'Evento de gala ou baile formal', dressCode: 'Black tie' },
    { id: 'graduation', name: 'Formatura', icon: '🎓', description: 'Cerimónia de graduação', dressCode: 'Smart casual' },
    { id: 'baptism', name: 'Batizado', icon: '👶', description: 'Cerimónia religiosa', dressCode: 'Conservador elegante' },
    { id: 'conference', name: 'Conferência', icon: '📊', description: 'Evento profissional', dressCode: 'Business professional' },
    { id: 'date', name: 'Encontro Romântico', icon: '💕', description: 'Jantar ou atividade a dois', dressCode: 'Elegante casual' },
    { id: 'networking', name: 'Networking', icon: '🤝', description: 'Evento de networking profissional', dressCode: 'Business casual' }
  ];

  const addEvent = (eventData) => {
    const newEvent = {
      ...eventData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      outfitPlanned: false
    };
    saveEvents([...events, newEvent]);
    setShowAddEvent(false);
  };

  const updateEvent = (eventId, updates) => {
    const newEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    );
    saveEvents(newEvents);
  };

  const deleteEvent = (eventId) => {
    const newEvents = events.filter(event => event.id !== eventId);
    saveEvents(newEvents);
  };

  const generateEventOutfit = async (event) => {
    if (!openaiApiKey) {
      alert('Por favor configura a API key do OpenAI primeiro.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const eventType = eventTypes.find(type => type.id === event.type);
      
      const prompt = `Como personal stylist especializado em eventos, cria o outfit perfeito para este evento:

DETALHES DO EVENTO:
- Tipo: ${eventType?.name || event.type}
- Data: ${event.date}
- Hora: ${event.time}
- Local: ${event.location}
- Dress Code: ${eventType?.dressCode || 'Não especificado'}
- Notas: ${event.notes || 'Nenhuma'}

ARMÁRIO DISPONÍVEL:
${wardrobe.slice(0, 20).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

OUTFITS EXISTENTES:
${outfits.slice(0, 10).map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'})`).join('\n')}

CONSIDERA:
1. Apropriado para a ocasião e dress code
2. Estação do ano e hora do evento
3. Peças disponíveis no armário
4. Acessórios e coordenação
5. Conforto vs elegância
6. Protocolo social se aplicável

FORNECE:
1. Outfit completo (cabeça aos pés)
2. Alternativas se peças não disponíveis
3. Sugestões de acessórios
4. Dicas de styling
5. Considerações especiais
6. Backup options
7. Beauty/grooming suggestions

Formato: Estrutura clara por secções.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist expert em eventos sociais com 15 anos de experiência. Especializas-te em dress codes e etiqueta social.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      // Update event with generated outfit
      updateEvent(event.id, {
        generatedOutfit: response,
        outfitPlanned: true,
        lastUpdated: new Date().toISOString()
      });

      alert(`Outfit gerado para ${event.name}! Verifica os detalhes do evento.`);
      
    } catch (error) {
      alert('Erro ao gerar outfit: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'upcoming') {
      return matchesSearch && new Date(event.date) >= new Date();
    } else if (activeTab === 'past') {
      return matchesSearch && new Date(event.date) < new Date();
    }
    return matchesSearch;
  });

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-pulse mb-4">
            <div className="text-6xl mb-4">🎭</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Criando look perfeito...</h2>
          <p className="text-gray-600 mb-4">Analisando dress code e ocasião</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>💃 Considerando etiqueta social...</div>
            <div>👗 Selecionando peças apropriadas...</div>
            <div>✨ Coordenando acessórios...</div>
            <div>🎯 Finalizando styling...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Planeador de Eventos</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-xl mb-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'upcoming' ? 'bg-purple-500 text-white' : 'text-gray-600'
              }`}
            >
              📅 Próximos
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'past' ? 'bg-purple-500 text-white' : 'text-gray-600'
              }`}
            >
              📁 Passados
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'types' ? 'bg-purple-500 text-white' : 'text-gray-600'
              }`}
            >
              🎭 Tipos
            </button>
          </div>
        </div>

        {/* Add Event Button */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <button
            onClick={() => setShowAddEvent(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Adicionar Evento</span>
          </button>
        </div>

        {/* Search */}
        {(activeTab === 'upcoming' || activeTab === 'past') && (
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Procurar eventos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'types' ? (
          <EventTypesTab eventTypes={eventTypes} />
        ) : (
          <EventsListTab 
            events={filteredEvents}
            onEditEvent={setSelectedEvent}
            onDeleteEvent={deleteEvent}
            onGenerateOutfit={generateEventOutfit}
            activeTab={activeTab}
          />
        )}

        {/* Add Event Modal */}
        {showAddEvent && (
          <AddEventModal
            eventTypes={eventTypes}
            onAdd={addEvent}
            onClose={() => setShowAddEvent(false)}
          />
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            eventTypes={eventTypes}
            onClose={() => setSelectedEvent(null)}
            onUpdate={updateEvent}
            onGenerateOutfit={generateEventOutfit}
          />
        )}
      </div>
    </div>
  );
};

// Event Types Tab Component
const EventTypesTab = ({ eventTypes }) => (
  <div className="space-y-4">
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">Tipos de Eventos</h3>
      <p className="text-sm text-gray-600 mb-4">
        Conhece os dress codes para diferentes ocasiões
      </p>
      
      <div className="space-y-3">
        {eventTypes.map((type) => (
          <div key={type.id} className="p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{type.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{type.name}</h4>
                <p className="text-sm text-gray-600 mb-1">{type.description}</p>
                <div className="text-xs text-purple-600 font-medium">
                  Dress Code: {type.dressCode}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Dress Code Guide */}
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <h3 className="font-semibold text-gray-800 mb-3">Guia de Dress Codes</h3>
      
      <div className="space-y-3 text-sm">
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-800">Black Tie</div>
          <div className="text-gray-600">Vestido longo, smoking opcional</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-800">Cocktail Attire</div>
          <div className="text-gray-600">Vestido midi, fato elegante</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-800">Business Formal</div>
          <div className="text-gray-600">Fato conservador, cores neutras</div>
        </div>
        
        <div className="p-2 bg-gray-50 rounded">
          <div className="font-medium text-gray-800">Smart Casual</div>
          <div className="text-gray-600">Elegante mas descontraído</div>
        </div>
      </div>
    </div>
  </div>
);

// Events List Tab Component
const EventsListTab = ({ events, onEditEvent, onDeleteEvent, onGenerateOutfit, activeTab }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <div className="text-6xl mb-4">
          {activeTab === 'upcoming' ? '📅' : '📁'}
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {activeTab === 'upcoming' ? 'Nenhum evento próximo' : 'Nenhum evento passado'}
        </h3>
        <p className="text-gray-600">
          {activeTab === 'upcoming' 
            ? 'Adiciona o teu próximo evento para começar o planeamento!'
            : 'Os eventos passados aparecerão aqui.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEditEvent}
          onDelete={onDeleteEvent}
          onGenerateOutfit={onGenerateOutfit}
        />
      ))}
    </div>
  );
};

// Event Card Component
const EventCard = ({ event, onEdit, onDelete, onGenerateOutfit }) => {
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();
  const eventType = event.type;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg">{event.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
            <Calendar className="h-4 w-4" />
            <span>{eventDate.toLocaleDateString('pt-PT')}</span>
            {event.time && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{event.time}</span>
              </>
            )}
          </div>
          {event.location && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(event)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(event.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {event.dressCode && (
        <div className="mb-3">
          <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
            {event.dressCode}
          </span>
        </div>
      )}

      {event.outfitPlanned ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2 text-green-700 mb-2">
            <Star className="h-4 w-4" />
            <span className="font-medium">Outfit Planeado</span>
          </div>
          <button
            onClick={() => onEdit(event)}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Ver detalhes do outfit →
          </button>
        </div>
      ) : isUpcoming ? (
        <button
          onClick={() => onGenerateOutfit(event)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-medium text-sm"
        >
          🎭 Gerar Outfit Perfeito
        </button>
      ) : (
        <div className="text-sm text-gray-500 text-center py-2">
          Evento passado
        </div>
      )}
    </div>
  );
};

// Add Event Modal Component
const AddEventModal = ({ eventTypes, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    date: '',
    time: '',
    location: '',
    dressCode: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.date) {
      alert('Por favor preenche os campos obrigatórios.');
      return;
    }
    onAdd(formData);
  };

  const selectedEventType = eventTypes.find(type => type.id === formData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Adicionar Evento</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nome do Evento *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Casamento da Ana"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Tipo de Evento *</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const selectedType = eventTypes.find(type => type.id === e.target.value);
                  setFormData(prev => ({ 
                    ...prev, 
                    type: e.target.value,
                    dressCode: selectedType?.dressCode || ''
                  }));
                }}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Selecionar tipo</option>
                {eventTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedEventType && (
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700">
                  <strong>Dress Code:</strong> {selectedEventType.dressCode}
                </div>
                <div className="text-sm text-purple-600 mt-1">
                  {selectedEventType.description}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Data *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Local</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Quinta da Bouça, Sintra"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Dress Code Personalizado</label>
              <input
                type="text"
                value={formData.dressCode}
                onChange={(e) => setFormData(prev => ({ ...prev, dressCode: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Personalizar se diferente do padrão"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="3"
                placeholder="Tema, cores específicas, observações..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
              >
                Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Event Detail Modal Component
const EventDetailModal = ({ event, eventTypes, onClose, onUpdate, onGenerateOutfit }) => {
  const eventType = eventTypes.find(type => type.id === event.type);
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{event.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ×
            </button>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{eventType?.icon}</span>
              <div>
                <div className="font-medium text-gray-800">{eventType?.name}</div>
                <div className="text-sm text-gray-600">{eventType?.description}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{eventDate.toLocaleDateString('pt-PT')}</span>
              {event.time && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{event.time}</span>
                </>
              )}
            </div>

            {event.location && (
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}

            {event.dressCode && (
              <div>
                <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                  {event.dressCode}
                </span>
              </div>
            )}

            {event.notes && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-700">{event.notes}</div>
              </div>
            )}
          </div>

          {/* Generated Outfit */}
          {event.generatedOutfit && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                Outfit Gerado
              </h3>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {event.generatedOutfit.length > 300 
                    ? `${event.generatedOutfit.substring(0, 300)}...`
                    : event.generatedOutfit
                  }
                </div>
                {event.generatedOutfit.length > 300 && (
                  <button className="text-purple-600 text-sm mt-2 hover:underline">
                    Ver outfit completo
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            {!event.outfitPlanned && isUpcoming && (
              <button
                onClick={() => {
                  onGenerateOutfit(event);
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium"
              >
                🎭 Gerar Outfit Perfeito
              </button>
            )}

            {event.outfitPlanned && (
              <button
                onClick={() => {
                  onGenerateOutfit(event);
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-medium"
              >
                🔄 Regenerar Outfit
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPlannerScreen;