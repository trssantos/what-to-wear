import React from 'react';

const FeatureCard = ({ icon, title, subtitle, onClick, gradient }) => (
  <div 
    onClick={onClick}
    className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer`}
  >
    <div className="flex items-center space-x-4">
      <div className="text-white">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <p className="text-white/80 text-sm">{subtitle}</p>
      </div>
    </div>
  </div>
);

export default FeatureCard;