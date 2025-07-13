export const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

// Categorias base para todos os gêneros
export const BASE_CLOTHING_CATEGORIES = [
  'T-shirts', 
  'Camisas', 
  'Camisolas/Sweaters',
  'Hoodies/Moletons',
  'Calças',
  'Jeans',
  'Casacos',
  'Blazers',
  'Sapatos',
  'Ténis/Sneakers',
  'Underwear',
  'Pijamas',
  'Roupa Desportiva'
];

// Categorias específicas femininas
export const FEMALE_SPECIFIC_CATEGORIES = [
  'Vestidos',
  'Saias',
  'Blusas',
  'Tops',
  'Cardigans',
  'Knitwear',
  'Lingerie/Sutiãs',
  'Bodies',
  'Macacões/Jumpsuits',
  'Echarpes/Lenços',
  'Kimonos',
  'Crop Tops',
  'Camisoles',
  'Túnicas',
  'Wrap Dresses',
  'Maxidresses',
  'Cocktail Dresses',
  'Sapatos de Salto',
  'Sandálias',
  'Botas (Femininas)',
  'Sabrinas/Bailarinas',
  'Wedges',
  'Leggings',
  'Meias-calças/Collants'
];

// Categorias específicas masculinas
export const MALE_SPECIFIC_CATEGORIES = [
  'Polos',
  'Henley Shirts',
  'Tank Tops',
  'Muscle Shirts',
  'Camisas Formais',
  'Chinos',
  'Shorts',
  'Bermudas',
  'Calças de Fato',
  'Suspensórios',
  'Gravatas',
  'Laços/Bow Ties',
  'Coletes',
  'Smokings',
  'Fatos/Ternos',
  'Sapatos Formais',
  'Mocassins',
  'Botas (Masculinas)',
  'Chinelos',
  'Boxers/Cuecas',
  'Camisolas de Interior',
  'Fatos de Banho (Masculinos)'
];

// Função para obter categorias baseadas no gênero
export const getClothingCategoriesByGender = (gender) => {
  const baseCategories = [...BASE_CLOTHING_CATEGORIES];
  
  switch (gender) {
    case 'female':
      return [...baseCategories, ...FEMALE_SPECIFIC_CATEGORIES].sort();
    case 'male':
      return [...baseCategories, ...MALE_SPECIFIC_CATEGORIES].sort();
    case 'non-binary':
      // Para non-binary, incluir todas as categorias
      return [...baseCategories, ...FEMALE_SPECIFIC_CATEGORIES, ...MALE_SPECIFIC_CATEGORIES].sort();
    default:
      // Se género não especificado, mostrar todas
      return [...baseCategories, ...FEMALE_SPECIFIC_CATEGORIES, ...MALE_SPECIFIC_CATEGORIES].sort();
  }
};

// Categorias legacy para compatibilidade (pode remover depois)
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
  'classic',
  'vintage',
  'bohemian',
  'minimalist',
  'edgy',
  'romantic',
  'sporty',
  'business',
  'weekend',
  'summer',
  'winter',
  'spring',
  'autumn',
  'holiday',
  'date',
  'gym',
  'lounge'
];

// Cores expandidas
export const COMMON_COLORS = [
  'Branco',
  'Preto', 
  'Azul',
  'Azul Marinho',
  'Azul Claro',
  'Vermelho',
  'Verde',
  'Verde Escuro',
  'Verde Claro',
  'Amarelo',
  'Rosa',
  'Rosa Claro',
  'Roxo',
  'Lilás',
  'Castanho',
  'Cinzento',
  'Cinzento Claro',
  'Cinzento Escuro',
  'Bege',
  'Creme',
  'Laranja',
  'Coral',
  'Burgundy',
  'Vinho',
  'Caqui',
  'Dourado',
  'Prateado',
  'Nude',
  'Off-white',
  'Estampado',
  'Multicolor'
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
  'Levi\'s',
  'Calvin Klein',
  'Tommy Hilfiger',
  'Ralph Lauren',
  'Lacoste',
  'Hugo Boss',
  'Armani',
  'Versace',
  'Gucci',
  'Prada',
  'Burberry',
  'Chanel',
  'Dior'
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
  'Encontro',
  'Reunião',
  'Apresentação',
  'Brunch',
  'Cinema',
  'Shopping',
  'Ginásio',
  'Caminhada',
  'Noite',
  'Cocktail',
  'Formal'
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

// Cache keys para localStorage (removida a chave da API)
export const STORAGE_KEYS = {
  userPreferences: 'whatToWear_preferences',
  onboardingComplete: 'whatToWear_onboarding'
};