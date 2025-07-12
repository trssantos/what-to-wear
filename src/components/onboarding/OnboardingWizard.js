// src/components/onboarding/OnboardingWizard.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, User, Palette, Shirt, Home, 
  Sparkles, Check, ChevronRight, Star, Heart, X
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const OnboardingWizard = ({ onComplete, navigateToScreen }) => {
  const { updateUserProfile } = useAppContext();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    preferredStyle: '',
    favoriteColors: [],
    dislikedColors: [],
    wardrobeSize: '',
    lifestyle: '',
    budget: '',
    priorities: [],
    bodyType: '',
    colorSeason: ''
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsRevealed(true), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const steps = [
    {
      id: 'welcome',
      title: 'Bem-vindo!',
      subtitle: 'Vamos personalizar a tua experiência',
      icon: <Sparkles className="h-8 w-8" />
    },
    {
      id: 'name',
      title: 'Como te chamas?',
      subtitle: 'Para te tratarmos pelo nome',
      icon: <User className="h-8 w-8" />
    },
    {
      id: 'gender',
      title: 'Género',
      subtitle: 'Para adaptar as funcionalidades',
      icon: <User className="h-8 w-8" />
    },
    {
      id: 'style',
      title: 'Estilo Preferido',
      subtitle: 'Como te gostas de vestir?',
      icon: <Shirt className="h-8 w-8" />
    },
    {
      id: 'colors',
      title: 'Cores',
      subtitle: 'Que cores preferes e evitas?',
      icon: <Palette className="h-8 w-8" />
    },
    {
      id: 'wardrobe',
      title: 'Armário',
      subtitle: 'Conta-nos sobre o teu armário',
      icon: <Home className="h-8 w-8" />
    },
    {
      id: 'lifestyle',
      title: 'Estilo de Vida',
      subtitle: 'Para recomendações personalizadas',
      icon: <Star className="h-8 w-8" />
    },
    {
      id: 'complete',
      title: 'Pronto!',
      subtitle: 'O teu perfil está configurado',
      icon: <Check className="h-8 w-8" />
    }
  ];

  const genderOptions = [
    { id: 'female', label: 'Feminino', emoji: '👩' },
    { id: 'male', label: 'Masculino', emoji: '👨' },
    { id: 'non-binary', label: 'Não-binário', emoji: '🏳️‍⚧️' },
    { id: 'prefer-not-to-say', label: 'Prefiro não dizer', emoji: '✨' }
  ];

  const styleOptions = [
    { id: 'classic', label: 'Clássico', description: 'Atemporal e elegante', emoji: '👔' },
    { id: 'casual', label: 'Casual', description: 'Confortável e descontraído', emoji: '👕' },
    { id: 'trendy', label: 'Trendy', description: 'Sempre na moda', emoji: '✨' },
    { id: 'boho', label: 'Boho', description: 'Bohemio e livre', emoji: '🌸' },
    { id: 'minimalist', label: 'Minimalista', description: 'Simples e limpo', emoji: '⚪' },
    { id: 'edgy', label: 'Edgy', description: 'Ousado e diferente', emoji: '🖤' },
    { id: 'romantic', label: 'Romântico', description: 'Feminino e delicado', emoji: '💕' },
    { id: 'sporty', label: 'Sporty', description: 'Ativo e funcional', emoji: '👟' }
  ];

  const colorOptions = [
    { id: 'black', label: 'Preto', hex: '#000000' },
    { id: 'white', label: 'Branco', hex: '#FFFFFF' },
    { id: 'navy', label: 'Azul Marinho', hex: '#001f3f' },
    { id: 'blue', label: 'Azul', hex: '#0074D9' },
    { id: 'red', label: 'Vermelho', hex: '#FF4136' },
    { id: 'green', label: 'Verde', hex: '#2ECC40' },
    { id: 'yellow', label: 'Amarelo', hex: '#FFDC00' },
    { id: 'pink', label: 'Rosa', hex: '#F012BE' },
    { id: 'purple', label: 'Roxo', hex: '#B10DC9' },
    { id: 'orange', label: 'Laranja', hex: '#FF851B' },
    { id: 'brown', label: 'Castanho', hex: '#8B4513' },
    { id: 'grey', label: 'Cinzento', hex: '#AAAAAA' },
    { id: 'beige', label: 'Bege', hex: '#F5E6D3' },
    { id: 'cream', label: 'Creme', hex: '#FFFDD0' }
  ];

  const wardrobeSizeOptions = [
    { id: 'minimal', label: 'Minimalista', description: '< 30 peças', emoji: '📦' },
    { id: 'small', label: 'Pequeno', description: '30-60 peças', emoji: '🛍️' },
    { id: 'medium', label: 'Médio', description: '60-100 peças', emoji: '👗' },
    { id: 'large', label: 'Grande', description: '100-200 peças', emoji: '🏠' },
    { id: 'extensive', label: 'Extenso', description: '200+ peças', emoji: '🏬' }
  ];

  const lifestyleOptions = [
    { id: 'student', label: 'Estudante', description: 'Prático e económico', emoji: '🎓' },
    { id: 'professional', label: 'Profissional', description: 'Escritório e reuniões', emoji: '💼' },
    { id: 'creative', label: 'Criativo', description: 'Expressão pessoal', emoji: '🎨' },
    { id: 'social', label: 'Social', description: 'Eventos e saídas', emoji: '🎉' },
    { id: 'family', label: 'Familiar', description: 'Prático e confortável', emoji: '👪' },
    { id: 'freelancer', label: 'Freelancer', description: 'Flexível e versátil', emoji: '💻' }
  ];

  const priorityOptions = [
    { id: 'comfort', label: 'Conforto', emoji: '😌' },
    { id: 'style', label: 'Estilo', emoji: '✨' },
    { id: 'quality', label: 'Qualidade', emoji: '⭐' },
    { id: 'price', label: 'Preço', emoji: '💰' },
    { id: 'versatility', label: 'Versatilidade', emoji: '🔄' },
    { id: 'sustainability', label: 'Sustentabilidade', emoji: '🌱' }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setIsRevealed(false);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 150);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setIsRevealed(false);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
      }, 150);
    }
  };

  const handleColorToggle = (colorId, type) => {
    const field = type === 'favorite' ? 'favoriteColors' : 'dislikedColors';
    const otherField = type === 'favorite' ? 'dislikedColors' : 'favoriteColors';
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(colorId) 
        ? prev[field].filter(id => id !== colorId)
        : [...prev[field], colorId],
      // Remove from other field if exists
      [otherField]: prev[otherField].filter(id => id !== colorId)
    }));
  };

  const handlePriorityToggle = (priorityId) => {
    setFormData(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priorityId)
        ? prev.priorities.filter(id => id !== priorityId)
        : [...prev.priorities, priorityId]
    }));
  };

  const handleComplete = async () => {
    try {
      console.log('🎉 Completing onboarding with data:', formData);
      
      // Save user profile
      await updateUserProfile({
        ...formData,
        onboardingCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      });

      console.log('✅ Profile saved successfully');
      
      // Store in localStorage for quick access
      localStorage.setItem('whatToWear_onboarding', 'completed');
      
      onComplete();
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Erro ao guardar perfil. Tenta novamente.');
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Bem-vindo ao WhatToWear!
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          Vamos criar o teu perfil personalizado para que a nossa IA possa dar-te as melhores recomendações de estilo.
        </p>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h3 className="font-bold text-blue-800 mb-3">O que vamos descobrir:</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Nome e preferências pessoais</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shirt className="h-4 w-4" />
            <span>Estilo preferido e lifestyle</span>
          </div>
          <div className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Cores favoritas e a evitar</span>
          </div>
          <div className="flex items-center space-x-2">
            <Home className="h-4 w-4" />
            <span>Tamanho e tipo do teu armário</span>
          </div>
        </div>
      </div>

      <button
        onClick={nextStep}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <span>Começar</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderNameStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Como te chamas?
        </h2>
        <p className="text-gray-600">
          Queremos tratar-te pelo nome para uma experiência mais pessoal
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-800 font-medium mb-2">Nome</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
            placeholder="Como queres ser chamado?"
            autoFocus
          />
        </div>
        
        <div className="bg-blue-50 rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-blue-800 mb-2">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Exemplo</span>
          </div>
          <p className="text-blue-700 text-sm">
            Se te chamas "Maria Silva", podes colocar apenas "Maria" ou "Mari" - como preferes ser tratada!
          </p>
        </div>
      </div>
    </div>
  );

  const renderGenderStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Como te identificas?
        </h2>
        <p className="text-gray-600">
          Isto ajuda-nos a personalizar as categorias de acessórios, maquilhagem e outras funcionalidades
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {genderOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setFormData(prev => ({ ...prev, gender: option.id }))}
            className={`p-4 rounded-2xl border-2 transition-all ${
              formData.gender === option.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{option.emoji}</span>
              <span className="font-medium text-gray-800">{option.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStyleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Qual é o teu estilo?
        </h2>
        <p className="text-gray-600">
          Escolhe o estilo que mais se identifica contigo
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {styleOptions.map((style) => (
          <button
            key={style.id}
            onClick={() => setFormData(prev => ({ ...prev, preferredStyle: style.id }))}
            className={`p-4 rounded-2xl border-2 transition-all text-left ${
              formData.preferredStyle === style.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{style.emoji}</div>
              <div className="font-medium text-gray-800 text-sm">{style.label}</div>
              <div className="text-xs text-gray-500 mt-1">{style.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderColorsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Cores Favoritas
        </h2>
        <p className="text-gray-600">
          Seleciona cores que gostas e que evitas
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
            <Heart className="h-4 w-4 text-red-500" />
            <span>Cores que gostas (máx. 5)</span>
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorToggle(color.id, 'favorite')}
                disabled={formData.favoriteColors.length >= 5 && !formData.favoriteColors.includes(color.id)}
                className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                  formData.favoriteColors.includes(color.id)
                    ? 'border-green-500 scale-110'
                    : formData.dislikedColors.includes(color.id)
                    ? 'border-red-500 opacity-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {formData.favoriteColors.includes(color.id) && (
                  <Check className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-800 mb-3 flex items-center space-x-2">
            <X className="h-4 w-4 text-red-500" />
            <span>Cores que evitas (máx. 3)</span>
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorToggle(color.id, 'disliked')}
                disabled={formData.dislikedColors.length >= 3 && !formData.dislikedColors.includes(color.id)}
                className={`w-10 h-10 rounded-full border-2 transition-all relative ${
                  formData.dislikedColors.includes(color.id)
                    ? 'border-red-500 scale-110'
                    : formData.favoriteColors.includes(color.id)
                    ? 'border-green-500 opacity-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              >
                {formData.dislikedColors.includes(color.id) && (
                  <X className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWardrobeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          O teu Armário
        </h2>
        <p className="text-gray-600">
          Conta-nos sobre o tamanho do teu armário
        </p>
      </div>

      <div className="space-y-3">
        {wardrobeSizeOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setFormData(prev => ({ ...prev, wardrobeSize: option.id }))}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              formData.wardrobeSize === option.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{option.emoji}</span>
              <div>
                <div className="font-medium text-gray-800">{option.label}</div>
                <div className="text-sm text-gray-500">{option.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderLifestyleStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Estilo de Vida
        </h2>
        <p className="text-gray-600">
          Como é o teu dia-a-dia?
        </p>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-3">Lifestyle principal:</h3>
        <div className="grid grid-cols-1 gap-3">
          {lifestyleOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFormData(prev => ({ ...prev, lifestyle: option.id }))}
              className={`p-4 rounded-2xl border-2 transition-all text-left ${
                formData.lifestyle === option.id
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{option.emoji}</span>
                <div>
                  <div className="font-medium text-gray-800">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-3">Prioridades (seleciona até 3):</h3>
        <div className="grid grid-cols-2 gap-2">
          {priorityOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => handlePriorityToggle(option.id)}
              disabled={formData.priorities.length >= 3 && !formData.priorities.includes(option.id)}
              className={`p-3 rounded-xl border-2 transition-all text-sm ${
                formData.priorities.includes(option.id)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="text-center">
                <div className="text-lg mb-1">{option.emoji}</div>
                <div className="font-medium text-gray-800">{option.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto">
        <Check className="h-12 w-12 text-white" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Perfil Criado!
        </h2>
        <p className="text-gray-600 text-lg mb-6">
          O teu perfil personalizado está pronto. A nossa IA já pode dar-te recomendações super personalizadas!
        </p>
      </div>

      <div className="bg-green-50 rounded-2xl p-6">
        <h3 className="font-bold text-green-800 mb-3">Funcionalidades desbloqueadas:</h3>
        <div className="space-y-2 text-sm text-green-700">
          <div>✨ Recomendações baseadas no teu estilo</div>
          <div>🎨 Sugestões de cores personalizadas</div>
          <div>👔 Secções adaptadas ao teu género</div>
          <div>🏠 Análises adequadas ao teu tipo de armário</div>
          <div>💫 Consultor de estilo personalizado</div>
        </div>
      </div>

      <button
        onClick={handleComplete}
        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2"
      >
        <span>Começar a Explorar</span>
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return renderWelcomeStep();
      case 'name':
        return renderNameStep();
      case 'gender':
        return renderGenderStep();
      case 'style':
        return renderStyleStep();
      case 'colors':
        return renderColorsStep();
      case 'wardrobe':
        return renderWardrobeStep();
      case 'lifestyle':
        return renderLifestyleStep();
      case 'complete':
        return renderCompleteStep();
      default:
        return renderWelcomeStep();
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case 'welcome':
        return true;
      case 'name':
        return formData.name.trim().length >= 2;
      case 'gender':
        return formData.gender !== '';
      case 'style':
        return formData.preferredStyle !== '';
      case 'colors':
        return formData.favoriteColors.length > 0;
      case 'wardrobe':
        return formData.wardrobeSize !== '';
      case 'lifestyle':
        return formData.lifestyle !== '' && formData.priorities.length > 0;
      case 'complete':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Progress Bar */}
        <div className="pt-8 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-white text-sm font-medium">
              Passo {currentStep + 1} de {steps.length}
            </div>
            <div className="text-white text-sm">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className={`text-center mb-6 transform transition-all duration-500 ${
          isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-white">
            {steps[currentStep].icon}
            <span className="font-medium">{steps[currentStep].title}</span>
          </div>
          <p className="text-white/80 text-sm mt-2">{steps[currentStep].subtitle}</p>
        </div>

        {/* Main Content */}
        <div className={`bg-white rounded-3xl p-6 shadow-2xl transform transition-all duration-500 ${
          isRevealed ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'
        }`}>
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <div className={`flex justify-between mt-6 transform transition-all duration-500 delay-200 ${
            isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <button
              onClick={prevStep}
              className="bg-white/20 text-white px-6 py-3 rounded-2xl font-medium flex items-center space-x-2 hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </button>
            
            {canProceed() && (
              <button
                onClick={nextStep}
                className="bg-white text-purple-600 px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 hover:bg-gray-100 transition-all"
              >
                <span>Próximo</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;