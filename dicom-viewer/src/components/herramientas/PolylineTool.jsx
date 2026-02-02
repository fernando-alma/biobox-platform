import React from 'react';

const PolylineTool = ({ measurement, toScreen }) => {
    const { points, value } = measurement;
    if (!points || points.length === 0) return null;

    // Convertimos todos los puntos a coordenadas de pantalla
    const screenPoints = points.map(p => toScreen(p));
    
    // Generamos el string para el atributo 'points' del SVG (x1,y1 x2,y2 ...)
    const pointsString = screenPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <g>
            {/* 1. La Línea Quebrada */}
            <polyline 
                points={pointsString} 
                fill="none" 
                stroke="#f97316" // Naranja brillante
                strokeWidth="2"
            />

            {/* 2. Puntos en los vértices (para referencia visual) */}
            {screenPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3" fill="#f97316" />
            ))}

            {/* 3. Etiqueta con la distancia total (en el último punto) */}
            {screenPoints.length > 1 && (
                <text 
                    x={screenPoints[screenPoints.length - 1].x + 10} 
                    y={screenPoints[screenPoints.length - 1].y} 
                    fill="white" 
                    fontSize="12"
                    fontWeight="bold"
                    style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
                >
                    {value} mm
                </text>
            )}
        </g>
    );
};

export default PolylineTool;