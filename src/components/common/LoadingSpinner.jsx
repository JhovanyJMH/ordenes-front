import React from 'react';

const LoadingSpinner = ({ size = 'medium', color = 'primary', overlay = false, message }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'border-colorPrimario',
    secondary: 'border-colorSecundario',
    white: 'border-white'
  };

  const spinnerClasses = `
    animate-spin
    rounded-full
    border-4
    border-t-transparent
    ${sizeClasses[size]}
    ${colorClasses[color]}
  `;

  const messageClasses = `
    mt-4 
    text-lg 
    font-medium 
    animate-pulse 
    bg-gradient-to-r 
    from-gray-700 
    to-gray-500 
    bg-clip-text 
    text-transparent
  `;

  const overlayMessageClasses = `
    mt-4 
    text-lg 
    font-medium 
    animate-pulse 
    bg-gradient-to-r 
    from-white 
    to-gray-300 
    bg-clip-text 
    text-transparent
  `;

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <div className={spinnerClasses} />
          {message && (
            <div className="text-center">
              <p className={overlayMessageClasses}>{message}</p>
              <div className="mt-2 w-24 h-1 bg-gradient-to-r from-white/30 to-white/10 rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={spinnerClasses} />
      {message && (
        <div className="text-center">
          <p className={messageClasses}>{message}</p>
          <div className="mt-2 w-24 h-1 bg-gradient-to-r from-gray-300 to-gray-100 rounded-full"></div>
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner; 