const Card = ({ 
    children, 
    className = '',
    padding = 'md',
    shadow = 'md',
    ...props 
  }) => {
    const baseClasses = 'bg-white rounded-2xl';
    
    const paddingClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
      none: ''
    };
    
    const shadowClasses = {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-xl',
      lg: 'shadow-2xl'
    };
    
    const combinedClasses = `${baseClasses} ${paddingClasses[padding]} ${shadowClasses[shadow]} ${className}`;
    
    return (
      <div className={combinedClasses} {...props}>
        {children}
      </div>
    );
  };

  export {  Card };