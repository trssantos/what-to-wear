import React from 'react';

const Input = ({ 
  label, 
  error, 
  helperText,
  icon = null,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const inputClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
    error 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-200 focus:ring-purple-500'
  } ${className}`;
  
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {label && (
        <label className="block text-gray-700 font-semibold text-sm">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input 
          className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
};

export {Input };