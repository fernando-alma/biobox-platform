import React from 'react';

const FreehandTool = ({ measurement, toScreen }) => {
    const { points, value } = measurement;
    if (!points || points.length === 0) return null;

    // Convertir a coordenadas de pantalla y generar string "x,y x,y..."
    const pointsString = points.map(p => {
        const s = toScreen(p);
        return `${s.x},${s.y}`;
    }).join(' ');

    // Calculamos un centro aproximado para poner la etiqueta
    const centerIndex = Math.floor(points.length / 2);
    const labelPos = toScreen(points[centerIndex]);

    return (
        <g>
            {/* El contorno relleno */}
            <polygon 
                points={pointsString} 
                fill="rgba(234, 179, 8, 0.2)" // Amarillo transparente
                stroke="#eab308"              // Amarillo borde
                strokeWidth="2"
            />

            {/* Etiqueta del Área */}
            {labelPos && (
                <text 
                    x={labelPos.x} 
                    y={labelPos.y} 
                    fill="white" 
                    fontSize="12"
                    fontWeight="bold"
                    textAnchor="middle"
                    style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
                >
                    {value} mm²
                </text>
            )}
        </g>
    );
};

export default FreehandTool;