import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Calendar, ThermometerSun, Palette, Users, Type } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useOpenAI } from '../../hooks/useOpenAI';

const OutfitQuizScreen = ({ navigateToScreen, openaiApiKey }) => {
  const { wardrobe } = useAppContext();
  const { generateOutfitRecommendation } = useOpenAI(openaiApiKey);
  
  const [mode, setMode] = useState('guided');
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({});
  const [freeTextDescription, setFreeTextDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState(null);

  const questions = [
    {
      id: 'occasion',
      title: 'Qual é a ocasião?',
      icon: <Calendar className="h-8 w-8" />,
      options: ['Trabalho', 'Encontro', 'Festa', 'Casual', 'Desporto', 'Formal', 'Família', 'Entrevista']
    },
    {
      id: 'weather',
      title: 'Como está o tempo?',
      icon: <ThermometerSun className="h-8 w-8" />,
      options: ['Quente (>25°C)', 'Ameno (15-25°C)', 'Frio (<15°C)', 'Chuva', 'Vento', 'Humidade']
    },
    {
      id: 'style',
      title: 'Que impressão queres causar?',
      icon: <Palette className="h-8 w-8" />,
      options: ['Profissional', 'Confiante', 'Acessível', 'Criativo', 'Elegante', 'Descontraído']
    },
    {
      id: 'context',
      title: 'Detalhes importantes?',
      icon: <Users className="h-8 w-8" />,
      options: ['Primeira impressão', 'Conhecidos', 'Ambiente conservador', 'Ambiente criativo', 'Ao ar livre', 'Interior']
    }
  ];

  const generateRecommendationAI = async (data) => {
    setIsGenerating(true);
    try {
      let response;
      
      if (mode === 'freetext') {
        response = await generateOutfitRecommendation(
          { description: freeTextDescription },
          wardrobe,
          'freetext'
        );
      } else {
        response = await generateOutfitRecommendation(
          data,
          wardrobe,
          'guided'
        );
      }

      setRecommendation({
        fullResponse: response,
        mode: mode,
        input: mode === 'freetext' ? freeTextDescription : data
      });

    } catch (error) {
      alert('Erro na IA: ' + error.message);
    }
    setIsGenerating(false);
  };

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[step-1].id]: answer };
    setAnswers(newAnswers);
    
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      generateRecommendationAI(newAnswers);
    }
  };

  const resetQuiz = () => {
    setRecommendation(null);
    setStep(1);
    setAnswers({});
    setFreeTextDescription('');
  };

  if (recommendation) {
    return (
      <RecommendationResult 
        recommendation={recommendation}
        onNewConsultation={resetQuiz}
        navigateToScreen={navigateToScreen}
      />
    );
  }

  if (isGenerating) {
    return (
      <LoadingRecommendation />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('home')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Recomendação</h1>
        </div>

        {/* Mode Selection */}
        <div className="bg-white rounded-2xl p-4 shadow-xl mb-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('guided')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                mode === 'guided'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Questionário</span>
            </button>
            <button
              onClick={() => setMode('freetext')}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                mode === 'freetext'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Type className="h-4 w-4" />
              <span>Descrição Livre</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {mode === 'freetext' ? (
            <FreeTextMode 
              freeTextDescription={freeTextDescription}
              setFreeTextDescription={setFreeTextDescription}
              onGenerate={() => generateRecommendationAI({})}
            />
          ) : (
            <GuidedMode 
              questions={questions}
              step={step}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Component for free text mode
const FreeTextMode = ({ freeTextDescription, setFreeTextDescription, onGenerate }) => (
  <div>
    <div className="text-center mb-6">
      <Type className="h-12 w-12 text-blue-500 mx-auto mb-3" />
      <h2 className="text-2xl font-bold text-gray-800">Descreve a Situação</h2>
      <p className="text-gray-600 text-sm mt-2">
        Ex: "Jantar com pais da namorada", "Entrevista para startup", "Casamento de amigo próximo"
      </p>
    </div>

    <textarea
      value={freeTextDescription}
      onChange={(e) => setFreeTextDescription(e.target.value)}
      placeholder="Descreve detalhadamente a situação: onde vais, com quem, que impressão queres causar, há algum dress code..."
      className="w-full h-32 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />

    <button
      onClick={onGenerate}
      disabled={!freeTextDescription.trim()}
      className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Obter Recomendação IA
    </button>
  </div>
);

// Component for guided mode
const GuidedMode = ({ questions, step, onAnswer }) => (
  <div>
    <div className="text-center mb-6">
      <div className="text-blue-500 mb-3">
        {questions[step-1].icon}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">{questions[step-1].title}</h2>
      <p className="text-gray-500 text-sm">Questão {step} de {questions.length}</p>
    </div>

    <div className="space-y-3">
      {questions[step-1].options.map((option, index) => (
        <button
          key={index}
          onClick={() => onAnswer(option)}
          className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors duration-200 border border-transparent hover:border-blue-200"
        >
          <span className="font-medium text-gray-800">{option}</span>
        </button>
      ))}
    </div>

    <div className="mt-6 bg-gray-100 rounded-full h-2">
      <div 
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${(step / questions.length) * 100}%` }}
      ></div>
    </div>
  </div>
);

// Component for loading state
const LoadingRecommendation = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-6 flex items-center justify-center">
    <div className="bg-white rounded-2xl p-8 text-center">
      <div className="animate-spin mb-4">
        <Sparkles className="h-16 w-16 text-purple-500 mx-auto" />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">IA a pensar...</h2>
      <p className="text-gray-600">A criar a recomendação perfeita para ti!</p>
    </div>
  </div>
);

// Component for recommendation result
const RecommendationResult = ({ recommendation, onNewConsultation, navigateToScreen }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 p-6">
    <div className="max-w-md mx-auto">
      <div className="flex items-center mb-6 pt-8">
        <button onClick={() => navigateToScreen('home')} className="text-white">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-white ml-4">Recomendação IA</h1>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
        <div className="text-center mb-6">
          <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800">Outfit Perfeito!</h2>
          {recommendation.mode === 'freetext' && (
            <p className="text-sm text-gray-600 mt-2">Para: "{recommendation.input}"</p>
          )}
        </div>

        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {recommendation.fullResponse}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onNewConsultation}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold"
          >
            Nova Consulta
          </button>
          <button
            onClick={() => navigateToScreen('style-chat')}
            className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold"
          >
            Conversar Mais
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default OutfitQuizScreen;