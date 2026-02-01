import React from 'react';

const AnnotationTool = ({ measurement, toScreen }) => {
    const { start, end, text } = measurement;
    if (!start || !end || !text) return null;

    const sStart = toScreen(start); // Punta de la flecha (donde señala)
    const sEnd = toScreen(end);     // Donde va el texto

    // Cálculo matemático para dibujar la cabeza de la flecha
    const angle = Math.atan2(sEnd.y - sStart.y, sEnd.x - sStart.x);
    const headLen = 10; // Largo de la cabeza
    const arrowX1 = sStart.x + headLen * Math.cos(angle - Math.PI / 6);
    const arrowY1 = sStart.y + headLen * Math.sin(angle - Math.PI / 6);
    const arrowX2 = sStart.x + headLen * Math.cos(angle + Math.PI / 6);
    const arrowY2 = sStart.y + headLen * Math.sin(angle + Math.PI / 6);

    return (
        <g>
            {/* Línea conectora */}
            <line 
                x1={sStart.x} y1={sStart.y} 
                x2={sEnd.x} y2={sEnd.y} 
                stroke="#fbbf24" strokeWidth="2" // Amber-400
            />
            
            {/* Cabeza de la flecha (Triangle) */}
            <polygon 
                points={`${sStart.x},${sStart.y} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                fill="#fbbf24"
            />

            {/* Texto */}
            <text 
                x={sEnd.x + 5} 
                y={sEnd.y + 5} 
                fill="white" 
                fontSize="14" 
                fontWeight="bold"
                style={{ 
                    filter: 'drop-shadow(2px 2px 2px black)',
                    fontFamily: 'sans-serif' 
                }}
            >
                {text}
            </text>
        </g>
    );
};

export default AnnotationTool;