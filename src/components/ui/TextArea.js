const TextArea = ({ 
    label, 
    error, 
    helperText,
    className = '',
    containerClassName = '',
    rows = 3,
    ...props 
  }) => {
    const textareaClasses = `w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none ${
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
        
        <textarea 
          className={textareaClasses}
          rows={rows}
          {...props}
        />
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="text-gray-500 text-sm">{helperText}</p>
        )}
      </div>
    );
  };

  export { TextArea };