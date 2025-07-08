import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, Target, TrendingUp, User, Lightbulb, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const PersonalStylistScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [activeService, setActiveService] = useState(null);
  const [consultation, setConsultation] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stylistProfile, setStylistProfile] = useState(null);

  const stylistServices = [
    {
      id: 'style-audit',
      name: 'Auditoria de Estilo Completa',
      description: 'Análise profunda do teu armário, estilo atual e potencial de melhoria',
      icon: <Target className="h-8 w-8" />,
      duration: '45 min',
      price: 'Análise completa',
      includes: [
        'Análise detalhada do armário',
        'Identificação do teu estilo pessoal',
        'Gaps e oportunidades',
        'Plano de desenvolvimento de 90 dias',
        'Orçamento otimizado'
      ]
    },
    {
      id: 'signature-style',
      name: 'Criação de Signature Style',
      description: 'Desenvolve um estilo único e reconhecível que te representa',
      icon: <Star className="h-8 w-8" />,
      duration: '60 min',
      price: 'Desenvolvimento de marca pessoal',
      includes: [
        'Definição da tua marca pessoal',
        'Criação de signature looks',
        'Paleta de cores personalizada',
        'Guidelines de styling',
        'Looks para diferentes ocasiões'
      ]
    },
    {
      id: 'wardrobe-transformation',
      name: 'Transformação de Armário',
      description: 'Plano estratégico para renovar completamente o teu guarda-roupa',
      icon: <TrendingUp className="h-8 w-8" />,
      duration: '90 min',
      price: 'Makeover completo',
      includes: [
        'Decluttering guiado',
        'Lista prioritária de compras',
        'Cronograma de renovação',
        'Maximização de combinações',
        'Estratégia de investment pieces'
      ]
    },
    {
      id: 'event-styling',
      name: 'Styling para Eventos',
      description: 'Consultoria especializada para eventos importantes',
      icon: <Calendar className="h-8 w-8" />,
      duration: '30 min',
      price: 'Evento perfeito',
      includes: [
        'Análise do dress code',
        'Looks específicos para o evento',
        'Alternativas e backup plans',
        'Coordenação completa (makeup/cabelo)',
        'Dicas de confiança'
      ]
    },
    {
      id: 'lifestyle-styling',
      name: 'Styling para Lifestyle',
      description: 'Adaptação do estilo ao teu estilo de vida e objetivos',
      icon: <User className="h-8 w-8" />,
      duration: '45 min',
      price: 'Estilo funcional',
      includes: [
        'Análise do dia-a-dia',
        'Otimização para rotina',
        'Versatilidade maximizada',
        'Comfort meets style',
        'Sustainable fashion tips'
      ]
    },
    {
      id: 'trend-integration',
      name: 'Integração de Tendências',
      description: 'Como incorporar tendências de forma inteligente no teu estilo',
      icon: <Lightbulb className="h-8 w-8" />,
      duration: '35 min',
      price: 'Always on-trend',
      includes: [
        'Análise de tendências atuais',
        'Filtro personalizado de trends',
        'Como adaptar ao teu estilo',
        'Investment vs fast fashion',
        'Timeline de adoção'
      ]
    }
  ];

  useEffect(() => {
    generateStylistProfile();
  }, []);

  const generateStylistProfile = async () => {
    try {
      const prompt = `Como personal stylist AI de elite, cria um perfil profissional baseado na análise do cliente.

DADOS DO CLIENTE:
ARMÁRIO: ${wardrobe.length} peças
${wardrobe.slice(0, 10).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

OUTFITS: ${outfits.length} criados
${outfits.slice(0, 5).map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'})`).join('\n')}

PERFIL EXISTENTE:
${userProfile ? `
- Estação de cor: ${userProfile.colorSeason || 'N/A'}
- Body shape: ${userProfile.bodyShape || 'N/A'}
- Última análise: ${userProfile.analyzedAt || 'N/A'}
` : 'Perfil em desenvolvimento'}

Cria um perfil de stylist personalizado incluindo:
1. **DIAGNÓSTICO INICIAL**: Estado atual do estilo
2. **POTENCIAL IDENTIFICADO**: Onde pode melhorar
3. **ESTILO NATURAL**: Tendência natural do cliente
4. **RECOMENDAÇÕES PRIORITÁRIAS**: Top 3 focos
5. **PERSONALIDADE DE STYLIST**: Que tipo de abordagem usar

Responde em formato de consulta profissional, como se fosses um stylist real a avaliar um novo cliente.`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist profissional de elite com 15 anos de experiência. Fazes diagnósticos precisos e recommendations estratégicas.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      setStylistProfile(response);
    } catch (error) {
      console.error('Error generating stylist profile:', error);
    }
  };

  const startConsultation = async (service) => {
    setActiveService(service);
    setIsGenerating(true);

    try {
      let prompt;
      
      switch (service.id) {
        case 'style-audit':
          prompt = `Como personal stylist expert, realiza uma auditoria completa de estilo para este cliente.

