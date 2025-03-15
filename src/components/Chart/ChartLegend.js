import React, { useState } from 'react';

// Import the color constants to match the chart
const PLANET_COLORS = {
  Sun: '#F9A825',
  Moon: '#E0E0E0',
  Mercury: '#64B5F6',
  Venus: '#EC407A',
  Mars: '#EF5350',
  Jupiter: '#8D6E63',
  Saturn: '#607D8B',
  Uranus: '#26A69A',
  Neptune: '#5C6BC0',
  Pluto: '#7E57C2',
  'North Node': '#66BB6A',
  'South Node': '#FF7043',
  Chiron: '#9575CD',
  Ascendant: '#FB8C00',
  Midheaven: '#29B6F6',
};

// Aspect type descriptions
const ASPECT_DESCRIPTIONS = {
  conjunction: 'Planets are within 0-8° of each other, intensifying and blending their energies.',
  opposition: 'Planets are 180° apart, creating tension that requires balance and integration.',
  trine: 'Planets are 120° apart, creating harmonious flow and supportive energy.',
  square: 'Planets are 90° apart, creating dynamic tension and motivation for change.',
  sextile: 'Planets are 60° apart, offering opportunities and gentle support.',
  quincunx: 'Planets are 150° apart, creating subtle discomfort that requires adjustment.',
  semisextile: 'Planets are 30° apart, creating subtle tension and growth opportunities.',
  semisquare: 'Planets are 45° apart, creating minor irritation and growth challenges.',
  sesquiquadrate: 'Planets are 135° apart, creating internal tension that requires resolution.',
  quintile: 'Planets are 72° apart, associated with creativity and special talents.',
  biquintile: 'Planets are 144° apart, also associated with unique talents and creative capacity.'
};

