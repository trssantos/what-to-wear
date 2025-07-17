// src/hooks/useAccessories.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAccessoryCategoriesByGender } from '../utils/constants';

export const useAccessories = (userId) => {
  const [accessories, setAccessories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Listener em tempo real para acessórios do utilizador
  useEffect(() => {
    if (!userId) {
      setAccessories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const accessoriesQuery = query(
      collection(db, 'accessories'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(accessoriesQuery, (snapshot) => {
      const accessoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAccessories(accessoriesData);
      setIsLoading(false);
    }, (error) => {
      console.error('Erro ao buscar acessórios:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  // Adicionar novo acessório
  const addAccessory = async (accessoryData) => {
    if (!userId) throw new Error('Utilizador não autenticado');

    try {
      const newAccessory = {
        ...accessoryData,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'accessories'), newAccessory);
      console.log('✅ Acessório adicionado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('💥 Erro ao adicionar acessório:', error);
      throw error;
    }
  };

  // Atualizar acessório existente
  const updateAccessory = async (accessoryId, updates) => {
    if (!userId) throw new Error('Utilizador não autenticado');

    try {
      const accessoryRef = doc(db, 'accessories', accessoryId);
      await updateDoc(accessoryRef, {
        ...updates,
        updatedAt: new Date()
      });
      
      console.log('✅ Acessório atualizado:', accessoryId);
    } catch (error) {
      console.error('💥 Erro ao atualizar acessório:', error);
      throw error;
    }
  };

  // Eliminar acessório
  const deleteAccessory = async (accessoryId) => {
    if (!userId) throw new Error('Utilizador não autenticado');

    try {
      const accessoryRef = doc(db, 'accessories', accessoryId);
      await deleteDoc(accessoryRef);
      
      console.log('✅ Acessório eliminado:', accessoryId);
    } catch (error) {
      console.error('💥 Erro ao eliminar acessório:', error);
      throw error;
    }
  };

  // Obter acessório por ID
  const getAccessoryById = (accessoryId) => {
    return accessories.find(accessory => accessory.id === accessoryId);
  };

  // Pesquisar acessórios
  const searchAccessories = (searchQuery, options = {}) => {
    const {
      includeName = true,
      includeCategory = true,
      includeColor = true,
      includeBrand = true,
      includeTags = true,
      includeNotes = true,
      includeAIMetadata = true,
      caseSensitive = false
    } = options;

    if (!searchQuery.trim()) return accessories;

    const terms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);

    return accessories.filter(item => {
      return terms.some(term => {
        let matches = false;

        // Name search
        if (includeName && item.name) {
          const nameText = caseSensitive ? item.name : item.name.toLowerCase();
          matches = matches || nameText.includes(term);
        }

        // Category search  
        if (includeCategory && item.category) {
          const categoryText = caseSensitive ? item.category : item.category.toLowerCase();
          matches = matches || categoryText.includes(term);
        }

        // Color search
        if (includeColor && item.color) {
          const colorText = caseSensitive ? item.color : item.color.toLowerCase();
          matches = matches || colorText.includes(term);
        }

        // Brand search
        if (includeBrand && item.brand) {
          const brandText = caseSensitive ? item.brand : item.brand.toLowerCase();
          matches = matches || brandText.includes(term);
        }

        // Notes search
        if (includeNotes && item.notes) {
          const notesText = caseSensitive ? item.notes : item.notes.toLowerCase();
          matches = matches || notesText.includes(term);
        }

        // Tags search
        if (includeTags && item.tags) {
          matches = matches || item.tags.some(tag => 
            (caseSensitive ? tag : tag.toLowerCase()).includes(term)
          );
        }

        // AI metadata search
        if (includeAIMetadata && item.aiMetadata) {
          matches = matches || (caseSensitive ? item.aiMetadata : item.aiMetadata.toLowerCase()).includes(term);
        }

        return matches;
      });
    });
  };

  // Filtro avançado
  const advancedFilter = (filters) => {
    return accessories.filter(item => {
      // Filtros básicos
      if (filters.category && item.category !== filters.category) return false;
      if (filters.color && item.color !== filters.color) return false;
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.condition && item.condition !== filters.condition) return false;
      
      // Filtro de tags
      if (filters.tags && filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.every(tag => 
          item.tags && item.tags.includes(tag)
        );
        if (!hasRequiredTags) return false;
      }

      // Filtros baseados em AI
      if (filters.aiFilters && item.aiMetadata) {
        const metadata = item.aiMetadata.toLowerCase();
        
        if (filters.aiFilters.style) {
          const style = filters.aiFilters.style.toLowerCase();
          if (!metadata.includes(style)) return false;
        }
        
        if (filters.aiFilters.occasion) {
          const occasion = filters.aiFilters.occasion.toLowerCase();
          if (!metadata.includes(occasion)) return false;
        }
        
        if (filters.aiFilters.material) {
          const material = filters.aiFilters.material.toLowerCase();
          if (!metadata.includes(material)) return false;
        }
      }

      // Filtro de data
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt || 0);
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
      }

      // Filtro de análise AI
      if (filters.hasAI !== undefined) {
        const hasAI = Boolean(item.aiMetadata);
        if (filters.hasAI !== hasAI) return false;
      }

      return true;
    });
  };

  // Analytics dos acessórios
  const accessoriesAnalytics = {
    totalItems: accessories.length,
    aiAnalyzedItems: accessories.filter(item => item.aiMetadata).length,
    categoryCounts: accessories.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    }, {}),
    colorCounts: accessories.reduce((acc, item) => {
      if (item.color) {
        acc[item.color] = (acc[item.color] || 0) + 1;
      }
      return acc;
    }, {}),
    brandCounts: accessories.reduce((acc, item) => {
      if (item.brand) {
        acc[item.brand] = (acc[item.brand] || 0) + 1;
      }
      return acc;
    }, {}),
    conditionCounts: accessories.reduce((acc, item) => {
      if (item.condition) {
        acc[item.condition] = (acc[item.condition] || 0) + 1;
      }
      return acc;
    }, {}),
    aiInsights: {
      styleTypes: {},
      formalityLevels: {},
      seasonality: {},
      materials: {}
    }
  };

  // Obter recomendações para acessórios
  const getAccessoriesRecommendations = (userProfile) => {
    const recommendations = {
      missingEssentials: [],
      underrepresentedCategories: [],
      colorGaps: [],
      aiRecommendations: []
    };

    const essentialCategories = getAccessoryCategoriesByGender(userProfile?.gender);
    const categoryThresholds = {
      'Relógios': 2,
      'Óculos de Sol': 2,
      'Cintos': 3,
      'Carteiras': 1,
      'Brincos': userProfile?.gender === 'female' ? 5 : 0,
      'Colares': userProfile?.gender === 'female' ? 3 : 1,
      'Pulseiras': 2,
      'Gravatas': userProfile?.gender === 'male' ? 5 : 0,
      'Lenços de Bolso': userProfile?.gender === 'male' ? 3 : 0
    };

    // Analisar categorias em falta
    Object.entries(categoryThresholds).forEach(([category, threshold]) => {
      if (threshold > 0) {
        const count = accessoriesAnalytics.categoryCounts[category] || 0;
        if (count < threshold) {
          recommendations.underrepresentedCategories.push({
            category,
            current: count,
            recommended: threshold,
            priority: threshold - count > 2 ? 'high' : 'medium'
          });
        }
      }
    });

    return recommendations;
  };

  return {
    accessories,
    isLoading,
    addAccessory,
    updateAccessory,
    deleteAccessory,
    getAccessoryById,
    searchAccessories,
    advancedFilter,
    accessoriesAnalytics,
    getAccessoriesRecommendations
  };
};