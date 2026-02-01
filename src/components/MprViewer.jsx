import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";

const MprViewer = ({ 
    pixelData, 
    width, 
    height, 
    aspectRatio, 
    windowCenter = 400, 
    windowWidth = 2000,
    referenceIndex,
    maxIndex,
    color = "yellow"
}) => {
    const elementRef = useRef(null);
    const imageIdRef = useRef(`MPR-${Date.now()}-${Math.random()}`);
    const [isSmoothed, setIsSmoothed] = useState(true); 

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;
        try { cornerstone.enable(element); } catch (e) {}
        return () => { try { cornerstone.disable(element); } catch (e) {} };
    }, []);

    useEffect(() => {
        const element = elementRef.current;
        if (!element || !pixelData) return;

        const dynamicImageId = `${imageIdRef.current}-${Date.now()}`;

        const image = {
            imageId: dynamicImageId,
            minPixelValue: -1000, 
            maxPixelValue: 3000,
            slope: 1.0,
            intercept: 0,
            windowCenter: windowCenter,
            windowWidth: windowWidth,
            render: cornerstone.renderGrayscaleImage,
            getPixelData: () => pixelData,
            rows: height,
            columns: width,
            height: height,
            width: width,
            color: false,
            columnPixelSpacing: 1.0, 
            rowPixelSpacing: aspectRatio || 1.0, 
            sizeInBytes: pixelData.byteLength,
            invert: false,
        };

        cornerstone.displayImage(element, image);

        const viewport = cornerstone.getViewport(element);
        if (viewport) {
            viewport.pixelReplication = !isSmoothed;
            if (viewport.scale === 1) cornerstone.fitToWindow(element);
            cornerstone.setViewport(element, viewport);
        }

    }, [pixelData, width, height, aspectRatio, windowCenter, windowWidth, isSmoothed]);

    const linePositionPct = maxIndex ? (referenceIndex / maxIndex) * 100 : 50;

    const colorClasses = {
        yellow: "border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]",
        green: "border-green-400 shadow-[0_0_10px_rgba(74,222,128,0.6)]",
        blue: "border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]",
    };

    return (
        <div className="w-full h-full relative group overflow-hidden">
            <div 
                ref={elementRef} 
                className="w-full h-full bg-black cursor-crosshair"
                onContextMenu={(e) => e.preventDefault()}
            />
            
            {referenceIndex !== undefined && maxIndex > 0 && (
                <div 
                    className={`absolute top-0 bottom-0 w-0 border-l-2 border-dashed opacity-70 pointer-events-none transition-all duration-75 ease-out ${colorClasses[color] || colorClasses.yellow}`}
                    style={{ left: `${linePositionPct}%` }}
                >
                    <div className={`absolute top-2 -left-3 text-[10px] font-bold bg-black/50 px-1 rounded ${color === 'yellow' ? 'text-yellow-400' : 'text-green-400'}`}>
                        {color === 'yellow' ? 'COR' : 'SAG'}
                    </div>
                </div>
            )}

            <button 
                onClick={() => setIsSmoothed(!isSmoothed)}
                className="absolute top-2 right-2 bg-gray-800/80 text-white text-[10px] px-2 py-1 rounded border border-gray-600 opacity-0 group-hover:opacity-100 transition-opacity z-20"
            >
                {isSmoothed ? "Modo: SUAVE" : "Modo: PIXEL"}
            </button>
        </div>
    );
};

export default MprViewer;