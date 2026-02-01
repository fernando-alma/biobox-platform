import React, { useState } from 'react';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import { UploadCloud } from 'lucide-react';

const DragDropZone = ({ onNewImages, children }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length === 0) return;

        // Filtrar solo posibles archivos DICOM (o asumir que todos lo son)
        // Procesamos los archivos
        const imageIds = [];
        
        files.forEach(file => {
            // Agregamos el archivo al gestor de Cornerstone
            const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
            imageIds.push({
                imageId: imageId,
                name: file.name,
                // Simulamos datos por ahora, Cornerstone los extraerá al cargar
                instanceNumber: 0 
            });
        });

        if (imageIds.length > 0) {
            onNewImages(imageIds);
        }
    };

    return (
        <div 
            className="relative w-full h-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* El contenido de la app (Visor) */}
            {children}

            {/* Overlay de "Soltar aquí" */}
            {isDragging && (
                <div className="absolute inset-0 bg-blue-600/80 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm border-4 border-white border-dashed m-4 rounded-3xl animate-pulse">
                    <UploadCloud className="w-24 h-24 mb-4" />
                    <h2 className="text-4xl font-black uppercase tracking-widest">Suelte los estudios aquí</h2>
                    <p className="mt-2 text-xl font-light">Procesamiento DICOM local seguro</p>
                </div>
            )}
        </div>
    );
};

export default DragDropZone;