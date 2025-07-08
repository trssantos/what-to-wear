// 🔑 HARDCODED OpenAI API Key (TEMPORÁRIO)
// TODO: Mover para variáveis de ambiente em produção
export const OPENAI_API_KEY = ''

// Categorias de roupas disponíveis
export const CLOTHING_CATEGORIES = [
  'Camisas', 
  'Calças', 
  'Sapatos', 
  'Acessórios', 
  'Casacos', 
  'Vestidos'
];

// Estados de condição das peças
export const CONDITION_OPTIONS = [
  'Novo', 
  'Como Novo', 
  'Usado - Bom', 
  'Usado - Razoável', 
  'Gasto'
];

// Tags disponíveis para categorizar peças
export const AVAILABLE_TAGS = [
  'formal', 
  'casual', 
  'work', 
  'party', 
  'sport', 
  'everyday', 
  'elegant', 
  'comfortable', 
  'trendy', 
  'classic'
];

// Cores comuns para facilitar seleção
export const COMMON_COLORS = [
  'Branco',
  'Preto', 
  'Azul',
  'Vermelho',
  'Verde',
  'Amarelo',
  'Rosa',
  'Roxo',
  'Castanho',
  'Cinzento',
  'Bege',
  'Laranja'
];

// Marcas populares (para auto-complete)
export const POPULAR_BRANDS = [
  'Zara',
  'H&M',
  'Mango',
  'Pull & Bear',
  'Bershka',
  'Stradivarius',
  'Massimo Dutti',
  'COS',
  'Uniqlo',
  'Nike',
  'Adidas',
  'Levi\'s'
];

// Ocasiões comuns para outfits
export const COMMON_OCCASIONS = [
  'Trabalho',
  'Casual',
  'Festa',
  'Jantar',
  'Entrevista',
  'Desporto',
  'Praia',
  'Viagem',
  'Casamento',
  'Encontro'
];

// Configurações da aplicação
export const APP_CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  MAX_OUTFIT_ACCESSORIES: 5,
  CAMERA_CONSTRAINTS: {
    video: { 
      facingMode: 'environment',
      width: { ideal: 1280, max: 1920 },
      height: { ideal: 720, max: 1080 }
    }
  }
};

// Temas de cores para gradientes
export const COLOR_THEMES = {
  auth: 'from-purple-400 via-pink-500 to-red-500',
  home: 'from-purple-400 via-pink-500 to-red-500',
  wardrobe: 'from-orange-400 to-red-600',
  outfits: 'from-violet-400 to-purple-600',
  ai: 'from-blue-400 to-purple-600',
  styleChat: 'from-green-400 to-blue-600',
  recommendations: 'from-indigo-400 to-purple-600'
};

// URLs úteis
export const EXTERNAL_LINKS = {
  openaiPlatform: 'https://platform.openai.com',
  privacy: '/privacy',
  terms: '/terms',
  support: '/support'
};

// Validações
export const VALIDATION_RULES = {
  minPasswordLength: 6,
  maxItemNameLength: 50,
  maxNotesLength: 200,
  maxOutfitNameLength: 50
};

// Cache keys para localStorage
export const STORAGE_KEYS = {
  apiKey: 'whatToWear_openai_key',
  userPreferences: 'whatToWear_preferences',
  onboardingComplete: 'whatToWear_onboarding'
};