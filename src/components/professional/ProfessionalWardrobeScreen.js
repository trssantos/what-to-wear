import React, { useState, useEffect } from 'react';
import { ArrowLeft, Briefcase, Users, TrendingUp, Target, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const ProfessionalWardrobeScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits } = useAppContext();
  const { callOpenAI } = useOpenAI(openaiApiKey);
  
  const [activeTab, setActiveTab] = useState('audit');
  const [professionalProfile, setProfessionalProfile] = useState({
    industry: '',
    position: '',
    workEnvironment: '',
    meetingFrequency: '',
    dressCode: '',
    budget: '',
    careerGoals: ''
  });
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [careerStrategy, setCareerStrategy] = useState(null);

  // Load professional profile
  useEffect(() => {
    const savedProfile = localStorage.getItem('whatToWear_professionalProfile');
    if (savedProfile) {
      setProfessionalProfile(JSON.parse(savedProfile));
    }
  }, []);

  const saveProfessionalProfile = (profile) => {
    localStorage.setItem('whatToWear_professionalProfile', JSON.stringify(profile));
    setProfessionalProfile(profile);
  };

  const generateProfessionalAnalysis = async () => {
    if (!professionalProfile.industry || !professionalProfile.position) {
      alert('Por favor preenche pelo menos a indústria e posição');
      return;
    }

    setIsAnalyzing(true);
    try {
      const prompt = `Como consultor de imagem corporativa e especialista em professional wardrobe, faz uma análise completa para este profissional.

PERFIL PROFISSIONAL:
- Indústria: ${professionalProfile.industry}
- Posição: ${professionalProfile.position}
- Ambiente de trabalho: ${professionalProfile.workEnvironment}
- Frequência de reuniões: ${professionalProfile.meetingFrequency}
- Dress code: ${professionalProfile.dressCode}
- Orçamento mensal: ${professionalProfile.budget}
- Objetivos de carreira: ${professionalProfile.careerGoals}

ARMÁRIO ATUAL (${wardrobe.length} peças):
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

OUTFITS PROFISSIONAIS:
${outfits.filter(outfit => outfit.occasion && (outfit.occasion.toLowerCase().includes('trabalho') || outfit.occasion.toLowerCase().includes('profissional') || outfit.occasion.toLowerCase().includes('reunião'))).map(outfit => `- ${outfit.name} (${outfit.occasion})`).join('\n')}

ANÁLISE PROFISSIONAL COMPLETA:

1. **PROFESSIONAL READINESS SCORE**
   - Adequação atual do armário (0-100)
   - Breakdown por categoria
   - Gap analysis específico

2. **DRESS CODE COMPLIANCE**
   - Alinhamento com expectativas da indústria
   - Adequação ao nível hierárquico
   - Versatilidade para diferentes contextos

3. **POWER DRESSING ASSESSMENT**
   - Peças que transmitem autoridade
   - Color psychology para negócios
   - Fit and silhouette optimization

4. **MEETING WARDROBE**
   - Outfits para client meetings
   - Internal meetings vs external
   - Video call optimization
   - International business context

5. **CAREER ADVANCEMENT STRATEGY**
   - Dress for the job you want
   - Industry leadership expectations
   - Networking event appropriateness
   - Conference and presentation looks

6. **INVESTMENT PRIORITIES**
   - Must-have professional pieces
   - Cost-per-wear optimization
   - Quality vs budget allocation
   - Seasonal considerations

7. **WEEKLY PLANNING TEMPLATE**
   - Monday to Friday outfit formulas
   - Versatile core pieces
   - Mix-and-match strategies
   - Laundry and maintenance schedule

8. **INDUSTRY-SPECIFIC RECOMMENDATIONS**
   - Trends affecting professional dress
   - Conservative vs progressive choices
   - Regional and cultural considerations
   - Modern professional evolution

Formato JSON:
{
  "professionalScore": {
    "overall": 75,
    "breakdown": {
      "suits": 80,
      "shirts": 70,
      "shoes": 60,
      "accessories": 40
    }
  },
  "dressCodeCompliance": {
    "level": "Adequado|Needs Improvement|Excellent",
    "gaps": ["gap1", "gap2"],
    "strengths": ["strength1", "strength2"]
  },
  "powerDressingElements": [
    {"item": "navy suit", "powerLevel": 9, "occasions": ["meetings", "presentations"]},
    {"item": "white shirt", "powerLevel": 8, "occasions": ["daily", "formal"]}
  ],
  "meetingWardrobe": {
    "clientMeetings": ["outfit1", "outfit2"],
    "internalMeetings": ["outfit1", "outfit2"],
    "videoCalls": ["outfit1", "outfit2"]
  },
  "investmentPriorities": [
    {
      "item": "charcoal suit",
      "priority": "High",
      "budget": "€300-500",
      "reasoning": "Foundation piece for authority",
      "costPerWear": "€3-5"
    }
  ],
  "weeklyTemplate": {
    "Monday": {"formula": "Power start", "pieces": ["piece1", "piece2"]},
    "Tuesday": {"formula": "Meeting ready", "pieces": ["piece1", "piece2"]},
    "Wednesday": {"formula": "Mid-week polish", "pieces": ["piece1", "piece2"]},
    "Thursday": {"formula": "Presentation perfect", "pieces": ["piece1", "piece2"]},
    "Friday": {"formula": "Business casual", "pieces": ["piece1", "piece2"]}
  },
  "careerStrategy": {
    "currentLevel": "assessment",
    "targetLevel": "target position style",
    "gapsToBridge": ["gap1", "gap2"],
    "timelineRecommendations": "6-month plan"
  }
}`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um consultor de imagem corporativa expert com 20 anos de experiência em Fortune 500 companies. Especializas-te em professional wardrobe optimization e career advancement através de image consulting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysisData = JSON.parse(jsonMatch[0]);
        setAnalysis(analysisData);
        if (analysisData.weeklyTemplate) {
          setWeeklyPlan(analysisData.weeklyTemplate);
        }
        if (analysisData.careerStrategy) {
          setCareerStrategy(analysisData.careerStrategy);
        }
      } else {
        throw new Error('Resposta inválida da IA');
      }

    } catch (error) {
      alert('Erro na análise profissional: ' + error.message);
    }
    setIsAnalyzing(false);
  };

  const generateMeetingOutfit = async (meetingType) => {
    try {
      const prompt = `Baseado no perfil profissional e armário, cria um outfit específico para ${meetingType}.

TIPO DE REUNIÃO: ${meetingType}
PERFIL: ${professionalProfile.industry}, ${professionalProfile.position}
ARMÁRIO: ${wardrobe.slice(0, 10).map(item => `${item.name} (${item.category})`).join(', ')}

Cria um outfit específico incluindo:
- Peças exatas do armário ou alternativas
- Justificação para escolhas
- Dicas de styling
- Backup options
- Grooming suggestions`;

      const response = await callOpenAI([
        {
          role: 'system',
          content: 'És um image consultant especializado em meeting attire e business presentations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]);

      alert(`Outfit para ${meetingType}:\n\n${response.substring(0, 500)}...`);
    } catch (error) {
      alert('Erro ao gerar outfit: ' + error.message);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <div className="animate-spin mb-4">
            <Briefcase className="h-16 w-16 text-gray-600 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Analisando armário profissional...</h2>
          <p className="text-gray-600 mb-4">Consultoria de imagem corporativa em progresso</p>
          <div className="space-y-2 text-sm text-gray-500">
            <div>💼 Avaliando dress code compliance...</div>
            <div>👔 Analisando power dressing elements...</div>
            <div>📊 Calculando professional readiness...</div>
            <div>🎯 Criando strategy de carreira...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-600 to-gray-800 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Armário Profissional</h1>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl p-2 shadow-xl mb-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'audit' ? 'bg-gray-600 text-white' : 'text-gray-600'
              }`}
            >
              📊 Auditoria
            </button>
            <button
              onClick={() => setActiveTab('planning')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'planning' ? 'bg-gray-600 text-white' : 'text-gray-600'
              }`}
            >
              📅 Planeamento
            </button>
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'meetings' ? 'bg-gray-600 text-white' : 'text-gray-600'
              }`}
            >
              🤝 Reuniões
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                activeTab === 'career' ? 'bg-gray-600 text-white' : 'text-gray-600'
              }`}
            >
              🚀 Carreira
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'audit' && (
          <AuditTab
            professionalProfile={professionalProfile}
            setProfessionalProfile={saveProfessionalProfile}
            analysis={analysis}
            onAnalyze={generateProfessionalAnalysis}
            wardrobe={wardrobe}
          />
        )}

        {activeTab === 'planning' && (
          <PlanningTab
            weeklyPlan={weeklyPlan}
            analysis={analysis}
            onAnalyze={generateProfessionalAnalysis}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingsTab
            analysis={analysis}
            professionalProfile={professionalProfile}
            onGenerateOutfit={generateMeetingOutfit}
          />
        )}

        {activeTab === 'career' && (
          <CareerTab
            careerStrategy={careerStrategy}
            analysis={analysis}
            professionalProfile={professionalProfile}
            navigateToScreen={navigateToScreen}
          />
        )}
      </div>
    </div>
  );
};

