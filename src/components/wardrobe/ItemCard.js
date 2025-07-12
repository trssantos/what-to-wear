import React from 'react';
import { Shirt, Eye, Sparkles, Tag, Calendar, Star } from 'lucide-react';

const ItemCard = ({ item, onClick, variant = 'default', showAIBadge = true, showDetails = true }) => {
  const hasAI = item.aiMetadata && item.aiMetadata.length > 0;
  const createdDate = new Date(item.createdAt || Date.now());
  const isRecent = (Date.now() - createdDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Last 7 days

  // Extract key characteristics from AI metadata for quick preview
  const getAIPreview = () => {
    if (!item.aiMetadata) return null;
    
    // Try to extract key characteristics
    const text = item.aiMetadata.toLowerCase();
    const characteristics = [];
    
    // Fabric types
    if (text.includes('algodão')) characteristics.push('Algodão');
    else if (text.includes('seda')) characteristics.push('Seda');
    else if (text.includes('linho')) characteristics.push('Linho');
    else if (text.includes('poliéster')) characteristics.push('Poliéster');
    
    // Style types
    if (text.includes('formal')) characteristics.push('Formal');
    else if (text.includes('casual')) characteristics.push('Casual');
    else if (text.includes('elegante')) characteristics.push('Elegante');
    else if (text.includes('desportivo')) characteristics.push('Desportivo');
    
    // Fit types
    if (text.includes('slim')) characteristics.push('Slim Fit');
    else if (text.includes('oversized')) characteristics.push('Oversized');
    else if (text.includes('ajustado')) characteristics.push('Ajustado');
    
    return characteristics.slice(0, 2); // Max 2 characteristics
  };

  const aiPreview = getAIPreview();

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center space-x-3 bg-white rounded-xl p-3 shadow-md hover:shadow-lg transition-all cursor-pointer group"
        onClick={onClick}
      >
        {/* Mini Image */}
        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Shirt className="h-6 w-6 text-gray-400" />
            </div>
          )}
          {hasAI && showAIBadge && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-2 w-2 text-white" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800 text-sm truncate">{item.name}</h3>
          <p className="text-xs text-gray-500">{item.category} • {item.color}</p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-1 text-gray-400">
          {item.tags && item.tags.length > 0 && (
            <Tag className="h-3 w-3" />
          )}
          <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        {/* Header with badges */}
        <div className="relative">
          {hasAI && showAIBadge && (
            <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Sparkles className="h-3 w-3" />
              <span>AI</span>
            </div>
          )}
          
          {isRecent && (
            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>NOVO</span>
            </div>
          )}

          {/* Image */}
          <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Shirt className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Eye className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-2 line-clamp-1">{item.name}</h3>
          
          {/* Basic Info */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {item.category}
            </span>
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {item.color}
            </span>
          </div>

          {/* AI Preview */}
          {hasAI && aiPreview && aiPreview.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {aiPreview.map((characteristic, index) => (
                  <span 
                    key={index}
                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {characteristic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.slice(0, 3).map(tag => (
                <span 
                  key={tag}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-gray-400 text-xs">+{item.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* AI Metadata Preview */}
          {hasAI && item.aiMetadata && (
            <div className="bg-purple-50 rounded-lg p-3 mt-3">
              <div className="flex items-center space-x-1 mb-1">
                <Sparkles className="h-3 w-3 text-purple-600" />
                <span className="text-purple-700 text-xs font-bold">Análise AI</span>
              </div>
              <p className="text-purple-700 text-xs line-clamp-3">
                {item.aiMetadata.substring(0, 120)}...
              </p>
            </div>
          )}

          {/* Brand & Date */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            {item.brand ? (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-500 text-xs font-medium">{item.brand}</span>
              </div>
            ) : (
              <span className="text-gray-400 text-xs">Sem marca</span>
            )}
            
            <div className="flex items-center space-x-1 text-gray-400">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{createdDate.toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className="relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* AI Badge */}
      {hasAI && showAIBadge && (
        <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
          <Sparkles className="h-3 w-3" />
          <span>AI</span>
        </div>
      )}

      {/* New Badge */}
      {isRecent && (
        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          NOVO
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Eye className="h-8 w-8 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">{item.name}</h3>
        <p className="text-gray-600 text-xs mb-2">{item.category} • {item.color}</p>
        
        {/* Tags */}
        {showDetails && item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {item.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-gray-400 text-xs">+{item.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* AI Preview for Default */}
        {hasAI && aiPreview && aiPreview.length > 0 && showDetails && (
          <div className="flex flex-wrap gap-1 mb-2">
            {aiPreview.map((characteristic, index) => (
              <span 
                key={index}
                className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
              >
                {characteristic}
              </span>
            ))}
          </div>
        )}

        {/* AI Metadata Preview - Compact */}
        {hasAI && item.aiMetadata && showDetails && (
          <div className="bg-purple-50 rounded-lg p-2 mt-2">
            <p className="text-purple-700 text-xs line-clamp-2 font-medium">
              {item.aiMetadata.substring(0, 80)}...
            </p>
          </div>
        )}

        {/* Brand */}
        {showDetails && item.brand && (
          <div className="flex items-center space-x-1 mt-2">
            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
            <span className="text-gray-500 text-xs font-medium">{item.brand}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Smart Grid Component for displaying multiple items
export const SmartItemGrid = ({ 
  items, 
  onItemClick, 
  variant = 'default',
  showAIFirst = true,
  maxItems = null,
  emptyMessage = "Nenhuma peça encontrada" 
}) => {
  let displayItems = [...items];
  
  // Sort AI-analyzed items first if requested
  if (showAIFirst) {
    displayItems.sort((a, b) => {
      const aHasAI = a.aiMetadata ? 1 : 0;
      const bHasAI = b.aiMetadata ? 1 : 0;
      return bHasAI - aHasAI;
    });
  }
  
  // Limit items if specified
  if (maxItems) {
    displayItems = displayItems.slice(0, maxItems);
  }

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Shirt className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  const getGridClasses = () => {
    switch (variant) {
      case 'compact':
        return 'space-y-2';
      case 'detailed':
        return 'grid grid-cols-1 gap-6';
      default:
        return 'grid grid-cols-2 gap-4';
    }
  };

  return (
    <div className={getGridClasses()}>
      {displayItems.map((item) => (
        <ItemCard 
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
          variant={variant}
        />
      ))}
    </div>
  );
};

// AI Status Badge Component
export const AIStatusBadge = ({ item, size = 'default' }) => {
  const hasAI = item.aiMetadata && item.aiMetadata.length > 0;
  
  if (!hasAI) return null;
  
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };
  
  return (
    <div className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold flex items-center space-x-1 ${sizeClasses[size]}`}>
      <Sparkles className="h-3 w-3" />
      <span>AI</span>
    </div>
  );
};

export default ItemCard;