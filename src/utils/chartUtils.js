/**
 * Calculates the orb (difference in degrees) between two planetary positions
 * @param {number} pos1 - First position in degrees
 * @param {number} pos2 - Second position in degrees
 * @returns {number} The orb in degrees (0-180)
 */
export const calculateOrb = (pos1, pos2) => {
  // Normalize positions to 0-360 range
  const normalizedPos1 = ((pos1 % 360) + 360) % 360;
  const normalizedPos2 = ((pos2 % 360) + 360) % 360;
  
  // Calculate the absolute difference
  let diff = Math.abs(normalizedPos1 - normalizedPos2);
  
  // Take the shorter arc
  if (diff > 180) {
    diff = 360 - diff;
  }
  
  return diff;
};

/**
 * Determines if two planets form a specific aspect
 * @param {number} pos1 - First position in degrees
 * @param {number} pos2 - Second position in degrees
 * @param {number} aspectAngle - The ideal angle for the aspect
 * @param {number} orb - The maximum allowed orb
 * @returns {boolean} Whether the planets form the aspect
 */
export const isAspect = (pos1, pos2, aspectAngle, orb = 8) => {
  const diff = calculateOrb(pos1, pos2);
  return Math.abs(diff - aspectAngle) <= orb;
};

/**
 * Gets the zodiac sign for a given longitude
 * @param {number} longitude - The longitude in degrees
 * @returns {number} The zodiac sign index (0-11)
 */
export const getZodiacSignIndex = (longitude) => {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Each sign is 30 degrees
  return Math.floor(normalizedLongitude / 30);
};

/**
 * Gets the degree within a zodiac sign
 * @param {number} longitude - The longitude in degrees
 * @returns {number} The degree within the sign (0-29)
 */
export const getDegreeInSign = (longitude) => {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  // Get the degree within the sign
  return Math.floor(normalizedLongitude % 30);
};

/**
 * Calculates the house for a given longitude based on house cusps
 * @param {number} longitude - The longitude in degrees
 * @param {Array} houses - Array of house cusp objects with longitude property
 * @returns {number} The house number (1-12)
 */
export const getHouseNumber = (longitude, houses) => {
  // Normalize longitude to 0-360 range
  const normalizedLongitude = ((longitude % 360) + 360) % 360;
  
  for (let i = 0; i < houses.length; i++) {
    const currentHouse = houses[i];
    const nextHouse = houses[(i + 1) % houses.length];
    
    let start = currentHouse.longitude;
    let end = nextHouse.longitude;
    
    // Handle case where the house crosses 0°
    if (end < start) end += 360;
    
    // Normalize the longitude for comparison
    let normalizedLongitudeForComparison = normalizedLongitude;
    if (start > end) {
      if (normalizedLongitudeForComparison < start) normalizedLongitudeForComparison += 360;
    }
    
    if (normalizedLongitudeForComparison >= start && normalizedLongitudeForComparison < end) {
      return currentHouse.house;
    }
  }
  
  return 1; // Default to first house if not found
};

/**
 * Determines if a planet is retrograde based on its daily motion
 * @param {number} dailyMotion - The daily motion in degrees
 * @returns {boolean} Whether the planet is retrograde
 */
export const isRetrograde = (dailyMotion) => {
  return dailyMotion < 0;
};

/**
 * Calculates the midpoint between two positions
 * @param {number} pos1 - First position in degrees
 * @param {number} pos2 - Second position in degrees
 * @returns {number} The midpoint in degrees (0-360)
 */
export const calculateMidpoint = (pos1, pos2) => {
  // Normalize positions to 0-360 range
  const normalizedPos1 = ((pos1 % 360) + 360) % 360;
  const normalizedPos2 = ((pos2 % 360) + 360) % 360;
  
  // Calculate the midpoint
  let diff = normalizedPos2 - normalizedPos1;
  
  // Handle crossing 0°
  if (Math.abs(diff) > 180) {
    diff = diff > 0 ? diff - 360 : diff + 360;
  }
  
  let midpoint = normalizedPos1 + diff / 2;
  
  // Normalize the result
  return ((midpoint % 360) + 360) % 360;
};