// Audit Tab Component
const AuditTab = ({ professionalProfile, setProfessionalProfile, analysis, onAnalyze, wardrobe }) => {
  const industries = [
    'Tecnologia', 'Consultoria', 'Banca/Finanças', 'Direito', 'Saúde',
    'Marketing/Publicidade', 'Educação', 'Governo', 'Retalho', 'Outro'
  ];

  const positions = [
    'Entry Level', 'Analista', 'Especialista', 'Coordenador', 'Supervisor',
    'Manager', 'Senior Manager', 'Director', 'VP/C-Level', 'Empreendedor'
  ];

  const environments = [
    'Escritório tradicional', 'Open office', 'Coworking', 'Híbrido', 'Remoto',
    'Client-facing', 'Factory/Industrial', 'Retail', 'Hospitality'
  ];

  return (
    <div className="space-y-4">
      {/* Professional Profile Setup */}
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-4">Perfil Profissional</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indústria</label>
              <select
                value={professionalProfile.industry}
                onChange={(e) => setProfessionalProfile({...professionalProfile, industry: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Seleciona...</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Posição</label>
              <select
                value={professionalProfile.position}
                onChange={(e) => setProfessionalProfile({...professionalProfile, position: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Seleciona...</option>
                {positions.map(position => (
                  <option key={position} value={position}>{position}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente de trabalho</label>
            <select
              value={professionalProfile.workEnvironment}
              onChange={(e) => setProfessionalProfile({...professionalProfile, workEnvironment: e.target.value})}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Seleciona...</option>
              {environments.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reuniões</label>
              <select
                value={professionalProfile.meetingFrequency}
                onChange={(e) => setProfessionalProfile({...professionalProfile, meetingFrequency: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Frequência...</option>
                <option value="Diárias">Diárias</option>
                <option value="Semanais">Semanais</option>
                <option value="Mensais">Mensais</option>
                <option value="Raras">Raras</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dress Code</label>
              <select
                value={professionalProfile.dressCode}
                onChange={(e) => setProfessionalProfile({...professionalProfile, dressCode: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="">Seleciona...</option>
                <option value="Formal">Formal (fato obrigatório)</option>
                <option value="Business Professional">Business Professional</option>
                <option value="Business Casual">Business Casual</option>
                <option value="Smart Casual">Smart Casual</option>
                <option value="Casual">Casual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento mensal (€)</label>
            <select
              value={professionalProfile.budget}
              onChange={(e) => setProfessionalProfile({...professionalProfile, budget: e.target.value})}
              className="w-full p-2 border rounded text-sm"
            >
              <option value="">Seleciona...</option>
              <option value="<100">Menos de €100</option>
              <option value="100-250">€100-250</option>
              <option value="250-500">€250-500</option>
              <option value="500-1000">€500-1000</option>
              <option value=">1000">Mais de €1000</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos de carreira</label>
            <textarea
              value={professionalProfile.careerGoals}
              onChange={(e) => setProfessionalProfile({...professionalProfile, careerGoals: e.target.value})}
              className="w-full p-2 border rounded text-sm h-16 resize-none"
              placeholder="Ex: Promoção a manager, mudança de área, networking..."
            />
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={!professionalProfile.industry || !professionalProfile.position}
          className="w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-800 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          Analisar Armário Profissional
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Professional Score */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Professional Readiness Score</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-gray-600">{analysis.professionalScore.overall}/100</div>
              <div className="text-sm text-gray-500">Overall Professional Score</div>
            </div>
            
            <div className="space-y-2">
              {Object.entries(analysis.professionalScore.breakdown).map(([category, score]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{category}:</span>
                    <span className="font-semibold">{score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        score >= 80 ? 'bg-green-500' :
                        score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dress Code Compliance */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Dress Code Compliance</h3>
            <div className="text-center mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                analysis.dressCodeCompliance.level === 'Excellent' ? 'bg-green-100 text-green-800' :
                analysis.dressCodeCompliance.level === 'Adequado' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {analysis.dressCodeCompliance.level}
              </span>
            </div>
            
            {analysis.dressCodeCompliance.gaps.length > 0 && (
              <div className="mb-3">
                <h4 className="font-medium text-red-700 mb-1">Gaps identificados:</h4>
                <ul className="list-disc list-inside text-sm text-red-600">
                  {analysis.dressCodeCompliance.gaps.map((gap, index) => (
                    <li key={index}>{gap}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {analysis.dressCodeCompliance.strengths.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-1">Pontos fortes:</h4>
                <ul className="list-disc list-inside text-sm text-green-600">
                  {analysis.dressCodeCompliance.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Investment Priorities */}
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h3 className="font-semibold text-gray-800 mb-3">Prioridades de Investimento</h3>
            <div className="space-y-3">
              {analysis.investmentPriorities.map((item, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{item.item}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.priority === 'High' ? 'bg-red-100 text-red-800' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Orçamento:</strong> {item.budget}</div>
                    <div><strong>Cost per wear:</strong> {item.costPerWear}</div>
                    <div><strong>Motivo:</strong> {item.reasoning}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Wardrobe Stats */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Estatísticas do Armário</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {wardrobe.filter(item => item.tags?.includes('work') || item.tags?.includes('formal')).length}
            </div>
            <div className="text-xs text-gray-500">Peças Profissionais</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {wardrobe.filter(item => item.category === 'Camisas').length}
            </div>
            <div className="text-xs text-gray-500">Camisas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {wardrobe.filter(item => item.category === 'Sapatos' && (item.tags?.includes('formal') || item.color === 'Preto')).length}
            </div>
            <div className="text-xs text-gray-500">Sapatos Formais</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Planning Tab Component
const PlanningTab = ({ weeklyPlan, analysis, onAnalyze }) => {
  if (!weeklyPlan) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Planeamento não disponível</h3>
        <p className="text-gray-600 mb-4">Faz primeiro a auditoria para gerar o plano semanal</p>
        <button
          onClick={onAnalyze}
          className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-2 px-6 rounded-lg font-semibold"
        >
          Fazer Auditoria
        </button>
      </div>
    );
  }

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Template Semanal Profissional</h3>
        <p className="text-sm text-gray-600 mb-4">
          Plano otimizado para maximizar versatilidade e impacto profissional
        </p>
        
        <div className="space-y-3">
          {days.map((day, index) => {
            const dayPlan = weeklyPlan[day];
            if (!dayPlan) return null;
            
            return (
              <div key={day} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-gray-800">{dayNames[index]}</h4>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {dayPlan.formula}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div className="flex flex-wrap gap-1">
                    {dayPlan.pieces.map((piece, pieceIndex) => (
                      <span key={pieceIndex} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {piece}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Power Dressing Elements */}
      {analysis?.powerDressingElements && (
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Power Dressing Elements</h3>
          <div className="space-y-2">
            {analysis.powerDressingElements.map((element, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <span className="font-medium text-gray-800">{element.item}</span>
                  <div className="text-xs text-gray-500">
                    {element.occasions.join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-bold text-yellow-600">{element.powerLevel}/10</span>
                  <Star className="h-4 w-4 text-yellow-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Dicas de Planeamento</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span>Prepara outfits no domingo para toda a semana</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span>Mantém 2-3 backup outfits para emergências</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span>Coordena com a agenda: reuniões importantes = power outfits</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <span>Considera o weather e transporte diário</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Meetings Tab Component
const MeetingsTab = ({ analysis, professionalProfile, onGenerateOutfit }) => {
  const meetingTypes = [
    { name: 'Client Meeting', icon: '🤝', description: 'Reunião com cliente externo' },
    { name: 'Board Presentation', icon: '📊', description: 'Apresentação para board/executivos' },
    { name: 'Job Interview', icon: '💼', description: 'Entrevista de emprego' },
    { name: 'Team Meeting', icon: '👥', description: 'Reunião de equipa interna' },
    { name: 'Conference', icon: '🎤', description: 'Conferência ou evento de networking' },
    { name: 'Video Call', icon: '📹', description: 'Reunião virtual/video chamada' }
  ];

  return (
    <div className="space-y-4">
      {/* Meeting Wardrobe from Analysis */}
      {analysis?.meetingWardrobe && (
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-3">Outfits por Tipo de Reunião</h3>
          
          {Object.entries(analysis.meetingWardrobe).map(([type, outfits]) => (
            <div key={type} className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2 capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()}:
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {outfits.map((outfit, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {outfit}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Meeting Type Generator */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Gerador de Outfits por Reunião</h3>
        <p className="text-sm text-gray-600 mb-4">
          Gera outfits específicos baseados no tipo de reunião
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {meetingTypes.map((meeting, index) => (
            <button
              key={index}
              onClick={() => onGenerateOutfit(meeting.name)}
              className="p-3 text-left border rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{meeting.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-800">{meeting.name}</h4>
                  <p className="text-sm text-gray-600">{meeting.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Video Call Optimization */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Otimização para Video Calls</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-1">🎥 Visual</h4>
            <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
              <li>Cores sólidas funcionam melhor que padrões</li>
              <li>Evita branco puro (pode criar glare)</li>
              <li>Azul e cinza são cores ideais para câmara</li>
            </ul>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">👔 Styling</h4>
            <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
              <li>Focus no upper body - blazer ou camisa estruturada</li>
              <li>Evita acessórios que façam ruído</li>
              <li>Mantém styling simples e profissional</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Meeting Prep Checklist */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Checklist de Preparação</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Outfit escolhido e preparado na noite anterior</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Sapatos limpos e polidos</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Grooming check (cabelo, barba, unhas)</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Backup outfit preparado</span>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span>Acessórios coordenados (relógio, pasta, etc.)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Career Tab Component
const CareerTab = ({ careerStrategy, analysis, professionalProfile, navigateToScreen }) => {
  if (!careerStrategy) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Estratégia de carreira não disponível</h3>
        <p className="text-gray-600 mb-4">Faz a auditoria para gerar a estratégia personalizada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Career Assessment */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Assessment de Carreira</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-600">Nível Atual:</label>
            <div className="text-lg font-semibold text-gray-800">{careerStrategy.currentLevel}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Target Level:</label>
            <div className="text-lg font-semibold text-blue-600">{careerStrategy.targetLevel}</div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Timeline:</label>
            <div className="text-sm text-gray-700">{careerStrategy.timelineRecommendations}</div>
          </div>
        </div>
      </div>

      {/* Gaps to Bridge */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Gaps a Superar</h3>
        <div className="space-y-2">
          {careerStrategy.gapsToBridge.map((gap, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 bg-orange-50 rounded">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
              <span className="text-sm text-orange-800">{gap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Plan */}
      <div className="bg-white rounded-2xl p-4 shadow-xl">
        <h3 className="font-semibold text-gray-800 mb-3">Plano de Ação</h3>
        
        <div className="space-y-4">
          <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
            <h4 className="font-medium text-blue-800">Próximos 30 dias</h4>
            <ul className="text-sm text-blue-700 mt-1 space-y-1">
              <li>• Investir em 1-2 peças power dressing</li>
              <li>• Optimizar grooming routine</li>
              <li>• Definir signature look</li>
            </ul>
          </div>
          
          <div className="p-3 border-l-4 border-green-500 bg-green-50">
            <h4 className="font-medium text-green-800">3-6 meses</h4>
            <ul className="text-sm text-green-700 mt-1 space-y-1">
              <li>• Completar wardrobe foundation</li>
              <li>• Desenvolver networking wardrobe</li>
              <li>• Master meeting presentation looks</li>
            </ul>
          </div>
          
          <div className="p-3 border-l-4 border-purple-500 bg-purple-50">
            <h4 className="font-medium text-purple-800">6-12 meses</h4>
            <ul className="text-sm text-purple-700 mt-1 space-y-1">
              <li>• Refinar personal brand através do estilo</li>
              <li>• Investir em executive presence pieces</li>
              <li>• Preparar para target position</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Investment ROI */}
      {analysis?.investmentPriorities && (
        <div className="bg-white rounded-2xl p-4 shadow-xl">
          <h3 className="font-semibold text-gray-800 mb-3">ROI de Investimento</h3>
          <div className="text-sm text-gray-600 mb-3">
            Baseado no teu orçamento de <strong>{professionalProfile.budget}</strong>
          </div>
          
          <div className="space-y-2">
            {analysis.investmentPriorities.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border rounded">
                <div>
                  <div className="font-medium text-gray-800">{item.item}</div>
                  <div className="text-xs text-gray-500">{item.costPerWear}</div>
                </div>
                <div className="text-sm font-semibold text-green-600">{item.budget}</div>
              </div>
            ))}
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
            🛍️ Shopping List
          </button>
          <button
            onClick={() => navigateToScreen('personal-stylist')}
            className="bg-purple-100 text-purple-800 py-2 rounded-lg font-semibold text-sm"
          >
            👔 Consultoria
          </button>
          <button
            onClick={() => navigateToScreen('outfit-planner')}
            className="bg-blue-100 text-blue-800 py-2 rounded-lg font-semibold text-sm"
          >
            📅 Planear Semana
          </button>
          <button
            onClick={() => navigateToScreen('style-chat')}
            className="bg-orange-100 text-orange-800 py-2 rounded-lg font-semibold text-sm"
          >
            💬 Tirar Dúvidas
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalWardrobeScreen;