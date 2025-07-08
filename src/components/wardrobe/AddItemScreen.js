import React, { useState } from 'react';
import { ArrowLeft, Camera, Upload } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import CameraCapture from '../shared/CameraCapture';

const AddItemScreen = ({ navigateToScreen, user }) => {
  const { addWardrobeItem } = useAppContext();
  const { uploadImageToStorage, dataURLtoFile } = useStorage();
  
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Camisas',
    color: '',
    brand: '',
    condition: 'Usado - Bom',
    tags: [],
    notes: '',
    imageUrl: null
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const categories = ['Camisas', 'Calças', 'Sapatos', 'Acessórios', 'Casacos', 'Vestidos'];
  const conditionOptions = ['Novo', 'Como Novo', 'Usado - Bom', 'Usado - Razoável', 'Gasto'];
  const availableTags = ['formal', 'casual', 'work', 'party', 'sport', 'everyday', 'elegant', 'comfortable', 'trendy', 'classic'];

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.color) {
      alert('Por favor preenche pelo menos o nome e a cor da peça.');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting to add new item...');
      
      let imageUrl = null;
      
      if (newItem.imageUrl) {
        console.log('Processing image upload...');
        const file = dataURLtoFile(newItem.imageUrl, `${Date.now()}.jpg`);
        const imagePath = `wardrobe/${user.uid}/${Date.now()}.jpg`;
        
        console.log('Waiting for auth propagation...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        imageUrl = await uploadImageToStorage(file, imagePath);
        console.log('Image uploaded successfully:', imageUrl);
      }

      const itemToAdd = {
        ...newItem,
        imageUrl: imageUrl,
        userId: user.uid
      };

      console.log('Adding item to Firestore...');
      await addWardrobeItem(itemToAdd);
      console.log('Item added successfully');
      
      navigateToScreen('wardrobe');
    } catch (error) {
      console.error('Error in handleAddItem:', error);
      alert('Erro ao adicionar peça: ' + error.message);
    }
    setIsUploading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor escolhe uma imagem menor que 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewItem({ ...newItem, imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setNewItem({ ...newItem, imageUrl: photoDataUrl });
    setShowCamera(false);
  };

  const toggleTag = (tag) => {
    const newTags = newItem.tags.includes(tag)
      ? newItem.tags.filter(t => t !== tag)
      : [...newItem.tags, tag];
    setNewItem({ ...newItem, tags: newTags });
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6 pt-8">
          <button onClick={() => navigateToScreen('wardrobe')} className="text-white">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-white ml-4">Adicionar Peça</h1>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Foto da Peça</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {newItem.imageUrl ? (
                  <div className="relative">
                    <img src={newItem.imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      onClick={() => setNewItem({ ...newItem, imageUrl: null })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="flex justify-center space-x-4 mb-4">
                      <button
                        onClick={() => setShowCamera(true)}
                        className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Camera className="h-8 w-8 text-blue-500 mb-2" />
                        <span className="text-sm text-blue-600">Tirar Foto</span>
                      </button>
                      
                      <label className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-green-500 mb-2" />
                        <span className="text-sm text-green-600">Carregar</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-sm">Adiciona uma foto da peça (máx. 5MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Nome da Peça *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ex: Camisa azul listrada"
              />
            </div>

            {/* Category and Color */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Categoria *</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Cor *</label>
                <input
                  type="text"
                  value={newItem.color}
                  onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Azul"
                />
              </div>
            </div>

            {/* Brand and Condition */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Marca</label>
                <input
                  type="text"
                  value={newItem.brand}
                  onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ex: Zara, H&M..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Estado</label>
                <select
                  value={newItem.condition}
                  onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {conditionOptions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      newItem.tags.includes(tag)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Notas</label>
              <textarea
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows="2"
                placeholder="Ex: Corte slim fit, comprada em saldos..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleAddItem}
              disabled={!newItem.name || !newItem.color || isUploading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'A adicionar...' : 'Adicionar ao Armário'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddItemScreen;