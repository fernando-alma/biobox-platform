import React, { useEffect, useRef } from "react";
import cornerstone from "cornerstone-core";

// Sub-componente para renderizar UNA miniatura individual
const Thumbnail = ({ imageId, index, isActive, onClick }) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // 1. Habilitamos Cornerstone en este pequeño div
        try { cornerstone.enable(element); } catch (e) {}

        // 2. Cargamos la imagen (Cornerstone usa caché, así que es rápido si ya la cargó el visor principal)
        cornerstone.loadImage(imageId).then(image => {
            cornerstone.displayImage(element, image);
            
            // Ajustamos el viewport para que se vea bonita en pequeño
            const viewport = cornerstone.getDefaultViewport(element, image);
            viewport.scale = 0.15; // Zoom out para verla completa (ajustable)
            
            // Reset de W/L para que se vea estándar
            cornerstone.setViewport(element, viewport);
            cornerstone.fitToWindow(element); // Forzar ajuste al div
        }).catch(err => console.log("Error thumb", err));

        // Limpieza
        return () => { try { cornerstone.disable(element); } catch (e) {} };
    }, [imageId]);

    return (
        <div 
            onClick={() => onClick(index)}
            className={`
                relative flex flex-col items-center p-1 cursor-pointer transition-all mb-2 rounded-lg border-2
                ${isActive 
                    ? "border-blue-500 bg-blue-900/20 shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105" 
                    : "border-transparent hover:bg-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100"
                }
            `}
        >
            {/* Contenedor de la imagen DICOM Mini */}
            <div 
                ref={elementRef} 
                className="w-20 h-20 bg-black rounded overflow-hidden pointer-events-none" // pointer-events-none para que el click pase al padre
            />
            
            {/* Etiqueta de número */}
            <span className={`text-[10px] mt-1 font-mono font-bold ${isActive ? "text-blue-400" : "text-gray-500"}`}>
                IMG {index + 1}
            </span>
        </div>
    );
};

const ThumbnailStrip = ({ images, activeIndex, onSelectImage }) => {
    if (!images || images.length === 0) return null;

    return (
        <div className="w-28 bg-gray-950 border-r border-gray-800 flex flex-col h-full z-30">
            {/* Título de la Serie */}
            <div className="p-3 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-800 text-center">
                Serie 1
                <span className="block text-[9px] text-gray-600 font-normal mt-0.5">{images.length} imgs</span>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar flex flex-col items-center">
                {images.map((img, idx) => (
                    <Thumbnail 
                        key={`${img.imageId}-${idx}`} // Key única
                        imageId={img.imageId} 
                        index={idx}
                        isActive={idx === activeIndex}
                        onClick={onSelectImage}
                    />
                ))}
            </div>
        </div>
    );
};

export default ThumbnailStrip;