import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const SubmitButton = ({
  type = 'submit',
  onClick,
  disabled = false,
  loading = false,
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = async (e) => {
    if (isClicked || loading) return;
    
    if (type === 'button' && onClick) {
      setIsClicked(true);
      await onClick(e);
      setIsClicked(false);
    }
  };

  const baseClasses = `
    px-4 
    py-2 
    rounded-md 
    shadow-sm 
    text-sm 
    font-medium 
    focus:outline-none 
    focus:ring-2 
    focus:ring-offset-2 
    transition-colors 
    duration-200
  `;

  const variantClasses = {
    primary: `
      text-white 
      bg-colorPrimario 
      hover:bg-colorPrimarioHover 
      focus:ring-colorPrimario
      disabled:bg-gray-400
      disabled:cursor-not-allowed
    `,
    secondary: `
      text-gray-700 
      bg-white 
      border 
      border-gray-300 
      hover:bg-gray-50 
      focus:ring-colorPrimario
      disabled:bg-gray-100
      disabled:cursor-not-allowed
    `,
    danger: `
      text-white 
      bg-red-600 
      hover:bg-red-700 
      focus:ring-red-500
      disabled:bg-red-300
      disabled:cursor-not-allowed
    `
  };

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${className}
  `;

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading || (type === 'button' && isClicked)}
      className={buttonClasses}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && <LoadingSpinner size="small" color="white" />}
        <span>{children}</span>
      </div>
    </button>
  );
};

export default SubmitButton; 