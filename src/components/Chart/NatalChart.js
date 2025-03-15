import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import ChartLegend from './ChartLegend';

// Planetary colors and symbols based on harmonic design principles
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

// Zodiac sign colors using harmonic color wheel
const ZODIAC_COLORS = {
  Aries: '#FF4500',       // Fiery Red
  Taurus: '#228B22',      // Forest Green
  Gemini: '#FFA500',      // Orange
  Cancer: '#87CEEB',      // Sky Blue
  Leo: '#FFD700',         // Gold
  Virgo: '#8B4513',       // Brown
  Libra: '#20B2AA',       // Light Sea Green
  Scorpio: '#8B008B',     // Dark Magenta
  Sagittarius: '#FF6347', // Tomato
  Capricorn: '#2F4F4F',   // Dark Slate Gray
  Aquarius: '#00BFFF',    // Deep Sky Blue
  Pisces: '#9370DB'       // Medium Purple
};

// Aspect colors with harmonic principles
const ASPECT_COLORS = {
  conjunction: '#666666',  // Gray
  opposition: '#FF0000',   // Red
  trine: '#00CC00',        // Green
  square: '#FF6600',       // Orange
  sextile: '#3399FF',      // Blue
  quincunx: '#CC33FF',     // Purple
  semisextile: '#99CC00',  // Yellow-Green
  quintile: '#CC9900',     // Gold
  biquintile: '#FF9900',   // Orange
  septile: '#9933CC',      // Violet
  semisquare: '#FF9966',   // Peach
  sesquisquare: '#FF6633'  // Coral
};

