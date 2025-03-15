import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import ChartLegend from '../Chart/ChartLegend';

const TransitChart = ({ natalData, transitData }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const [selectedElement, setSelectedElement] = useState(null);
  
  useEffect(() => {
    if (!natalData || !transitData || !svgRef.current) return;
    
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
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Create tooltip
    const tooltip = d3.select(tooltipRef.current)
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('font-size', '12px')
      .style('box-shadow', '0 2px 5px rgba(0, 0, 0, 0.1)');
    
    // Draw zodiac wheel
    drawZodiacWheel(svg, radius, natalData.zodiacSigns);
    
    // Draw house cusps (using natal chart houses)
    drawHouseCusps(svg, radius, natalData.houses);
    
    // Draw natal planets (inner circle)
    drawNatalPlanets(svg, radius, natalData.planets, tooltip);
    
    // Draw transit planets (outer circle)
    drawTransitPlanets(svg, radius, transitData.planets, tooltip);
    
    // Draw aspects between transit and natal planets
    drawTransitAspects(svg, radius, transitData.aspects, natalData.planets, transitData.planets);
    
    // Draw ascendant and midheaven (natal)
    drawSpecialPoints(svg, radius, natalData.ascendant, natalData.midheaven, false);
    
    // Draw ascendant and midheaven (transit)
    drawSpecialPoints(svg, radius, transitData.ascendant, transitData.midheaven, true);
    
    // Add chart title
    svg.append('text')
      .attr('class', 'chart-title')
      .attr('x', 0)
      .attr('y', -radius - 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text(`Transit Chart for ${natalData.birthData.name}`);
    
    // Add chart subtitle with date and location
    svg.append('text')
      .attr('class', 'chart-subtitle')
      .attr('x', 0)
      .attr('y', -radius - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .text(`Transit Date: ${format(new Date(transitData.date), 'MMMM d, yyyy')} at ${transitData.time}`);
    
  }, [natalData, transitData]);
  
  // Function to draw the zodiac wheel
  const drawZodiacWheel = (svg, radius, zodiacSigns) => {
    // Create a pie generator for the zodiac signs (each 30 degrees)
    const pie = d3.pie()
      .value(() => 30) // Each sign is 30 degrees
      .sort(null); // Don't sort, maintain the order
    
    // Create an arc generator for the zodiac segments
    const arc = d3.arc()
      .innerRadius(radius * 0.7) // Inner radius for the zodiac wheel
      .outerRadius(radius); // Outer radius
    
    // Create the zodiac segments
    const zodiacSegments = svg.append('g')
      .attr('class', 'zodiac-wheel')
      .selectAll('path')
      .data(pie(zodiacSigns))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => {
        // Alternate colors based on element
        const element = d.data.element;
        if (element === 'Fire') return '#FFEBCD'; // Light orange
        if (element === 'Earth') return '#E6F5D0'; // Light green
        if (element === 'Air') return '#E6F0FF'; // Light blue
        if (element === 'Water') return '#E6E6FA'; // Light purple
        return '#f0f0f0'; // Default
      })
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);
    
    // Add zodiac symbols
    const symbolRadius = radius * 0.85; // Position for the symbols
    
    svg.append('g')
      .attr('class', 'zodiac-symbols')
      .selectAll('text')
      .data(zodiacSigns)
      .enter()
      .append('text')
      .attr('x', (d, i) => symbolRadius * Math.sin(((i * 30) + 15) * (Math.PI / 180)))
      .attr('y', (d, i) => -symbolRadius * Math.cos(((i * 30) + 15) * (Math.PI / 180)))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', '18px')
      .text(d => d.symbol);
  };
  
  // Function to draw house cusps
  const drawHouseCusps = (svg, radius, houses) => {
    // Draw house cusp lines
    svg.append('g')
      .attr('class', 'house-cusps')
      .selectAll('line')
      .data(houses)
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', (d) => radius * Math.sin(d.longitude * (Math.PI / 180)))
      .attr('y2', (d) => -radius * Math.cos(d.longitude * (Math.PI / 180)))
      .attr('stroke', '#666')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3');
    
    // Add house numbers
    const houseNumberRadius = radius * 0.6; // Position for house numbers
    
    svg.append('g')
      .attr('class', 'house-numbers')
      .selectAll('text')
      .data(houses)
      .enter()
      .append('text')
      .attr('x', (d) => houseNumberRadius * Math.sin(d.longitude * (Math.PI / 180)))
      .attr('y', (d) => -houseNumberRadius * Math.cos(d.longitude * (Math.PI / 180)))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .style('font-size', '12px')
      .style('fill', '#666')
      .text(d => d.house);
  };
  
  // Function to draw natal planets (inner circle)
  const drawNatalPlanets = (svg, radius, planets, tooltip) => {
    // Calculate positions for planets
    const planetRadius = radius * 0.4; // Position natal planets in inner circle
    
    // Create a group for planets
    const planetGroup = svg.append('g')
      .attr('class', 'natal-planets');
    
    // Add planets
    planetGroup.selectAll('g')
      .data(planets)
      .enter()
      .append('g')
      .attr('class', 'natal-planet')
      .attr('transform', (d) => {
        const x = planetRadius * Math.sin(d.longitude * (Math.PI / 180));
        const y = -planetRadius * Math.cos(d.longitude * (Math.PI / 180));
        return `translate(${x}, ${y})`;
      })
      .each(function(d) {
        // Add a circle behind the symbol for better visibility
        d3.select(this)
          .append('circle')
          .attr('r', 10)
          .attr('fill', 'white')
          .attr('stroke', d.color)
          .attr('stroke-width', 1.5);
        
        // Add the planet symbol
        d3.select(this)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .style('font-size', '12px')
          .style('fill', d.color)
          .text(d.symbol);
        
        // Add retrograde symbol if applicable
        if (d.isRetrograde) {
          d3.select(this)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('y', 14) // Position below the planet
            .style('font-size', '8px')
            .style('fill', d.color)
            .text('℞'); // Retrograde symbol
        }
      })
      .on('mouseover', function(event, d) {
        // Show tooltip on hover
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d.name} (Natal)</strong><br/>
          ${d.zodiacSignName} ${d.degree}°<br/>
          ${d.isRetrograde ? 'Retrograde' : 'Direct'}<br/>
          House: ${getHouseForDegree(d.longitude, natalData.houses)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        
        // Highlight the planet
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 12)
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
        
        // Remove highlight
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 10)
          .attr('stroke-width', 1.5);
      })
      .on('click', function(event, d) {
        // Set selected element for detailed info
        setSelectedElement({...d, type: 'natal'});
        event.stopPropagation();
      });
  };
  
  // Function to draw transit planets (outer circle)
  const drawTransitPlanets = (svg, radius, planets, tooltip) => {
    // Calculate positions for planets
    const planetRadius = radius * 0.6; // Position transit planets in outer circle
    
    // Create a group for planets
    const planetGroup = svg.append('g')
      .attr('class', 'transit-planets');
    
    // Add planets
    planetGroup.selectAll('g')
      .data(planets)
      .enter()
      .append('g')
      .attr('class', 'transit-planet')
      .attr('transform', (d) => {
        const x = planetRadius * Math.sin(d.longitude * (Math.PI / 180));
        const y = -planetRadius * Math.cos(d.longitude * (Math.PI / 180));
        return `translate(${x}, ${y})`;
      })
      .each(function(d) {
        // Add a circle behind the symbol for better visibility
        d3.select(this)
          .append('circle')
          .attr('r', 10)
          .attr('fill', 'white')
          .attr('stroke', d.color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', '2,1'); // Dashed stroke for transit planets
        
        // Add the planet symbol
        d3.select(this)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .style('font-size', '12px')
          .style('fill', d.color)
          .text(d.symbol);
        
        // Add retrograde symbol if applicable
        if (d.isRetrograde) {
          d3.select(this)
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('y', 14) // Position below the planet
            .style('font-size', '8px')
            .style('fill', d.color)
            .text('℞'); // Retrograde symbol
        }
      })
      .on('mouseover', function(event, d) {
        // Show tooltip on hover
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        
        tooltip.html(`
          <strong>${d.name} (Transit)</strong><br/>
          ${d.zodiacSignName} ${d.degree}°<br/>
          ${d.isRetrograde ? 'Retrograde' : 'Direct'}<br/>
          House: ${getHouseForDegree(d.longitude, natalData.houses)}
        `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        
        // Highlight the planet
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 12)
          .attr('stroke-width', 2);
      })
      .on('mouseout', function() {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
        
        // Remove highlight
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 10)
          .attr('stroke-width', 1.5);
      })
      .on('click', function(event, d) {
        // Set selected element for detailed info
        setSelectedElement({...d, type: 'transit'});
        event.stopPropagation();
      });
  };
  
  // Function to draw aspects between transit and natal planets
  const drawTransitAspects = (svg, radius, aspects, natalPlanets, transitPlanets) => {
    // Create maps of planet IDs to their positions
    const natalPositions = {};
    natalPlanets.forEach(planet => {
      const angle = planet.longitude * (Math.PI / 180);
      const planetRadius = radius * 0.4; // Inner circle
      natalPositions[planet.planet] = {
        x: planetRadius * Math.sin(angle),
        y: -planetRadius * Math.cos(angle)
      };
    });
    
    const transitPositions = {};
    transitPlanets.forEach(planet => {
      const angle = planet.longitude * (Math.PI / 180);
      const planetRadius = radius * 0.6; // Outer circle
      transitPositions[planet.planet] = {
        x: planetRadius * Math.sin(angle),
        y: -planetRadius * Math.cos(angle)
      };
    });
    
    // Create a group for aspects
    const aspectGroup = svg.append('g')
      .attr('class', 'transit-aspects');
    
    // Draw aspect lines
    aspectGroup.selectAll('line')
      .data(aspects)
      .enter()
      .append('line')
      .attr('x1', d => {
        // Check if it's a transit-natal aspect or transit-transit aspect
        if (d.isTransitToNatal) {
          return transitPositions[d.planet1].x;
        } else {
          return transitPositions[d.planet1].x;
        }
      })
      .attr('y1', d => {
        if (d.isTransitToNatal) {
          return transitPositions[d.planet1].y;
        } else {
          return transitPositions[d.planet1].y;
        }
      })
      .attr('x2', d => {
        if (d.isTransitToNatal) {
          return natalPositions[d.planet2].x;
        } else {
          return transitPositions[d.planet2].x;
        }
      })
      .attr('y2', d => {
        if (d.isTransitToNatal) {
          return natalPositions[d.planet2].y;
        } else {
          return transitPositions[d.planet2].y;
        }
      })
      .attr('stroke', d => {
        // Color based on aspect type
        switch (d.aspect) {
          case 'conjunction': return '#666'; // Gray
          case 'opposition': return '#f00'; // Red
          case 'trine': return '#0a0'; // Green
          case 'square': return '#f60'; // Orange
          case 'sextile': return '#00f'; // Blue
          default: return '#999';
        }
      })
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => {
        // Different line styles for different aspects
        switch (d.aspect) {
          case 'conjunction': return ''; // Solid
          case 'opposition': return ''; // Solid
          case 'trine': return ''; // Solid
          case 'square': return ''; // Solid
          case 'sextile': return '3,3'; // Dashed
          default: return '3,3';
        }
      })
      .attr('opacity', 0.6);
  };
  
  // Function to draw ascendant and midheaven
  const drawSpecialPoints = (svg, radius, ascendant, midheaven, isTransit) => {
    const lineRadius = isTransit ? radius * 0.65 : radius;
    const dashArray = isTransit ? '5,3' : '';
    const ascColor = isTransit ? '#f99' : '#f00';
    const mcColor = isTransit ? '#99f' : '#00f';
    
    // Draw ascendant line
    svg.append('line')
      .attr('class', isTransit ? 'transit-ascendant-line' : 'natal-ascendant-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', lineRadius * Math.sin(ascendant.longitude * (Math.PI / 180)))
      .attr('y2', -lineRadius * Math.cos(ascendant.longitude * (Math.PI / 180)))
      .attr('stroke', ascColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', dashArray);
    
    // Draw midheaven line
    svg.append('line')
      .attr('class', isTransit ? 'transit-midheaven-line' : 'natal-midheaven-line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', lineRadius * Math.sin(midheaven.longitude * (Math.PI / 180)))
      .attr('y2', -lineRadius * Math.cos(midheaven.longitude * (Math.PI / 180)))
      .attr('stroke', mcColor)
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', dashArray);
    
    // Add labels for ascendant and midheaven if not transit
    if (!isTransit) {
      const labelRadius = radius + 15;
      
      // Ascendant label
      svg.append('text')
        .attr('class', 'ascendant-label')
        .attr('x', labelRadius * Math.sin(ascendant.longitude * (Math.PI / 180)))
        .attr('y', -labelRadius * Math.cos(ascendant.longitude * (Math.PI / 180)))
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#f00')
        .text('ASC');
      
      // Midheaven label
      svg.append('text')
        .attr('class', 'midheaven-label')
        .attr('x', labelRadius * Math.sin(midheaven.longitude * (Math.PI / 180)))
        .attr('y', -labelRadius * Math.cos(midheaven.longitude * (Math.PI / 180)))
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#00f')
        .text('MC');
    }
  };
  
  // Helper function to determine which house a degree falls into
  const getHouseForDegree = (degree, houses) => {
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
  
  return (
    <div className="transit-chart-container">
      <div className="chart-svg-container" onClick={handleChartClick}>
        <svg ref={svgRef}></svg>
        <div ref={tooltipRef} className="tooltip"></div>
      </div>
      
      {selectedElement && (
        <div className="chart-details">
          <h3>{selectedElement.name} in {selectedElement.zodiacSignName} ({selectedElement.type === 'natal' ? 'Natal' : 'Transit'})</h3>
          <p>
            Position: {selectedElement.degree}° {selectedElement.zodiacSignName} {selectedElement.isRetrograde ? '(Retrograde)' : ''}
          </p>
          <p>
            House: {getHouseForDegree(selectedElement.longitude, natalData.houses)}
          </p>
          <p>
            Element: {selectedElement.element}
          </p>
          <h4>Aspects:</h4>
          <ul>
            {transitData.aspects
              .filter(aspect => {
                if (selectedElement.type === 'natal') {
                  return aspect.isTransitToNatal && aspect.planet2 === selectedElement.planet;
                } else {
                  return (aspect.isTransitToNatal && aspect.planet1 === selectedElement.planet) || 
                         (!aspect.isTransitToNatal && (aspect.planet1 === selectedElement.planet || aspect.planet2 === selectedElement.planet));
                }
              })
              .map((aspect, index) => {
                let otherPlanet, otherPlanetData, aspectDescription;
                
                if (selectedElement.type === 'natal') {
                  // Natal planet selected, show transit planet making aspect to it
                  otherPlanet = aspect.planet1;
                  otherPlanetData = transitData.planets.find(p => p.planet === otherPlanet);
                  aspectDescription = `Transit ${otherPlanetData.name} ${aspect.aspectData.name} your natal ${selectedElement.name}`;
                } else {
                  // Transit planet selected
                  if (aspect.isTransitToNatal) {
                    // Show natal planet this transit is aspecting
                    otherPlanet = aspect.planet2;
                    otherPlanetData = natalData.planets.find(p => p.planet === otherPlanet);
                    aspectDescription = `Your ${selectedElement.name} ${aspect.aspectData.name} natal ${otherPlanetData.name}`;
                  } else {
                    // Show other transit planet
                    otherPlanet = aspect.planet1 === selectedElement.planet ? aspect.planet2 : aspect.planet1;
                    otherPlanetData = transitData.planets.find(p => p.planet === otherPlanet);
                    aspectDescription = `Your ${selectedElement.name} ${aspect.aspectData.name} transit ${otherPlanetData.name}`;
                  }
                }
                
                return (
                  <li key={index}>
                    {aspectDescription} (orb: {aspect.orb}°)
                  </li>
                );
              })}
          </ul>
        </div>
      )}
      
      <div className="chart-legend-container">
        <div className="legend-note">
          <p><strong>Note:</strong> Solid circles represent natal planets, dashed circles represent transit planets.</p>
        </div>
        <ChartLegend planets={transitData.planets} aspects={transitData.aspects} />
      </div>
    </div>
  );
};

export default TransitChart; 