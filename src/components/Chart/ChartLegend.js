import React from 'react';

// Import the color constants to match the chart
const PLANET_COLORS = {
  Sun: '#FFD700',      // Gold
  Moon: '#F0F0F0',     // Silver/White
  Mercury: '#C0C0C0',  // Light Gray
  Venus: '#FFC0CB',    // Pink
  Mars: '#FF4500',     // Red Orange
  Jupiter: '#9370DB',  // Medium Purple
  Saturn: '#4682B4',   // Steel Blue
  Uranus: '#00CED1',   // Dark Turquoise
  Neptune: '#1E90FF',  // Dodger Blue
  Pluto: '#8B0000',    // Dark Red
  'North Node': '#32CD32', // Lime Green
  'South Node': '#8B4513', // Saddle Brown
  Chiron: '#9932CC',   // Dark Orchid
  Ascendant: '#FF1493', // Deep Pink
  Midheaven: '#4169E1'  // Royal Blue
};

const ChartLegend = ({ planets, onSelectPlanet }) => {
  // Skip if no planets
  if (!planets || !Array.isArray(planets) || planets.length === 0) {
    return null;
  }

  // Group planets by category
  const personalPlanets = planets.filter(p => 
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].includes(p.name)
  );
  
  const socialPlanets = planets.filter(p => 
    ['Jupiter', 'Saturn'].includes(p.name)
  );
  
  const transpersonalPlanets = planets.filter(p => 
    ['Uranus', 'Neptune', 'Pluto'].includes(p.name)
  );
  
  const otherPoints = planets.filter(p => 
    ['North Node', 'South Node', 'Chiron'].includes(p.name)
  );

  return (
    <div className="chart-legend">
      <h3 className="legend-title">Planet Positions</h3>
      
      <div className="legend-categories">
        <div className="legend-category">
          <h4>Personal Planets</h4>
          <ul className="legend-list">
            {personalPlanets.map((planet, index) => (
              <li 
                key={index} 
                className="legend-item"
                onClick={() => onSelectPlanet(planet)}
              >
                <div className="legend-symbol" style={{ backgroundColor: PLANET_COLORS[planet.name] }}>
                  {planet.symbol}
                </div>
                <div className="legend-info">
                  <span className="planet-name">{planet.name}</span>
                  <span className="planet-position">
                    {planet.zodiacSignName} {planet.degree.toFixed(1)}° 
                    {planet.isRetrograde && <span className="retrograde-indicator"> ℞</span>}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="legend-category">
          <h4>Social Planets</h4>
          <ul className="legend-list">
            {socialPlanets.map((planet, index) => (
              <li 
                key={index} 
                className="legend-item"
                onClick={() => onSelectPlanet(planet)}
              >
                <div className="legend-symbol" style={{ backgroundColor: PLANET_COLORS[planet.name] }}>
                  {planet.symbol}
                </div>
                <div className="legend-info">
                  <span className="planet-name">{planet.name}</span>
                  <span className="planet-position">
                    {planet.zodiacSignName} {planet.degree.toFixed(1)}° 
                    {planet.isRetrograde && <span className="retrograde-indicator"> ℞</span>}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="legend-category">
          <h4>Transpersonal Planets</h4>
          <ul className="legend-list">
            {transpersonalPlanets.map((planet, index) => (
              <li 
                key={index} 
                className="legend-item"
                onClick={() => onSelectPlanet(planet)}
              >
                <div className="legend-symbol" style={{ backgroundColor: PLANET_COLORS[planet.name] }}>
                  {planet.symbol}
                </div>
                <div className="legend-info">
                  <span className="planet-name">{planet.name}</span>
                  <span className="planet-position">
                    {planet.zodiacSignName} {planet.degree.toFixed(1)}° 
                    {planet.isRetrograde && <span className="retrograde-indicator"> ℞</span>}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {otherPoints.length > 0 && (
          <div className="legend-category">
            <h4>Other Points</h4>
            <ul className="legend-list">
              {otherPoints.map((planet, index) => (
                <li 
                  key={index} 
                  className="legend-item"
                  onClick={() => onSelectPlanet(planet)}
                >
                  <div className="legend-symbol" style={{ backgroundColor: PLANET_COLORS[planet.name] }}>
                    {planet.symbol}
                  </div>
                  <div className="legend-info">
                    <span className="planet-name">{planet.name}</span>
                    <span className="planet-position">
                      {planet.zodiacSignName} {planet.degree.toFixed(1)}° 
                      {planet.isRetrograde && <span className="retrograde-indicator"> ℞</span>}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="legend-help">
        <p>Click on any planet for detailed information</p>
      </div>
    </div>
  );
};

export default ChartLegend; 