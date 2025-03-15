import React from 'react';

// Zodiac sign data
const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', color: '#F44336', element: 'fire' },
  { name: 'Taurus', symbol: '♉', color: '#8BC34A', element: 'earth' },
  { name: 'Gemini', symbol: '♊', color: '#FFC107', element: 'air' },
  { name: 'Cancer', symbol: '♋', color: '#2196F3', element: 'water' },
  { name: 'Leo', symbol: '♌', color: '#FF5722', element: 'fire' },
  { name: 'Virgo', symbol: '♍', color: '#795548', element: 'earth' },
  { name: 'Libra', symbol: '♎', color: '#9C27B0', element: 'air' },
  { name: 'Scorpio', symbol: '♏', color: '#03A9F4', element: 'water' },
  { name: 'Sagittarius', symbol: '♐', color: '#E91E63', element: 'fire' },
  { name: 'Capricorn', symbol: '♑', color: '#4CAF50', element: 'earth' },
  { name: 'Aquarius', symbol: '♒', color: '#3F51B5', element: 'air' },
  { name: 'Pisces', symbol: '♓', color: '#00BCD4', element: 'water' }
];

// Get element color with opacity
const getElementColor = (element, opacity = 0.3) => {
  switch (element) {
    case 'fire': return `rgba(255, 87, 34, ${opacity})`;
    case 'earth': return `rgba(76, 175, 80, ${opacity})`;
    case 'air': return `rgba(255, 193, 7, ${opacity})`;
    case 'water': return `rgba(33, 150, 243, ${opacity})`;
    default: return `rgba(158, 158, 158, ${opacity})`;
  }
};

const ZodiacWheel = ({ centerX, centerY, outerRadius, innerRadius }) => {
  // SVG path for a zodiac sign segment
  const createZodiacPath = (startAngle, endAngle) => {
    const start = {
      x: centerX + innerRadius * Math.cos(startAngle),
      y: centerY + innerRadius * Math.sin(startAngle)
    };
    
    const end = {
      x: centerX + innerRadius * Math.cos(endAngle),
      y: centerY + innerRadius * Math.sin(endAngle)
    };
    
    const outerStart = {
      x: centerX + outerRadius * Math.cos(startAngle),
      y: centerY + outerRadius * Math.sin(startAngle)
    };
    
    const outerEnd = {
      x: centerX + outerRadius * Math.cos(endAngle),
      y: centerY + outerRadius * Math.sin(endAngle)
    };
    
    // Create arc path
    // M = move to starting point
    // L = draw line to point
    // A = draw arc: rx ry x-axis-rotation large-arc-flag sweep-flag x y
    return `
      M ${start.x} ${start.y}
      L ${outerStart.x} ${outerStart.y}
      A ${outerRadius} ${outerRadius} 0 0 1 ${outerEnd.x} ${outerEnd.y}
      L ${end.x} ${end.y}
      A ${innerRadius} ${innerRadius} 0 0 0 ${start.x} ${start.y}
    `;
  };
  
  return (
    <g className="zodiac-wheel">
      {/* Draw each zodiac sign segment */}
      {ZODIAC_SIGNS.map((sign, index) => {
        // Calculate angles (30 degrees per sign)
        const startAngle = ((index * 30) - 90) * (Math.PI / 180);
        const endAngle = (((index + 1) * 30) - 90) * (Math.PI / 180);
        const midAngle = (startAngle + endAngle) / 2;
        
        return (
          <g key={sign.name} className="zodiac-sign">
            {/* Sign segment */}
            <path
              d={createZodiacPath(startAngle, endAngle)}
              fill={getElementColor(sign.element)}
              stroke="var(--color-chart-border)"
              strokeWidth="0.5"
              className="zodiac-segment"
            />
            
            {/* Sign symbol */}
            <text
              x={centerX + (innerRadius + (outerRadius - innerRadius) / 2) * Math.cos(midAngle)}
              y={centerY + (innerRadius + (outerRadius - innerRadius) / 2) * Math.sin(midAngle)}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="18"
              fontWeight="bold"
              fill="var(--color-text)"
              opacity="0.8"
              className="zodiac-symbol"
            >
              {sign.symbol}
            </text>
            
            {/* Sign division line */}
            <line
              x1={centerX + innerRadius * Math.cos(startAngle)}
              y1={centerY + innerRadius * Math.sin(startAngle)}
              x2={centerX + outerRadius * Math.cos(startAngle)}
              y2={centerY + outerRadius * Math.sin(startAngle)}
              stroke="var(--color-chart-border)"
              strokeWidth="1"
              className="zodiac-divider"
            />
            
            {/* Degree markers (every 5 degrees) */}
            {Array.from({ length: 6 }, (_, i) => i + 1).map((tick) => {
              const tickAngle = (startAngle + (tick * 5 * Math.PI / 180));
              const tickInnerRadius = innerRadius + 1;
              const tickOuterRadius = innerRadius + (tick % 2 === 0 ? 6 : 3);
              
              return (
                <line
                  key={`tick-${index}-${tick}`}
                  x1={centerX + tickInnerRadius * Math.cos(tickAngle)}
                  y1={centerY + tickInnerRadius * Math.sin(tickAngle)}
                  x2={centerX + tickOuterRadius * Math.cos(tickAngle)}
                  y2={centerY + tickOuterRadius * Math.sin(tickAngle)}
                  stroke="var(--color-chart-border)"
                  strokeWidth="0.5"
                  opacity="0.5"
                  className="degree-marker"
                />
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

export default ZodiacWheel; 