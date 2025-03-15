import { format, parse } from 'date-fns';

/**
 * Formats a date object to a string in the format 'YYYY-MM-DD'
 * @param {Date} date - The date to format
 * @returns {string} The formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Formats a time string to a standardized format 'HH:mm'
 * @param {string} time - The time string to format
 * @returns {string} The formatted time string
 */
export const formatTime = (time) => {
  if (!time) return '';
  
  try {
    // Handle different time formats
    let timeStr = time;
    
    // If time is in 12-hour format with AM/PM
    if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
      const parsedTime = parse(time, 'h:mm a', new Date());
      timeStr = format(parsedTime, 'HH:mm');
    }
    
    // Ensure time is in HH:mm format
    if (timeStr.includes(':')) {
      const [hours, minutes] = timeStr.split(':');
      return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    }
    
    return timeStr;
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original time if there's an error
  }
};

/**
 * Combines date and time into a single Date object
 * @param {Date|string} date - The date object or string
 * @param {string} time - The time string in format 'HH:mm'
 * @returns {Date} The combined date and time as a Date object
 */
export const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const [hours, minutes] = time.split(':').map(Number);
    
    const result = new Date(dateObj);
    result.setHours(hours);
    result.setMinutes(minutes);
    
    return result;
  } catch (error) {
    console.error('Error combining date and time:', error);
    return null;
  }
};

/**
 * Formats a date and time for display
 * @param {Date|string} date - The date object or string
 * @param {string} time - The time string
 * @returns {string} The formatted date and time string
 */
export const formatDateTimeForDisplay = (date, time) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dateStr = format(dateObj, 'MMMM d, yyyy');
    return time ? `${dateStr} at ${time}` : dateStr;
  } catch (error) {
    console.error('Error formatting date and time for display:', error);
    return '';
  }
};

/**
 * Validates a date string or object
 * @param {Date|string} date - The date to validate
 * @returns {boolean} Whether the date is valid
 */
export const isValidDate = (date) => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Validates a time string in format 'HH:mm' or 'h:mm a'
 * @param {string} time - The time string to validate
 * @returns {boolean} Whether the time is valid
 */
export const isValidTime = (time) => {
  if (!time) return false;
  
  // Check for 24-hour format (HH:mm)
  const timeRegex24 = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  
  // Check for 12-hour format (h:mm am/pm)
  const timeRegex12 = /^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(am|pm|AM|PM)$/;
  
  return timeRegex24.test(time) || timeRegex12.test(time);
};

/**
 * Gets the current date and time
 * @returns {Object} Object containing current date and time
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: now,
    time: format(now, 'HH:mm')
  };
};

/**
 * Parses a date string in various formats
 * @param {string} dateStr - The date string to parse
 * @returns {Date|null} The parsed Date object or null if invalid
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;
  
  try {
    // Try standard ISO format first
    let date = new Date(dateStr);
    
    // If that fails, try other common formats
    if (isNaN(date.getTime())) {
      // Try MM/DD/YYYY
      const parts = dateStr.split(/[/.-]/);
      if (parts.length === 3) {
        // Try different date formats
        const formats = [
          'MM/dd/yyyy', 'dd/MM/yyyy', 'yyyy/MM/dd',
          'MM-dd-yyyy', 'dd-MM-yyyy', 'yyyy-MM-dd'
        ];
        
        for (const formatStr of formats) {
          try {
            date = parse(dateStr, formatStr, new Date());
            if (!isNaN(date.getTime())) {
              break;
            }
          } catch (e) {
            // Continue trying other formats
          }
        }
      }
    }
    
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}; 