/**
 * Gets the element (Fire, Earth, Air, Water) for a zodiac sign
 * @param {number} signIndex - The zodiac sign index (0-11)
 * @returns {string} The element name
 */
export const getElementForSign = (signIndex) => {
  const elements = ['Fire', 'Earth', 'Air', 'Water'];
  return elements[signIndex % 4];
};

/**
 * Gets the modality (Cardinal, Fixed, Mutable) for a zodiac sign
 * @param {number} signIndex - The zodiac sign index (0-11)
 * @returns {string} The modality name
 */
export const getModalityForSign = (signIndex) => {
  const modalities = ['Cardinal', 'Fixed', 'Mutable'];
  return modalities[signIndex % 3];
};

/**
 * Formats a longitude as a zodiac position string
 * @param {number} longitude - The longitude in degrees
 * @param {Array} zodiacSigns - Array of zodiac sign objects
 * @returns {string} Formatted position (e.g., "15° Aries")
 */
export const formatZodiacPosition = (longitude, zodiacSigns) => {
  const signIndex = getZodiacSignIndex(longitude);
  const degree = getDegreeInSign(longitude);
  
  return `${degree}° ${zodiacSigns[signIndex].name}`;
};

/**
 * Gets all aspects between a set of planets
 * @param {Array} planets - Array of planet objects with longitude property
 * @param {Array} aspectTypes - Array of aspect type objects with angle and orb properties
 * @returns {Array} Array of aspect objects
 */
export const getAllAspects = (planets, aspectTypes) => {
  const aspects = [];
  
  // Check each pair of planets
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const planet1 = planets[i];
      const planet2 = planets[j];
      
      // Check each aspect type
      for (const aspectType of aspectTypes) {
        const orb = calculateOrb(planet1.longitude, planet2.longitude);
        
        if (isAspect(planet1.longitude, planet2.longitude, aspectType.angle, aspectType.orb)) {
          aspects.push({
            planet1: planet1.planet,
            planet2: planet2.planet,
            aspect: aspectType.name.toLowerCase(),
            aspectData: aspectType,
            orb: Math.abs(orb - aspectType.angle).toFixed(1)
          });
        }
      }
    }
  }
  
  return aspects;
};

/**
 * Gets aspects between transit planets and natal planets
 * @param {Array} transitPlanets - Array of transit planet objects
 * @param {Array} natalPlanets - Array of natal planet objects
 * @param {Array} aspectTypes - Array of aspect type objects
 * @returns {Array} Array of aspect objects
 */
export const getTransitAspects = (transitPlanets, natalPlanets, aspectTypes) => {
  const aspects = [];
  
  // Check each transit planet against each natal planet
  for (const transitPlanet of transitPlanets) {
    for (const natalPlanet of natalPlanets) {
      // Check each aspect type
      for (const aspectType of aspectTypes) {
        const orb = calculateOrb(transitPlanet.longitude, natalPlanet.longitude);
        
        if (isAspect(transitPlanet.longitude, natalPlanet.longitude, aspectType.angle, aspectType.orb)) {
          aspects.push({
            planet1: transitPlanet.planet,
            planet2: natalPlanet.planet,
            aspect: aspectType.name.toLowerCase(),
            aspectData: aspectType,
            orb: Math.abs(orb - aspectType.angle).toFixed(1),
            isTransitToNatal: true
          });
        }
      }
    }
  }
  
  // Also get aspects between transit planets
  const transitAspects = getAllAspects(transitPlanets, aspectTypes);
  transitAspects.forEach(aspect => {
    aspect.isTransitToNatal = false;
  });
  
  return [...aspects, ...transitAspects];
}; 