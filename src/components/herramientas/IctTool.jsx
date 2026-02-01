import React from 'react';

const IctTool = ({ measurement, toScreen }) => {
    const { complexData, value } = measurement;
    // Validación de seguridad
    if (!complexData?.thorax || !complexData?.heart) return null;

    const { thorax, heart } = complexData;

    return (
        <g>
            {/* 1. Línea de Tórax (Azul punteada) */}
            <line 
                x1={toScreen(thorax.start).x} y1={toScreen(thorax.start).y} 
                x2={toScreen(thorax.end).x} y2={toScreen(thorax.end).y} 
                stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" 
            />
            
            {/* 2. Línea de Corazón (Amarilla sólida) */}
            <line 
                x1={toScreen(heart.start).x} y1={toScreen(heart.start).y} 
                x2={toScreen(heart.end).x} y2={toScreen(heart.end).y} 
                stroke="#facc15" strokeWidth="2" 
            />

            {/* 3. Etiqueta del Resultado */}
            <text 
                x={toScreen(heart.end).x + 5} 
                y={toScreen(heart.end).y} 
                fill="white" fontSize="12" 
                style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
            >
                ICT: {value}%
            </text>
        </g>
    );
};

export default IctTool;