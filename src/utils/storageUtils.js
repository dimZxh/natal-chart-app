/**
 * Saves data to local storage
 * @param {string} key - The key to store the data under
 * @param {any} data - The data to store
 * @returns {boolean} Whether the operation was successful
 */
export const saveToLocalStorage = (key, data) => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    return true;
  } catch (error) {
    console.error('Error saving to local storage:', error);
    return false;
  }
};

/**
 * Retrieves data from local storage
 * @param {string} key - The key to retrieve data from
 * @param {any} defaultValue - The default value to return if the key doesn't exist
 * @returns {any} The retrieved data or the default value
 */
export const getFromLocalStorage = (key, defaultValue = null) => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error retrieving from local storage:', error);
    return defaultValue;
  }
};

/**
 * Removes data from local storage
 * @param {string} key - The key to remove
 * @returns {boolean} Whether the operation was successful
 */
export const removeFromLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from local storage:', error);
    return false;
  }
};

/**
 * Clears all data from local storage
 * @returns {boolean} Whether the operation was successful
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing local storage:', error);
    return false;
  }
};

/**
 * Saves a profile to local storage
 * @param {Object} profile - The profile to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveProfile = (profile) => {
  try {
    // Get existing profiles
    const profiles = getFromLocalStorage('natal_chart_profiles', []);
    
    // Check if profile with same ID already exists
    const existingIndex = profiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      // Update existing profile
      profiles[existingIndex] = profile;
    } else {
      // Add new profile with unique ID
      const newProfile = {
        ...profile,
        id: profile.id || Date.now().toString(),
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      profiles.push(newProfile);
    }
    
    // Save updated profiles
    return saveToLocalStorage('natal_chart_profiles', profiles);
  } catch (error) {
    console.error('Error saving profile:', error);
    return false;
  }
};

/**
 * Retrieves all profiles from local storage
 * @returns {Array} Array of profiles
 */
export const getAllProfiles = () => {
  return getFromLocalStorage('natal_chart_profiles', []);
};

/**
 * Retrieves a specific profile by ID
 * @param {string} id - The profile ID
 * @returns {Object|null} The profile or null if not found
 */
export const getProfileById = (id) => {
  const profiles = getAllProfiles();
  return profiles.find(profile => profile.id === id) || null;
};

/**
 * Deletes a profile from local storage
 * @param {string} id - The profile ID to delete
 * @returns {boolean} Whether the operation was successful
 */
export const deleteProfile = (id) => {
  try {
    const profiles = getAllProfiles();
    const updatedProfiles = profiles.filter(profile => profile.id !== id);
    
    // If no profiles were removed, return false
    if (profiles.length === updatedProfiles.length) {
      return false;
    }
    
    return saveToLocalStorage('natal_chart_profiles', updatedProfiles);
  } catch (error) {
    console.error('Error deleting profile:', error);
    return false;
  }
};

/**
 * Saves the last used birth data to local storage
 * @param {Object} birthData - The birth data to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveLastBirthData = (birthData) => {
  return saveToLocalStorage('natal_chart_last_birth_data', birthData);
};

/**
 * Retrieves the last used birth data from local storage
 * @returns {Object|null} The last birth data or null
 */
export const getLastBirthData = () => {
  return getFromLocalStorage('natal_chart_last_birth_data', null);
};

/**
 * Saves the application settings to local storage
 * @param {Object} settings - The settings to save
 * @returns {boolean} Whether the operation was successful
 */
export const saveSettings = (settings) => {
  return saveToLocalStorage('natal_chart_settings', settings);
};

/**
 * Retrieves the application settings from local storage
 * @param {Object} defaultSettings - The default settings to use if none are found
 * @returns {Object} The settings
 */
export const getSettings = (defaultSettings = {}) => {
  return getFromLocalStorage('natal_chart_settings', defaultSettings);
}; 