import React, { useState } from 'react';
import { ArrowLeft, Edit, Trash2, Save, X, Camera, Upload, Shirt } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';
import { useStorage } from '../../hooks/useStorage';
import CameraCapture from '../shared/CameraCapture';

const ItemDetailScreen = ({ navigateToScreen }) => {
  const { selectedItem, updateWardrobeItem, deleteWardrobeItem } = useAppContext();
  const { uploadImageToStorage, dataURLtoFile } = useStorage();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...selectedItem });
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const conditionOptions = ['Novo', 'Como Novo', 'Usado - Bom', 'Usado - Razoável', 'Gasto'];
  const categories = ['Camisas', 'Calças', 'Sapatos', 'Acessórios', 'Casacos', 'Vestidos'];
  const availableTags = ['formal', 'casual', 'work', 'party', 'sport', 'everyday', 'elegant', 'comfortable', 'trendy', 'classic'];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      let imageUrl = editedItem.imageUrl;
      
      if (editedItem.imageUrl && editedItem.imageUrl.startsWith('data:')) {
        const file = dataURLtoFile(editedItem.imageUrl, `${Date.now()}.jpg`);
        const imagePath = `wardrobe/${selectedItem.userId}/${Date.now()}.jpg`;
        imageUrl = await uploadImageToStorage(file, imagePath);
      }

      await updateWardrobeItem(selectedItem.id, {
        ...editedItem,
        imageUrl: imageUrl
      });

      setIsEditing(false);
    } catch (error) {
      alert('Erro ao guardar: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Tens a certeza que queres eliminar esta peça?')) {
      setIsLoading(true);
      try {
        await deleteWardrobeItem(selectedItem.id, selectedItem.imageUrl);
        navigateToScreen('wardrobe');
      } catch (error) {
        alert('Erro ao eliminar: ' + error.message);
      }
      setIsLoading(false);
    }
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
        setEditedItem({ ...editedItem, imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (photoDataUrl) => {
    setEditedItem({ ...editedItem, imageUrl: photoDataUrl });
    setShowCamera(false);
  };

  const toggleTag = (tag) => {
    const newTags = editedItem.tags?.includes(tag)
      ? editedItem.tags.filter(t => t !== tag)
      : [...(editedItem.tags || []), tag];
    setEditedItem({ ...editedItem, tags: newTags });
  };

  if (showCamera) {
    return (
      <CameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-400 to-gray-600 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Peça não encontrada</p>
          <button 
            onClick={() => navigateToScreen('wardrobe')}
            className="mt-4 bg-white text-slate-600 px-6 py-2 rounded-lg"
          >
            Voltar ao Armário
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-400 to-gray-600 p-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6 pt-8">
          <div className="flex items-center">
            <button onClick={() => navigateToScreen('wardrobe')} className="text-white mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-white">
              {isEditing ? 'Editar Peça' : 'Detalhes da Peça'}
            </h1>
          </div>
          
          {!isEditing && (
            <div className="flex space-x-2">
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 bg-white/20 rounded-full"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
              <button 
                onClick={handleDelete}
                className="p-2 bg-red-500/80 rounded-full"
                disabled={isLoading}
              >
                <Trash2 className="h-5 w-5 text-white" />
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl max-h-[80vh] overflow-y-auto">
          {/* Image */}
          <div className="mb-6">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              {(isEditing ? editedItem.imageUrl : selectedItem.imageUrl) ? (
                <img 
                  src={isEditing ? editedItem.imageUrl : selectedItem.imageUrl} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Shirt className="h-16 w-16 text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setShowCamera(true)}
                      className="p-3 bg-blue-500 rounded-full"
                    >
                      <Camera className="h-5 w-5 text-white" />
                    </button>
                    <label className="p-3 bg-green-500 rounded-full cursor-pointer">
                      <Upload className="h-5 w-5 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nome da Peça</label>
                <input
                  type="text"
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Categoria</label>
                  <select
                    value={editedItem.category}
                    onChange={(e) => setEditedItem({ ...editedItem, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Cor</label>
                  <input
                    type="text"
                    value={editedItem.color}
                    onChange={(e) => setEditedItem({ ...editedItem, color: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Marca</label>
                  <input
                    type="text"
                    value={editedItem.brand || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, brand: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Estado</label>
                  <select
                    value={editedItem.condition || 'Usado - Bom'}
                    onChange={(e) => setEditedItem({ ...editedItem, condition: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                  >
                    {conditionOptions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        editedItem.tags?.includes(tag)
                          ? 'bg-slate-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Notas</label>
                <textarea
                  value={editedItem.notes || ''}
                  onChange={(e) => setEditedItem({ ...editedItem, notes: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  rows="3"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-slate-500 to-gray-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Save className="h-5 w-5" />
                  <span>{isLoading ? 'A guardar...' : 'Guardar'}</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedItem({ ...selectedItem });
                  }}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2"
                >
                  <X className="h-5 w-5" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedItem.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {selectedItem.category}
                  </span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {selectedItem.color}
                  </span>
                  {selectedItem.condition && (
                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                      {selectedItem.condition}
                    </span>
                  )}
                </div>
              </div>

              {selectedItem.brand && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Marca</h3>
                  <p className="text-gray-600">{selectedItem.brand}</p>
                </div>
              )}

              {selectedItem.tags && selectedItem.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.notes && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">Notas</h3>
                  <p className="text-gray-600">{selectedItem.notes}</p>
                </div>
              )}

              <div className="text-xs text-gray-400 pt-4 border-t">
                Adicionado em {new Date(selectedItem.createdAt).toLocaleDateString('pt-PT')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailScreen;