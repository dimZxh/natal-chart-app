import React from 'react';

const HouseMarker = ({ 
  houseNumber, 
  position, 
  centerX, 
  centerY, 
  outerRadius, 
  innerRadius,
  scale = 1
}) => {
  // Constants for styling
  const isAngularHouse = [1, 4, 7, 10].includes(houseNumber);
  const lineWidth = isAngularHouse ? 1.5 : 0.75;
  const lineOpacity = isAngularHouse ? 0.9 : 0.6;
  const lineStyle = isAngularHouse ? "" : "4,4";
  
  // Calculate the angle in radians
  const angle = (position - 90) * (Math.PI / 180);
  
  // Coordinates for house line
  const startX = centerX;
  const startY = centerY;
  const endX = centerX + outerRadius * Math.cos(angle);
  const endY = centerY + outerRadius * Math.sin(angle);
  
  // Coordinates for house number
  // Place between center and outer radius
  const labelRadius = innerRadius * 0.8;
  const labelAngle = angle + (Math.PI / 36); // Slight offset to not overlap with the line
  const labelX = centerX + labelRadius * Math.cos(labelAngle);
  const labelY = centerY + labelRadius * Math.sin(labelAngle);
  
  // Determine house quadrant for label styling
  const quadrant = Math.floor((position % 360) / 90);
  const labelSize = isAngularHouse ? 14 * scale : 12 * scale;
  
  return (
    <g className={`house-marker house-${houseNumber} ${isAngularHouse ? 'angular' : ''}`}>
      {/* House cusp line */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="var(--color-chart-line)"
        strokeWidth={lineWidth}
        strokeDasharray={lineStyle}
        opacity={lineOpacity}
        className="house-line"
      />
      
      {/* House number */}
      <circle
        cx={labelX}
        cy={labelY}
        r={labelSize * 0.9}
        fill={isAngularHouse ? "var(--color-angular-house)" : "var(--color-house)"}
        stroke="var(--color-chart-border)"
        strokeWidth={0.5}
        opacity={isAngularHouse ? 0.3 : 0.2}
        className="house-number-bg"
      />
      
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={labelSize}
        fontWeight={isAngularHouse ? "bold" : "normal"}
        fill="var(--color-text)"
        opacity={isAngularHouse ? 0.9 : 0.7}
        className="house-number"
      >
        {houseNumber}
      </text>
      
      {/* House cusp degree marker at the outer edge */}
      <circle
        cx={endX}
        cy={endY}
        r={2}
        fill="var(--color-chart-line)"
        opacity={isAngularHouse ? 0.8 : 0.5}
        className="house-cusp-marker"
      />
    </g>
  );
};

export default HouseMarker; 