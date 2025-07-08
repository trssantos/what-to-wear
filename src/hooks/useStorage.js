import { auth, storage } from '../firebase';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

export const useStorage = () => {
  const checkAuth = () => {
    if (!auth.currentUser) {
      throw new Error('Utilizador não autenticado');
    }
    return auth.currentUser;
  };

  const uploadImageToStorage = async (file, path) => {
    try {
      console.log('Starting image upload to path:', path);
      const currentUser = checkAuth();
      console.log('User authenticated for upload:', currentUser.uid);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storageRef = ref(storage, path);
      console.log('Uploading file...');
      
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload successful, getting download URL...');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error details:', error.code, error.message);
      
      if (error.code === 'storage/unauthorized') {
        throw new Error('Erro de permissão. Tenta fazer logout e login novamente.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Erro de rede. Verifica a tua ligação à internet.');
      } else {
        throw new Error('Erro no upload: ' + error.message);
      }
    }
  };

  const deleteImageFromStorage = async (imageUrl) => {
    try {
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
        console.log('Image deleted successfully');
      }
    } catch (error) {
      console.warn('Error deleting image:', error);
      // Don't throw error as this is not critical
    }
  };

  const dataURLtoFile = (dataurl, filename) => {
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

  return {
    uploadImageToStorage,
    deleteImageFromStorage,
    dataURLtoFile
  };
};