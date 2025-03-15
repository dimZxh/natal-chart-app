import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <div className="spinner-wrapper">
        <div className="spinner">
          <div className="inner-spin"></div>
          <div className="inner-spin"></div>
          <div className="inner-spin"></div>
        </div>
      </div>
      
      {message && <p className="loading-message">{message}</p>}
      
      <style jsx>{`
        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 200px;
          width: 100%;
        }
        
        .spinner-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          margin-bottom: 1rem;
        }
        
        .spinner {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: var(--color-primary);
          animation: spin 1.5s linear infinite;
        }
        
        .spinner .inner-spin {
          position: absolute;
          top: 5px;
          bottom: 5px;
          left: 5px;
          right: 5px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: var(--color-secondary);
          animation: spin 2s linear infinite reverse;
        }
        
        .spinner .inner-spin:nth-child(2) {
          top: 15px;
          bottom: 15px;
          left: 15px;
          right: 15px;
          border-top-color: var(--color-tertiary);
          animation: spin 1.75s linear infinite;
        }
        
        .loading-message {
          font-size: 1rem;
          color: var(--color-text-light);
          text-align: center;
          margin-top: 1rem;
          font-style: italic;
        }
        
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 