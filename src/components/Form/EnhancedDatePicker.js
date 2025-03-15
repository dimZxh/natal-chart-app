import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

/**
 * Enhanced DatePicker with improved UX
 * 
 * @param {Object} props - Component props
 * @param {Date} props.selectedDate - Currently selected date
 * @param {Function} props.onChange - Callback when date changes
 * @param {string} props.label - Field label
 * @param {string} props.id - Input ID
 * @param {boolean} props.showTimeSelect - Whether to show time selection
 * @param {boolean} props.required - Whether the field is required
 * @param {string} props.error - Error message if validation fails
 */
const EnhancedDatePicker = ({
  selectedDate,
  onChange,
  label,
  id,
  showTimeSelect = false,
  required = false,
  error = '',
  placeholder = 'Select date...',
  timeFormat = "HH:mm",
  dateFormat = showTimeSelect ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy"
}) => {
  const [focused, setFocused] = useState(false);
  
  const handleDateChange = (date) => {
    onChange(date);
  };
  
  // Format date for screen readers
  const getAriaLabel = () => {
    if (selectedDate) {
      return `Selected date: ${format(selectedDate, 'PPP')}${
        showTimeSelect ? `, time: ${format(selectedDate, 'h:mm a')}` : ''
      }`;
    }
    return 'Date not selected';
  };

  return (
    <div className={`enhanced-datepicker ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={id} className="datepicker-label">
          {label} {required && <span className="required-mark">*</span>}
        </label>
      )}
      
      <div 
        className={`datepicker-container ${focused ? 'focused' : ''}`}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        <DatePicker
          id={id}
          selected={selectedDate}
          onChange={handleDateChange}
          showTimeSelect={showTimeSelect}
          timeFormat={timeFormat}
          dateFormat={dateFormat}
          timeIntervals={15}
          placeholderText={placeholder}
          className="datepicker-input"
          calendarClassName="enhanced-calendar"
          popperClassName="enhanced-popper"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          ariaLabelledBy={label ? undefined : id}
          aria-label={getAriaLabel()}
          required={required}
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={100}
          showMonthDropdown
          dropdownMode="select"
          closeOnScroll={true}
        />
        
        <div className="datepicker-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 1V3M11 1V3M1 7H15M3 3H13C14.1046 3 15 3.89543 15 5V13C15 14.1046 14.1046 15 13 15H3C1.89543 15 1 14.1046 1 13V5C1 3.89543 1.89543 3 3 3Z" 
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p id={`${id}-error`} className="error-message" role="alert">
          {error}
        </p>
      )}
      
      <style jsx>{`
        .enhanced-datepicker {
          margin-bottom: 1.5rem;
          position: relative;
        }
        
        .datepicker-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--color-text);
          font-size: 0.95rem;
        }
        
        .required-mark {
          color: var(--color-danger);
          margin-left: 2px;
        }
        
        .datepicker-container {
          position: relative;
          border: 1px solid var(--color-border);
          border-radius: 8px;
          background-color: var(--color-bg-light);
          transition: all 0.2s ease;
        }
        
        .datepicker-container.focused {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-transparent);
        }
        
        .has-error .datepicker-container {
          border-color: var(--color-danger);
        }
        
        .has-error .datepicker-container.focused {
          box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.25);
        }
        
        :global(.datepicker-input) {
          width: 100%;
          padding: 0.75rem 1rem;
          padding-right: 2.5rem;
          font-size: 1rem;
          border: none;
          background: transparent;
          color: var(--color-text);
          border-radius: 8px;
        }
        
        :global(.datepicker-input:focus) {
          outline: none;
        }
        
        .datepicker-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-light);
          pointer-events: none;
        }
        
        .error-message {
          color: var(--color-danger);
          font-size: 0.85rem;
          margin-top: 0.5rem;
          margin-bottom: 0;
        }
        
        /* Enhanced Calendar Styling */
        :global(.enhanced-calendar) {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
};

export default EnhancedDatePicker; 