import axios from 'axios';

// In a real application, you would use a real astronomy API
// For this example, we'll create a mock API that returns simulated data

// Mock data for zodiac signs
const zodiacSigns = [
  { id: 'aries', name: 'Aries', symbol: '♈', element: 'Fire', startDegree: 0 },
  { id: 'taurus', name: 'Taurus', symbol: '♉', element: 'Earth', startDegree: 30 },
  { id: 'gemini', name: 'Gemini', symbol: '♊', element: 'Air', startDegree: 60 },
  { id: 'cancer', name: 'Cancer', symbol: '♋', element: 'Water', startDegree: 90 },
  { id: 'leo', name: 'Leo', symbol: '♌', element: 'Fire', startDegree: 120 },
  { id: 'virgo', name: 'Virgo', symbol: '♍', element: 'Earth', startDegree: 150 },
  { id: 'libra', name: 'Libra', symbol: '♎', element: 'Air', startDegree: 180 },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', element: 'Water', startDegree: 210 },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', element: 'Fire', startDegree: 240 },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', element: 'Earth', startDegree: 270 },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', element: 'Air', startDegree: 300 },
  { id: 'pisces', name: 'Pisces', symbol: '♓', element: 'Water', startDegree: 330 }
];

// Mock data for planets
const planets = [
  { id: 'sun', name: 'Sun', symbol: '☉', color: '#FFD700' },
  { id: 'moon', name: 'Moon', symbol: '☽', color: '#C0C0C0' },
  { id: 'mercury', name: 'Mercury', symbol: '☿', color: '#B5A642' },
  { id: 'venus', name: 'Venus', symbol: '♀', color: '#FFC0CB' },
  { id: 'mars', name: 'Mars', symbol: '♂', color: '#FF0000' },
  { id: 'jupiter', name: 'Jupiter', symbol: '♃', color: '#FFA500' },
  { id: 'saturn', name: 'Saturn', symbol: '♄', color: '#808080' },
  { id: 'uranus', name: 'Uranus', symbol: '♅', color: '#40E0D0' },
  { id: 'neptune', name: 'Neptune', symbol: '♆', color: '#0000FF' },
  { id: 'pluto', name: 'Pluto', symbol: '♇', color: '#800080' }
];

// Mock data for houses
const houses = [
  { id: 1, name: 'House 1', meaning: 'Self, appearance, beginnings' },
  { id: 2, name: 'House 2', meaning: 'Possessions, values, resources' },
  { id: 3, name: 'House 3', meaning: 'Communication, siblings, local travel' },
  { id: 4, name: 'House 4', meaning: 'Home, family, roots' },
  { id: 5, name: 'House 5', meaning: 'Creativity, pleasure, children' },
  { id: 6, name: 'House 6', meaning: 'Health, service, daily routine' },
  { id: 7, name: 'House 7', meaning: 'Partnerships, marriage, open enemies' },
  { id: 8, name: 'House 8', meaning: 'Transformation, shared resources, death' },
  { id: 9, name: 'House 9', meaning: 'Higher education, philosophy, long-distance travel' },
  { id: 10, name: 'House 10', meaning: 'Career, public image, authority' },
  { id: 11, name: 'House 11', meaning: 'Friends, groups, hopes and wishes' },
  { id: 12, name: 'House 12', meaning: 'Unconscious, spirituality, hidden enemies' }
];

// Mock data for aspects
const aspects = [
  { id: 'conjunction', name: 'Conjunction', symbol: '☌', angle: 0, orb: 8 },
  { id: 'opposition', name: 'Opposition', symbol: '☍', angle: 180, orb: 8 },
  { id: 'trine', name: 'Trine', symbol: '△', angle: 120, orb: 8 },
  { id: 'square', name: 'Square', symbol: '□', angle: 90, orb: 7 },
  { id: 'sextile', name: 'Sextile', symbol: '⚹', angle: 60, orb: 6 }
];

