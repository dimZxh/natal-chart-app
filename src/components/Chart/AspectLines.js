import React from 'react';

// Aspect color and style definitions
const ASPECT_STYLES = {
  conjunction: { color: '#8E24AA', strokeWidth: 1.5, strokeDasharray: '' },
  opposition: { color: '#D32F2F', strokeWidth: 1.5, strokeDasharray: '' },
  trine: { color: '#43A047', strokeWidth: 1.5, strokeDasharray: '' },
  square: { color: '#F9A825', strokeWidth: 1.5, strokeDasharray: '' },
  sextile: { color: '#1E88E5', strokeWidth: 1.2, strokeDasharray: '5,3' },
  quincunx: { color: '#6D4C41', strokeWidth: 1, strokeDasharray: '1,3' },
  semisextile: { color: '#7CB342', strokeWidth: 1, strokeDasharray: '3,2' },
  semisquare: { color: '#FB8C00', strokeWidth: 1, strokeDasharray: '5,2,2,2' },
  sesquiquadrate: { color: '#EF6C00', strokeWidth: 1, strokeDasharray: '5,2,2,2' },
  quintile: { color: '#AB47BC', strokeWidth: 0.8, strokeDasharray: '1,5' },
  biquintile: { color: '#7B1FA2', strokeWidth: 0.8, strokeDasharray: '1,5' }
};

// Default style for aspects not defined above
const DEFAULT_ASPECT_STYLE = { color: '#9E9E9E', strokeWidth: 0.8, strokeDasharray: '1,1' };

const AspectLines = ({ 
  aspects, 
  planets, 
  centerX, 
  centerY, 
  radius,
  selectedPlanet = null
}) => {
  // Skip if no aspects
  if (!aspects || aspects.length === 0 || !planets || planets.length === 0) {
    return null;
  }
  
  // Calculate planet positions based on longitude
  const planetPositions = {};
  planets.forEach(planet => {
    const angle = (planet.position - 90) * (Math.PI / 180);
    planetPositions[planet.name] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
  
  // Filter aspects based on selected planet if any
  const filteredAspects = selectedPlanet 
    ? aspects.filter(aspect => 
        aspect.planet1 === selectedPlanet || 
        aspect.planet2 === selectedPlanet)
    : aspects;
  
  return (
    <g className="aspect-lines">
      {filteredAspects.map((aspect, index) => {
        // Get planet positions
        const planet1Pos = planetPositions[aspect.planet1];
        const planet2Pos = planetPositions[aspect.planet2];
        
        // Skip if any planet is missing
        if (!planet1Pos || !planet2Pos) return null;
        
        // Get aspect style
        const style = ASPECT_STYLES[aspect.type] || DEFAULT_ASPECT_STYLE;
        
        // Calculate opacity based on orb
        // The closer to exact, the more opaque
        const maxOrb = 10; // Maximum orb in degrees
        const orb = Math.min(Math.abs(aspect.orb), maxOrb);
        const opacity = 1 - (orb / maxOrb) * 0.7; // Map to 0.3-1.0 range
        
        // Determine if this aspect involves the selected planet
        const isSelectedAspect = selectedPlanet && 
          (aspect.planet1 === selectedPlanet || aspect.planet2 === selectedPlanet);
        
        // Apply higher opacity if selected
        const finalOpacity = isSelectedAspect ? Math.max(0.8, opacity) : opacity;
        
        return (
          <line
            key={`aspect-${index}`}
            x1={planet1Pos.x}
            y1={planet1Pos.y}
            x2={planet2Pos.x}
            y2={planet2Pos.y}
            stroke={style.color}
            strokeWidth={style.strokeWidth}
            strokeDasharray={style.strokeDasharray}
            opacity={finalOpacity}
            className={`aspect-line ${aspect.type} ${isSelectedAspect ? 'selected' : ''}`}
          />
        );
      })}
    </g>
  );
};

export default AspectLines; 