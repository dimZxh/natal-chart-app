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
  const { birthData, chartData, isLoading, error } = useChartContext();
  const [chartSize, setChartSize] = useState(650);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [chartScale, setChartScale] = useState(1);
  const chartRef = useRef(null);
  const viewBoxSize = 800; // SVG viewBox size
  const chartCenter = viewBoxSize / 2;
  const outerRadius = viewBoxSize * 0.45;
  const aspectDisplayActive = true; // Toggle for aspect lines
  
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
    };
    
    handleResize(); // Call once on mount
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Handle planet selection
  const handlePlanetClick = (planet) => {
    setSelectedPlanet(selectedPlanet === planet ? null : planet);
  };
  
  // Handle chart click outside planets to deselect
  const handleChartClick = (e) => {
    // Only deselect if clicking on the chart background, not a planet
    if (e.target === chartRef.current) {
      setSelectedPlanet(null);
    }
  };
  
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
  
  return (
    <div className="natal-chart-container">
      <div className="chart-heading">
        <h2>Natal Chart</h2>
        <div className="chart-details">
          <h3>{birthData.name}</h3>
          <p>{new Date(birthData.date).toLocaleDateString()} at {birthData.time}</p>
          <p>{birthData.place}</p>
        </div>
      </div>
      
      <div 
        className="chart-wrapper"
        style={{ width: `${chartSize}px`, height: `${chartSize}px` }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          ref={chartRef}
          onClick={handleChartClick}
          className="natal-chart-svg"
        >
          {/* Background circle */}
          <circle 
            cx={chartCenter} 
            cy={chartCenter} 
            r={outerRadius} 
            fill="var(--color-chart-bg)" 
            stroke="var(--color-chart-border)"
            strokeWidth="2"
          />
          
          {/* Zodiac wheel */}
          <ZodiacWheel 
            centerX={chartCenter} 
            centerY={chartCenter} 
            outerRadius={outerRadius} 
            innerRadius={outerRadius * 0.85}
          />
          
          {/* House lines and numbers */}
          {houses.map((house, index) => (
            <HouseMarker
              key={`house-${index + 1}`}
              houseNumber={index + 1}
              position={house.position}
              centerX={chartCenter}
              centerY={chartCenter}
              outerRadius={outerRadius}
              innerRadius={outerRadius * 0.7}
              scale={chartScale}
            />
          ))}
          
          {/* Aspect lines between planets */}
          {aspectDisplayActive && aspects && (
            <AspectLines
              aspects={aspects}
              planets={planets}
              centerX={chartCenter}
              centerY={chartCenter}
              radius={outerRadius * 0.6}
              selectedPlanet={selectedPlanet}
            />
          )}
          
          {/* Planet symbols */}
          {planets.map((planet) => (
            <PlanetMark
              key={planet.name}
              planet={planet}
              centerX={chartCenter}
              centerY={chartCenter}
              radius={outerRadius * 0.6}
              scale={chartScale}
              isSelected={selectedPlanet === planet.name}
              onClick={() => handlePlanetClick(planet.name)}
            />
          ))}
          
          {/* Chart center point */}
          <circle
            cx={chartCenter}
            cy={chartCenter}
            r={3}
            fill="var(--color-text)"
            opacity="0.5"
          />
        </svg>
      </div>
      
      <ChartLegend 
        planets={planets} 
        houses={houses}
        selectedPlanet={selectedPlanet}
        onPlanetSelect={handlePlanetClick}
        aspects={aspects}
      />
      
      <style jsx>{`
        .natal-chart-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          margin: 0 auto;
          padding: 1rem;
        }
        
        .chart-heading {
          text-align: center;
          margin-bottom: 1.5rem;
          width: 100%;
        }
        
        .chart-details {
          margin-top: 0.5rem;
        }
        
        .chart-details h3 {
          margin-bottom: 0.25rem;
          color: var(--color-heading);
        }
        
        .chart-details p {
          margin: 0.25rem 0;
          color: var(--color-text-light);
          font-size: 0.95rem;
        }
        
        .chart-wrapper {
          position: relative;
          max-width: 100%;
          margin: 0 auto;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          border-radius: 50%;
          background-color: var(--color-background-chart);
          transition: transform 0.3s ease;
        }
        
        .chart-wrapper:hover {
          transform: scale(1.01);
        }
        
        .natal-chart-svg {
          border-radius: 50%;
          overflow: visible;
        }
        
        .chart-error {
          text-align: center;
          padding: 2rem;
          background-color: rgba(239, 68, 68, 0.1);
          border-radius: var(--border-radius-md);
          margin: 2rem 0;
          color: var(--color-error);
        }
        
        .chart-placeholder {
          text-align: center;
          padding: 2rem;
          background-color: var(--color-background-alt);
          border-radius: var(--border-radius-md);
          margin: 2rem 0;
          color: var(--color-text-light);
          border: 1px dashed var(--color-border);
        }
        
        @media (max-width: 768px) {
          .natal-chart-container {
            padding: 0.5rem;
          }
          
          .chart-heading h2 {
            font-size: 1.5rem;
          }
          
          .chart-details h3 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NatalChart; 