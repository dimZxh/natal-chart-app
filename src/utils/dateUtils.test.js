import {
  formatDate,
  formatTime,
  combineDateAndTime,
  formatDateTimeForDisplay,
  isValidDate,
  isValidTime,
  getCurrentDateTime,
  parseDate
} from './dateUtils';

describe('Date Utility Functions', () => {
  describe('formatDate', () => {
    test('formats date object to YYYY-MM-DD string', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      expect(formatDate(date)).toBe('2023-01-15');
    });

    test('returns empty string for null or undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    test('handles errors gracefully', () => {
      const invalidDate = 'not a date';
      expect(formatDate(invalidDate)).toBe('');
    });
  });

  describe('formatTime', () => {
    test('formats 24-hour time string to HH:mm format', () => {
      expect(formatTime('14:30')).toBe('14:30');
      expect(formatTime('9:05')).toBe('09:05');
    });

    test('formats 12-hour time string to HH:mm format', () => {
      // Note: This test might fail in some environments due to date-fns parsing behavior
      // We're mocking the behavior here
      const mockParsedTime = new Date();
      mockParsedTime.setHours(14);
      mockParsedTime.setMinutes(30);
      
      jest.spyOn(Date, 'parse').mockImplementation(() => mockParsedTime);
      
      expect(formatTime('2:30 PM')).toBe('14:30');
    });

    test('returns empty string for null or undefined', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
    });

    test('returns original time string if error occurs', () => {
      const invalidTime = 'invalid time';
      expect(formatTime(invalidTime)).toBe(invalidTime);
    });
  });

  describe('combineDateAndTime', () => {
    test('combines date and time into a single Date object', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      const time = '14:30';
      
      const result = combineDateAndTime(date, time);
      
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    test('handles date as string', () => {
      const date = '2023-01-15';
      const time = '14:30';
      
      const result = combineDateAndTime(date, time);
      
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });

    test('returns null if date or time is missing', () => {
      expect(combineDateAndTime(null, '14:30')).toBeNull();
      expect(combineDateAndTime(new Date(), null)).toBeNull();
    });

    test('handles errors gracefully', () => {
      const invalidDate = 'invalid date';
      const invalidTime = 'invalid time';
      
      expect(combineDateAndTime(invalidDate, '14:30')).toBeNull();
      expect(combineDateAndTime(new Date(), invalidTime)).toBeNull();
    });
  });

  describe('formatDateTimeForDisplay', () => {
    test('formats date and time for display', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      const time = '14:30';
      
      expect(formatDateTimeForDisplay(date, time)).toBe('January 15, 2023 at 14:30');
    });

    test('formats date only if time is not provided', () => {
      const date = new Date(2023, 0, 15); // January 15, 2023
      
      expect(formatDateTimeForDisplay(date)).toBe('January 15, 2023');
    });

    test('returns empty string if date is missing', () => {
      expect(formatDateTimeForDisplay(null, '14:30')).toBe('');
    });

    test('handles errors gracefully', () => {
      const invalidDate = 'invalid date';
      
      expect(formatDateTimeForDisplay(invalidDate, '14:30')).toBe('');
    });
  });

  describe('isValidDate', () => {
    test('returns true for valid dates', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate('2023-01-15')).toBe(true);
    });

    test('returns false for invalid dates', () => {
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
      expect(isValidDate('invalid date')).toBe(false);
      expect(isValidDate('2023-13-45')).toBe(false); // Invalid month and day
    });
  });

  describe('isValidTime', () => {
    test('returns true for valid 24-hour format times', () => {
      expect(isValidTime('00:00')).toBe(true);
      expect(isValidTime('14:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
    });

    test('returns true for valid 12-hour format times', () => {
      expect(isValidTime('12:00 PM')).toBe(true);
      expect(isValidTime('2:30 AM')).toBe(true);
      expect(isValidTime('11:59 pm')).toBe(true);
    });

    test('returns false for invalid times', () => {
      expect(isValidTime(null)).toBe(false);
      expect(isValidTime(undefined)).toBe(false);
      expect(isValidTime('25:00')).toBe(false); // Invalid hour
      expect(isValidTime('14:60')).toBe(false); // Invalid minute
      expect(isValidTime('14:30 XM')).toBe(false); // Invalid AM/PM
      expect(isValidTime('invalid time')).toBe(false);
    });
  });

  describe('getCurrentDateTime', () => {
    test('returns object with current date and time', () => {
      // Mock current date and time
      const mockDate = new Date(2023, 0, 15, 14, 30);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const result = getCurrentDateTime();
      
      expect(result.date).toEqual(mockDate);
      expect(result.time).toBe('14:30');
      
      // Restore original Date
      jest.restoreAllMocks();
    });
  });

  describe('parseDate', () => {
    test('parses ISO format dates', () => {
      const result = parseDate('2023-01-15');
      
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
    });

    test('parses MM/DD/YYYY format dates', () => {
      const result = parseDate('01/15/2023');
      
      expect(result.getFullYear()).toBe(2023);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
    });

    test('returns null for null or undefined', () => {
      expect(parseDate(null)).toBeNull();
      expect(parseDate(undefined)).toBeNull();
    });

    test('returns null for invalid date strings', () => {
      expect(parseDate('invalid date')).toBeNull();
      expect(parseDate('2023-13-45')).toBeNull(); // Invalid month and day
    });
  });
}); 