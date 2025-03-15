import React from 'react';

// Planet colors and symbols mapping
const PLANET_COLORS = {
  Sun: '#F9A825',       // Golden yellow
  Moon: '#E0E0E0',      // Silver/white
  Mercury: '#64B5F6',   // Light blue
  Venus: '#EC407A',     // Pink
  Mars: '#EF5350',      // Red
  Jupiter: '#8D6E63',   // Brown
  Saturn: '#607D8B',    // Blue-grey
  Uranus: '#26A69A',    // Teal
  Neptune: '#5C6BC0',   // Indigo
  Pluto: '#7E57C2',     // Purple
  "North Node": '#66BB6A', // Green
  "South Node": '#FF7043', // Orange
  Chiron: '#9575CD',    // Light purple
  Ascendant: '#FB8C00', // Orange
  Midheaven: '#29B6F6', // Light blue
};

const PlanetMark = ({ 
  planet, 
  centerX, 
  centerY, 
  radius, 
  scale = 1,
  isSelected = false,
  onClick 
}) => {
  // Calculate planet position based on its longitude
  const angle = (planet.position - 90) * (Math.PI / 180);
  const x = centerX + (radius * Math.cos(angle));
  const y = centerY + (radius * Math.sin(angle));
  
  // Determine symbol size and colors based on state
  const baseSize = 16 * scale;
  const symbolSize = isSelected ? baseSize * 1.2 : baseSize;
  const circleRadius = isSelected ? 18 * scale : 15 * scale;
  const color = PLANET_COLORS[planet.name] || '#999999';
  const strokeWidth = isSelected ? 2 : 1;
  
  return (
    <g 
      className={`planet-mark ${isSelected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Line from center to planet */}
      <line
        x1={centerX}
        y1={centerY}
        x2={x}
        y2={y}
        stroke="var(--color-chart-line)"
        strokeWidth={0.5}
        strokeDasharray="3,3"
        opacity={isSelected ? 0.8 : 0.4}
      />
      
      {/* Planet background circle */}
      <circle
        cx={x}
        cy={y}
        r={circleRadius}
        fill={color}
        stroke="var(--color-chart-border)"
        strokeWidth={strokeWidth}
        opacity={isSelected ? 1 : 0.85}
        className="planet-circle"
      />
      
      {/* Planet symbol */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={symbolSize}
        fontWeight="bold"
        fill="white"
        style={{ 
          cursor: 'pointer',
          filter: isSelected ? 'drop-shadow(0 0 1px rgba(0,0,0,0.5))' : 'none'
        }}
      >
        {planet.symbol}
      </text>
      
      {/* Retrograde symbol if planet is retrograde */}
      {planet.isRetrograde && (
        <text
          x={x + (circleRadius + 5)}
          y={y - (circleRadius - 3)}
          textAnchor="start"
          fontSize={12 * scale}
          fill="var(--color-retrograde)"
          fontWeight="bold"
        >
          ℞
        </text>
      )}
      
      {/* Planet degree (show only when selected) */}
      {isSelected && (
        <text
          x={x}
          y={y + circleRadius + 15}
          textAnchor="middle"
          fontSize={12 * scale}
          fill="var(--color-text)"
          className="planet-degree"
        >
          {`${planet.sign} ${planet.degree.toFixed(1)}°`}
        </text>
      )}
      
      <style jsx>{`
        .planet-mark {
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .planet-mark:hover .planet-circle {
          opacity: 1;
          r: ${circleRadius * 1.1}px;
        }
      `}</style>
    </g>
  );
};

export default PlanetMark; 