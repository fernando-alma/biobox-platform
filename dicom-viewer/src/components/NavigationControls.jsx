import React from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";

const NavigationControls = ({
  currentIndex,
  totalImages,
  onNext,
  onPrev,
  onImageSelect,
  images = [] // Necesitamos recibir el array de URLs de imágenes
}) => {
  
  // Función para iniciar el arrastre (Drag Start)
  const handleDragStart = (e, index) => {
    // Guardamos el índice de la imagen que estamos arrastrando
    e.dataTransfer.setData("imageIndex", index);
    e.dataTransfer.effectAllowed = "copy"; // Icono de copiar
    
    // Opcional: Imagen fantasma personalizada
    // const dragImg = new Image(); dragImg.src = ...; e.dataTransfer.setDragImage(dragImg, 0, 0);
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-2 select-none">
      <div className="flex items-center gap-2">
        
        {/* Botón Anterior */}
        <button
          onClick={onPrev}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* TIRA DE MINIATURAS (FILMSTRIP) */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 pb-1">
          <div className="flex gap-2 px-1">
            {images.map((imgUrl, index) => {
              const isActive = index === currentIndex;
              return (
                <div
                  key={index}
                  // Eventos de Drag & Drop
                  draggable="true"
                  onDragStart={(e) => handleDragStart(e, index)}
                  
                  // Evento de Click normal
                  onClick={() => onImageSelect(index)}
                  
                  className={`
                    group relative w-20 h-20 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-200
                    ${isActive 
                      ? "border-blue-500 ring-2 ring-blue-500/30 scale-105 z-10" 
                      : "border-gray-700 hover:border-gray-500 opacity-70 hover:opacity-100"
                    }
                  `}
                >
                  {/* Imagen Miniatura */}
                  <img 
                    src={imgUrl} 
                    alt={`Slice ${index + 1}`} 
                    className="w-full h-full object-cover"
                    loading="lazy" 
                  />
                  
                  {/* Número de slice superpuesto */}
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded-tl-md font-bold">
                    {index + 1}
                  </div>

                  {/* Icono de arrastre al hacer hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <GripVertical className="w-6 h-6 text-white drop-shadow-md" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={onNext}
          className="p-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex-shrink-0"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default NavigationControls;