DADOS COMPLETOS:
ARMÁRIO (${wardrobe.length} peças):
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - ${item.condition || 'N/A'} - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

OUTFITS (${outfits.length}):
${outfits.map(outfit => `- ${outfit.name} (${outfit.occasion || 'casual'}) - Peças: ${outfit.pieces ? Object.values(outfit.pieces).filter(Boolean).join(', ') : 'N/A'}`).join('\n')}

PERFIL:
${userProfile ? `
- Estação de cor: ${userProfile.colorSeason || 'N/A'}
- Body shape: ${userProfile.bodyShape || 'N/A'}
- Análises feitas: ${userProfile.analyzedAt || 'N/A'}
` : 'Perfil básico'}

AUDITORIA COMPLETA:

1. **DIAGNÓSTICO DO ARMÁRIO**
   - Análise por categoria (força/fraqueza)
   - Quality assessment
   - Versatilidade score
   - Investment pieces vs fast fashion

2. **ESTILO ATUAL**
   - Identificação do estilo predominante
   - Consistência e coerência
   - Signature pieces
   - Personal brand clarity

3. **GAPS CRÍTICOS**
   - Peças essenciais em falta
   - Categorias sub-representadas
   - Ocasiões mal cobertas
   - Problemas de fit/proporção

4. **POTENCIAL DE MELHORIA**
   - Onde investir primeiro
   - Quick wins (mudanças rápidas)
   - Long-term development
   - Budget allocation

5. **PLANO DE DESENVOLVIMENTO 90 DIAS**
   - Mês 1: Foundation building
   - Mês 2: Style refinement
   - Mês 3: Signature development
   - Milestones específicos

6. **ORÇAMENTO OTIMIZADO**
   - Investimentos por prioridade
   - Timeline de compras
   - ROI esperado por peça
   - Sustainable options

Sê específico, prático e actionable. Usa dados concretos.`;
          break;

        case 'signature-style':
          prompt = `Desenvolve um signature style único para este cliente baseado na análise completa.

[Include wardrobe and profile data...]

CRIAÇÃO DE SIGNATURE STYLE:

1. **BRAND PESSOAL**
   - 3 palavras que definem o estilo
   - Mood board conceitual
   - Target audience (como quer ser percebido)
   - Core values refletidos no estilo

2. **SIGNATURE ELEMENTS**
   - Cores assinatura (3-5 cores)
   - Silhuetas preferidas
   - Texturas características
   - Acessórios marcantes

3. **LOOKS ASSINATURA**
   - 5 outfits icónicos usando o armário
   - Fórmulas de styling reproduzíveis
   - Peças statement vs basics
   - Variações sazonais

4. **GUIDELINES DE STYLING**
   - Regras de combinação
   - Proporções ideais
   - Color blocking strategies
   - Layering techniques

5. **OCASIÕES MASTER**
   - Work signature
   - Weekend signature  
   - Evening signature
   - Travel signature
   - Special events signature

Cria um estilo distintivo e memorável.`;
          break;

        case 'wardrobe-transformation':
          prompt = `Cria um plano completo de transformação de armário.

[Include all data...]

TRANSFORMAÇÃO ESTRATÉGICA:

1. **AUDIT & DECLUTTER**
   - Keep/Donate/Alter analysis
   - Cost per wear calculation
   - Emotional attachment assessment
   - Quality vs sentimental value

2. **FOUNDATION REBUILD**
   - Essential basics list
   - Investment pieces priority
   - Color palette refinement
   - Fit optimization needs

3. **CRONOGRAMA DE RENOVAÇÃO**
   - Fase 1 (Imediata): Essentials
   - Fase 2 (3 meses): Core building
   - Fase 3 (6 meses): Style refinement
   - Fase 4 (12 meses): Signature pieces

4. **MAXIMIZAÇÃO DE COMBINAÇÕES**
   - Cost per wear optimization
   - Mix & match strategies
   - Capsule wardrobe principles
   - Versatility multiplication

5. **INVESTMENT STRATEGY**
   - High ROI pieces
   - Timeless vs trendy allocation
   - Quality indicators
   - Price per wear targets

6. **SUSTAINABLE APPROACH**
   - Conscious consumption
   - Quality over quantity
   - Circular fashion integration
   - Local vs international brands

Foca em transformação gradual mas impactante.`;
          break;

        default:
          prompt = `Realiza uma consultoria especializada em ${service.name} para este cliente.

[Include relevant data...]

