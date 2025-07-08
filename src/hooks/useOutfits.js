import { useState } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

export const useOutfits = () => {
  const [outfits, setOutfits] = useState([]);
  const [isLoadingOutfits, setIsLoadingOutfits] = useState(false);
  const [outfitsRetryCount, setOutfitsRetryCount] = useState(0);

  const checkAuth = () => {
    if (!auth.currentUser) {
      throw new Error('Utilizador não autenticado');
    }
    return auth.currentUser;
  };

  const loadUserOutfits = async (userId) => {
    setIsLoadingOutfits(true);
    try {
      console.log('Loading outfits for user:', userId);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const outfitsRef = collection(db, 'users', userId, 'outfits');
      const q = query(outfitsRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const outfitItems = [];
      querySnapshot.forEach((doc) => {
        outfitItems.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('Outfits loaded:', outfitItems.length, 'items');
      setOutfits(outfitItems);
    } catch (error) {
      console.error('Error loading outfits:', error);
      
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permission denied loading outfits. Check Firestore rules.');
        if (outfitsRetryCount < 1) {
          console.log('🔄 Retrying outfits load once...');
          setOutfitsRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadUserOutfits(userId);
          }, 3000);
        } else {
          console.log('❌ Max retries reached for outfits load');
        }
      } else {
        alert('Erro ao carregar outfits: ' + error.message);
      }
    }
    setIsLoadingOutfits(false);
  };

  const addOutfit = async (outfit) => {
    try {
      console.log('Adding outfit...');
      const currentUser = checkAuth();
      
      const outfitsRef = collection(db, 'users', currentUser.uid, 'outfits');
      const docRef = await addDoc(outfitsRef, {
        ...outfit,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid
      });
      
      console.log('Outfit added with ID:', docRef.id);
      setOutfits(prev => [{ id: docRef.id, ...outfit }, ...prev]);
      return docRef.id;
    } catch (error) {
      console.error('Error adding outfit:', error);
      throw error;
    }
  };

  const updateOutfit = async (outfitId, updates) => {
    try {
      console.log('Updating outfit:', outfitId);
      const currentUser = checkAuth();
      
      const outfitRef = doc(db, 'users', currentUser.uid, 'outfits', outfitId);
      await updateDoc(outfitRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Outfit updated');
      setOutfits(prev => prev.map(outfit => 
        outfit.id === outfitId ? { ...outfit, ...updates } : outfit
      ));
    } catch (error) {
      console.error('Error updating outfit:', error);
      throw error;
    }
  };

  const deleteOutfit = async (outfitId) => {
    try {
      console.log('Deleting outfit:', outfitId);
      const currentUser = checkAuth();
      
      const outfitRef = doc(db, 'users', currentUser.uid, 'outfits', outfitId);
      await deleteDoc(outfitRef);
      
      console.log('Outfit deleted');
      setOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
    } catch (error) {
      console.error('Error deleting outfit:', error);
      throw error;
    }
  };

  return {
    outfits,
    setOutfits,
    isLoadingOutfits,
    loadUserOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit
  };
};