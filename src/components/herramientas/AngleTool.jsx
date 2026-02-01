import React from 'react';

const AngleTool = ({ measurement, toScreen }) => {
    const { start, end, value } = measurement;
    if (!start || !end) return null;

    const sStart = toScreen(start);
    const sEnd = toScreen(end);

    return (
        <g>
            <line 
                x1={sStart.x} y1={sStart.y} 
                x2={sEnd.x} y2={sEnd.y} 
                stroke="#10b981" strokeWidth="2" 
            />
            <text 
                x={sEnd.x + 5} y={sEnd.y - 5} 
                fill="white" fontSize="12" 
                style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
            >
                {value}°
            </text>
        </g>
    );
};

export default AngleTool;