Fornece advice específico, actionable e personalizado para esta área de expertise.`;
      }

      const response = await callOpenAI([
        {
          role: 'system',
          content: `És um personal stylist de elite com expertise em ${service.name}. Forneças consultorias detalhadas, práticas e transformadoras.`
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      setConsultation({
        service: service,
        content: response,
        timestamp: new Date(),
        recommendations: extractRecommendations(response)
      });

    } catch (error) {
      alert('Erro na consultoria: ' + error.message);
    }
    setIsGenerating(false);
  };

  const extractRecommendations = (content) => {
    // Simple extraction of actionable items
    const lines = content.split('\n');
    const recommendations = lines
      .filter(line => line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.'))
      .slice(0, 5)
      .map(line => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter(line => line.length > 10);
    
    return recommendations;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-600 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Star className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Preparando consultoria...</h2>
          <p className="text-gray-600 mb-4">O teu personal stylist está a analisar tudo</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>📊 Analisando armário completo...</div>
            <div>🎯 Identificando oportunidades...</div>
            <div>💡 Criando recommendations...</div>
            <div>📋 Preparando plano personalizado...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Personal Stylist IA</h1>
        </div>

        {!consultation ? (
          <div className="space-y-4">
            {/* Stylist Profile */}
            {stylistProfile && (
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Personal Stylist IA</h2>
                    <p className="text-sm text-gray-600">Elite Fashion Consultant</p>
                  </div>
                </div>
                
                <div className="prose text-sm text-gray-700 max-h-48 overflow-y-auto">
                  <div className="whitespace-pre-wrap">{stylistProfile}</div>
                </div>
              </div>
            )}

            {/* Services Menu */}
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <h3 className="font-bold text-gray-800 mb-4">Serviços de Consultoria</h3>
              
              <div className="space-y-3">
                {stylistServices.map(service => (
                  <button
                    key={service.id}
                    onClick={() => startConsultation(service)}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-yellow-500 mt-1">
                        {service.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{service.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{service.duration}</span>
                          <span className="font-medium text-yellow-600">{service.price}</span>
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-xs text-gray-500">Inclui:</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {service.includes.slice(0, 3).map((item, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {item}
                              </span>
                            ))}
                            {service.includes.length > 3 && (
                              <span className="text-xs text-gray-400">+{service.includes.length - 3} mais</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-xl">
              <h3 className="font-semibold text-gray-800 mb-3">Status do Cliente</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{wardrobe.length}</div>
                  <div className="text-xs text-gray-600">Peças</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{outfits.length}</div>
                  <div className="text-xs text-gray-600">Outfits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProfile ? Object.keys(userProfile).length : 0}
                  </div>
                  <div className="text-xs text-gray-600">Análises</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <ConsultationResults
            consultation={consultation}
            onNewConsultation={() => setConsultation(null)}
            navigateToScreen={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
};

// Consultation Results Component
const ConsultationResults = ({ consultation, onNewConsultation, navigateToScreen }) => {
  const [completedActions, setCompletedActions] = useState([]);

  const toggleAction = (index) => {
    setCompletedActions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="space-y-4 max-h-[75vh] overflow-y-auto">
      {/* Consultation Header */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">{consultation.service.name}</h2>
          <span className="text-xs text-gray-500">
            {consultation.timestamp.toLocaleString('pt-PT')}
          </span>
        </div>
        <p className="text-sm text-gray-600">{consultation.service.description}</p>
      </div>

      {/* Consultation Content */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-4">Consultoria Completa</h3>
        <div className="prose text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
          {consultation.content}
        </div>
      </div>

      {/* Action Items */}
      {consultation.recommendations && consultation.recommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Ações Recomendadas</h3>
          <div className="space-y-2">
            {consultation.recommendations.map((action, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                  completedActions.includes(index) 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => toggleAction(index)}
              >
                <button className="mt-0.5">
                  {completedActions.includes(index) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                  )}
                </button>
                <span className={`text-sm flex-1 ${
                  completedActions.includes(index) 
                    ? 'text-green-800 line-through' 
                    : 'text-gray-700'
                }`}>
                  {action}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-600">
              {completedActions.length}/{consultation.recommendations.length} ações completadas
            </span>
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Próximos Passos</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigateToScreen('smart-shopping')}
            className="bg-green-100 text-green-800 py-2 rounded-lg font-semibold text-sm"
          >
            🛍️ Lista de Compras
          </button>
          <button
            onClick={() => navigateToScreen('wardrobe')}
            className="bg-blue-100 text-blue-800 py-2 rounded-lg font-semibold text-sm"
          >
            👗 Organizar Armário
          </button>
          <button
            onClick={() => navigateToScreen('outfit-planner')}
            className="bg-purple-100 text-purple-800 py-2 rounded-lg font-semibold text-sm"
          >
            📅 Planear Outfits
          </button>
          <button
            onClick={() => navigateToScreen('style-chat')}
            className="bg-orange-100 text-orange-800 py-2 rounded-lg font-semibold text-sm"
          >
            💬 Mais Dúvidas
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <div className="space-y-3">
          <button
            onClick={onNewConsultation}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-semibold"
          >
            Nova Consultoria
          </button>
          
          <div className="text-center">
            <button
              onClick={() => {
                const text = `CONSULTORIA: ${consultation.service.name}\n\n${consultation.content}\n\nACÇÕES:\n${consultation.recommendations?.join('\n') || 'N/A'}`;
                navigator.clipboard.writeText(text);
                alert('Consultoria copiada para clipboard!');
              }}
              className="text-sm text-gray-600 underline"
            >
              Copiar consultoria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalStylistScreen;