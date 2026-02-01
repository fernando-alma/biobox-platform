import React from 'react';

const EllipseTool = ({ measurement, toScreen }) => {
    const { complexData, value } = measurement;
    if (!complexData) return null;

    const { center, radiusX, radiusY } = complexData;

    // Calculamos coordenadas de pantalla para el dibujo
    const sCenter = toScreen(center);
    const rx = Math.abs(toScreen({x: center.x + radiusX, y: center.y}).x - sCenter.x);
    const ry = Math.abs(toScreen({x: center.x, y: center.y + radiusY}).y - sCenter.y);

    // Definición de las 9 manijas de control
    const handles = [
        { id: 'center', x: 0, y: 0 },
        { id: 'top',    x: 0, y: -radiusY },
        { id: 'bottom', x: 0, y: radiusY },
        { id: 'left',   x: -radiusX, y: 0 },
        { id: 'right',  x: radiusX, y: 0 },
        // Diagonales (0.707 = cos(45°))
        { id: 'top-right',    x: radiusX * 0.707, y: -radiusY * 0.707 },
        { id: 'top-left',     x: -radiusX * 0.707, y: -radiusY * 0.707 },
        { id: 'bottom-right', x: radiusX * 0.707, y: radiusY * 0.707 },
        { id: 'bottom-left',  x: -radiusX * 0.707, y: radiusY * 0.707 },
    ];

    return (
        <g style={{ pointerEvents: 'all' }}>
            {/* 1. El Óvalo Principal */}
            <ellipse 
                cx={sCenter.x} cy={sCenter.y} 
                rx={rx} ry={ry}
                fill="none" stroke="#fbbf24" strokeWidth="2" 
            />

            {/* 2. Etiqueta de Área */}
            <text 
                x={sCenter.x} y={sCenter.y} 
                fill="#fbbf24" fontSize="12" 
                textAnchor="middle" dy={-15} 
                style={{ filter: 'drop-shadow(1px 1px 1px black)' }}
            >
                {value} mm²
            </text>

            {/* 3. Manijas de Control (Cruces) */}
            {handles.map(h => {
                const p = toScreen({ 
                    x: center.x + h.x, 
                    y: center.y + h.y 
                });
                
                return (
                    <g key={h.id} style={{ cursor: h.id === 'center' ? 'move' : 'pointer' }}>
                        {/* Círculo invisible para ampliar área de clic */}
                        <circle cx={p.x} cy={p.y} r="8" fill="transparent" />
                        
                        {/* La Cruz Visual (+) */}
                        <line x1={p.x - 5} y1={p.y} x2={p.x + 5} y2={p.y} stroke="#fbbf24" strokeWidth="2" />
                        <line x1={p.x} y1={p.y - 5} x2={p.x} y2={p.y + 5} stroke="#fbbf24" strokeWidth="2" />
                    </g>
                );
            })}
        </g>
    );
};

export default EllipseTool;