// src/components/profile/ProfileSettingsScreen.js
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, User, Palette, Shirt, Home, Star, Heart, X, 
  Check, Save, Edit3, Sparkles, Info
} from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

const ProfileSettingsScreen = ({ navigateToScreen }) => {
  const { userProfile, updateUserProfile } = useAppContext();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [formData, setFormData] = useState({
    gender: '',
    preferredStyle: '',
    favoriteColors: [],
    dislikedColors: [],
    wardrobeSize: '',
    lifestyle: '',
    priorities: []
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        gender: userProfile.gender || '',
        preferredStyle: userProfile.preferredStyle || '',
        favoriteColors: userProfile.favoriteColors || [],
        dislikedColors: userProfile.dislikedColors || [],
        wardrobeSize: userProfile.wardrobeSize || '',
        lifestyle: userProfile.lifestyle || '',
        priorities: userProfile.priorities || []
      });
    }
  }, [userProfile]);

  const sections = [
    { id: 'personal', name: 'Pessoal', icon: <User className="h-4 w-4" /> },
    { id: 'style', name: 'Estilo', icon: <Shirt className="h-4 w-4" /> },
    { id: 'colors', name: 'Cores', icon: <Palette className="h-4 w-4" /> },
    { id: 'lifestyle', name: 'Lifestyle', icon: <Star className="h-4 w-4" /> }
  ];

  const genderOptions = [
    { id: 'female', label: 'Feminino', emoji: '👩' },
    { id: 'male', label: 'Masculino', emoji: '👨' },
    { id: 'non-binary', label: 'Não-binário', emoji: '🏳️‍⚧️' },
    { id: 'prefer-not-to-say', label: 'Prefiro não dizer', emoji: '✨' }
  ];

  const styleOptions = [
    { id: 'classic', label: 'Clássico', emoji: '👔' },
    { id: 'casual', label: 'Casual', emoji: '👕' },
    { id: 'trendy', label: 'Trendy', emoji: '✨' },
    { id: 'boho', label: 'Boho', emoji: '🌸' },
    { id: 'minimalist', label: 'Minimalista', emoji: '⚪' },
    { id: 'edgy', label: 'Edgy', emoji: '🖤' },
    { id: 'romantic', label: 'Romântico', emoji: '💕' },
    { id: 'sporty', label: 'Sporty', emoji: '👟' }
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
    { id: 'student', label: 'Estudante', emoji: '🎓' },
    { id: 'professional', label: 'Profissional', emoji: '💼' },
    { id: 'creative', label: 'Criativo', emoji: '🎨' },
    { id: 'social', label: 'Social', emoji: '🎉' },
    { id: 'family', label: 'Familiar', emoji: '👪' },
    { id: 'freelancer', label: 'Freelancer', emoji: '💻' }
  ];

  const priorityOptions = [
    { id: 'comfort', label: 'Conforto', emoji: '😌' },
    { id: 'style', label: 'Estilo', emoji: '✨' },
    { id: 'quality', label: 'Qualidade', emoji: '⭐' },
    { id: 'price', label: 'Preço', emoji: '💰' },
    { id: 'versatility', label: 'Versatilidade', emoji: '🔄' },
    { id: 'sustainability', label: 'Sustentabilidade', emoji: '🌱' }
  ];

  const handleColorToggle = (colorId, type) => {
    const field = type === 'favorite' ? 'favoriteColors' : 'dislikedColors';
    const otherField = type === 'favorite' ? 'dislikedColors' : 'favoriteColors';
    
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(colorId) 
        ? prev[field].filter(id => id !== colorId)
        : [...prev[field], colorId],
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        ...formData,
        profileUpdatedAt: new Date().toISOString()
      });
      
      setIsEditing(false);
      
      // Show success message
      setTimeout(() => {
        alert('Perfil atualizado com sucesso!');
      }, 500);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Tenta novamente.');
    }
    setIsSaving(false);
  };

  const getDisplayValue = (field, value) => {
    switch (field) {
      case 'gender':
        return genderOptions.find(opt => opt.id === value)?.label || 'Não definido';
      case 'preferredStyle':
        return styleOptions.find(opt => opt.id === value)?.label || 'Não definido';
      case 'wardrobeSize':
        return wardrobeSizeOptions.find(opt => opt.id === value)?.label || 'Não definido';
      case 'lifestyle':
        return lifestyleOptions.find(opt => opt.id === value)?.label || 'Não definido';
      case 'favoriteColors':
        return value.map(colorId => 
          colorOptions.find(color => color.id === colorId)?.label
        ).join(', ') || 'Nenhuma definida';
      case 'dislikedColors':
        return value.map(colorId => 
          colorOptions.find(color => color.id === colorId)?.label
        ).join(', ') || 'Nenhuma definida';
      case 'priorities':
        return value.map(priorityId => 
          priorityOptions.find(priority => priority.id === priorityId)?.label
        ).join(', ') || 'Nenhuma definida';
      default:
        return value || 'Não definido';
    }
  };

  const renderPersonalSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-800">Género</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {getDisplayValue('gender', formData.gender)}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFormData(prev => ({ ...prev, gender: option.id }))}
                className={`p-3 rounded-lg border-2 transition-all text-sm ${
                  formData.gender === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-purple-600 font-medium">
            {genderOptions.find(opt => opt.id === formData.gender)?.emoji} {getDisplayValue('gender', formData.gender)}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-800">Tamanho do Armário</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {getDisplayValue('wardrobeSize', formData.wardrobeSize)}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            {wardrobeSizeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFormData(prev => ({ ...prev, wardrobeSize: option.id }))}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  formData.wardrobeSize === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{option.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-purple-600 font-medium">
            {wardrobeSizeOptions.find(opt => opt.id === formData.wardrobeSize)?.emoji} {getDisplayValue('wardrobeSize', formData.wardrobeSize)}
          </div>
        )}
      </div>
    </div>
  );

  const renderStyleSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-800">Estilo Preferido</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {getDisplayValue('preferredStyle', formData.preferredStyle)}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            {styleOptions.map((style) => (
              <button
                key={style.id}
                onClick={() => setFormData(prev => ({ ...prev, preferredStyle: style.id }))}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.preferredStyle === style.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg mb-1">{style.emoji}</div>
                <div className="font-medium text-gray-800 text-sm">{style.label}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-purple-600 font-medium">
            {styleOptions.find(opt => opt.id === formData.preferredStyle)?.emoji} {getDisplayValue('preferredStyle', formData.preferredStyle)}
          </div>
        )}
      </div>
    </div>
  );

  const renderColorsSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium text-gray-800">Cores Favoritas</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {formData.favoriteColors.length} selecionadas
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <div className="text-sm text-gray-600 mb-2">Seleciona até 5 cores:</div>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorToggle(color.id, 'favorite')}
                  disabled={formData.favoriteColors.length >= 5 && !formData.favoriteColors.includes(color.id)}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                    formData.favoriteColors.includes(color.id)
                      ? 'border-green-500 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                >
                  {formData.favoriteColors.includes(color.id) && (
                    <Check className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.favoriteColors.map(colorId => {
              const color = colorOptions.find(c => c.id === colorId);
              return color ? (
                <div key={colorId} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <span className="text-sm font-medium">{color.label}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium text-gray-800">Cores a Evitar</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {formData.dislikedColors.length} selecionadas
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <div className="text-sm text-gray-600 mb-2">Seleciona até 3 cores:</div>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  onClick={() => handleColorToggle(color.id, 'disliked')}
                  disabled={formData.dislikedColors.length >= 3 && !formData.dislikedColors.includes(color.id)}
                  className={`w-8 h-8 rounded-full border-2 transition-all relative ${
                    formData.dislikedColors.includes(color.id)
                      ? 'border-red-500 scale-110'
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
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.dislikedColors.map(colorId => {
              const color = colorOptions.find(c => c.id === colorId);
              return color ? (
                <div key={colorId} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <span className="text-sm font-medium">{color.label}</span>
                  <X className="h-3 w-3 text-red-500" />
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderLifestyleSection = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-800">Lifestyle</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {getDisplayValue('lifestyle', formData.lifestyle)}
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div className="grid grid-cols-2 gap-2">
            {lifestyleOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setFormData(prev => ({ ...prev, lifestyle: option.id }))}
                className={`p-3 rounded-lg border-2 transition-all text-center ${
                  formData.lifestyle === option.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="text-lg mb-1">{option.emoji}</div>
                <div className="font-medium text-gray-800 text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-purple-600 font-medium">
            {lifestyleOptions.find(opt => opt.id === formData.lifestyle)?.emoji} {getDisplayValue('lifestyle', formData.lifestyle)}
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <label className="font-medium text-gray-800">Prioridades</label>
          {!isEditing && (
            <span className="text-sm text-gray-600">
              {formData.priorities.length} selecionadas
            </span>
          )}
        </div>
        
        {isEditing ? (
          <div>
            <div className="text-sm text-gray-600 mb-2">Seleciona até 3 prioridades:</div>
            <div className="grid grid-cols-2 gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handlePriorityToggle(option.id)}
                  disabled={formData.priorities.length >= 3 && !formData.priorities.includes(option.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    formData.priorities.includes(option.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-lg mb-1">{option.emoji}</div>
                  <div className="font-medium text-gray-800 text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {formData.priorities.map(priorityId => {
              const priority = priorityOptions.find(p => p.id === priorityId);
              return priority ? (
                <div key={priorityId} className="flex items-center space-x-2 bg-white rounded-full px-3 py-1">
                  <span>{priority.emoji}</span>
                  <span className="text-sm font-medium">{priority.label}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalSection();
      case 'style':
        return renderStyleSection();
      case 'colors':
        return renderColorsSection();
      case 'lifestyle':
        return renderLifestyleSection();
      default:
        return renderPersonalSection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-purple-500 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="pt-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateToScreen('home')} className="text-white">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-white">Configurações do Perfil</h1>
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              disabled={isSaving}
              className="bg-white/20 text-white px-4 py-2 rounded-xl flex items-center space-x-2 font-medium hover:bg-white/30 transition-all"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>A guardar...</span>
                </>
              ) : isEditing ? (
                <>
                  <Save className="h-4 w-4" />
                  <span>Guardar</span>
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-1 mb-6">
          <div className="flex">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex-1 py-2 px-3 rounded-xl font-medium text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-white text-purple-600'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  {section.icon}
                  <span className="hidden sm:inline">{section.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              {sections.find(s => s.id === activeSection)?.icon}
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {sections.find(s => s.id === activeSection)?.name}
            </h2>
            {isEditing && (
              <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                Modo Edição
              </div>
            )}
          </div>

          {renderCurrentSection()}

          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form data to original
                    if (userProfile) {
                      setFormData({
                        gender: userProfile.gender || '',
                        preferredStyle: userProfile.preferredStyle || '',
                        favoriteColors: userProfile.favoriteColors || [],
                        dislikedColors: userProfile.dislikedColors || [],
                        wardrobeSize: userProfile.wardrobeSize || '',
                        lifestyle: userProfile.lifestyle || '',
                        priorities: userProfile.priorities || []
                      });
                    }
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Alterações</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4">
          <div className="flex items-center space-x-2 text-white/90">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">
              Estas informações ajudam a personalizar as recomendações da IA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsScreen;