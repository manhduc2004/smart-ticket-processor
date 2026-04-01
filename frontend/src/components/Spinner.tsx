import React from 'react';

interface SpinnerProps {
  size?: number;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 20 }) => {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '3px solid #e5e7eb',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  );
};

// Inject keyframes CSS vào document 1 lần
if (typeof document !== 'undefined' && !document.getElementById('__spinner_css')) {
  const style = document.createElement('style');
  style.id = '__spinner_css';
  style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(style);
}