import React from 'react';
import { Shirt } from 'lucide-react';

const ItemCard = ({ item, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105"
    >
      <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>
      <h3 className="font-semibold text-gray-800 text-sm">{item.name}</h3>
      <p className="text-gray-500 text-xs">{item.color}</p>
      {item.brand && (
        <p className="text-gray-400 text-xs">{item.brand}</p>
      )}
      {item.condition && (
        <p className="text-orange-600 text-xs font-medium">{item.condition}</p>
      )}
      <div className="flex flex-wrap gap-1 mt-2">
        {(item.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ItemCard;