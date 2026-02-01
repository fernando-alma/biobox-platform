import React from 'react';

const RectangleTool = ({ measurement, toScreen }) => {
    const { start, end, value } = measurement;
    if (!start || !end) return null;

    const sStart = toScreen(start);
    const sEnd = toScreen(end);

    const x = Math.min(sStart.x, sEnd.x);
    const y = Math.min(sStart.y, sEnd.y);
    const width = Math.abs(sEnd.x - sStart.x);
    const height = Math.abs(sEnd.y - sStart.y);

    return (
        <g>
            <rect 
                x={x} y={y} width={width} height={height}
                fill="none" stroke="#22d3ee" strokeWidth="2"
            />
            <circle cx={x} cy={y} r="3" fill="#22d3ee" />
            <circle cx={x + width} cy={y + height} r="3" fill="#22d3ee" />
            <text 
                x={x} y={y - 5} 
                fill="white" fontSize="12" fontWeight="bold"
                style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
            >
                {value} mm²
            </text>
        </g>
    );
};

export default RectangleTool;