import { useState } from 'react';
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
      console.log('Adding wardrobe item...');
      const currentUser = checkAuth();
      
      const wardrobeRef = collection(db, 'users', currentUser.uid, 'wardrobe');
      const docRef = await addDoc(wardrobeRef, {
        ...item,
        createdAt: new Date().toISOString(),
        userId: currentUser.uid
      });
      
      console.log('Wardrobe item added with ID:', docRef.id);
      setWardrobe(prev => [{ id: docRef.id, ...item }, ...prev]);
    } catch (error) {
      console.error('Error adding wardrobe item:', error);
      throw error;
    }
  };

  const updateWardrobeItem = async (itemId, updates) => {
    try {
      console.log('Updating wardrobe item:', itemId);
      const currentUser = checkAuth();
      
      const itemRef = doc(db, 'users', currentUser.uid, 'wardrobe', itemId);
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      console.log('Wardrobe item updated');
      setWardrobe(prev => prev.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
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

  return {
    wardrobe,
    setWardrobe,
    isLoadingWardrobe,
    loadUserWardrobe,
    addWardrobeItem,
    updateWardrobeItem,
    deleteWardrobeItem
  };
};