const NatalChart = ({ data }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [error, setError] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [chartMode, setChartMode] = useState('standard'); // 'standard', 'harmonic', 'house-focused'
  const [harmonicNumber, setHarmonicNumber] = useState(2);

  useEffect(() => {
    // Error handling for missing data
    if (!data) {
      setError('No chart data available');
      return;
    }

    if (!svgRef.current) return;

    try {
      // Clear any existing chart
      d3.select(svgRef.current).selectAll('*').remove();

      // Set up dimensions
      const width = 600;
      const height = 600;
      const margin = 50;
      const radius = Math.min(width, height) / 2 - margin;

      // Create SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      // Create tooltip
      const tooltip = d3.select(tooltipRef.current)
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '8px')
        .style('padding', '12px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('box-shadow', '0 4px 8px rgba(0, 0, 0, 0.1)')
        .style('z-index', '1000');

      // Draw zodiac wheel with improved design
      if (data.zodiacSigns && Array.isArray(data.zodiacSigns)) {
        drawZodiacWheel(svg, radius, data.zodiacSigns);
      }

      // Draw house cusps with harmonic design
      if (data.houses && Array.isArray(data.houses)) {
        drawHouseCusps(svg, radius, data.houses);
      }

      // Draw planets with harmonic design
      if (data.planets && Array.isArray(data.planets)) {
        // Apply harmonic transformation if in harmonic mode
        let displayPlanets = [...data.planets];
        if (chartMode === 'harmonic' && harmonicNumber > 1) {
          displayPlanets = displayPlanets.map(planet => ({
            ...planet,
            longitude: (planet.longitude * harmonicNumber) % 360
          }));
        }
        
        drawPlanets(svg, radius, displayPlanets, tooltip);
      }

      // Draw aspects with harmonic design
      if (data.aspects && Array.isArray(data.aspects) && data.planets && Array.isArray(data.planets)) {
        let displayAspects = [...data.aspects];
        let displayPlanets = [...data.planets];
        
        // Apply harmonic transformation if in harmonic mode
        if (chartMode === 'harmonic' && harmonicNumber > 1) {
          displayPlanets = displayPlanets.map(planet => ({
            ...planet,
            longitude: (planet.longitude * harmonicNumber) % 360
          }));
          
          // Recalculate aspects for harmonic chart
          // This is a simplified approach - in a real app, you'd likely
          // want to recalculate aspects based on the transformed positions
        }
        
        drawAspects(svg, radius, displayAspects, displayPlanets);
      }

      // Draw ascendant and midheaven if they exist
      if (data.ascendant && data.midheaven) {
        drawSpecialPoints(svg, radius, data.ascendant, data.midheaven);
      }

      // Add chart title if birthData exists
      if (data.birthData && data.birthData.name) {
        svg.append('text')
          .attr('class', 'chart-title')
          .attr('x', 0)
          .attr('y', -radius - 25)
          .attr('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('font-weight', 'bold')
          .text(`Natal Chart for ${data.birthData.name}`);
      }

      // Add chart subtitle with date and location if they exist
      if (data.date && data.time && data.birthData && data.birthData.place) {
        svg.append('text')
          .attr('class', 'chart-subtitle')
          .attr('x', 0)
          .attr('y', -radius - 5)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .text(`${format(new Date(data.date), 'MMMM d, yyyy')} at ${data.time} - ${data.birthData.place}`);
      }

      // Add harmonic information if in harmonic mode
      if (chartMode === 'harmonic' && harmonicNumber > 1) {
        svg.append('text')
          .attr('class', 'harmonic-info')
          .attr('x', 0)
          .attr('y', radius + 25)
          .attr('text-anchor', 'middle')
          .style('font-size', '16px')
          .style('font-weight', 'bold')
          .text(`Harmonic ${harmonicNumber} Chart`);
      }

    } catch (err) {
      console.error('Error rendering chart:', err);
      setError(`Error rendering chart: ${err.message}`);
    }
  }, [data, chartMode, harmonicNumber]);

  // Function to draw the zodiac wheel with harmonic design
  const drawZodiacWheel = (svg, radius, zodiacSigns) => {
    // Create a group for the zodiac wheel
    const wheelGroup = svg.append('g').attr('class', 'zodiac-wheel');

    // Draw the outer circle
    wheelGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 2);

    // Draw the inner circle (for house boundary)
    wheelGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', radius * 0.8)
      .attr('fill', 'none')
      .attr('stroke', '#333')
      .attr('stroke-width', 1);

    // Calculate the angular width of each sign (30 degrees)
    const angleWidth = 30;

    // Draw each zodiac sign
    zodiacSigns.forEach((sign, index) => {
      // Convert degrees to radians
      const startAngle = (index * angleWidth - 90) * (Math.PI / 180);
      const endAngle = ((index + 1) * angleWidth - 90) * (Math.PI / 180);

      // Create an arc for the sign
      const arc = d3.arc()
        .innerRadius(radius * 0.8)
        .outerRadius(radius)
        .startAngle(startAngle)
        .endAngle(endAngle);

      // Draw the sign segment
      wheelGroup.append('path')
        .attr('d', arc)
        .attr('fill', ZODIAC_COLORS[sign.name] || '#f0f0f0')
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .attr('opacity', 0.7);

      // Add the sign symbol
      const symbolAngle = (index * angleWidth + 15 - 90) * (Math.PI / 180); // Middle of the sign
      const symbolX = (radius * 0.9) * Math.cos(symbolAngle);
      const symbolY = (radius * 0.9) * Math.sin(symbolAngle);

      wheelGroup.append('text')
        .attr('x', symbolX)
        .attr('y', symbolY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text(sign.symbol);

      // Add sign division lines
      const lineX1 = (radius * 0.8) * Math.cos(startAngle);
      const lineY1 = (radius * 0.8) * Math.sin(startAngle);
      const lineX2 = radius * Math.cos(startAngle);
      const lineY2 = radius * Math.sin(startAngle);

      wheelGroup.append('line')
        .attr('x1', lineX1)
        .attr('y1', lineY1)
        .attr('x2', lineX2)
        .attr('y2', lineY2)
        .attr('stroke', '#333')
        .attr('stroke-width', 1);
    });
  };

  // Function to draw house cusps with harmonic design
  const drawHouseCusps = (svg, radius, houses) => {
    // Create a group for the houses
    const housesGroup = svg.append('g').attr('class', 'houses');

    // Draw house boundary lines
    houses.forEach((house) => {
      const angle = (house.longitude - 90) * (Math.PI / 180);
      const x1 = 0;
      const y1 = 0;
      const x2 = (radius * 0.8) * Math.cos(angle);
      const y2 = (radius * 0.8) * Math.sin(angle);

      housesGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', '#333')
        .attr('stroke-width', house.house === 1 || house.house === 10 ? 2 : 1)
        .attr('stroke-dasharray', house.house === 1 || house.house === 10 ? 'none' : '3,3');

      // Add house number
      const labelAngle = (house.longitude + 15 - 90) * (Math.PI / 180); // 15 degrees after the house cusp
      const labelRadius = radius * 0.4; // Placing labels closer to the center
      const labelX = labelRadius * Math.cos(labelAngle);
      const labelY = labelRadius * Math.sin(labelAngle);

      housesGroup.append('text')
        .attr('x', labelX)
        .attr('y', labelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '14px')
        .style('fill', '#555')
        .text(house.house);
    });
  };

  // Function to draw planets with harmonic design
  const drawPlanets = (svg, radius, planets, tooltip) => {
    // Create a group for the planets
    const planetsGroup = svg.append('g').attr('class', 'planets');

    // Sort planets by longitude to handle overlap
    const sortedPlanets = [...planets].sort((a, b) => a.longitude - b.longitude);

    // Group planets that are close to each other
    const planetGroups = [];
    const proximityThreshold = 8; // in degrees

    for (let i = 0; i < sortedPlanets.length; i++) {
      const planet = sortedPlanets[i];
      let foundGroup = false;

      for (let j = 0; j < planetGroups.length; j++) {
        const group = planetGroups[j];
        const firstPlanetInGroup = group[0];

        // Check if this planet is close to the first planet in the group
        const longitudeDiff = Math.abs(planet.longitude - firstPlanetInGroup.longitude);
        const adjustedDiff = Math.min(longitudeDiff, 360 - longitudeDiff);

        if (adjustedDiff <= proximityThreshold) {
          group.push(planet);
          foundGroup = true;
          break;
        }
      }

      if (!foundGroup) {
        planetGroups.push([planet]);
      }
    }

    // Draw each planet group
    planetGroups.forEach(group => {
      const basePlanet = group[0];
      const baseAngle = (basePlanet.longitude - 90) * (Math.PI / 180);
      const baseRadius = radius * 0.7; // Planet base radius
      
      // Draw each planet in the group with slight offset
      group.forEach((planet, index) => {
        // Adjust radius for each planet in the group to prevent overlap
        const adjustedRadius = baseRadius - (index * 10);
        const x = adjustedRadius * Math.cos(baseAngle);
        const y = adjustedRadius * Math.sin(baseAngle);

        // Planet circle
        const planetCircle = planetsGroup.append('circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 12)
          .attr('fill', PLANET_COLORS[planet.name] || '#999')
          .attr('stroke', '#333')
          .attr('stroke-width', 1)
          .attr('cursor', 'pointer');

        // Planet symbol
        planetsGroup.append('text')
          .attr('x', x)
          .attr('y', y)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('fill', planet.name === 'Moon' || planet.name === 'Neptune' ? '#333' : 'white')
          .style('cursor', 'pointer')
          .text(planet.symbol);

        // Add line from center to planet
        planetsGroup.append('line')
          .attr('x1', 0)
          .attr('y1', 0)
          .attr('x2', x)
          .attr('y2', y)
          .attr('stroke', '#777')
          .attr('stroke-width', 0.5)
          .attr('stroke-dasharray', '2,2');

        // Add retrograde indicator
        if (planet.isRetrograde) {
          planetsGroup.append('text')
            .attr('x', x + 15)
            .attr('y', y - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#FF5555')
            .text('℞');
        }

        // Add tooltip interactions
        planetCircle
          .on('mouseover', (event) => {
            tooltip
              .style('opacity', 1)
              .style('left', (event.pageX + 10) + 'px')
              .style('top', (event.pageY - 10) + 'px')
              .html(`
                <div class="tooltip-content">
                  <h3>${planet.name}</h3>
                  <p>Sign: ${planet.zodiacSignName} ${planet.degree.toFixed(2)}°</p>
                  <p>House: ${getHouseForDegree(planet.longitude, data.houses)}</p>
                  ${planet.isRetrograde ? '<p>Retrograde</p>' : ''}
                </div>
              `);
          })
          .on('mouseout', () => {
            tooltip.style('opacity', 0);
          })
          .on('click', (event) => {
            event.stopPropagation();
            setSelectedElement(planet);
          });
      });
    });
  };

  // Function to draw aspects with harmonic design
  const drawAspects = (svg, radius, aspects, planets) => {
    // Create a group for the aspects
    const aspectsGroup = svg.append('g').attr('class', 'aspects');

    // Draw each aspect
    aspects.forEach(aspect => {
      // Find the planets involved in the aspect
      const planet1 = planets.find(p => p.name === aspect.planet1);
      const planet2 = planets.find(p => p.name === aspect.planet2);

      if (!planet1 || !planet2) return;

      // Convert longitudes to angles in radians
      const angle1 = (planet1.longitude - 90) * (Math.PI / 180);
      const angle2 = (planet2.longitude - 90) * (Math.PI / 180);

      // Calculate the points on the aspect circle
      const aspectRadius = radius * 0.3; // Smaller radius for aspects
      const x1 = aspectRadius * Math.cos(angle1);
      const y1 = aspectRadius * Math.sin(angle1);
      const x2 = aspectRadius * Math.cos(angle2);
      const y2 = aspectRadius * Math.sin(angle2);

      // Draw the aspect line
      aspectsGroup.append('line')
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .attr('stroke', ASPECT_COLORS[aspect.aspect] || '#999')
        .attr('stroke-width', 1.5)
        .attr('stroke-dasharray', getAspectLineStyle(aspect.aspect))
        .attr('opacity', 0.7);
    });
  };

  // Function to get the line style for different aspects
  const getAspectLineStyle = (aspectType) => {
    switch (aspectType) {
      case 'conjunction': return 'none'; // Solid
      case 'opposition': return 'none'; // Solid
      case 'trine': return 'none'; // Solid
      case 'square': return 'none'; // Solid
      case 'sextile': return '5,3'; // Dashed
      case 'quincunx': return '1,3'; // Dotted
      case 'semisextile': return '5,2,2,2'; // Dash-dot
      default: return '3,3';
    }
  };

  // Function to draw ascendant and midheaven
  const drawSpecialPoints = (svg, radius, ascendant, midheaven) => {
    // Create a group for special points
    const specialPointsGroup = svg.append('g').attr('class', 'special-points');

    // Draw ascendant line
    const ascAngle = (ascendant.longitude - 90) * (Math.PI / 180);
    specialPointsGroup.append('line')
      .attr('class', 'ascendant-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', radius * Math.cos(ascAngle))
      .attr('y2', radius * Math.sin(ascAngle))
      .attr('stroke', PLANET_COLORS['Ascendant'])
      .attr('stroke-width', 2);

    // Draw midheaven line
    const mcAngle = (midheaven.longitude - 90) * (Math.PI / 180);
    specialPointsGroup.append('line')
      .attr('class', 'midheaven-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', radius * Math.cos(mcAngle))
      .attr('y2', radius * Math.sin(mcAngle))
      .attr('stroke', PLANET_COLORS['Midheaven'])
      .attr('stroke-width', 2);

    // Add labels for ascendant and midheaven
    const labelRadius = radius + 20;

    // Ascendant label
    specialPointsGroup.append('text')
      .attr('class', 'ascendant-label')
      .attr('x', labelRadius * Math.cos(ascAngle))
      .attr('y', labelRadius * Math.sin(ascAngle))
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', PLANET_COLORS['Ascendant'])
      .text('ASC');

    // Midheaven label
    specialPointsGroup.append('text')
      .attr('class', 'midheaven-label')
      .attr('x', labelRadius * Math.cos(mcAngle))
      .attr('y', labelRadius * Math.sin(mcAngle))
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', PLANET_COLORS['Midheaven'])
      .text('MC');
  };

  // Helper function to determine which house a degree falls into
  const getHouseForDegree = (degree, houses) => {
    if (!houses || !Array.isArray(houses) || houses.length === 0) return '?';

    for (let i = 0; i < houses.length; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % houses.length];

      let start = currentHouse.longitude;
      let end = nextHouse.longitude;

      // Handle case where the house crosses 0°
      if (end < start) end += 360;

      // Normalize the degree
      let normalizedDegree = degree;
      if (start > end) {
        if (normalizedDegree < start) normalizedDegree += 360;
      }

      if (normalizedDegree >= start && normalizedDegree < end) {
        return currentHouse.house;
      }
    }

    return '?'; // Unknown house
  };

  // Handle click outside of a planet to clear selection
  const handleChartClick = () => {
    setSelectedElement(null);
  };

  // Handle chart mode change
  const handleModeChange = (mode) => {
    setChartMode(mode);
  };

  // Handle harmonic number change
  const handleHarmonicChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0 && value <= 12) {
      setHarmonicNumber(value);
    }
  };

  // If there's an error, display an error message
  if (error) {
    return (
      <div className="natal-chart-container error">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // If there's no data, display a loading message
  if (!data) {
    return (
      <div className="natal-chart-container loading">
        <div className="loading-message">
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="natal-chart-container">
      <div className="chart-options">
        <div className="view-modes">
          <button 
            className={`mode-btn ${chartMode === 'standard' ? 'active' : ''}`}
            onClick={() => handleModeChange('standard')}
          >
            Standard
          </button>
          <button 
            className={`mode-btn ${chartMode === 'harmonic' ? 'active' : ''}`}
            onClick={() => handleModeChange('harmonic')}
          >
            Harmonic
          </button>
          <button 
            className={`mode-btn ${chartMode === 'house-focused' ? 'active' : ''}`}
            onClick={() => handleModeChange('house-focused')}
          >
            House Focused
          </button>
        </div>
        
        {chartMode === 'harmonic' && (
          <div className="harmonic-controls">
            <label htmlFor="harmonic-number">Harmonic:</label>
            <input 
              type="number" 
              id="harmonic-number"
              min="2"
              max="12"
              value={harmonicNumber}
              onChange={handleHarmonicChange}
            />
          </div>
        )}
      </div>
      
      <div className="chart-svg-container" onClick={handleChartClick}>
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className="tooltip"></div>
      </div>

      {selectedElement && (
        <div className="chart-details">
          <h3>{selectedElement.name}</h3>
          <div className="detail-item">
            <span className="detail-label">Sign:</span> 
            <span className="detail-value">{selectedElement.zodiacSignName} {selectedElement.degree.toFixed(2)}°</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">House:</span> 
            <span className="detail-value">{getHouseForDegree(selectedElement.longitude, data.houses)}</span>
          </div>
          {selectedElement.isRetrograde && (
            <div className="detail-item retrograde">
              <span className="detail-label">Motion:</span> 
              <span className="detail-value">Retrograde</span>
            </div>
          )}
          {data.aspects && (
            <div className="planet-aspects">
              <h4>Aspects</h4>
              <ul className="aspect-list">
                {data.aspects
                  .filter(aspect => aspect.planet1 === selectedElement.name || aspect.planet2 === selectedElement.name)
                  .map((aspect, index) => {
                    const otherPlanet = aspect.planet1 === selectedElement.name ? aspect.planet2 : aspect.planet1;
                    return (
                      <li key={index} className="aspect-item">
                        <span className="aspect-planet">{otherPlanet}</span>
                        <span className="aspect-type" style={{ color: ASPECT_COLORS[aspect.aspect] }}>
                          {aspect.aspect}
                        </span>
                        <span className="aspect-orb">{aspect.orb.toFixed(1)}°</span>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}
        </div>
      )}

      <ChartLegend planets={data.planets} onSelectPlanet={(planet) => setSelectedElement(planet)} />
    </div>
  );
};

export default NatalChart; 