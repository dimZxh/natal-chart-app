import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { format } from 'date-fns';
import ChartLegend from './ChartLegend';
import { useChartContext } from '../../context/ChartContext';
import PlanetMark from './PlanetMark';
import LoadingSpinner from '../UI/LoadingSpinner';
import HouseMarker from './HouseMarker';
import ZodiacWheel from './ZodiacWheel';
import AspectLines from './AspectLines';
import ChartSettings from './ChartSettings';

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

const NatalChart = () => {
  const { birthData, chartData, isLoading, error, chartSettings } = useChartContext();
  const [chartSize, setChartSize] = useState(650);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [chartScale, setChartScale] = useState(1);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [chartCenter, setChartCenter] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectDisplayActive, setAspectDisplayActive] = useState(true);
  
  const chartRef = useRef(null);
  const svgRef = useRef(null);
  const viewBoxSize = 800; // SVG viewBox size
  const baseChartCenter = viewBoxSize / 2;
  const outerRadius = viewBoxSize * 0.45;

  // Function to handle window resize and adjust chart size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // Responsive sizing based on screen width
      if (width < 480) {
        setChartSize(Math.min(width * 0.85, 320));
        setChartScale(0.85);
      } else if (width < 768) {
        setChartSize(Math.min(width * 0.8, 500));
        setChartScale(0.9);
      } else {
        setChartSize(Math.min(width * 0.5, 650));
        setChartScale(1);
      }
    }, [selectedPlanet]);

    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    }, [selectedPlanet]);
  }, []);

  // Initialize chart center
  useEffect(() => {
    setChartCenter({ x: baseChartCenter, y: baseChartCenter });
  }, [baseChartCenter]);

  // Handle planet selection
  const handlePlanetClick = React.useCallback((planet) => {
    setSelectedPlanet(selectedPlanet === planet ? null : planet);
  }, [selectedPlanet]);

  // Handle chart click outside planets to deselect
  const handleChartClick = (e) => {
    // Only deselect if clicking on the chart background, not a planet
    if (e.target === svgRef.current) {
      setSelectedPlanet(null);
    }
  }, [selectedPlanet]);

  // Handle mouse over for tooltips
  const handlePlanetMouseOver = (planet, event) => {
    const planetData = chartData.planets.find(p => p.name === planet);
    if (planetData) {
      const content = {
        name: planetData.name,
        sign: planetData.sign,
        degree: planetData.degree.toFixed(2),
        house: planetData.house,
        retrograde: planetData.retrograde
      }, [selectedPlanet]);
      
      // Calculate position relative to the SVG
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = event.clientX - svgRect.left;
      const y = event.clientY - svgRect.top;
      
      setTooltipContent(content);
      setTooltipPosition({ x, y });
      setShowTooltip(true);
    }
  }, [selectedPlanet]);

  // Handle mouse out for tooltips
  const handlePlanetMouseOut = () => {
    setShowTooltip(false);
  }, [selectedPlanet]);

  // Handle zoom with mouse wheel
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const newZoom = Math.max(0.5, Math.min(2, zoomLevel + delta));
    setZoomLevel(newZoom);
  }, [selectedPlanet]);

  // Handle drag start
  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [selectedPlanet]);

  // Handle drag
  const handleMouseMove = (e) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / zoomLevel;
      const dy = (e.clientY - dragStart.y) / zoomLevel;
      
      setChartCenter({
        x: chartCenter.x + dx,
        y: chartCenter.y + dy
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  }, [selectedPlanet]);

  // Handle drag end
  const handleMouseUp = () => {
    setIsDragging(false);
  }, [selectedPlanet]);

  // Handle drag leave
  const handleMouseLeave = () => {
    setIsDragging(false);
  }, [selectedPlanet]);

  // Toggle aspect lines
  const toggleAspectLines = () => {
    setAspectDisplayActive(!aspectDisplayActive);
  }, [selectedPlanet]);

  // Reset zoom and position
  const resetView = React.useCallback(() => {
    setZoomLevel(1);
    setChartCenter({ x: baseChartCenter, y: baseChartCenter });
  }, [selectedPlanet]);

  if (isLoading) {
    return <LoadingSpinner message="Calculating chart positions..." />;
  }

  if (error) {
    return (
      <div className="chart-error">
        <h3>Error Generating Chart</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!birthData || !chartData || !chartData.planets || !chartData.houses) {
    return (
      <div className="chart-placeholder">
        <h3>Enter Your Birth Details</h3>
        <p>Fill out the form to generate your natal chart</p>
      </div>
    );
  }

  // Destructure chart data
  const { planets, houses, aspects } = chartData;

  // Calculate transform for zoom and pan
  const transform = `scale(${zoomLevel}) translate(${(chartCenter.x - baseChartCenter) / zoomLevel}px, ${(chartCenter.y - baseChartCenter) / zoomLevel}px)`;

  return (
    <div className="natal-chart-container">
      <div className="chart-header">
        <h2>Natal Chart</h2>
        {birthData && (
          <div className="birth-info">
            <p>{birthData.name} - {format(new Date(birthData.date), 'MMMM d, yyyy')} at {birthData.time}</p>
            <p>{birthData.location}</p>
          </div>
        )}
      </div>

      <ChartSettings />
      
      <div className="chart-controls">
        <button 
          className="control-btn"
          onClick={toggleAspectLines}
          aria-pressed={aspectDisplayActive}
        >
          {aspectDisplayActive ? 'Hide Aspects' : 'Show Aspects'}
        </button>
        <button 
          className="control-btn"
          onClick={resetView}
        >
          Reset View
        </button>
        <div className="zoom-controls">
          <button 
            className="zoom-btn"
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            aria-label="Zoom out" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleZoomOut()}
          >
            -
          </button>
          <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
          <button 
            className="zoom-btn"
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            aria-label="Zoom in" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && handleZoomIn()}
          >
            +
          </button>
        </div>
      </div>

      <div
        className="chart-wrapper"
        style={{ width: `${chartSize}px`, height: `${chartSize}px` }}
        onWheel={handleWheel}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          ref={svgRef}
          onClick={handleChartClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className="natal-chart-svg"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <g style={{ transform }}>
            {/* Background circle */}
            <circle
              cx={baseChartCenter}
              cy={baseChartCenter}
              r={outerRadius}
              fill="var(--color-chart-bg)"
              stroke="var(--color-chart-border)"
              strokeWidth="2"
            />

            {/* Zodiac wheel */}
            <ZodiacWheel
              centerX={baseChartCenter}
              centerY={baseChartCenter}
              outerRadius={outerRadius}
              innerRadius={outerRadius * 0.85}
              colors={ZODIAC_COLORS}
            />

            {/* House lines and numbers */}
            {houses.map((house, index) => (
              <HouseMarker
                key={`house-${index + 1}`}
                houseNumber={index + 1}
                position={house.position}
                centerX={baseChartCenter}
                centerY={baseChartCenter}
                outerRadius={outerRadius}
                innerRadius={outerRadius * 0.7}
                scale={chartScale}
              />
            ))}

            {/* Aspect lines between planets */}
            {chartData && chartSettings.showAspects && aspects && (
              <AspectLines
                aspects={aspects}
                planets={planets}
                centerX={baseChartCenter}
                centerY={baseChartCenter}
                radius={outerRadius * 0.6}
                selectedPlanet={selectedPlanet}
                colors={ASPECT_COLORS}
              />
            )}

            {/* Planet symbols */}
            {planets.map((planet) => (
              <PlanetMark
                key={planet.name}
                planet={planet}
                centerX={baseChartCenter}
                centerY={baseChartCenter}
                radius={outerRadius * 0.6}
                color={PLANET_COLORS[planet.name] || '#666666'}
                isSelected={selectedPlanet === planet.name}
                onClick={() => handlePlanetClick(planet.name)}
                onMouseOver={(e) => handlePlanetMouseOver(planet.name, e)}
                onMouseOut={handlePlanetMouseOut}
                scale={chartScale}
              />
            ))}
          </g>
        </svg>

        {/* Tooltip */}
        {showTooltip && tooltipContent && (
          <div 
            className="planet-tooltip"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y + 10}px`
            }}
          >
            <h4>{tooltipContent.name}</h4>
            <p>
              {tooltipContent.sign} {tooltipContent.degree}°
              {tooltipContent.retrograde && <span className="retrograde"> ℞</span>}
            </p>
            <p>House: {tooltipContent.house}</p>
          </div>
        )}
      </div>

      <ChartLegend 
        planets={planets} 
        selectedPlanet={selectedPlanet}
        onPlanetSelect={handlePlanetClick}
        planetColors={PLANET_COLORS}
      />

      <style jsx>{`
        .natal-chart-container {
          padding: 1.5rem;
          background-color: var(--color-bg);
          border-radius: var(--border-radius-lg);
          box-shadow: var(--shadow-md);
        }
        
        .chart-header {
          margin-bottom: 1.5rem;
          text-align: center;
        }
        
        .chart-header h2 {
          color: var(--color-primary);
          margin-bottom: 0.5rem;
        }
        
        .birth-info {
          margin-bottom: 1rem;
        }
        
        .birth-info p {
          margin: 0.25rem 0;
          color: var(--color-text-light);
        }
        
        .chart-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .control-btn {
          background-color: var(--color-bg-light);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          padding: 0.5rem 1rem;
          border-radius: var(--border-radius-md);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }
        
        .control-btn:hover {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        
        .control-btn[aria-pressed="true"] {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        
        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .zoom-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-bg-light);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          font-size: 1.2rem;
          line-height: 1;
          transition: all 0.2s ease;
        }
        
        .zoom-btn:hover {
          background-color: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }
        
        .zoom-level {
          font-size: 0.9rem;
          color: var(--color-text-light);
          min-width: 50px;
          text-align: center;
        }
        
        .chart-wrapper {
          position: relative;
          margin: 0 auto 2rem;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          touch-action: none;
        }
        
        .natal-chart-svg {
          display: block;
          user-select: none;
        }
        
        .planet-tooltip {
          position: absolute;
          background-color: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          padding: 0.75rem;
          box-shadow: var(--shadow-md);
          z-index: 10;
          pointer-events: none;
          min-width: 150px;
        }
        
        .planet-tooltip h4 {
          margin: 0 0 0.5rem;
          color: var(--color-primary);
          font-size: 1rem;
        }
        
        .planet-tooltip p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }
        
        .retrograde {
          color: var(--color-danger);
          font-weight: bold;
        }
        
        @media (max-width: 768px) {
          .natal-chart-container {
            padding: 0.5rem;
          }

          .chart-header h2 {
            font-size: 1.5rem;
          }

          .birth-info p {
            font-size: 1.2rem;
          }
          
          .chart-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .zoom-controls {
            margin-top: 0.5rem;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default NatalChart; 

