import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { fetchPlanetaryPositions } from '../api/astronomyApi';

// Initial state
const initialState = {
  birthData: null,
  chartData: null,
  transitData: null,
  savedProfiles: [],
  loading: false,
  error: null
};

// Create context
const ChartContext = createContext(initialState);

// Reducer function
const chartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_BIRTH_DATA':
      return {
        ...state,
        birthData: action.payload,
        loading: true,
        error: null
      };
    case 'SET_CHART_DATA':
      return {
        ...state,
        chartData: action.payload,
        loading: false
      };
    case 'SET_TRANSIT_DATA':
      return {
        ...state,
        transitData: action.payload
      };
    case 'SAVE_PROFILE':
      // Check if profile already exists
      const profileExists = state.savedProfiles.some(
        profile => profile.id === action.payload.id
      );
      
      return {
        ...state,
        savedProfiles: profileExists
          ? state.savedProfiles.map(profile =>
              profile.id === action.payload.id ? action.payload : profile
            )
          : [...state.savedProfiles, action.payload]
      };
    case 'DELETE_PROFILE':
      return {
        ...state,
        savedProfiles: state.savedProfiles.filter(
          profile => profile.id !== action.payload
        )
      };
    case 'LOAD_PROFILE':
      return {
        ...state,
        birthData: action.payload,
        loading: true,
        error: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'LOAD_SAVED_PROFILES':
      return {
        ...state,
        savedProfiles: action.payload
      };
    default:
      return state;
  }
};

// Provider component
export const ChartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chartReducer, initialState);
  const [chartSettings, setChartSettings] = useState({
    showAspects: true,
    showHouses: true,
    showDegrees: true,
    houseSystem: 'Placidus',
    zodiacType: 'Tropical'
  });

  // Load saved profiles from localStorage on initial render
  useEffect(() => {
    const savedProfiles = localStorage.getItem('savedProfiles');
    if (savedProfiles) {
      dispatch({
        type: 'LOAD_SAVED_PROFILES',
        payload: JSON.parse(savedProfiles)
      });
    }
  }, []);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('savedProfiles', JSON.stringify(state.savedProfiles));
  }, [state.savedProfiles]);

  // Fetch chart data whenever birthData changes
  useEffect(() => {
    if (state.birthData) {
      calculateChartData(state.birthData);
      fetchCurrentTransits();
    }
  }, [state.birthData]);

  // Calculate chart data based on birth data
  const calculateChartData = async (birthData) => {
    try {
      // In a real app, this would call an astronomy API or library
      // For now, we'll simulate with our fetchPlanetaryPositions function
      const positions = await fetchPlanetaryPositions(
        birthData.date,
        birthData.time,
        birthData.latitude,
        birthData.longitude
      );

      dispatch({
        type: 'SET_CHART_DATA',
        payload: {
          ...positions,
          birthData
        }
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: `Error calculating chart data: ${error.message}`
      });
    }
  };

  // Fetch current planetary positions for transits
  const fetchCurrentTransits = async () => {
    try {
      const now = new Date();
      // Get current location - in a real app, you might use geolocation
      // For now, we'll use a default location (New York)
      const currentPositions = await fetchPlanetaryPositions(
        now,
        now.toTimeString().split(' ')[0],
        40.7128, // New York latitude
        -74.0060 // New York longitude
      );

      dispatch({
        type: 'SET_TRANSIT_DATA',
        payload: currentPositions
      });
    } catch (error) {
      console.error('Error fetching transit data:', error);
      // We don't set an error state here as it's not critical
    }
  };

  // Set birth data and trigger chart calculation
  const setBirthData = (data) => {
    dispatch({
      type: 'SET_BIRTH_DATA',
      payload: {
        ...data,
        id: Date.now().toString() // Generate a unique ID
      }
    });
  };

  // Update chart settings
  const updateChartSettings = (newSettings) => {
    setChartSettings(newSettings);
  };

  // Save a profile
  const saveProfile = (profile) => {
    dispatch({
      type: 'SAVE_PROFILE',
      payload: profile
    });
  };

  // Delete a profile
  const deleteProfile = (profileId) => {
    dispatch({
      type: 'DELETE_PROFILE',
      payload: profileId
    });
  };

  // Load a saved profile
  const loadProfile = (profile) => {
    dispatch({
      type: 'LOAD_PROFILE',
      payload: profile
    });
  };

  return (
    <ChartContext.Provider
      value={{
        ...state,
        setBirthData,
        saveProfile,
        deleteProfile,
        loadProfile,
        chartSettings,
        updateChartSettings
      }}
    >
      {children}
    </ChartContext.Provider>
  );
};

// Custom hook to use the chart context
export const useChartContext = () => {
  const context = useContext(ChartContext);
  if (context === undefined) {
    throw new Error('useChartContext must be used within a ChartProvider');
  }
  return context;
}; 