const ChartLegend = ({ 
  planets = [], 
  houses = [],
  aspects = [],
  selectedPlanet = null,
  onPlanetSelect
}) => {
  const [activeTab, setActiveTab] = useState('planets');
  
  // Get aspects for the selected planet
  const getSelectedPlanetAspects = () => {
    if (!selectedPlanet || !aspects) return [];
    
    return aspects.filter(aspect => 
      aspect.planet1 === selectedPlanet || 
      aspect.planet2 === selectedPlanet
    ).map(aspect => {
      // Determine the other planet
      const otherPlanet = aspect.planet1 === selectedPlanet 
        ? aspect.planet2 
        : aspect.planet1;
      
      return {
        ...aspect,
        otherPlanet
      };
    });
  };
  
  // Get the house for a specific planet
  const getHouseForPlanet = (planetName) => {
    if (!planets || !houses) return null;
    
    const planet = planets.find(p => p.name === planetName);
    if (!planet) return null;
    
    // Find house by position
    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % houses.length];
      
      let currentPos = currentHouse.position;
      let nextPos = nextHouse.position;
      
      // Adjust for house spanning 0°
      if (nextPos < currentPos) {
        nextPos += 360;
      }
      
      let planetPos = planet.position;
      // Adjust planet position if the house spans 0°
      if (nextPos > 360 && planetPos < currentPos) {
        planetPos += 360;
      }
      
      if (planetPos >= currentPos && planetPos < nextPos) {
        return i + 1;
      }
    }
    
    return null;
  };
  
  const selectedPlanetAspects = getSelectedPlanetAspects();
  
  return (
    <div className="chart-legend">
      <div className="legend-tabs">
        <button 
          className={`tab-button ${activeTab === 'planets' ? 'active' : ''}`}
          onClick={() => setActiveTab('planets')}
        >
          Planets
        </button>
        <button 
          className={`tab-button ${activeTab === 'houses' ? 'active' : ''}`}
          onClick={() => setActiveTab('houses')}
        >
          Houses
        </button>
        {selectedPlanet && (
          <button 
            className={`tab-button ${activeTab === 'aspects' ? 'active' : ''}`}
            onClick={() => setActiveTab('aspects')}
          >
            Aspects
          </button>
        )}
      </div>
      
      <div className="legend-content">
        {activeTab === 'planets' && (
          <div className="planets-list">
            <h3 className="legend-title">Planet Positions</h3>
            {planets.map(planet => (
              <div 
                key={planet.name}
                className={`planet-item ${selectedPlanet === planet.name ? 'selected' : ''}`}
                onClick={() => onPlanetSelect(planet.name)}
              >
                <div className="planet-icon" style={{ backgroundColor: PLANET_COLORS[planet.name] || '#999' }}>
                  <span>{planet.symbol}</span>
                </div>
                <div className="planet-details">
                  <div className="planet-name">
                    {planet.name}
                    {planet.isRetrograde && <span className="retrograde">℞</span>}
                  </div>
                  <div className="planet-position">
                    {planet.sign} {planet.degree.toFixed(1)}° 
                    <span className="house-info">House {getHouseForPlanet(planet.name)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'houses' && (
          <div className="houses-list">
            <h3 className="legend-title">House Cusps</h3>
            {houses.map((house, index) => (
              <div key={`house-${index + 1}`} className="house-item">
                <div className={`house-number ${[1, 4, 7, 10].includes(index + 1) ? 'angular' : ''}`}>
                  {index + 1}
                </div>
                <div className="house-details">
                  <div className="house-position">
                    {house.sign} {house.position.toFixed(1)}°
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'aspects' && selectedPlanet && (
          <div className="aspects-list">
            <h3 className="legend-title">
              Aspects for {selectedPlanet}
            </h3>
            {selectedPlanetAspects.length > 0 ? (
              <>
                {selectedPlanetAspects.map((aspect, index) => (
                  <div 
                    key={`aspect-${index}`}
                    className="aspect-item"
                    onClick={() => onPlanetSelect(aspect.otherPlanet)}
                  >
                    <div className="aspect-type" style={{ 
                      borderColor: PLANET_COLORS[aspect.otherPlanet] || '#999'
                    }}>
                      <span>{aspect.symbol}</span>
                    </div>
                    <div className="aspect-details">
                      <div className="aspect-planets">
                        <span className="other-planet">{aspect.otherPlanet}</span>
                        <span className="aspect-name">{aspect.type}</span>
                      </div>
                      <div className="aspect-orb">
                        Orb: {Math.abs(aspect.orb).toFixed(1)}°
                        <div className="aspect-description">
                          {ASPECT_DESCRIPTIONS[aspect.type] || 'Relationship between planetary energies.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="no-aspects">No aspects found for {selectedPlanet}</p>
            )}
          </div>
        )}
      </div>
      
      <style jsx>{`
        .chart-legend {
          width: 100%;
          max-width: 700px;
          margin: 2rem auto 0;
          border-radius: var(--border-radius-md);
          background-color: var(--color-background-card);
          box-shadow: var(--shadow-md);
          overflow: hidden;
        }
        
        .legend-tabs {
          display: flex;
          border-bottom: 1px solid var(--color-border);
        }
        
        .tab-button {
          flex: 1;
          padding: 0.75rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: var(--color-text);
          transition: all 0.2s ease;
          position: relative;
        }
        
        .tab-button.active {
          color: var(--color-primary);
          font-weight: 600;
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 100%;
          height: 2px;
          background-color: var(--color-primary);
        }
        
        .tab-button:hover:not(.active) {
          background-color: var(--color-background-hover);
        }
        
        .legend-content {
          padding: 1rem;
          max-height: 400px;
          overflow-y: auto;
        }
        
        .legend-title {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          color: var(--color-heading);
          text-align: center;
        }
        
        /* Planet items */
        .planet-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .planet-item:hover, .planet-item.selected {
          background-color: var(--color-background-hover);
        }
        
        .planet-icon {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          color: white;
          font-weight: bold;
        }
        
        .planet-details {
          flex: 1;
        }
        
        .planet-name {
          font-weight: 600;
          display: flex;
          align-items: center;
        }
        
        .retrograde {
          margin-left: 0.5rem;
          color: var(--color-retrograde);
          font-size: 0.9rem;
        }
        
        .planet-position {
          font-size: 0.9rem;
          color: var(--color-text-light);
          display: flex;
          justify-content: space-between;
        }
        
        .house-info {
          opacity: 0.8;
        }
        
        /* House items */
        .house-item {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .house-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          background-color: var(--color-background-alt);
          font-weight: 600;
        }
        
        .house-number.angular {
          background-color: var(--color-angular-house);
          color: white;
        }
        
        .house-details {
          flex: 1;
        }
        
        /* Aspect items */
        .aspect-item {
          display: flex;
          align-items: flex-start;
          padding: 0.5rem;
          margin-bottom: 0.75rem;
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .aspect-item:hover {
          background-color: var(--color-background-hover);
        }
        
        .aspect-type {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 0.75rem;
          background-color: var(--color-background-card);
          border: 2px solid;
        }
        
        .aspect-details {
          flex: 1;
        }
        
        .aspect-planets {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }
        
        .aspect-name {
          font-size: 0.9rem;
          color: var(--color-text-light);
        }
        
        .aspect-orb {
          font-size: 0.85rem;
          color: var(--color-text-light);
        }
        
        .aspect-description {
          margin-top: 0.25rem;
          font-size: 0.8rem;
          font-style: italic;
          color: var(--color-text-light);
        }
        
        .no-aspects {
          text-align: center;
          color: var(--color-text-light);
          font-style: italic;
          padding: 1rem 0;
        }
        
        @media (max-width: 768px) {
          .planet-position {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .aspect-planets {
            flex-direction: column;
          }
          
          .aspect-planets .aspect-name {
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ChartLegend; 