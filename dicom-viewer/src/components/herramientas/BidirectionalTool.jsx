import React from 'react';

const BidirectionalTool = ({ measurement, toScreen }) => {
    const { complexData } = measurement;
    if (!complexData?.axis1 || !complexData?.axis2) return null;

    const { axis1, axis2 } = complexData;

    return (
        <g>
            {/* Eje 1 (Violeta) */}
            <line 
                x1={toScreen(axis1.start).x} y1={toScreen(axis1.start).y} 
                x2={toScreen(axis1.end).x} y2={toScreen(axis1.end).y} 
                stroke="#a855f7" strokeWidth="2" 
            />
            
            {/* Eje 2 (Celeste) */}
            <line 
                x1={toScreen(axis2.start).x} y1={toScreen(axis2.start).y} 
                x2={toScreen(axis2.end).x} y2={toScreen(axis2.end).y} 
                stroke="#22d3ee" strokeWidth="2" 
            />

            {/* Texto: Largo x Ancho mm */}
            <text 
                x={toScreen(axis2.end).x + 5} 
                y={toScreen(axis2.end).y} 
                fill="white" fontSize="12" 
                style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
            >
                {axis1.value} x {axis2.value} mm
            </text>
        </g>
    );
};

export default BidirectionalTool;