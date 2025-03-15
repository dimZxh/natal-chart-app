import React from 'react';

/**
 * Button component with various styles and built-in accessibility
 * 
 * @param {Object} props - Component props
 * @param {string} props.variant - Button style variant (primary, secondary, outline, danger)
 * @param {string} props.size - Button size (small, medium, large)
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {function} props.onClick - Click handler function
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
  ...rest
}) => {
  const baseClass = 'btn';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    fullWidth ? `${baseClass}--full-width` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      type={type}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        
        .btn::after {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          transition: width 0.5s, height 0.5s;
        }
        
        .btn:hover::after {
          width: 300px;
          height: 300px;
        }
        
        .btn:active::after {
          background-color: rgba(0, 0, 0, 0.1);
        }
        
        .btn:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--color-primary-transparent);
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .btn:disabled:hover::after {
          display: none;
        }

        /* Button Variants */
        .btn--primary {
          background-color: var(--color-primary);
          color: var(--color-white);
        }
        
        .btn--secondary {
          background-color: var(--color-secondary);
          color: var(--color-white);
        }
        
        .btn--outline {
          background-color: transparent;
          color: var(--color-primary);
          border: 2px solid var(--color-primary);
        }
        
        .btn--danger {
          background-color: var(--color-danger);
          color: var(--color-white);
        }

        /* Button Sizes */
        .btn--small {
          font-size: 0.85rem;
          padding: 0.4rem 0.75rem;
        }
        
        .btn--medium {
          font-size: 1rem;
          padding: 0.6rem 1.25rem;
        }
        
        .btn--large {
          font-size: 1.1rem;
          padding: 0.8rem 1.75rem;
        }

        /* Full Width */
        .btn--full-width {
          width: 100%;
        }
      `}</style>
    </button>
  );
};

export default Button; 