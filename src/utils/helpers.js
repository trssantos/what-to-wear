import { APP_CONFIG, VALIDATION_RULES } from './constants';

// Formatação de datas
export const formatDate = (dateString, locale = 'pt-PT') => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale);
};

export const formatDateTime = (dateString, locale = 'pt-PT') => {
  const date = new Date(dateString);
  return date.toLocaleString(locale);
};

export const formatTime = (dateString, locale = 'pt-PT') => {
  const date = new Date(dateString);
  return date.toLocaleTimeString(locale, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Validações
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= VALIDATION_RULES.minPasswordLength;
};

export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('Nenhum ficheiro selecionado');
    return errors;
  }
  
  if (file.size > APP_CONFIG.MAX_IMAGE_SIZE) {
    errors.push(`Ficheiro muito grande. Máximo ${APP_CONFIG.MAX_IMAGE_SIZE / (1024 * 1024)}MB`);
  }
  
  if (!APP_CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    errors.push('Tipo de ficheiro não suportado. Use JPEG, PNG ou WebP');
  }
  
  return errors;
};

export const validateItemName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Nome é obrigatório';
  }
  
  if (name.length > VALIDATION_RULES.maxItemNameLength) {
    return `Nome muito longo. Máximo ${VALIDATION_RULES.maxItemNameLength} caracteres`;
  }
  
  return null;
};

export const validateOutfitName = (name) => {
  if (!name || name.trim().length === 0) {
    return 'Nome do outfit é obrigatório';
  }
  
  if (name.length > VALIDATION_RULES.maxOutfitNameLength) {
    return `Nome muito longo. Máximo ${VALIDATION_RULES.maxOutfitNameLength} caracteres`;
  }
  
  return null;
};

// Manipulação de imagens
export const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Manipulação de texto
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Manipulação de arrays e objetos
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (direction === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    
    return aVal > bVal ? 1 : -1;
  });
};

export const filterBy = (array, filters) => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true; // Skip empty filters
      
      const itemValue = item[key];
      
      if (Array.isArray(itemValue)) {
        return itemValue.some(v => 
          v.toLowerCase().includes(value.toLowerCase())
        );
      }
      
      return itemValue?.toLowerCase().includes(value.toLowerCase());
    });
  });
};

// Utilitários de performance
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Manipulação de URLs e navegação
export const generateShareUrl = (outfitId) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/outfit/${outfitId}`;
};

export const downloadAsFile = (data, filename, type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Analytics e logging
export const logEvent = (eventName, properties = {}) => {
  console.log(`📊 Event: ${eventName}`, properties);
  
  // Aqui poderias integrar com analytics (Google Analytics, Mixpanel, etc.)
  // Example: gtag('event', eventName, properties);
};

export const logError = (error, context = {}) => {
  console.error('❌ Error:', error, context);
  
  // Aqui poderias integrar com error tracking (Sentry, LogRocket, etc.)
  // Example: Sentry.captureException(error, { extra: context });
};

// Utilitários de estado
export const createInitialFormState = (fields) => {
  return fields.reduce((state, field) => {
    state[field] = '';
    return state;
  }, {});
};

export const resetFormState = (setState, initialState) => {
  setState(initialState);
};

// Utilitários de localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn('Error loading from localStorage:', error);
    return defaultValue;
  }
};

export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Error removing from localStorage:', error);
    return false;
  }
};

// Utilitários específicos da app
export const getOutfitCompleteness = (outfit) => {
  const total = 4; // top, bottom, shoes, accessories
  let completed = 0;
  
  if (outfit.pieces?.top) completed++;
  if (outfit.pieces?.bottom) completed++;
  if (outfit.pieces?.shoes) completed++;
  if (outfit.pieces?.accessories?.length > 0) completed++;
  
  return Math.round((completed / total) * 100);
};

export const getWardrobeStats = (wardrobe) => {
  const stats = {
    total: wardrobe.length,
    byCategory: groupBy(wardrobe, 'category'),
    byCondition: groupBy(wardrobe, 'condition'),
    withImages: wardrobe.filter(item => item.imageUrl).length,
    recentlyAdded: wardrobe.filter(item => {
      const addedDate = new Date(item.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return addedDate > weekAgo;
    }).length
  };
  
  return stats;
};

export const generateOutfitSuggestions = (wardrobe, occasion = null) => {
  // Lógica simples para sugerir combinações
  const tops = wardrobe.filter(item => ['Camisas', 'Casacos'].includes(item.category));
  const bottoms = wardrobe.filter(item => ['Calças', 'Vestidos'].includes(item.category));
  const shoes = wardrobe.filter(item => item.category === 'Sapatos');
  
  const suggestions = [];
  
  // Gerar algumas combinações aleatórias
  for (let i = 0; i < Math.min(5, tops.length); i++) {
    const top = tops[Math.floor(Math.random() * tops.length)];
    const bottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const shoe = shoes[Math.floor(Math.random() * shoes.length)];
    
    if (top && bottom && shoe) {
      suggestions.push({
        id: `suggestion-${i}`,
        pieces: {
          top: top.id,
          bottom: bottom.id,
          shoes: shoe.id,
          accessories: []
        },
        confidence: Math.random() * 0.4 + 0.6 // 60-100%
      });
    }
  }
  
  return suggestions;
};