const Select = ({ 
    label, 
    error, 
    helperText,
    options = [],
    placeholder = 'Seleciona uma opção',
    className = '',
    containerClassName = '',
    ...props 
  }) => {
    const selectClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
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
        
        <select className={selectClasses} {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-sm">{helperText}</p>
        )}
      </div>
    );
  };

  export { Select };