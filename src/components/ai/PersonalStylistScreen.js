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
      // Contexto do gênero
      const genderContext = userProfile?.gender ? `
  PERFIL DO UTILIZADOR:
  - Gênero: ${userProfile.gender}
  
  INSTRUÇÕES ESPECÍFICAS POR GÊNERO:
  ${userProfile.gender === 'female' ? `
  - PRIORIZAR: Styling feminino, acessórios como brincos, colares, pulseiras, anéis
  - INCLUIR: Recomendações de maquilhagem, produtos para cabelo feminino, sapatos femininos
  - FOCAR: Feminilidade, elegância, versatilidade no guarda-roupa feminino
  - ACESSÓRIOS: Joias, carteiras, lenços, sapatos de salto, rasteiras, ténis femininos
  ` : userProfile.gender === 'male' ? `
  - PRIORIZAR: Styling masculino, acessórios como relógios, cintos, sapatos formais
  - INCLUIR: Grooming masculino, produtos para cabelo, dress codes profissionais
  - FOCAR: Masculinidade, sophistication, versatilidade no guarda-roupa masculino  
  - ACESSÓRIOS: Relógios, cintos de couro, sapatos formais/casual, carteiras masculinas
  ` : `
  - ADAPTAR: Styling neutro e inclusivo adequado a qualquer expressão de gênero
  - INCLUIR: Opções versáteis e acessórios neutros
  - FOCAR: Versatilidade e comfort para todas as expressões
  `}
  ` : '';
  
      let prompt;
      
      switch (service.id) {
        case 'style-audit':
          prompt = `Como personal stylist expert, realiza uma auditoria completa de estilo para este cliente.
  
  ${genderContext}
  
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
     - Análise por categoria (força/fraqueza) considerando o gênero
     - Quality assessment
     - Versatilidade score
     - Investment pieces vs fast fashion
  
  2. **ESTILO ATUAL**
     - Identificação do estilo predominante para o gênero
     - Consistência e coerência
     - Signature pieces apropriadas
     - Personal brand clarity
  
  3. **GAPS CRÍTICOS**
     - Peças essenciais em falta específicas para o gênero
     - Categorias sub-representadas
     - Ocasiões mal cobertas
     - Acessórios em falta (joias/relógios/etc baseado no gênero)
  
  4. **POTENCIAL DE MELHORIA**
     - Onde investir primeiro considerando o gênero
     - Quick wins (mudanças rápidas)
     - Long-term development
     - Budget allocation para acessórios específicos
  
  5. **PLANO DE DESENVOLVIMENTO 90 DIAS**
     - Mês 1: Foundation building com basics do gênero
     - Mês 2: Style refinement e acessórios
     - Mês 3: Signature development
     - Milestones específicos
  
  6. **ORÇAMENTO OTIMIZADO**
     - Investimentos por prioridade baseados no gênero
     - Timeline de compras
     - ROI esperado por peça
     - Sustainable options
  
  Sê específico, prático e actionable. Usa dados concretos considerando sempre o gênero do cliente.`;
          break;
  
        case 'signature-style':
          prompt = `Desenvolve um signature style único para este cliente baseado na análise completa.
  
  ${genderContext}
  
  DADOS COMPLETOS:
  ARMÁRIO (${wardrobe.length} peças):
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}
  
  CRIAÇÃO DE SIGNATURE STYLE:
  
  1. **BRAND PESSOAL**
     - 3 palavras que definem o estilo considerando o gênero
     - Mood board conceitual
     - Target audience (como quer ser percebido)
     - Core values refletidos no estilo
  
  2. **SIGNATURE ELEMENTS**
     - Cores assinatura (3-5 cores)
     - Silhuetas preferidas para o gênero
     - Texturas características
     - Acessórios marcantes específicos (joias/relógios baseado no gênero)
  
  3. **LOOKS ASSINATURA**
     - 5 outfits icónicos usando o armário
     - Fórmulas de styling reproduzíveis
     - Peças statement vs basics para o gênero
     - Variações sazonais
  
  4. **ACESSÓRIOS ESSENCIAIS**
     - Lista de must-have baseada no gênero
     - Investment pieces prioritárias
     - Como incorporar no dia-a-dia
     - Budget allocation
  
  5. **STYLE EVOLUTION**
     - Como manter consistência
     - Adaptação a diferentes fases da vida
     - Sustainable approach
  
  Foca em criar uma identidade visual forte e apropriada para o gênero.`;
          break;
  
        case 'color-consultation':
          prompt = `Realiza uma consultoria completa de cores personalizada.
  
  ${genderContext}
  
  ARMÁRIO ATUAL:
  ${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
  
  CONSULTORIA DE CORES:
  
  1. **ANÁLISE DAS CORES EXISTENTES**
     - Palette atual do armário
     - Harmonias e conflitos
     - Missing colors importantes
  
  2. **CORES ESTRATÉGICAS**
     - 5 cores principais para o gênero
     - Como combinar eficazmente
     - Seasonal adaptations
  
  3. **RECOMENDAÇÕES DE COMPRA**
     - Próximas cores a investir
     - Peças prioritárias por cor
     - Budget allocation
  
  4. **STYLING POR COR**
     - Como usar cada cor eficazmente para o gênero
     - Combinações winning
     - Acessórios que complementam
  
  ${userProfile.gender === 'female' ? `
  5. **MAQUILHAGEM & CORES**
     - Cores de maquilhagem que harmonizam
     - Looks day vs night
     - Seasonal adjustments
  ` : userProfile.gender === 'male' ? `
  5. **GROOMING & CORES**
     - Como cores influenciam grooming choices
     - Professional vs casual color rules
     - Accessories coordination
  ` : ''}
  
  Sê específico sobre como implementar cada recomendação.`;
          break;
  
        case 'occasion-styling':
          prompt = `Cria um guia completo de styling para diferentes ocasiões.
  
  ${genderContext}
  
  ARMÁRIO:
  ${wardrobe.slice(0, 15).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}
  
  STYLING GUIDE POR OCASIÃO:
  
  1. **WORK/PROFESSIONAL**
     - Outfits base usando armário atual
     - Power dressing tips para o gênero
     - Acessórios profissionais necessários
     - Do's and don'ts
  
  2. **CASUAL/WEEKEND**
     - Looks comfortable mas stylish
     - Mix & match opportunities
     - Versatile pieces destacadas
  
  3. **SOCIAL EVENTS**
     - Date nights, jantares, eventos
     - How to elevate basic pieces
     - Statement accessories por gênero
  
  4. **SPECIAL OCCASIONS**
     - Weddings, parties, celebrations
     - Investment pieces needed
     - Rental vs purchase decisions
  
  ${userProfile.gender === 'female' ? `
  5. **BEAUTY COORDINATION**
     - Maquilhagem adequada para cada ocasião
     - Hair styling suggestions
     - Jewelry combinations
  ` : userProfile.gender === 'male' ? `
  5. **GROOMING COORDINATION**
     - Styling adequado para cada ocasião
     - Watch and accessory rules
     - Shoe selection guide
  ` : ''}
  
  Para cada ocasião, lista outfits específicos e justifica as escolhas.`;
          break;
  
        case 'lifestyle-styling':
          prompt = `Adapta o estilo ao lifestyle específico do cliente.
  
  ${genderContext}
  
  ANÁLISE LIFESTYLE:
  
  1. **DAILY ROUTINE OPTIMIZATION**
     - Peças que funcionam para rotina diária
     - Versatility maximization
     - Time-saving combinations
  
  2. **COMFORT MEETS STYLE**
     - How to look good feeling comfortable
     - Fabric recommendations por gênero
     - Functional fashion choices
  
  3. **SUSTAINABLE APPROACH**
     - Cost-per-wear analysis
     - Quality investment pieces
     - Timeless vs trendy balance
  
  4. **STYLE EFFICIENCY**
     - Capsule wardrobe principles
     - Mix & match formulas
     - Shopping strategy
  
  ${userProfile.gender === 'female' ? `
  5. **FEMININE LIFESTYLE INTEGRATION**
     - How femininity adapts to lifestyle
     - Practical beauty routines
     - Accessory organization
  ` : userProfile.gender === 'male' ? `
  5. **MASCULINE LIFESTYLE INTEGRATION**
     - Professional masculine presence
     - Practical grooming routines
     - Accessory essentials
  ` : ''}
  
  Foca em soluções práticas e implementáveis baseadas no gênero.`;
          break;
  
        case 'trend-integration':
          prompt = `Guia para integração inteligente de tendências no estilo pessoal.
  
  ${genderContext}
  
  TREND INTEGRATION STRATEGY:
  
  1. **CURRENT TRENDS ANALYSIS**
     - Tendências relevantes para o gênero
     - Filter through personal style
     - Investment vs fast fashion decisions
  
  2. **ADAPTATION TECHNIQUES**
     - How to try trends without commitment
     - Accessories as trend vehicles
     - Seasonal trend incorporation
  
  3. **BUDGET-SMART TRENDING**
     - High-low mixing strategies
     - Where to splurge vs save
     - Rental and borrowing options
  
  4. **PERSONAL STYLE FILTER**
     - Which trends align with cliente
     - How to adapt trends to fit existing wardrobe
     - Long-term style consistency
  
  ${userProfile.gender === 'female' ? `
  5. **FEMININE TREND ADAPTATION**
     - How feminine trends work for this client
     - Beauty trends coordination
     - Accessory trend integration
  ` : userProfile.gender === 'male' ? `
  5. **MASCULINE TREND ADAPTATION**
     - How masculine trends work for this client
     - Grooming trend coordination
     - Accessory trend integration
  ` : ''}
  
  Sempre mantém coerência com o estilo pessoal e gênero.`;
          break;
  
        default:
          prompt = `Como personal stylist expert, fornece consultoria personalizada considerando o gênero e estilo do cliente.`;
      }
  
      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um personal stylist profissional de elite com 15 anos de experiência. Fazes diagnósticos precisos e recommendations estratégicas considerando sempre o gênero do cliente.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);
  
      setConsultationResult(response);
    } catch (error) {
      console.error('Error in consultation:', error);
      setConsultationResult('Erro na consultoria. Tenta novamente.');
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