import React, { useState, useEffect } from 'react';
import { ArrowLeft, Target, Trophy, Calendar, Zap, Star, Lock, Play, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const WardrobeChallengesScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe, outfits, addOutfit } = useAppContext();
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
    setActiveChallenges(active);
    setCompletedChallenges(completed);
    setUserLevel(level);
    setUserXP(xp);
  };

  const startChallenge = async (template) => {
    try {
      let challengeData;
      
      if (template.type === 'outfit-creation') {
        challengeData = await generateOutfitChallenge(template);
      } else if (template.type === 'minimalist') {
        challengeData = await generateMinimalistChallenge(template);
      } else if (template.type === 'color-focused') {
        challengeData = await generateColorChallenge(template);
      } else {
        challengeData = await generateGenericChallenge(template);
      }

      const newChallenge = {
        ...template,
        id: `${template.id}-${Date.now()}`,
        startDate: new Date().toISOString(),
        progress: 0,
        totalTasks: challengeData.tasks.length,
        tasks: challengeData.tasks,
        completedTasks: [],
        isActive: true
      };

      const newActive = [...activeChallenges, newChallenge];
      saveProgress(newActive, completedChallenges, userLevel, userXP);
      setShowChallengeModal(false);
    } catch (error) {
      alert('Erro ao criar desafio: ' + error.message);
    }
  };

  const generateOutfitChallenge = async (template) => {
    const prompt = `Como personal stylist, cria um desafio "${template.name}" de ${template.duration} dias.

ARMÁRIO DISPONÍVEL:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Cria ${template.duration} tasks específicas, cada uma com:
1. Nome criativo do outfit
2. Peças específicas a usar
3. Ocasião/tema
4. Desafio específico (ex: usar peça que nunca usaste)

Varia estilos, ocasiões e combinações. Garante que cada outfit é único.

Formato JSON:
{
  "tasks": [
    {
      "day": 1,
      "name": "nome do outfit",
      "pieces": ["peça1", "peça2"],
      "occasion": "ocasião",
      "challenge": "desafio específico",
      "tips": "dicas"
    }
  ]
}`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um personal stylist que cria desafios de moda criativos e motivadores.'
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
    
    const prompt = `Cria um desafio minimalista de 7 dias usando APENAS estas 10 peças:

PEÇAS DISPONÍVEIS:
${selectedPieces.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Para cada dia, cria um outfit diferente usando 3-5 destas peças.
Foca em versatilidade e criatividade com limitações.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um especialista em moda minimalista e versatilidade.'
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
    
    const prompt = `Cria um desafio de cores de 7 dias. Cada dia foca numa cor dominante:

CORES DOS DIAS:
${colors.slice(0, 7).map((color, index) => `Dia ${index + 1}: ${color}`).join('\n')}

ARMÁRIO:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Para cada dia, cria outfit onde a cor designada seja dominante.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um especialista em teoria das cores e styling.'
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
    // Generic challenge generator for other types
    const prompt = `Cria um desafio "${template.name}" com ${template.duration} tasks criativas.

DESCRIÇÃO: ${template.description}
TIPO: ${template.type}

ARMÁRIO:
${wardrobe.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}

Cria tasks específicas e motivadoras para este desafio.

Formato JSON igual ao anterior.`;

    const response = await callOpenAI([
      {
        role: 'system',
        content: 'És um personal stylist que cria desafios de moda únicos.'
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
    const updatedActive = activeChallenges.map(challenge => {
      if (challenge.id === challengeId) {
        const newCompletedTasks = [...challenge.completedTasks, taskIndex];
        const newProgress = Math.floor((newCompletedTasks.length / challenge.totalTasks) * 100);
        
        return {
          ...challenge,
          completedTasks: newCompletedTasks,
          progress: newProgress
        };
      }
      return challenge;
    });

    // Check if challenge is completed
    const completedChallenge = updatedActive.find(c => c.id === challengeId && c.progress === 100);
    if (completedChallenge) {
      const newCompleted = [...completedChallenges, { ...completedChallenge, completedAt: new Date().toISOString() }];
      const newActive = updatedActive.filter(c => c.id !== challengeId);
      const newXP = userXP + completedChallenge.xp;
      const newLevel = Math.floor(newXP / 1000) + 1;
      
      saveProgress(newActive, newCompleted, newLevel, newXP);
      alert(`🎉 Desafio completado! +${completedChallenge.xp} XP`);
    } else {
      saveProgress(updatedActive, completedChallenges, userLevel, userXP);
    }
  };

  const canStartChallenge = (template) => {
    if (template.requirements.minPieces && wardrobe.length < template.requirements.minPieces) {
      return false;
    }
    if (template.requirements.maxPieces && wardrobe.length > template.requirements.maxPieces) {
      // This is actually allowed for minimal challenges
    }
    return true;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-100 text-green-800';
      case 'Médio': return 'bg-yellow-100 text-yellow-800';
      case 'Difícil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-400 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Desafios do Armário</h1>
        </div>

        {/* User Level & XP */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <span className="font-bold text-gray-800">Level {userLevel}</span>
            </div>
            <span className="text-sm text-gray-600">{userXP} XP</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
              style={{ width: `${(userXP % 1000) / 10}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {1000 - (userXP % 1000)} XP para o próximo level
          </div>
        </div>

        {/* Active Challenges */}
        {activeChallenges.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
            <h2 className="font-bold text-gray-800 mb-3">Desafios Ativos</h2>
            <div className="space-y-3">
              {activeChallenges.map(challenge => (
                <div key={challenge.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-800">{challenge.name}</h3>
                    <span className="text-sm text-blue-600">{challenge.progress}%</span>
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
                  
                  {!canStart && template.requirements.minPieces && (
                    <div className="mt-2 text-xs text-red-600">
                      Necessitas de pelo menos {template.requirements.minPieces} peças no armário
                    </div>
                  )}
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
              {completedChallenges.map(challenge => (
                <div key={challenge.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">{challenge.name}</span>
                  </div>
                  <span className="text-xs text-green-600">+{challenge.xp} XP</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Challenge Detail Modal */}
        {selectedChallenge && !showChallengeModal && (
          <ChallengeDetailModal
            challenge={selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
            onCompleteTask={completeTask}
            wardrobe={wardrobe}
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
    </div>
  );
};

// Challenge Detail Modal
const ChallengeDetailModal = ({ challenge, onClose, onCompleteTask, wardrobe }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{challenge.name}</h3>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progresso</span>
            <span>{challenge.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${challenge.progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          {challenge.tasks?.map((task, index) => {
            const isCompleted = challenge.completedTasks?.includes(index);
            return (
              <div key={index} className={`p-3 rounded-lg border ${
                isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      Dia {task.day}: {task.name}
                    </h4>
                    <p className="text-sm text-gray-600">{task.occasion}</p>
                  </div>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <button
                      onClick={() => onCompleteTask(challenge.id, index)}
                      className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Completar
                    </button>
                  )}
                </div>
                
                {task.pieces && (
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1">
                      {task.pieces.map((piece, pieceIndex) => (
                        <span key={pieceIndex} className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                          {piece}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {task.challenge && (
                  <div className="text-xs text-purple-700 bg-purple-100 p-2 rounded">
                    🎯 {task.challenge}
                  </div>
                )}
                
                {task.tips && (
                  <div className="text-xs text-blue-700 mt-1">
                    💡 {task.tips}
                  </div>
                )}
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