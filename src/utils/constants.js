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


// Categorias base de acessórios para todos os gêneros
export const BASE_ACCESSORIES_CATEGORIES = [
  'Relógios',
  'Óculos de Sol',
  'Cintos',
  'Carteiras',
  'Mochilas/Malas',
  'Chapéus/Bonés',
  'Luvas',
  'Cachecóis'
];

// Categorias específicas femininas de acessórios
export const FEMALE_SPECIFIC_ACCESSORIES = [
  'Brincos',
  'Colares',
  'Pulseiras',
  'Anéis',
  'Broches/Pins',
  'Tiaras/Headbands',
  'Echarpes/Lenços',
  'Carteiras Femininas',
  'Bolsas de Mão',
  'Bolsas Pequenas',
  'Clutches',
  'Bolsas de Ombro',
  'Bolsas Grandes',
  'Mochilas Femininas',
  'Óculos de Leitura',
  'Hair Accessories',
  'Scrunchies',
  'Presilhas',
  'Elásticos de Cabelo',
  'Bandanas',
  'Turbantes',
  'Xales',
  'Pashminas',
  'Meias Especiais',
  'Knee Highs',
  'Suspensórios Femininos'
];

// Categorias específicas masculinas de acessórios
export const MALE_SPECIFIC_ACCESSORIES = [
  'Gravatas',
  'Laços/Bow Ties',
  'Lenços de Bolso',
  'Abotoaduras',
  'Clips de Gravata',
  'Carteiras Masculinas',
  'Porta-cartões',
  'Mochilas Masculinas',
  'Pastas/Briefcases',
  'Messenger Bags',
  'Bandoleiras',
  'Suspensórios',
  'Cintos de Couro',
  'Cintos Casuais',
  'Pulseiras Masculinas',
  'Colares Masculinos',
  'Anéis Masculinos',
  'Piercings',
  'Óculos de Leitura Masculinos',
  'Bonés Desportivos',
  'Chapéus Formais',
  'Gorros',
  'Viseiras',
  'Bandanas Masculinas',
  'Meias Especiais Masculinas'
];

// Função para obter categorias de acessórios baseadas no gênero
export const getAccessoryCategoriesByGender = (gender) => {
  const baseCategories = [...BASE_ACCESSORIES_CATEGORIES];
  
  switch (gender) {
    case 'female':
      return [...baseCategories, ...FEMALE_SPECIFIC_ACCESSORIES].sort();
    case 'male':
      return [...baseCategories, ...MALE_SPECIFIC_ACCESSORIES].sort();
    case 'non-binary':
      // Para non-binary, incluir todas as categorias
      return [...baseCategories, ...FEMALE_SPECIFIC_ACCESSORIES, ...MALE_SPECIFIC_ACCESSORIES].sort();
    default:
      // Se género não especificado, mostrar todas
      return [...baseCategories, ...FEMALE_SPECIFIC_ACCESSORIES, ...MALE_SPECIFIC_ACCESSORIES].sort();
  }
};

// Tags específicas para acessórios
export const ACCESSORIES_TAGS = [
  'statement',
  'delicate',
  'bold',
  'minimalist',
  'vintage',
  'modern',
  'formal',
  'casual',
  'everyday',
  'special-occasion',
  'work',
  'party',
  'travel',
  'sport',
  'luxury',
  'affordable',
  'handmade',
  'designer',
  'practical',
  'decorative',
  'summer',
  'winter',
  'spring',
  'autumn',
  'waterproof',
  'leather',
  'metal',
  'fabric',
  'sustainable'
];

// Tema de cores para acessórios (diferente do wardrobe)
export const ACCESSORIES_COLOR_THEME = {
  main: 'from-emerald-400 to-teal-600',
  accent: 'emerald',
  secondary: 'teal',
  light: 'emerald-100',
  dark: 'emerald-800'
};

// Atualização dos temas de cores existentes
export const COLOR_THEMES = {
  auth: 'from-purple-400 via-pink-500 to-red-500',
  home: 'from-purple-400 via-pink-500 to-red-500',
  wardrobe: 'from-orange-400 to-red-600',
  accessories: 'from-emerald-400 to-teal-600', // NOVO
  outfits: 'from-violet-400 to-purple-600',
  ai: 'from-blue-400 to-purple-600',
  styleChat: 'from-green-400 to-blue-600',
  recommendations: 'from-indigo-400 to-purple-600'
};