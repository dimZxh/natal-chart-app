import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container" role="alert" aria-busy="true" aria-label={message}>
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle spinner-circle-outer"></div>
      </div>
      <p className="loading-text">{message}</p>
      <style jsx>{`
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          height: 100%;
          min-height: 200px;
        }
        
        .loading-spinner {
          position: relative;
          width: 60px;
          height: 60px;
        }
        
        .spinner-circle {
          position: absolute;
          border: 4px solid transparent;
          border-top-color: var(--color-primary);
          border-radius: 50%;
          width: 100%;
          height: 100%;
          animation: spin 1s cubic-bezier(0.17, 0.49, 0.96, 0.76) infinite;
        }
        
        .spinner-circle-outer {
          border-top-color: transparent;
          border-right-color: var(--color-primary-light);
          animation: spin 0.75s linear infinite reverse;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .loading-text {
          margin-top: 1.5rem;
          font-size: 1rem;
          color: var(--color-text);
          font-weight: 500;
          text-align: center;
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 