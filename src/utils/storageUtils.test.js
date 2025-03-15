import {
  saveToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
  saveProfile,
  getAllProfiles,
  getProfileById,
  deleteProfile,
  saveLastBirthData,
  getLastBirthData,
  saveSettings,
  getSettings
} from './storageUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Storage Utility Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('saveToLocalStorage', () => {
    test('saves data to localStorage', () => {
      const key = 'testKey';
      const data = { name: 'Test Data' };
      
      const result = saveToLocalStorage(key, data);
      
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(key, JSON.stringify(data));
    });

    test('handles errors gracefully', () => {
      const key = 'testKey';
      const data = { name: 'Test Data' };
      
      // Mock localStorage.setItem to throw an error
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = saveToLocalStorage(key, data);
      
      expect(result).toBe(false);
    });
  });

  describe('getFromLocalStorage', () => {
    test('retrieves data from localStorage', () => {
      const key = 'testKey';
      const data = { name: 'Test Data' };
      
      // Set up localStorage with test data
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(data));
      
      const result = getFromLocalStorage(key);
      
      expect(result).toEqual(data);
      expect(localStorageMock.getItem).toHaveBeenCalledWith(key);
    });

    test('returns default value if key does not exist', () => {
      const key = 'nonExistentKey';
      const defaultValue = { name: 'Default Data' };
      
      const result = getFromLocalStorage(key, defaultValue);
      
      expect(result).toEqual(defaultValue);
    });

    test('handles errors gracefully', () => {
      const key = 'testKey';
      const defaultValue = { name: 'Default Data' };
      
      // Mock localStorage.getItem to throw an error
      localStorageMock.getItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = getFromLocalStorage(key, defaultValue);
      
      expect(result).toEqual(defaultValue);
    });
  });

  describe('removeFromLocalStorage', () => {
    test('removes data from localStorage', () => {
      const key = 'testKey';
      
      const result = removeFromLocalStorage(key);
      
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(key);
    });

    test('handles errors gracefully', () => {
      const key = 'testKey';
      
      // Mock localStorage.removeItem to throw an error
      localStorageMock.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = removeFromLocalStorage(key);
      
      expect(result).toBe(false);
    });
  });

  describe('clearLocalStorage', () => {
    test('clears all data from localStorage', () => {
      const result = clearLocalStorage();
      
      expect(result).toBe(true);
      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    test('handles errors gracefully', () => {
      // Mock localStorage.clear to throw an error
      localStorageMock.clear.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = clearLocalStorage();
      
      expect(result).toBe(false);
    });
  });

  describe('saveProfile', () => {
    test('saves a new profile', () => {
      const profile = {
        name: 'Test User',
        birthDate: '2000-01-01',
        birthTime: '12:00',
        birthPlace: 'New York, NY'
      };
      
      // Mock getFromLocalStorage to return empty array
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify([]));
      
      const result = saveProfile(profile);
      
      expect(result).toBe(true);
      
      // Check that setItem was called with the profile added to the array
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.length).toBe(1);
      expect(savedData[0].name).toBe('Test User');
      expect(savedData[0].id).toBeDefined();
      expect(savedData[0].createdAt).toBeDefined();
      expect(savedData[0].updatedAt).toBeDefined();
    });

    test('updates an existing profile', () => {
      const existingProfile = {
        id: '123',
        name: 'Test User',
        birthDate: '2000-01-01',
        birthTime: '12:00',
        birthPlace: 'New York, NY',
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      const updatedProfile = {
        ...existingProfile,
        name: 'Updated User'
      };
      
      // Mock getFromLocalStorage to return array with existing profile
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify([existingProfile]));
      
      const result = saveProfile(updatedProfile);
      
      expect(result).toBe(true);
      
      // Check that setItem was called with the updated profile
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.length).toBe(1);
      expect(savedData[0].name).toBe('Updated User');
      expect(savedData[0].updatedAt).toBeDefined();
    });
  });

  describe('getAllProfiles', () => {
    test('retrieves all profiles', () => {
      const profiles = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      
      // Mock getFromLocalStorage to return array of profiles
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(profiles));
      
      const result = getAllProfiles();
      
      expect(result).toEqual(profiles);
    });

    test('returns empty array if no profiles exist', () => {
      // Mock getFromLocalStorage to return null
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(null);
      
      const result = getAllProfiles();
      
      expect(result).toEqual([]);
    });
  });

  describe('getProfileById', () => {
    test('retrieves a profile by ID', () => {
      const profiles = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      
      // Mock getFromLocalStorage to return array of profiles
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(profiles));
      
      const result = getProfileById('2');
      
      expect(result).toEqual(profiles[1]);
    });

    test('returns null if profile does not exist', () => {
      const profiles = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      
      // Mock getFromLocalStorage to return array of profiles
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(profiles));
      
      const result = getProfileById('3');
      
      expect(result).toBeNull();
    });
  });

  describe('deleteProfile', () => {
    test('deletes a profile by ID', () => {
      const profiles = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      
      // Mock getFromLocalStorage to return array of profiles
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(profiles));
      
      const result = deleteProfile('2');
      
      expect(result).toBe(true);
      
      // Check that setItem was called with the profile removed
      const savedData = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedData.length).toBe(1);
      expect(savedData[0].id).toBe('1');
    });

    test('returns false if profile does not exist', () => {
      const profiles = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' }
      ];
      
      // Mock getFromLocalStorage to return array of profiles
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(profiles));
      
      const result = deleteProfile('3');
      
      expect(result).toBe(false);
    });
  });

  describe('saveLastBirthData and getLastBirthData', () => {
    test('saves and retrieves last birth data', () => {
      const birthData = {
        name: 'Test User',
        birthDate: '2000-01-01',
        birthTime: '12:00',
        birthPlace: 'New York, NY'
      };
      
      // Save birth data
      saveLastBirthData(birthData);
      
      // Mock getFromLocalStorage to return saved birth data
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(birthData));
      
      // Retrieve birth data
      const result = getLastBirthData();
      
      expect(result).toEqual(birthData);
    });
  });

  describe('saveSettings and getSettings', () => {
    test('saves and retrieves settings', () => {
      const settings = {
        theme: 'dark',
        language: 'en'
      };
      
      // Save settings
      saveSettings(settings);
      
      // Mock getFromLocalStorage to return saved settings
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(JSON.stringify(settings));
      
      // Retrieve settings
      const result = getSettings();
      
      expect(result).toEqual(settings);
    });

    test('returns default settings if none exist', () => {
      const defaultSettings = {
        theme: 'light',
        language: 'en'
      };
      
      // Mock getFromLocalStorage to return null
      jest.spyOn(window.localStorage, 'getItem').mockReturnValueOnce(null);
      
      // Retrieve settings with default
      const result = getSettings(defaultSettings);
      
      expect(result).toEqual(defaultSettings);
    });
  });
}); 