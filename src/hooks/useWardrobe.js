import { useState, useMemo } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { deleteObject, ref } from 'firebase/storage';
import { storage } from '../firebase';

export const useWardrobe = () => {
  const [wardrobe, setWardrobe] = useState([]);
  const [isLoadingWardrobe, setIsLoadingWardrobe] = useState(false);
  const [wardrobeRetryCount, setWardrobeRetryCount] = useState(0);

  const checkAuth = () => {
    if (!auth.currentUser) {
      throw new Error('Utilizador não autenticado');
    }
    return auth.currentUser;
  };

  // Enhanced wardrobe analytics using AI metadata
  const wardrobeAnalytics = useMemo(() => {
    const analytics = {
      totalItems: wardrobe.length,
      aiAnalyzedItems: wardrobe.filter(item => item.aiMetadata).length,
      categoryCounts: {},
      colorCounts: {},
      brandCounts: {},
      conditionCounts: {},
      tagCounts: {},
      aiInsights: {
        fabricTypes: {},
        styleTypes: {},
        formalityLevels: {},
        seasonality: {}
      }
    };

    wardrobe.forEach(item => {
      // Basic analytics
      analytics.categoryCounts[item.category] = (analytics.categoryCounts[item.category] || 0) + 1;
      analytics.colorCounts[item.color] = (analytics.colorCounts[item.color] || 0) + 1;
      
      if (item.brand) {
        analytics.brandCounts[item.brand] = (analytics.brandCounts[item.brand] || 0) + 1;
      }
      
      if (item.condition) {
        analytics.conditionCounts[item.condition] = (analytics.conditionCounts[item.condition] || 0) + 1;
      }

      if (item.tags) {
        item.tags.forEach(tag => {
          analytics.tagCounts[tag] = (analytics.tagCounts[tag] || 0) + 1;
        });
      }

      // AI-enhanced analytics
      if (item.aiMetadata) {
        const metadata = item.aiMetadata.toLowerCase();
        
        // Fabric analysis
        if (metadata.includes('algodão')) analytics.aiInsights.fabricTypes.cotton = (analytics.aiInsights.fabricTypes.cotton || 0) + 1;
        if (metadata.includes('poliéster')) analytics.aiInsights.fabricTypes.polyester = (analytics.aiInsights.fabricTypes.polyester || 0) + 1;
        if (metadata.includes('seda')) analytics.aiInsights.fabricTypes.silk = (analytics.aiInsights.fabricTypes.silk || 0) + 1;
        if (metadata.includes('linho')) analytics.aiInsights.fabricTypes.linen = (analytics.aiInsights.fabricTypes.linen || 0) + 1;
        
        // Style analysis
        if (metadata.includes('casual')) analytics.aiInsights.styleTypes.casual = (analytics.aiInsights.styleTypes.casual || 0) + 1;
        if (metadata.includes('formal')) analytics.aiInsights.styleTypes.formal = (analytics.aiInsights.styleTypes.formal || 0) + 1;
        if (metadata.includes('elegante')) analytics.aiInsights.styleTypes.elegant = (analytics.aiInsights.styleTypes.elegant || 0) + 1;
        if (metadata.includes('desportivo')) analytics.aiInsights.styleTypes.sporty = (analytics.aiInsights.styleTypes.sporty || 0) + 1;
        
        // Formality analysis
        if (metadata.includes('trabalho') || metadata.includes('profissional') || metadata.includes('reunião')) {
          analytics.aiInsights.formalityLevels.professional = (analytics.aiInsights.formalityLevels.professional || 0) + 1;
        }
        if (metadata.includes('festa') || metadata.includes('evento')) {
          analytics.aiInsights.formalityLevels.party = (analytics.aiInsights.formalityLevels.party || 0) + 1;
        }
        
        // Seasonality analysis
        if (metadata.includes('verão') || metadata.includes('respirável') || metadata.includes('leve')) {
          analytics.aiInsights.seasonality.summer = (analytics.aiInsights.seasonality.summer || 0) + 1;
        }
        if (metadata.includes('inverno') || metadata.includes('quente') || metadata.includes('abrigo')) {
          analytics.aiInsights.seasonality.winter = (analytics.aiInsights.seasonality.winter || 0) + 1;
        }
      }
    });

    return analytics;
  }, [wardrobe]);

  // Smart search function using AI metadata
  const smartSearch = (searchTerm, options = {}) => {
    if (!searchTerm) return wardrobe;

    const {
      includeAIMetadata = true,
      includeBasicInfo = true,
      includeTags = true,
      caseSensitive = false
    } = options;

    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    return wardrobe.filter(item => {
      let matches = false;

      // Basic info search
      if (includeBasicInfo) {
        const basicText = `${item.name} ${item.category} ${item.color} ${item.brand || ''} ${item.notes || ''}`;
        matches = matches || (caseSensitive ? basicText : basicText.toLowerCase()).includes(term);
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
  };

  // Advanced filtering with AI insights
  const advancedFilter = (filters) => {
    return wardrobe.filter(item => {
      // Basic filters
      if (filters.category && item.category !== filters.category) return false;
      if (filters.color && item.color !== filters.color) return false;
      if (filters.brand && item.brand !== filters.brand) return false;
      if (filters.condition && item.condition !== filters.condition) return false;
      
      // Tag filters
      if (filters.tags && filters.tags.length > 0) {
        const hasRequiredTags = filters.tags.every(tag => 
          item.tags && item.tags.includes(tag)
        );
        if (!hasRequiredTags) return false;
      }

      // AI-based filters
      if (filters.aiFilters && item.aiMetadata) {
        const metadata = item.aiMetadata.toLowerCase();
        
        if (filters.aiFilters.fabricType) {
          const fabric = filters.aiFilters.fabricType.toLowerCase();
          if (!metadata.includes(fabric)) return false;
        }
        
        if (filters.aiFilters.styleType) {
          const style = filters.aiFilters.styleType.toLowerCase();
          if (!metadata.includes(style)) return false;
        }
        
        if (filters.aiFilters.occasion) {
          const occasion = filters.aiFilters.occasion.toLowerCase();
          if (!metadata.includes(occasion)) return false;
        }
        
        if (filters.aiFilters.seasonality) {
          const season = filters.aiFilters.seasonality.toLowerCase();
          if (!metadata.includes(season)) return false;
        }
      }

      // Date filters
      if (filters.dateRange) {
        const itemDate = new Date(item.createdAt || 0);
        if (filters.dateRange.from && itemDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && itemDate > filters.dateRange.to) return false;
      }

      // AI analysis status filter
      if (filters.hasAI !== undefined) {
        const hasAI = Boolean(item.aiMetadata);
        if (filters.hasAI !== hasAI) return false;
      }

      return true;
    });
  };

  // Smart recommendations based on wardrobe analysis
  const getWardrobeRecommendations = () => {
    const recommendations = {
      missingBasics: [],
      underrepresentedCategories: [],
      colorGaps: [],
      styleImbalances: [],
      aiRecommendations: []
    };

    // Analyze category distribution
    const categoryThresholds = {
      'Camisas': 5,
      'Calças': 4,
      'Sapatos': 3,
      'Casacos': 2,
      'Vestidos': 3,
      'Acessórios': 5
    };

    Object.entries(categoryThresholds).forEach(([category, threshold]) => {
      const count = wardrobeAnalytics.categoryCounts[category] || 0;
      if (count < threshold) {
        recommendations.underrepresentedCategories.push({
          category,
          current: count,
          recommended: threshold,
          priority: threshold - count > 2 ? 'high' : 'medium'
        });
      }
    });

    // Color analysis
    const totalItems = wardrobeAnalytics.totalItems;
    if (totalItems > 10) {
      const neutralCount = (wardrobeAnalytics.colorCounts['Branco'] || 0) + 
                          (wardrobeAnalytics.colorCounts['Preto'] || 0) + 
                          (wardrobeAnalytics.colorCounts['Cinzento'] || 0) + 
                          (wardrobeAnalytics.colorCounts['Bege'] || 0);
      
      if (neutralCount < totalItems * 0.4) {
        recommendations.colorGaps.push({
          type: 'neutrals',
          message: 'Considera adicionar mais cores neutras (branco, preto, cinzento) para versatilidade',
          priority: 'high'
        });
      }
    }

    // AI-based recommendations
    if (wardrobeAnalytics.aiAnalyzedItems > 0) {
      const formalCount = wardrobeAnalytics.aiInsights.formalityLevels.professional || 0;
      const casualCount = wardrobeAnalytics.aiInsights.styleTypes.casual || 0;
      
      if (formalCount < casualCount * 0.3 && totalItems > 5) {
        recommendations.aiRecommendations.push({
          type: 'formal_gap',
          message: 'O teu armário é maioritariamente casual. Considera adicionar peças mais formais.',
          priority: 'medium'
        });
      }

      if (casualCount < formalCount * 0.5 && totalItems > 5) {
        recommendations.aiRecommendations.push({
          type: 'casual_gap',
          message: 'Tens muitas peças formais. Adiciona peças casuais para equilíbrio.',
          priority: 'medium'
        });
      }
    }

    return recommendations;
  };

  // Get similar items using AI metadata
  const findSimilarItems = (targetItem, limit = 5) => {
    if (!targetItem.aiMetadata) {
      // Fallback to basic similarity
      return wardrobe
        .filter(item => 
          item.id !== targetItem.id && 
          (item.category === targetItem.category || item.color === targetItem.color)
        )
        .slice(0, limit);
    }

    const targetMetadata = targetItem.aiMetadata.toLowerCase();
    const similarities = wardrobe
      .filter(item => item.id !== targetItem.id && item.aiMetadata)
      .map(item => {
        const itemMetadata = item.aiMetadata.toLowerCase();
        
        // Simple keyword overlap scoring
        const targetWords = targetMetadata.split(' ').filter(w => w.length > 3);
        const itemWords = itemMetadata.split(' ').filter(w => w.length > 3);
        
        const overlap = targetWords.filter(word => itemWords.includes(word)).length;
        const similarity = overlap / Math.max(targetWords.length, itemWords.length);
        
        return { item, similarity };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(({ item }) => item);

    return similarities;
  };

  const loadUserWardrobe = async (userId) => {
    setIsLoadingWardrobe(true);
    try {
      console.log('Loading wardrobe for user:', userId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const wardrobeRef = collection(db, 'users', userId, 'wardrobe');
      const q = query(wardrobeRef, orderBy('createdAt', 'desc'));
      
      console.log('🔥 Attempting Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('🔥 Firestore query successful!');
      
      const wardrobeItems = [];
      querySnapshot.forEach((doc) => {
        wardrobeItems.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Wardrobe loaded:', wardrobeItems.length, 'items');
      console.log('AI analyzed items:', wardrobeItems.filter(item => item.aiMetadata).length);
      setWardrobe(wardrobeItems);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
      
      if (error.message.includes('autenticado') || error.code === 'permission-denied') {
        console.log('⚠️ Permission denied loading wardrobe. Check Firestore rules.');
        if (wardrobeRetryCount < 1) {
          console.log('🔄 Retrying wardrobe load once...');
          setWardrobeRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadUserWardrobe(userId);
          }, 3000);
        } else {
          console.log('❌ Max retries reached for wardrobe load');
        }
      } else {
        alert('Erro ao carregar armário: ' + error.message);
      }
    }
    setIsLoadingWardrobe(false);
  };

  const addWardrobeItem = async (item) => {
    try {
      console.log('Adding wardrobe item with AI metadata...');
      const currentUser = checkAuth();
      
      // Add metadata about AI analysis
      const enhancedItem = {
        ...item,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
        hasAIAnalysis: Boolean(item.aiMetadata),
        aiAnalyzedAt: item.aiMetadata ? new Date().toISOString() : null,
        version: '2.0' // Track new format with AI support
      };
      
      const wardrobeRef = collection(db, 'users', currentUser.uid, 'wardrobe');
      const docRef = await addDoc(wardrobeRef, enhancedItem);
      
      console.log('Wardrobe item added with ID:', docRef.id);
      console.log('AI metadata included:', Boolean(item.aiMetadata));
      
      setWardrobe(prev => [{ id: docRef.id, ...enhancedItem }, ...prev]);
      return docRef.id;
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      throw error;
    }
  };

  const updateWardrobeItem = async (itemId, updates) => {
    try {
      console.log('Updating wardrobe item:', itemId);
      const currentUser = checkAuth();
      
      const enhancedUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      // Track AI metadata updates
      if (updates.aiMetadata !== undefined) {
        enhancedUpdates.hasAIAnalysis = Boolean(updates.aiMetadata);
        enhancedUpdates.aiAnalyzedAt = updates.aiMetadata ? new Date().toISOString() : null;
      }
      
      const itemRef = doc(db, 'users', currentUser.uid, 'wardrobe', itemId);
      await updateDoc(itemRef, enhancedUpdates);
      
      console.log('Wardrobe item updated');
      setWardrobe(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...enhancedUpdates } : item
      ));
    } catch (error) {
      console.error('Error updating wardrobe item:', error);
      throw error;
    }
  };

  const deleteWardrobeItem = async (itemId, imageUrl) => {
    try {
      console.log('Deleting wardrobe item:', itemId);
      const currentUser = checkAuth();
      
      // Delete from Firestore
      const itemRef = doc(db, 'users', currentUser.uid, 'wardrobe', itemId);
      await deleteDoc(itemRef);
      
      // Delete image from Storage if exists
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (storageError) {
          console.warn('Error deleting image:', storageError);
        }
      }
      
      console.log('Wardrobe item deleted');
      setWardrobe(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting wardrobe item:', error);
      throw error;
    }
  };

  // Bulk operations for AI metadata
  const bulkUpdateAIMetadata = async (updates) => {
    try {
      const currentUser = checkAuth();
      const updatePromises = updates.map(({ itemId, aiMetadata }) => {
        const itemRef = doc(db, 'users', currentUser.uid, 'wardrobe', itemId);
        return updateDoc(itemRef, {
          aiMetadata,
          hasAIAnalysis: Boolean(aiMetadata),
          aiAnalyzedAt: aiMetadata ? new Date().toISOString() : null,
          updatedAt: new Date().toISOString()
        });
      });

      await Promise.all(updatePromises);
      
      // Update local state
      setWardrobe(prev => prev.map(item => {
        const update = updates.find(u => u.itemId === item.id);
        if (update) {
          return {
            ...item,
            aiMetadata: update.aiMetadata,
            hasAIAnalysis: Boolean(update.aiMetadata),
            aiAnalyzedAt: update.aiMetadata ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      }));

      console.log(`Bulk updated ${updates.length} items with AI metadata`);
    } catch (error) {
      console.error('Error in bulk AI metadata update:', error);
      throw error;
    }
  };

  return {
    // Basic wardrobe management
    wardrobe,
    setWardrobe,
    isLoadingWardrobe,
    loadUserWardrobe,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem,
    
    // Enhanced AI-powered features
    wardrobeAnalytics,
    smartSearch,
    advancedFilter,
    getWardrobeRecommendations,
    findSimilarItems,
    bulkUpdateAIMetadata,
    
    // Computed properties
    aiAnalyzedCount: wardrobeAnalytics.aiAnalyzedItems,
    totalCount: wardrobeAnalytics.totalItems,
    analysisProgress: wardrobeAnalytics.totalItems > 0 ? 
      (wardrobeAnalytics.aiAnalyzedItems / wardrobeAnalytics.totalItems) * 100 : 0
  };
};