// Helper function to get a deterministic but seemingly random number
const getPseudoRandomDegree = (seed, min = 0, max = 360) => {
  // Simple hash function for the seed
  let hash = 0;
  for (let i = 0; i < seed.toString().length; i++) {
    hash = ((hash << 5) - hash) + seed.toString().charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Normalize to range
  return (Math.abs(hash) % (max - min)) + min;
};

// Helper function to determine which zodiac sign a degree falls into
const getZodiacSignForDegree = (degree) => {
  const normalizedDegree = degree % 360;
  return zodiacSigns.find(sign => 
    normalizedDegree >= sign.startDegree && 
    normalizedDegree < (sign.startDegree + 30)
  );
};

// Helper function to calculate aspects between planets
const calculateAspects = (planetPositions) => {
  const result = [];
  
  // Check each pair of planets
  for (let i = 0; i < planetPositions.length; i++) {
    for (let j = i + 1; j < planetPositions.length; j++) {
      const planet1 = planetPositions[i];
      const planet2 = planetPositions[j];
      
      // Calculate the angular difference
      let diff = Math.abs(planet1.longitude - planet2.longitude);
      if (diff > 180) diff = 360 - diff;
      
      // Check if this difference matches any aspect
      for (const aspect of aspects) {
        if (Math.abs(diff - aspect.angle) <= aspect.orb) {
          result.push({
            aspect: aspect.id,
            planet1: planet1.planet,
            planet2: planet2.planet,
            orb: Math.abs(diff - aspect.angle).toFixed(2),
            aspectData: aspect
          });
          break; // Only count the closest aspect
        }
      }
    }
  }
  
  return result;
};

/**
 * Fetch planetary positions for a given date, time, and location
 * @param {Date|string} date - Date of birth
 * @param {string} time - Time of birth (HH:MM format)
 * @param {number} latitude - Latitude of birth location
 * @param {number} longitude - Longitude of birth location
 * @returns {Promise<Object>} - Planetary positions and chart data
 */
export const fetchPlanetaryPositions = async (date, time, latitude, longitude) => {
  // In a real app, you would call an astronomy API here
  // For this example, we'll simulate the API call with a delay
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Convert date to a timestamp for our seed
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const timestamp = dateObj.getTime();
      
      // Generate planetary positions based on the input data
      const planetPositions = planets.map(planet => {
        // Use the planet name, date, and location as a seed for the "random" position
        const seed = `${planet.id}-${timestamp}-${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
        const longitude = getPseudoRandomDegree(seed);
        const zodiacSign = getZodiacSignForDegree(longitude);
        
        return {
          planet: planet.id,
          name: planet.name,
          symbol: planet.symbol,
          color: planet.color,
          longitude: longitude,
          latitude: getPseudoRandomDegree(seed + 'lat', -10, 10),
          zodiacSign: zodiacSign.id,
          zodiacSignName: zodiacSign.name,
          zodiacSymbol: zodiacSign.symbol,
          element: zodiacSign.element,
          degree: (longitude % 30).toFixed(2),
          isRetrograde: getPseudoRandomDegree(seed + 'retro', 0, 10) > 7 // 30% chance of retrograde
        };
      });
      
      // Calculate house cusps
      const houseCusps = houses.map((house, index) => {
        // Use the house number, date, and location as a seed
        const seed = `house-${house.id}-${timestamp}-${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
        // Houses should be evenly distributed but with some variation
        const baseDegree = (index * 30) % 360;
        const variation = getPseudoRandomDegree(seed, -10, 10);
        const longitude = (baseDegree + variation) % 360;
        const zodiacSign = getZodiacSignForDegree(longitude);
        
        return {
          house: house.id,
          name: house.name,
          meaning: house.meaning,
          longitude: longitude,
          zodiacSign: zodiacSign.id,
          zodiacSignName: zodiacSign.name,
          zodiacSymbol: zodiacSign.symbol,
          degree: (longitude % 30).toFixed(2)
        };
      });
      
      // Calculate aspects between planets
      const aspectData = calculateAspects(planetPositions);
      
      // Calculate ascendant (rising sign)
      const ascSeed = `asc-${timestamp}-${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
      const ascLongitude = getPseudoRandomDegree(ascSeed);
      const ascendant = {
        longitude: ascLongitude,
        zodiacSign: getZodiacSignForDegree(ascLongitude).id,
        zodiacSignName: getZodiacSignForDegree(ascLongitude).name,
        zodiacSymbol: getZodiacSignForDegree(ascLongitude).symbol,
        degree: (ascLongitude % 30).toFixed(2)
      };
      
      // Calculate midheaven (MC)
      const mcSeed = `mc-${timestamp}-${latitude.toFixed(2)}-${longitude.toFixed(2)}`;
      const mcLongitude = getPseudoRandomDegree(mcSeed);
      const midheaven = {
        longitude: mcLongitude,
        zodiacSign: getZodiacSignForDegree(mcLongitude).id,
        zodiacSignName: getZodiacSignForDegree(mcLongitude).name,
        zodiacSymbol: getZodiacSignForDegree(mcLongitude).symbol,
        degree: (mcLongitude % 30).toFixed(2)
      };
      
      resolve({
        planets: planetPositions,
        houses: houseCusps,
        aspects: aspectData,
        ascendant,
        midheaven,
        zodiacSigns,
        date: dateObj,
        time,
        latitude,
        longitude
      });
    }, 1000); // Simulate API delay
  });
};

/**
 * Geocode an address to get latitude and longitude
 * @param {string} address - Address to geocode
 * @returns {Promise<Object>} - Latitude and longitude
 */
export const geocodeAddress = async (address) => {
  try {
    // In a real app, you would use a geocoding API like Google Maps or Mapbox
    // For this example, we'll simulate the API call
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock coordinates based on the address
    // In a real app, this would come from the API response
    return {
      latitude: 40.7128, // New York coordinates as default
      longitude: -74.0060,
      formattedAddress: address || 'New York, NY, USA'
    };
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw new Error('Failed to geocode address. Please try again.');
  }
}; 