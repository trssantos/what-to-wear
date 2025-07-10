import React from 'react';

const FeatureCard = ({ icon, title, subtitle, onClick, gradient, isCompact = false }) => (
  <div 
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} ${
      isCompact ? 'p-4' : 'p-5'
    } rounded-xl shadow-md cursor-pointer active:opacity-80 transition-opacity touch-manipulation select-none`}
    style={{ 
      minHeight: isCompact ? 'auto' : '80px',
      WebkitTapHighlightColor: 'transparent',
      // Prevent zoom on double tap for iOS
      touchAction: 'manipulation',
      // Ensure consistent sizing
      boxSizing: 'border-box',
      // Prevent text selection
      userSelect: 'none',
      WebkitUserSelect: 'none'
    }}
  >
    <div className="flex items-center space-x-4">
      <div className="text-white flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`text-white font-semibold ${
          isCompact ? 'text-base' : 'text-lg'
        } leading-tight`}>
          {title}
        </h3>
        <p className={`text-white/90 ${
          isCompact ? 'text-xs' : 'text-sm'
        } leading-tight mt-1`}>
          {subtitle}
        </p>
      </div>
    </div>
  </div>
);

export default FeatureCard;