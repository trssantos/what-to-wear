import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Trophy, Calendar, Zap, Star, Lock, Play, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const WardrobeChallengesScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits, addOutfit, userProfile } = useAppContext();
  const { callOpenAI } = useOpenAI();
  
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);

  const challengeTemplates = [
    {
      id: '30-30',
      name: '30 Outfits em 30 Dias',
      description: 'Cria 30 outfits únicos usando o teu armário',
      difficulty: 'Médio',
      duration: 30,
      xp: 500,
      requirements: { minPieces: 15 },
      icon: <Calendar className="h-6 w-6" />,
      type: 'outfit-creation'
    },
    {
      id: 'minimal-week',
      name: 'Semana Minimalista',
      description: 'Cria 7 outfits usando apenas 10 peças',
      difficulty: 'Difícil',
      duration: 7,
      xp: 300,
      requirements: { maxPieces: 10 },
      icon: <Zap className="h-6 w-6" />,
      type: 'minimalist'
    },
    {
      id: 'color-week',
      name: 'Semana das Cores',
      description: 'Cada dia uma cor dominante diferente',
      difficulty: 'Fácil',
      duration: 7,
      xp: 200,
      requirements: { minPieces: 7 },
      icon: <Star className="h-6 w-6" />,
      type: 'color-focused'
    },
    {
      id: 'style-evolution',
      name: 'Evolução de Estilo',
      description: 'Recria o mesmo outfit base de 5 formas diferentes',
      difficulty: 'Médio',
      duration: 5,
      xp: 250,
      requirements: { minPieces: 8 },
      icon: <Target className="h-6 w-6" />,
      type: 'variation'
    },
    {
      id: 'seasonal-refresh',
      name: 'Refresh Sazonal',
      description: 'Adapta 15 outfits para a estação atual',
      difficulty: 'Médio',
      duration: 15,
      xp: 400,
      requirements: { minPieces: 20 },
      icon: <Trophy className="h-6 w-6" />,
      type: 'seasonal'
    },
    {
      id: 'one-piece-hero',
      name: 'Peça Heroína',
      description: 'Usa a mesma peça de 10 formas diferentes',
      difficulty: 'Fácil',
      duration: 10,
      xp: 150,
      requirements: { minPieces: 5 },
      icon: <Star className="h-6 w-6" />,
      type: 'single-piece'
    }
  ];

  // Load user progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('whatToWear_challengeProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setActiveChallenges(progress.active || []);
      setCompletedChallenges(progress.completed || []);
      setUserLevel(progress.userLevel || 1);
      setUserXP(progress.userXP || 0);
    }
  }, []);

  // Save progress
  const saveProgress = (active, completed, level, xp) => {
    const progress = {
      active,
      completed,
      userLevel: level,
      userXP: xp,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('whatToWear_challengeProgress', JSON.stringify(progress));
  };

  const canStartChallenge = (template) => {
    const wardrobeCount = wardrobe.length;
    if (template.requirements.minPieces && wardrobeCount < template.requirements.minPieces) {
      return false;
    }
    if (template.requirements.maxPieces && wardrobeCount > template.requirements.maxPieces) {
      // For maxPieces challenges, we'll select a subset, so it's always possible
      return wardrobeCount >= 5; // Minimum for any challenge
    }
    return true;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil':
        return 'bg-green-100 text-green-800';
      case 'Médio':
        return 'bg-yellow-100 text-yellow-800';
      case 'Difícil':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const startChallenge = async (template) => {
    try {
      console.log('🎯 Iniciando desafio:', template.name);
      
      let challengeData;
      switch (template.type) {
        case 'minimalist':
          challengeData = await generateMinimalistChallenge(template);
          break;
        case 'color-focused':
          challengeData = await generateColorChallenge(template);
          break;
        default:
          challengeData = await generateStandardChallenge(template);
      }

      const newChallenge = {
        id: `${template.id}-${Date.now()}`,
        name: template.name,
        description: template.description,
        difficulty: template.difficulty,
        type: template.type,
        xp: template.xp,
        duration: template.duration,
        tasks: challengeData.tasks || [],
        completedTasks: [],
        startDate: new Date().toISOString(),
        progress: 0,
        totalTasks: challengeData.tasks?.length || template.duration
      };

      const updatedActiveChallenges = [...activeChallenges, newChallenge];
      setActiveChallenges(updatedActiveChallenges);
      saveProgress(updatedActiveChallenges, completedChallenges, userLevel, userXP);
      
      setShowChallengeModal(false);
      alert(`Desafio "${template.name}" iniciado com sucesso! 🎉`);

    } catch (error) {
      console.error('❌ Erro ao iniciar desafio:', error);
      alert('Erro ao criar desafio. Tenta novamente.');
    }
  };

  const generateStandardChallenge = async (template) => {
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

DESAFIOS ESPECÍFICOS POR GÊNERO:
${userProfile.gender === 'female' ? `
- INCLUIR: Desafios com acessórios femininos (joias, lenços, sapatos)
- FOCAR: Styling feminino, layering feminino, ocasiões femininas
- VARIAÇÕES: Looks day-to-night, maquilhagem coordination, mixing feminine pieces
- ACESSÓRIOS: Challenges com brincos, colares, pulseiras, carteiras femininas
` : userProfile.gender === 'male' ? `
- INCLUIR: Desafios com acessórios masculinos (relógios, cintos, sapatos formais)
- FOCAR: Styling masculino, dress codes, grooming coordination
- VARIAÇÕES: Business casual, smart casual, formal variations
- ACESSÓRIOS: Challenges com relógios, cintos, sapatos, carteiras masculinas
` : `
- INCLUIR: Desafios neutros e inclusivos
- FOCAR: Styling versátil adequado a qualquer expressão de gênero
- VARIAÇÕES: Looks adaptáveis e acessórios neutros
`}
` : '';

    const prompt = `Cria um desafio "${template.name}" de ${template.duration} dias usando o armário disponível.

${genderContext}

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color}${item.brand ? ', ' + item.brand : ''}) - Tags: ${item.tags?.join(', ') || 'N/A'}`).join('\n')}

Para cada dia, cria:
1. Nome criativo do outfit adaptado ao gênero
2. Peças específicas a usar
3. Ocasião/tema
4. Desafio específico considerando o gênero (ex: usar peça que nunca usaste, accessorize femininely/masculinely)

Varia estilos, ocasiões e combinações. Garante que cada outfit é único e apropriado para o gênero.

Formato JSON:
{
  "tasks": [
    {
      "day": 1,
      "name": "nome do outfit",
      "pieces": ["peça1", "peça2"],
      "occasion": "ocasião",
      "challenge": "desafio específico considerando gênero",
      "tips": "dicas específicas baseadas no gênero"
    }
  ]
}`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um personal stylist que cria desafios de moda criativos e motivadores adaptados ao gênero do cliente.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Resposta inválida da IA');
  };

  const generateMinimalistChallenge = async (template) => {
    const selectedPieces = wardrobe.slice(0, 10); // Simplified selection
    
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

MINIMALISMO ESPECÍFICO POR GÊNERO:
${userProfile.gender === 'female' ? `
- FOCAR: Versatilidade feminina com peças-chave, accessories rotation
- INCLUIR: Como maximizar feminilidade com poucas peças
- STYLING: Techniques femininas de layering e accessorizing
` : userProfile.gender === 'male' ? `
- FOCAR: Essenciais masculinos versáteis, classic combinations
- INCLUIR: Como manter sophistication masculina com minimalismo
- STYLING: Técnicas masculinas de mixing formal/casual
` : `
- FOCAR: Versatilidade neutra e inclusiva
- INCLUIR: Peças adaptáveis a diferentes expressões
`}
` : '';
    
    const prompt = `Cria um desafio minimalista de 7 dias usando APENAS estas 10 peças:

${genderContext}

PEÇAS DISPONÍVEIS:
${selectedPieces.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Para cada dia, cria um outfit diferente usando 3-5 destas peças.
Foca em versatilidade e criatividade com limitações, adaptado ao gênero.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um especialista em moda minimalista e versatilidade, adaptando conselhos ao gênero do cliente.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Resposta inválida da IA');
  };

  const generateColorChallenge = async (template) => {
    const colors = ['Vermelho', 'Azul', 'Verde', 'Amarelo', 'Rosa', 'Roxo', 'Laranja'];
    
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

STYLING DE CORES POR GÊNERO:
${userProfile.gender === 'female' ? `
- INCLUIR: Como usar cores femininely, coordination com maquilhagem
- FOCAR: Feminine color combinations, jewelry coordination
- STYLING: Techniques para enhanced femininity através das cores
` : userProfile.gender === 'male' ? `
- INCLUIR: Masculine color styling, professional appropriateness  
- FOCAR: How colors work in masculine styling, business contexts
- STYLING: Sophisticated masculine color combinations
` : `
- INCLUIR: Styling neutro de cores, versatilidade universal
- FOCAR: Color combinations adequadas a qualquer expressão
`}
` : '';
    
    const prompt = `Cria um desafio de cores de 7 dias. Cada dia foca numa cor dominante:

${genderContext}

CORES DOS DIAS:
${colors.slice(0, 7).map((color, index) => `Dia ${index + 1}: ${color}`).join('\n')}

ARMÁRIO:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Para cada dia, cria outfit onde a cor designada seja dominante, considerando o gênero.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um especialista em teoria das cores e styling, adaptando conselhos ao gênero do cliente.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Resposta inválida da IA');
  };

  const generateGenericChallenge = async (template) => {
    // Contexto do gênero
    const genderContext = userProfile?.gender ? `
PERFIL DO UTILIZADOR:
- Gênero: ${userProfile.gender}

PERSONALIZAÇÃO POR GÊNERO:
${userProfile.gender === 'female' ? `
- ADAPTAR: Challenges para styling feminino e ocasiões femininas
- INCLUIR: Elementos femininos como accessories, makeup coordination
` : userProfile.gender === 'male' ? `
- ADAPTAR: Challenges para styling masculino e contextos masculinos
- INCLUIR: Elementos masculinos como grooming, formal wear
` : `
- ADAPTAR: Challenges neutros e inclusivos
- INCLUIR: Elementos versáteis para qualquer expressão
`}
` : '';

    // Generic challenge generator for other types
    const prompt = `Cria um desafio "${template.name}" com ${template.duration} tasks criativas.

${genderContext}

ARMÁRIO:
${wardrobe.slice(0, 15).map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Cria tasks variadas e interessantes que desafiem a criatividade no styling, adaptadas ao gênero.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um criador de desafios de moda inovadores, adaptando cada desafio ao gênero do cliente.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Resposta inválida da IA');
  };

  const completeTask = (challengeId, taskIndex) => {
    const updatedChallenges = activeChallenges.map(challenge => {
      if (challenge.id === challengeId) {
        const updatedCompletedTasks = [...challenge.completedTasks, taskIndex];
        const progress = Math.round((updatedCompletedTasks.length / challenge.totalTasks) * 100);
        
        return {
          ...challenge,
          completedTasks: updatedCompletedTasks,
          progress
        };
      }
      return challenge;
    });

    setActiveChallenges(updatedChallenges);
    
    // Check if challenge is completed
    const completedChallenge = updatedChallenges.find(c => c.id === challengeId && c.progress === 100);
    if (completedChallenge) {
      // Move to completed challenges
      const newCompleted = [...completedChallenges, completedChallenge];
      const newActive = updatedChallenges.filter(c => c.id !== challengeId);
      
      // Add XP
      const newXP = userXP + completedChallenge.xp;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      setCompletedChallenges(newCompleted);
      setActiveChallenges(newActive);
      setUserXP(newXP);
      setUserLevel(newLevel);
      
      saveProgress(newActive, newCompleted, newLevel, newXP);
      
      alert(`🎉 Desafio "${completedChallenge.name}" completado! +${completedChallenge.xp} XP`);
    } else {
      saveProgress(updatedChallenges, completedChallenges, userLevel, userXP);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Desafios de Styling</h1>
        </div>

        {/* User Level & XP */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Level {userLevel}</h2>
                <p className="text-sm text-gray-600">{userXP} XP total</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Próximo level:</p>
              <p className="text-sm font-semibold">{1000 - (userXP % 1000)} XP</p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-pink-500 h-2 rounded-full"
              style={{ width: `${(userXP % 1000) / 10}%` }}
            />
          </div>
        </div>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
            <h2 className="font-bold text-gray-800 mb-3">Desafios Ativos</h2>
            <div className="space-y-3">
              {activeChallenges.map((challenge) => (
                <div key={challenge.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{challenge.completedTasks.length}/{challenge.totalTasks} tasks</span>
                    <button
                      onClick={() => setSelectedChallenge(challenge)}
                      className="text-blue-600 underline"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Challenges */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <h2 className="font-bold text-gray-800 mb-3">Novos Desafios</h2>
          <div className="space-y-3">
            {challengeTemplates.map(template => {
              const canStart = canStartChallenge(template);
              const isActive = activeChallenges.some(c => c.id.startsWith(template.id));
              
              return (
                <div key={template.id} className={`border rounded-lg p-3 ${!canStart ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="text-red-500">{template.icon}</div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{template.name}</h3>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>
                    </div>
                    {!canStart && <Lock className="h-4 w-4 text-gray-400" />}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                        {template.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{template.duration} dias</span>
                      <span className="text-xs text-yellow-600">+{template.xp} XP</span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedChallenge(template);
                        setShowChallengeModal(true);
                      }}
                      disabled={!canStart || isActive}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded disabled:opacity-50"
                    >
                      {isActive ? 'Ativo' : canStart ? 'Iniciar' : 'Bloqueado'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Completed Challenges */}
        {completedChallenges.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-xl">
            <h2 className="font-bold text-gray-800 mb-3">Desafios Completados</h2>
            <div className="space-y-2">
              {completedChallenges.map((challenge) => (
                <div key={challenge.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                      <p className="text-sm text-gray-600">+{challenge.xp} XP ganhado</p>
                    </div>
                  </div>
                  <Trophy className="h-5 w-5 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Challenge Detail Modal */}
      {selectedChallenge && !showChallengeModal && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onCompleteTask={completeTask}
        />
      )}

      {/* Start Challenge Modal */}
      {showChallengeModal && selectedChallenge && (
        <StartChallengeModal
          challenge={selectedChallenge}
          onStart={() => startChallenge(selectedChallenge)}
          onClose={() => {
            setShowChallengeModal(false);
            setSelectedChallenge(null);
          }}
          wardrobe={wardrobe}
        />
      )}
    </div>
  );
};

// Challenge Detail Modal
const ChallengeDetailModal = ({ challenge, onClose, onCompleteTask }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">{challenge.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-blue-500 h-3 rounded-full"
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            {challenge.completedTasks.length}/{challenge.totalTasks} tasks completadas
          </p>
        </div>

        <div className="space-y-3">
          {challenge.tasks?.map((task, index) => {
            const isCompleted = challenge.completedTasks.includes(index);
            return (
              <div key={index} className={`border rounded-lg p-3 ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className="font-semibold text-gray-800">Dia {task.day}</span>
                    </div>
                    
                    <h4 className="font-medium text-gray-800 mb-1">{task.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{task.occasion}</p>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Peças:</strong> {task.pieces?.join(', ')}
                    </div>
                    
                    {task.challenge && (
                      <div className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        🎯 {task.challenge}
                      </div>
                    )}
                    
                    {task.tips && (
                      <div className="text-xs text-blue-700 mt-1">
                        💡 {task.tips}
                      </div>
                    )}
                  </div>
                  
                  {!isCompleted && (
                    <button
                      onClick={() => onCompleteTask(challenge.id, index)}
                      className="ml-3 bg-blue-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Completar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Start Challenge Modal
const StartChallengeModal = ({ challenge, onStart, onClose, wardrobe }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="text-center mb-4">
          <div className="text-red-500 mb-3">{challenge.icon}</div>
          <h3 className="text-xl font-bold text-gray-800">{challenge.name}</h3>
          <p className="text-gray-600 mt-2">{challenge.description}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-800 mb-2">Detalhes do Desafio:</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Duração:</span>
              <span>{challenge.duration} dias</span>
            </div>
            <div className="flex justify-between">
              <span>Dificuldade:</span>
              <span>{challenge.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span>Recompensa:</span>
              <span>{challenge.xp} XP</span>
            </div>
            <div className="flex justify-between">
              <span>Peças no armário:</span>
              <span>{wardrobe.length}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-1">Como funciona:</h4>
            <p className="text-sm text-blue-700">
              A IA vai criar tasks diárias personalizadas baseadas no teu armário. 
              Completa cada task para ganhar XP e subir de level!
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={onStart}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
            >
              Iniciar Desafio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WardrobeChallengesScreen;