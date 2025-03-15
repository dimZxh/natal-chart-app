import { getZodiacSignIndex, getHouseNumber, getElementForSign, getModalityForSign } from './chartUtils';

/**
 * Creates a snapshot of chart data formatted for analysis or export to LLMs
 * @param {Object} chartData - The natal chart data
 * @param {Object} transitData - Optional transit chart data
 * @returns {Object} Formatted data snapshot
 */
export const createChartSnapshot = (chartData, transitData = null) => {
  if (!chartData) return null;

  const { birthData, planets, houses, aspects, ascendant, midheaven, zodiacSigns } = chartData;

  // Format basic birth information
  const basicInfo = {
    name: birthData?.name || 'Unknown',
    birthDate: birthData?.date ? new Date(birthData.date).toISOString().split('T')[0] : 'Unknown',
    birthTime: birthData?.time || 'Unknown',
    birthPlace: birthData?.place || 'Unknown',
    latitude: birthData?.latitude || 'Unknown',
    longitude: birthData?.longitude || 'Unknown',
  };

  // Format planetary positions
  const planetaryPositions = planets.map(planet => {
    const houseNumber = getHouseNumber(planet.longitude, houses);
    return {
      planet: planet.name,
      sign: planet.zodiacSignName,
      degree: planet.degree.toFixed(1),
      house: houseNumber,
      isRetrograde: planet.isRetrograde,
      element: getElementForSign(getZodiacSignIndex(planet.longitude)),
      modality: getModalityForSign(getZodiacSignIndex(planet.longitude))
    };
  });

  // Format house cusps
  const houseCusps = houses.map(house => {
    const signIndex = getZodiacSignIndex(house.longitude);
    return {
      house: house.house,
      sign: zodiacSigns[signIndex].name,
      degree: house.longitude % 30,
      longitude: house.longitude
    };
  });

  // Format aspects
  const formattedAspects = aspects.map(aspect => {
    const planet1 = planets.find(p => p.planet === aspect.planet1);
    const planet2 = planets.find(p => p.planet === aspect.planet2);
    return {
      aspect: aspect.aspect,
      planet1: planet1?.name || aspect.planet1,
      planet2: planet2?.name || aspect.planet2,
      orb: aspect.orb
    };
  });

  // Format special points
  const specialPoints = {
    ascendant: {
      longitude: ascendant.longitude,
      sign: zodiacSigns[getZodiacSignIndex(ascendant.longitude)].name,
      degree: ascendant.longitude % 30
    },
    midheaven: {
      longitude: midheaven.longitude,
      sign: zodiacSigns[getZodiacSignIndex(midheaven.longitude)].name,
      degree: midheaven.longitude % 30
    }
  };

  // Format transit data if available
  let transitSnapshot = null;
  if (transitData) {
    const { planets: transitPlanets, aspects: transitAspects } = transitData;
    
    // Format transit planetary positions
    const transitPositions = transitPlanets.map(planet => {
      const houseNumber = getHouseNumber(planet.longitude, houses);
      return {
        planet: planet.name,
        sign: planet.zodiacSignName,
        degree: planet.degree.toFixed(1),
        house: houseNumber,
        isRetrograde: planet.isRetrograde,
        element: getElementForSign(getZodiacSignIndex(planet.longitude)),
        modality: getModalityForSign(getZodiacSignIndex(planet.longitude))
      };
    });

    // Format transit aspects
    const formattedTransitAspects = transitAspects
      .filter(aspect => aspect.isTransitToNatal)
      .map(aspect => {
        const transitPlanet = transitPlanets.find(p => p.planet === aspect.planet1);
        const natalPlanet = planets.find(p => p.planet === aspect.planet2);
        return {
          aspect: aspect.aspect,
          transitPlanet: transitPlanet?.name || aspect.planet1,
          natalPlanet: natalPlanet?.name || aspect.planet2,
          orb: aspect.orb
        };
      });

    transitSnapshot = {
      date: transitData.date ? new Date(transitData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      time: transitData.time || new Date().toTimeString().split(' ')[0],
      planets: transitPositions,
      aspects: formattedTransitAspects
    };
  }

  // Compile the complete snapshot
  return {
    basicInfo,
    planets: planetaryPositions,
    houses: houseCusps,
    aspects: formattedAspects,
    specialPoints,
    transits: transitSnapshot,
    timestamp: new Date().toISOString()
  };
};

/**
 * Generates a text analysis of a chart based on its data
 * @param {Object} chartData - The natal chart data
 * @param {Object} transitData - Optional transit chart data
 * @returns {Object} Analysis with different sections
 */
export const generateChartAnalysis = (chartData, transitData = null) => {
  if (!chartData) return { error: 'No chart data provided' };

  const snapshot = createChartSnapshot(chartData, transitData);
  const analysis = {
    summary: generateSummary(snapshot),
    planets: generatePlanetaryAnalysis(snapshot),
    houses: generateHouseAnalysis(snapshot),
    aspects: generateAspectAnalysis(snapshot),
    elements: generateElementAnalysis(snapshot),
    transits: transitData ? generateTransitAnalysis(snapshot) : null
  };

  return analysis;
};

/**
 * Generates a summary of the chart
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} Summary text
 */
const generateSummary = (snapshot) => {
  const { basicInfo, planets, specialPoints } = snapshot;
  
  // Count elements and modalities
  const elementCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCount = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  
  planets.forEach(planet => {
    elementCount[planet.element]++;
    modalityCount[planet.modality]++;
  });
  
  // Find dominant element and modality
  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  const dominantModality = Object.entries(modalityCount)
    .sort((a, b) => b[1] - a[1])[0][0];

  return `Natal Chart Analysis for ${basicInfo.name}, born on ${basicInfo.birthDate} at ${basicInfo.birthTime} in ${basicInfo.birthPlace}.

This chart has Ascendant in ${specialPoints.ascendant.sign} and Midheaven in ${specialPoints.midheaven.sign}. 
The Sun is in ${planets.find(p => p.planet === 'Sun')?.sign || 'Unknown'}, 
the Moon is in ${planets.find(p => p.planet === 'Moon')?.sign || 'Unknown'}, 
and Mercury is in ${planets.find(p => p.planet === 'Mercury')?.sign || 'Unknown'}.

The dominant element is ${dominantElement} and the dominant modality is ${dominantModality}, 
suggesting a personality that tends to be ${getElementDescription(dominantElement)} 
and ${getModalityDescription(dominantModality)}.`;
};

/**
 * Generates analysis of planetary positions
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} Planetary analysis text
 */
const generatePlanetaryAnalysis = (snapshot) => {
  const { planets } = snapshot;
  
  let analysis = 'Planetary Positions Analysis:\n\n';
  
  planets.forEach(planet => {
    analysis += `${planet.planet} in ${planet.sign} (${planet.degree}°) in House ${planet.house}${planet.isRetrograde ? ' Retrograde' : ''}: 
${getPlanetInSignDescription(planet.planet, planet.sign, planet.isRetrograde)}
${getPlanetInHouseDescription(planet.planet, planet.house)}\n\n`;
  });
  
  return analysis;
};

/**
 * Generates analysis of house placements
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} House analysis text
 */
const generateHouseAnalysis = (snapshot) => {
  const { houses, planets } = snapshot;
  
  let analysis = 'House Placements Analysis:\n\n';
  
  houses.forEach(house => {
    const planetsInHouse = planets.filter(p => p.house === house.house);
    
    analysis += `House ${house.house} (${getHouseDescription(house.house)}) in ${house.sign}:\n`;
    
    if (planetsInHouse.length > 0) {
      analysis += `Planets in this house: ${planetsInHouse.map(p => p.planet).join(', ')}\n`;
    } else {
      analysis += 'No planets in this house.\n';
    }
    
    analysis += `${getHouseInSignDescription(house.house, house.sign)}\n\n`;
  });
  
  return analysis;
};

/**
 * Generates analysis of aspects
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} Aspect analysis text
 */
const generateAspectAnalysis = (snapshot) => {
  const { aspects } = snapshot;
  
  let analysis = 'Aspect Analysis:\n\n';
  
  if (aspects.length === 0) {
    return analysis + 'No significant aspects found in this chart.';
  }
  
  aspects.forEach(aspect => {
    analysis += `${aspect.planet1} ${formatAspectName(aspect.aspect)} ${aspect.planet2} (orb: ${aspect.orb}°):\n`;
    analysis += `${getAspectDescription(aspect.planet1, aspect.planet2, aspect.aspect)}\n\n`;
  });
  
  return analysis;
};

/**
 * Generates analysis of elemental balance
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} Element analysis text
 */
const generateElementAnalysis = (snapshot) => {
  const { planets } = snapshot;
  
  // Count elements and modalities
  const elementCount = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityCount = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  
  planets.forEach(planet => {
    elementCount[planet.element]++;
    modalityCount[planet.modality]++;
  });
  
  let analysis = 'Elemental and Modality Balance:\n\n';
  
  // Element analysis
  analysis += 'Elements:\n';
  Object.entries(elementCount).forEach(([element, count]) => {
    const percentage = Math.round((count / planets.length) * 100);
    analysis += `${element}: ${count} planets (${percentage}%)\n`;
  });
  
  analysis += '\nModalities:\n';
  Object.entries(modalityCount).forEach(([modality, count]) => {
    const percentage = Math.round((count / planets.length) * 100);
    analysis += `${modality}: ${count} planets (${percentage}%)\n`;
  });
  
  // Overall balance interpretation
  analysis += '\nOverall Balance Interpretation:\n';
  
  // Find missing or underrepresented elements
  const missingElements = Object.entries(elementCount)
    .filter(([_, count]) => count === 0)
    .map(([element]) => element);
  
  const underrepresentedElements = Object.entries(elementCount)
    .filter(([_, count]) => count === 1)
    .map(([element]) => element);
  
  if (missingElements.length > 0) {
    analysis += `Missing elements: ${missingElements.join(', ')}. ${getMissingElementDescription(missingElements)}\n`;
  }
  
  if (underrepresentedElements.length > 0) {
    analysis += `Underrepresented elements: ${underrepresentedElements.join(', ')}. This suggests ${getUnderrepresentedElementDescription(underrepresentedElements)}\n`;
  }
  
  // Find dominant element and modality
  const dominantElement = Object.entries(elementCount)
    .sort((a, b) => b[1] - a[1])[0];
  
  const dominantModality = Object.entries(modalityCount)
    .sort((a, b) => b[1] - a[1])[0];
  
  if (dominantElement[1] >= 3) {
    analysis += `Dominant element: ${dominantElement[0]} (${dominantElement[1]} planets). ${getDominantElementDescription(dominantElement[0])}\n`;
  }
  
  if (dominantModality[1] >= 3) {
    analysis += `Dominant modality: ${dominantModality[0]} (${dominantModality[1]} planets). ${getDominantModalityDescription(dominantModality[0])}\n`;
  }
  
  return analysis;
};

/**
 * Generates analysis of transits
 * @param {Object} snapshot - The chart snapshot
 * @returns {string} Transit analysis text
 */
const generateTransitAnalysis = (snapshot) => {
  const { transits } = snapshot;
  
  if (!transits) return 'No transit data available.';
  
  let analysis = `Transit Analysis for ${transits.date} at ${transits.time}:\n\n`;
  
  // Current positions
  analysis += 'Current Planetary Positions:\n';
  transits.planets.forEach(planet => {
    analysis += `${planet.planet} in ${planet.sign} (${planet.degree}°)${planet.isRetrograde ? ' Retrograde' : ''}\n`;
  });
  
  // Transit aspects to natal chart
  if (transits.aspects && transits.aspects.length > 0) {
    analysis += '\nSignificant Transit Aspects to Natal Chart:\n';
    
    transits.aspects.forEach(aspect => {
      analysis += `${aspect.transitPlanet} ${formatAspectName(aspect.aspect)} natal ${aspect.natalPlanet} (orb: ${aspect.orb}°):\n`;
      analysis += `${getTransitAspectDescription(aspect.transitPlanet, aspect.natalPlanet, aspect.aspect)}\n\n`;
    });
  } else {
    analysis += '\nNo significant transit aspects to natal chart at this time.\n';
  }
  
  return analysis;
};

/**
 * Formats an aspect name for display
 * @param {string} aspect - The aspect type
 * @returns {string} Formatted aspect name
 */
const formatAspectName = (aspect) => {
  const aspectNames = {
    conjunction: 'conjunct',
    opposition: 'opposite',
    trine: 'trine',
    square: 'square',
    sextile: 'sextile'
  };
  
  return aspectNames[aspect] || aspect;
};

/**
 * Gets a description for a planet in a sign
 * @param {string} planet - The planet name
 * @param {string} sign - The zodiac sign
 * @param {boolean} isRetrograde - Whether the planet is retrograde
 * @returns {string} Description text
 */
const getPlanetInSignDescription = (planet, sign, isRetrograde) => {
  // This would contain detailed interpretations for each planet in each sign
  // For now, returning a placeholder
  const retrogradeText = isRetrograde ? 
    ' The retrograde motion suggests a more internalized or reflective expression of this energy.' : '';
  
  return `${planet} in ${sign} indicates a specific way of expressing the energy of ${planet}.${retrogradeText} This placement influences how you ${getPlanetFunction(planet)} in the ${getSignCharacteristics(sign)} manner of ${sign}.`;
};

/**
 * Gets a description for a planet in a house
 * @param {string} planet - The planet name
 * @param {number} house - The house number
 * @returns {string} Description text
 */
const getPlanetInHouseDescription = (planet, house) => {
  // This would contain detailed interpretations for each planet in each house
  // For now, returning a placeholder
  return `With ${planet} in the ${getHouseOrdinal(house)} House, the energy of ${planet} is expressed in the area of life related to ${getHouseDescription(house)}.`;
};

/**
 * Gets a description for a house in a sign
 * @param {number} house - The house number
 * @param {string} sign - The zodiac sign
 * @returns {string} Description text
 */
const getHouseInSignDescription = (house, sign) => {
  // This would contain detailed interpretations for each house in each sign
  // For now, returning a placeholder
  return `With the ${getHouseOrdinal(house)} House in ${sign}, you approach matters of ${getHouseDescription(house)} with the ${getSignCharacteristics(sign)} energy of ${sign}.`;
};

/**
 * Gets a description for an aspect between two planets
 * @param {string} planet1 - The first planet
 * @param {string} planet2 - The second planet
 * @param {string} aspect - The aspect type
 * @returns {string} Description text
 */
const getAspectDescription = (planet1, planet2, aspect) => {
  // This would contain detailed interpretations for aspects between planets
  // For now, returning a placeholder
  return `The ${aspect} between ${planet1} and ${planet2} suggests a ${getAspectQuality(aspect)} interaction between how you ${getPlanetFunction(planet1)} and how you ${getPlanetFunction(planet2)}.`;
};

/**
 * Gets a description for a transit aspect
 * @param {string} transitPlanet - The transiting planet
 * @param {string} natalPlanet - The natal planet
 * @param {string} aspect - The aspect type
 * @returns {string} Description text
 */
const getTransitAspectDescription = (transitPlanet, natalPlanet, aspect) => {
  // This would contain detailed interpretations for transit aspects
  // For now, returning a placeholder
  return `Transiting ${transitPlanet} ${formatAspectName(aspect)} your natal ${natalPlanet} suggests a period where your ${getPlanetFunction(natalPlanet)} is being ${getAspectInfluence(aspect)} by ${getTransitPlanetInfluence(transitPlanet)}.`;
};

/**
 * Gets a description for an element
 * @param {string} element - The element name
 * @returns {string} Description text
 */
const getElementDescription = (element) => {
  const descriptions = {
    Fire: 'energetic, passionate, and action-oriented',
    Earth: 'practical, grounded, and stability-focused',
    Air: 'intellectual, communicative, and socially oriented',
    Water: 'emotional, intuitive, and empathetic'
  };
  
  return descriptions[element] || element;
};

/**
 * Gets a description for a modality
 * @param {string} modality - The modality name
 * @returns {string} Description text
 */
const getModalityDescription = (modality) => {
  const descriptions = {
    Cardinal: 'initiating and leadership-oriented',
    Fixed: 'persistent, determined, and resistant to change',
    Mutable: 'adaptable, flexible, and versatile'
  };
  
  return descriptions[modality] || modality;
};

/**
 * Gets a description for missing elements
 * @param {Array} elements - Array of missing element names
 * @returns {string} Description text
 */
const getMissingElementDescription = (elements) => {
  const descriptions = {
    Fire: 'You may find it challenging to take initiative or express passion and enthusiasm.',
    Earth: 'You might struggle with practical matters, stability, or grounding yourself.',
    Air: 'Communication and intellectual analysis may be areas for development.',
    Water: 'Emotional expression and intuitive understanding could be challenging areas.'
  };
  
  return elements.map(element => descriptions[element]).join(' ');
};

/**
 * Gets a description for underrepresented elements
 * @param {Array} elements - Array of underrepresented element names
 * @returns {string} Description text
 */
const getUnderrepresentedElementDescription = (elements) => {
  return 'a need to consciously develop and integrate these qualities for greater balance.';
};

/**
 * Gets a description for a dominant element
 * @param {string} element - The element name
 * @returns {string} Description text
 */
const getDominantElementDescription = (element) => {
  const descriptions = {
    Fire: 'You are likely energetic, enthusiastic, and action-oriented in your approach to life.',
    Earth: 'You tend to be practical, reliable, and focused on tangible results.',
    Air: 'Your approach to life is likely intellectual, communicative, and socially oriented.',
    Water: 'You are probably emotionally sensitive, intuitive, and empathetically attuned to others.'
  };
  
  return descriptions[element] || '';
};

/**
 * Gets a description for a dominant modality
 * @param {string} modality - The modality name
 * @returns {string} Description text
 */
const getDominantModalityDescription = (modality) => {
  const descriptions = {
    Cardinal: 'You tend to be a self-starter who initiates action and takes the lead.',
    Fixed: 'You are likely persistent, determined, and resistant to change once committed.',
    Mutable: 'You tend to be adaptable, flexible, and responsive to changing circumstances.'
  };
  
  return descriptions[modality] || '';
};

/**
 * Gets the function or meaning of a planet
 * @param {string} planet - The planet name
 * @returns {string} Function description
 */
const getPlanetFunction = (planet) => {
  const functions = {
    Sun: 'express your core identity and purpose',
    Moon: 'respond emotionally and seek security',
    Mercury: 'think, communicate, and process information',
    Venus: 'relate to others and experience pleasure',
    Mars: 'assert yourself and take action',
    Jupiter: 'grow, expand, and find meaning',
    Saturn: 'structure, limit, and take responsibility',
    Uranus: 'innovate, rebel, and seek freedom',
    Neptune: 'dream, imagine, and transcend boundaries',
    Pluto: 'transform, empower, and regenerate'
  };
  
  return functions[planet] || 'express yourself';
};

/**
 * Gets characteristics of a zodiac sign
 * @param {string} sign - The zodiac sign
 * @returns {string} Characteristics description
 */
const getSignCharacteristics = (sign) => {
  const characteristics = {
    Aries: 'assertive, pioneering, and direct',
    Taurus: 'steady, sensual, and resource-conscious',
    Gemini: 'curious, versatile, and communicative',
    Cancer: 'nurturing, protective, and emotionally sensitive',
    Leo: 'expressive, proud, and creative',
    Virgo: 'analytical, practical, and detail-oriented',
    Libra: 'harmonious, relationship-focused, and fair-minded',
    Scorpio: 'intense, transformative, and deeply perceptive',
    Sagittarius: 'expansive, truth-seeking, and optimistic',
    Capricorn: 'ambitious, disciplined, and achievement-oriented',
    Aquarius: 'innovative, humanitarian, and independent',
    Pisces: 'compassionate, intuitive, and spiritually attuned'
  };
  
  return characteristics[sign] || '';
};

/**
 * Gets a description of a house
 * @param {number} house - The house number
 * @returns {string} House description
 */
const getHouseDescription = (house) => {
  const descriptions = {
    1: 'self-identity and personal appearance',
    2: 'personal resources, values, and possessions',
    3: 'communication, learning, and immediate environment',
    4: 'home, family, and emotional foundations',
    5: 'creativity, self-expression, and pleasure',
    6: 'work, health, and daily routines',
    7: 'partnerships, relationships, and open enemies',
    8: 'shared resources, transformation, and intimacy',
    9: 'higher education, philosophy, and long-distance travel',
    10: 'career, public reputation, and authority',
    11: 'friendships, groups, and future aspirations',
    12: 'unconscious, spirituality, and hidden matters'
  };
  
  return descriptions[house] || '';
};

/**
 * Gets the ordinal form of a house number
 * @param {number} house - The house number
 * @returns {string} Ordinal form
 */
const getHouseOrdinal = (house) => {
  const ordinals = {
    1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth',
    5: 'Fifth', 6: 'Sixth', 7: 'Seventh', 8: 'Eighth',
    9: 'Ninth', 10: 'Tenth', 11: 'Eleventh', 12: 'Twelfth'
  };
  
  return ordinals[house] || house;
};

/**
 * Gets the quality of an aspect
 * @param {string} aspect - The aspect type
 * @returns {string} Quality description
 */
const getAspectQuality = (aspect) => {
  const qualities = {
    conjunction: 'blended and intensified',
    opposition: 'polarized and balanced',
    trine: 'harmonious and flowing',
    square: 'tense and challenging',
    sextile: 'supportive and opportunistic'
  };
  
  return qualities[aspect] || '';
};

/**
 * Gets the influence of an aspect
 * @param {string} aspect - The aspect type
 * @returns {string} Influence description
 */
const getAspectInfluence = (aspect) => {
  const influences = {
    conjunction: 'intensified by',
    opposition: 'challenged or balanced by',
    trine: 'supported and enhanced by',
    square: 'challenged or stressed by',
    sextile: 'given opportunity through'
  };
  
  return influences[aspect] || 'influenced by';
};

/**
 * Gets the influence of a transit planet
 * @param {string} planet - The planet name
 * @returns {string} Influence description
 */
const getTransitPlanetInfluence = (planet) => {
  const influences = {
    Sun: 'conscious awareness and vitality',
    Moon: 'emotional fluctuations and needs',
    Mercury: 'communication and thought patterns',
    Venus: 'relationship dynamics and values',
    Mars: 'energy, action, and assertiveness',
    Jupiter: 'growth, expansion, and opportunity',
    Saturn: 'structure, limitation, and responsibility',
    Uranus: 'sudden change, innovation, and freedom',
    Neptune: 'inspiration, confusion, or spiritual awareness',
    Pluto: 'deep transformation and empowerment'
  };
  
  return influences[planet] || 'planetary energies';
};

/**
 * Exports chart data to JSON format for sharing or LLM analysis
 * @param {Object} chartData - The natal chart data
 * @param {Object} transitData - Optional transit chart data
 * @returns {string} JSON string of chart data
 */
export const exportChartDataAsJson = (chartData, transitData = null) => {
  const snapshot = createChartSnapshot(chartData, transitData);
  return JSON.stringify(snapshot, null, 2);
};

/**
 * Exports chart analysis as text for sharing or LLM input
 * @param {Object} chartData - The natal chart data
 * @param {Object} transitData - Optional transit chart data
 * @returns {string} Formatted text analysis
 */
export const exportChartAnalysisAsText = (chartData, transitData = null) => {
  const analysis = generateChartAnalysis(chartData, transitData);
  
  let text = `# NATAL CHART ANALYSIS\n\n`;
  text += `## Summary\n${analysis.summary}\n\n`;
  text += `## Planetary Positions\n${analysis.planets}\n\n`;
  text += `## House Placements\n${analysis.houses}\n\n`;
  text += `## Aspects\n${analysis.aspects}\n\n`;
  text += `## Elemental Balance\n${analysis.elements}\n\n`;
  
  if (analysis.transits) {
    text += `## Transit Analysis\n${analysis.transits}\n\n`;
  }
  
  return text;
}; 