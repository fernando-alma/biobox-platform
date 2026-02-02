import React, { useEffect, useRef, useState } from "react";
import cornerstone from "cornerstone-core";
import { TOOLS } from "../utils/constants";
import { 
    calculateCTRPercentage, getClinicalStatusCTR, calculateEllipseArea,
    calculatePolylineLength, calculateFreehandArea, calculateRectangleArea 
} from "../utils/calculations";

// Importación de Herramientas
import EllipseTool from "./herramientas/EllipseTool";       
import RulerTool from "./herramientas/RulerTool";           
import AngleTool from "./herramientas/AngleTool";           
import IctTool from "./herramientas/IctTool";
import BidirectionalTool from "./herramientas/BidirectionalTool";
import PolylineTool from "./herramientas/PolylineTool";
import FreehandTool from "./herramientas/FreehandTool";
import RectangleTool from "./herramientas/RectangleTool";
import AnnotationTool from "./herramientas/AnnotationTool";

const DicomViewer = ({ 
    images, activeIndex, zoom, brightness, contrast, invert, 
    activeTool, measurements, setMeasurements, onLevelsChange 
}) => {
    const viewportRef = useRef(null);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [hoverData, setHoverData] = useState(null);
    
    // Estados de edición
    const [editMode, setEditMode] = useState(null); 
    const [activeEditId, setActiveEditId] = useState(null);
    const [resizeHandle, setResizeHandle] = useState(null);

    const [startPos, setStartPos] = useState({ x: 0, y: 0 }); 
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 }); 
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [startLevels, setStartLevels] = useState({ windowWidth: 256, windowCenter: 128 });

    // Estados intermedios
    const [ictStep, setIctStep] = useState(0); 
    const [tempThorax, setTempThorax] = useState(null); 
    const [bidirectionalPoints, setBidirectionalPoints] = useState([]); 
    const [polyPoints, setPolyPoints] = useState([]); 

    const activeImage = images && images.length > 0 ? images[activeIndex] : null;

    // 1. CARGA DE IMAGEN (Con configuración para Screenshots)
    useEffect(() => {
        let isMounted = true;
        const element = viewportRef.current;
        if (!element || !activeImage) return;

        // --- CORRECCIÓN CLAVE AQUÍ ---
        // Habilitamos Cornerstone con opciones para permitir capturas de pantalla
        try { 
            cornerstone.enable(element, {
                renderer: 'webgl', // Forzamos WebGL si es posible
                preserveDrawingBuffer: true // ¡ESTO ES VITAL! Evita que el canvas se borre tras renderizar
            }); 
        } catch (e) {
            // Fallback si la versión de cornerstone es antigua
            try { cornerstone.enable(element); } catch(e){}
        }
        // -----------------------------
        
        setIsImageLoaded(false);

        cornerstone.loadImage(activeImage.imageId).then(image => {
            if (isMounted) {
                cornerstone.displayImage(element, image);
                const viewport = cornerstone.getDefaultViewport(element, image);
                
                viewport.voi.windowWidth = contrast > 0 ? (contrast / 100) * (image.windowWidth || 256) : image.windowWidth;
                viewport.voi.windowCenter = brightness > 0 ? (brightness / 100) * (image.windowCenter || 128) : image.windowCenter;
                viewport.invert = invert;
                viewport.scale = zoom / 100;
                
                cornerstone.setViewport(element, viewport);
                setIsImageLoaded(true);
            }
        }).catch(err => console.error("Error loading image:", err));

        return () => { 
            isMounted = false;
            try { cornerstone.disable(element); } catch(e) {} 
        };
    }, [activeImage]); // Dependencias originales

    // 2. ACTUALIZACIÓN VISUAL
    useEffect(() => {
        const element = viewportRef.current;
        if (!element || !isImageLoaded || !activeImage) return;
        
        if (editMode === 'wwwc') return;

        try {
            const viewport = cornerstone.getViewport(element);
            const image = cornerstone.getImage(element);
            if (!viewport || !image) return;

            if (editMode !== 'panning') {
                viewport.scale = zoom / 100;
                viewport.voi.windowWidth = (contrast / 100) * (image.windowWidth || 256);
                viewport.voi.windowCenter = (brightness / 100) * (image.windowCenter || 128);
                viewport.invert = invert;
                cornerstone.setViewport(element, viewport);
            }
        } catch (e) {}
    }, [zoom, brightness, contrast, invert, isImageLoaded]); 

    // --- HELPERS SEGUROS ---
    const getImagePos = (e) => {
        const element = viewportRef.current;
        if (!element) return { x: 0, y: 0 };
        try {
            const enabledElement = cornerstone.getEnabledElement(element);
            if (!enabledElement || !enabledElement.image) return { x: 0, y: 0 };
            const rect = element.getBoundingClientRect();
            return cornerstone.canvasToPixel(element, { x: e.clientX - rect.left, y: e.clientY - rect.top });
        } catch (error) { return { x: 0, y: 0 }; }
    };

    const toScreen = (imagePoint) => {
        const element = viewportRef.current;
        if (!element || !imagePoint) return { x: 0, y: 0 };
        try { return cornerstone.pixelToCanvas(element, imagePoint); } 
        catch (e) { return { x: 0, y: 0 }; }
    };

    const checkHit = (pos) => {
        const specs = measurements.filter(m => m.imageIndex === activeIndex && m.type === TOOLS.ELLIPSE);
        const screenPos = toScreen(pos); 
        for (let m of specs) {
            if (!m.complexData) continue;
            const { center, radiusX, radiusY } = m.complexData;
            const sCenter = toScreen(center);
            const sRadiusX = Math.abs(toScreen({x: center.x + radiusX, y: center.y}).x - sCenter.x);
            const sRadiusY = Math.abs(toScreen({x: center.x, y: center.y + radiusY}).y - sCenter.y);
            const handles = [{ id: 'center', x: sCenter.x, y: sCenter.y }, { id: 'right',  x: sCenter.x + sRadiusX, y: sCenter.y }, { id: 'bottom', x: sCenter.x, y: sCenter.y + sRadiusY }];
            for (let h of handles) {
                const dist = Math.sqrt(Math.pow(screenPos.x - h.x, 2) + Math.pow(screenPos.y - h.y, 2));
                if (dist < 15) return { found: true, id: m.id, handle: h.id };
            }
        }
        return { found: false };
    };

    // --- HANDLERS DE INTERACCIÓN ---
    const handleMouseDown = (e) => {
        if (!isImageLoaded) return;
        const pos = getImagePos(e);
        const hit = checkHit(pos);

        if (hit.found) {
            setEditMode(hit.handle === 'center' ? 'moving' : 'resizing');
            setActiveEditId(hit.id);
            setResizeHandle(hit.handle);
            setStartPos(pos); 
            return;
        }

        if (activeTool === TOOLS.WWWC) {
            setEditMode('wwwc');
            setDragStart({ x: e.clientX, y: e.clientY });
            try {
                const viewport = cornerstone.getViewport(viewportRef.current);
                setStartLevels({ windowWidth: viewport.voi.windowWidth, windowCenter: viewport.voi.windowCenter });
            } catch(e) {}
            return;
        }

        if (!activeTool || activeTool === TOOLS.NONE) {
            setEditMode('panning');
            setDragStart({ x: e.clientX, y: e.clientY });
            return;
        }

        if (activeTool === TOOLS.POLYLINE) { setPolyPoints(prev => [...prev, pos]); setEditMode('drawing'); return; }
        if (activeTool === TOOLS.ROI) { setPolyPoints([pos]); setEditMode('drawing_freehand'); return; }

        setStartPos(pos); setMousePos(pos); setEditMode('drawing');
        if (activeTool === TOOLS.ICT_COMPLEX && (ictStep === 0 || ictStep === 2)) setIctStep(prev => prev === 0 ? 1 : 3);
    };

    const handleMouseMove = (e) => {
        if (!isImageLoaded) return;
        const currentPos = getImagePos(e);
        setMousePos(currentPos); 

        if (editMode === 'wwwc') {
            const element = viewportRef.current;
            try {
                const viewport = cornerstone.getViewport(element);
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                const currentWidth = viewport.voi.windowWidth;
                const dynamicMultiplier = Math.max(currentWidth / 512, 0.2); 
                viewport.voi.windowWidth = startLevels.windowWidth + (deltaX * dynamicMultiplier);
                viewport.voi.windowCenter = startLevels.windowCenter + (deltaY * dynamicMultiplier);
                cornerstone.setViewport(element, viewport);
            } catch(e) {}
            return;
        }

        if (editMode === 'panning') {
            const element = viewportRef.current;
            try {
                const viewport = cornerstone.getViewport(element);
                const deltaX = e.clientX - dragStart.x;
                const deltaY = e.clientY - dragStart.y;
                viewport.translation.x += (deltaX / viewport.scale);
                viewport.translation.y += (deltaY / viewport.scale);
                cornerstone.setViewport(element, viewport);
                setDragStart({ x: e.clientX, y: e.clientY });
            } catch(e) {}
            return; 
        }

        try {
            const element = viewportRef.current;
            const image = cornerstone.getImage(element);
            const x = Math.floor(currentPos.x);
            const y = Math.floor(currentPos.y);
            if (image && x >= 0 && x < image.width && y >= 0 && y < image.height) {
                const pixelData = image.getPixelData();
                const hu = pixelData[y * image.width + x] * image.slope + image.intercept;
                setHoverData({ x, y, hu: Math.round(hu) });
            } else setHoverData(null);
        } catch(e) { setHoverData(null); }

        if (editMode === 'drawing_freehand' && activeTool === TOOLS.ROI) {
            setPolyPoints(prev => {
                const last = prev[prev.length - 1];
                const dist = Math.sqrt(Math.pow(currentPos.x - last.x, 2) + Math.pow(currentPos.y - last.y, 2));
                return dist > 2 ? [...prev, currentPos] : prev;
            });
        }

        if (activeEditId && editMode && editMode !== 'drawing' && editMode !== 'drawing_freehand') {
            setMeasurements(prev => prev.map(m => {
                if (m.id !== activeEditId) return m;
                const newData = { ...m.complexData };
                if (editMode === 'moving') {
                    newData.center = { x: newData.center.x + (currentPos.x - startPos.x), y: newData.center.y + (currentPos.y - startPos.y) };
                    setStartPos(currentPos); 
                } else if (editMode === 'resizing') {
                    if (resizeHandle.includes('right')) newData.radiusX = Math.abs(currentPos.x - newData.center.x);
                    if (resizeHandle.includes('bottom')) newData.radiusY = Math.abs(currentPos.y - newData.center.y);
                }
                const area = calculateEllipseArea(newData.radiusX, newData.radiusY, images[activeIndex]?.pixelSpacing); 
                return { ...m, value: area, complexData: newData };
            }));
        }
    };

    const handleMouseUp = (e) => {
        if (!isImageLoaded) return;
        
        if (editMode === 'wwwc') {
            try {
                const element = viewportRef.current;
                const viewport = cornerstone.getViewport(element);
                const image = cornerstone.getImage(element);
                if (onLevelsChange && image) {
                    const wPercent = (viewport.voi.windowWidth / (image.windowWidth || 256)) * 100;
                    const cPercent = (viewport.voi.windowCenter / (image.windowCenter || 128)) * 100;
                    onLevelsChange(cPercent, wPercent); 
                }
            } catch(e) {}
            setEditMode(null);
            return;
        }

        if (editMode === 'panning') { setEditMode(null); return; }

        if (editMode === 'drawing_freehand' && activeTool === TOOLS.ROI) {
            if (polyPoints.length > 5) { 
                const area = calculateFreehandArea(polyPoints, activeImage?.pixelSpacing);
                setMeasurements(prev => [...prev, { id: Date.now(), type: TOOLS.ROI, imageIndex: activeIndex, seriesUID: activeImage?.seriesUID, points: polyPoints, value: area }]);
            }
            setPolyPoints([]); setEditMode(null); return;
        }

        if (!editMode) return;
        if (editMode === 'moving' || editMode === 'resizing') { setEditMode(null); setActiveEditId(null); setResizeHandle(null); return; }
        if (activeTool === TOOLS.POLYLINE) return; 

        const finalPos = getImagePos(e);
        const spacing = activeImage?.pixelSpacing || "1\\1";
        const dist = Math.sqrt(Math.pow(finalPos.x - startPos.x, 2) + Math.pow(finalPos.y - startPos.y, 2)).toFixed(1);

        if (activeTool === TOOLS.ANNOTATION && parseFloat(dist) > 20) {
            const text = window.prompt("Ingrese la nota clínica:");
            if (text) saveMeasurement(TOOLS.ANNOTATION, startPos, finalPos, 0, [], false, { text });
        }
        else if (activeTool === TOOLS.ELLIPSE) {
            const rX = Math.abs(finalPos.x - startPos.x) / 2; const rY = Math.abs(finalPos.y - startPos.y) / 2;
            if (rX > 2 && rY > 2) saveMeasurement(TOOLS.ELLIPSE, null, null, calculateEllipseArea(rX, rY, spacing), [], false, { center: { x: (startPos.x + finalPos.x)/2, y: (startPos.y + finalPos.y)/2 }, radiusX: rX, radiusY: rY });
        } 
        else if (activeTool === TOOLS.RECTANGLE) {
            if (Math.abs(finalPos.x - startPos.x) > 5) saveMeasurement(TOOLS.RECTANGLE, startPos, finalPos, calculateRectangleArea(startPos, finalPos, spacing));
        }
        else if (activeTool === TOOLS.ICT_COMPLEX) {
             if (parseFloat(dist) > 5) {
                 if (ictStep === 1) { setTempThorax({ start: startPos, end: finalPos, value: dist }); setIctStep(2); }
                 else if (ictStep === 3 && tempThorax) {
                    const heart = { start: startPos, end: finalPos, value: dist };
                    const pct = calculateCTRPercentage(heart.value, tempThorax.value);
                    saveMeasurement(TOOLS.ICT_COMPLEX, null, null, pct, [], false, { thorax: tempThorax, heart, diagnosis: getClinicalStatusCTR(pct) });
                    setIctStep(0); setTempThorax(null);
                 }
             } else setIctStep(prev => prev === 3 ? 2 : 0);
        }
        else if (activeTool === TOOLS.BIDIRECTIONAL) {
            if (parseFloat(dist) > 5) {
                if (bidirectionalPoints.length === 0) setBidirectionalPoints([{ start: startPos, end: finalPos, value: dist }]);
                else { saveMeasurement(TOOLS.BIDIRECTIONAL, null, null, dist, [], false, { axis1: bidirectionalPoints[0], axis2: { start: startPos, end: finalPos, value: dist } }); setBidirectionalPoints([]); }
            }
        }
        else if (activeTool === TOOLS.RULER || activeTool === TOOLS.ANGLE) {
            if (parseFloat(dist) > 2) saveMeasurement(activeTool, startPos, finalPos, dist);
        }
        setEditMode(null);
    };

    const handleDoubleClick = (e) => {
        if (activeTool === TOOLS.POLYLINE && polyPoints.length > 1) {
            setMeasurements(prev => [...prev, { id: Date.now(), type: TOOLS.POLYLINE, imageIndex: activeIndex, seriesUID: activeImage?.seriesUID, points: polyPoints, value: calculatePolylineLength(polyPoints, activeImage?.pixelSpacing) }]);
            setPolyPoints([]); setEditMode(null);
        }
    };

    const saveMeasurement = (type, start, end, val, points = [], closed = false, complexData = null) => {
        const newM = { id: Date.now(), type, imageIndex: activeIndex, seriesUID: activeImage?.seriesUID || 'unknown', start, end, points, value: val, closed, complexData };
        if (complexData?.text) newM.text = complexData.text;
        setMeasurements(prev => [...prev, newM]);
    };

    const cursorStyle = editMode === 'panning' ? 'cursor-grabbing' : editMode === 'wwwc' ? 'cursor-ns-resize' : (!activeTool || activeTool === TOOLS.NONE) ? 'cursor-grab' : 'cursor-crosshair';

    return (
        <div className={`w-full h-full bg-black relative flex items-center justify-center overflow-hidden select-none ${cursorStyle}`}>
            <div ref={viewportRef} className="w-full h-full relative" 
                onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onDoubleClick={handleDoubleClick} 
            >
                <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none">
                    <defs><filter id="txtShdw"><feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="black"/></filter></defs>
                    {measurements?.filter(m => m.imageIndex === activeIndex).map(m => (
                        <g key={m.id} style={{ pointerEvents: 'auto' }}>
                            {m.type === TOOLS.ELLIPSE && <EllipseTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.RULER && <RulerTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.ANGLE && <AngleTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.ICT_COMPLEX && <IctTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.BIDIRECTIONAL && <BidirectionalTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.POLYLINE && <PolylineTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.ROI && <FreehandTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.RECTANGLE && <RectangleTool measurement={m} toScreen={toScreen} />}
                            {m.type === TOOLS.ANNOTATION && <AnnotationTool measurement={m} toScreen={toScreen} />}
                        </g>
                    ))}
                    {editMode === 'drawing' && activeTool !== TOOLS.NONE && activeTool !== TOOLS.ROI && activeTool !== TOOLS.POLYLINE && (
                        activeTool === TOOLS.ELLIPSE || activeTool === TOOLS.RECTANGLE ? null :
                        <line x1={toScreen(startPos).x} y1={toScreen(startPos).y} x2={toScreen(mousePos).x} y2={toScreen(mousePos).y} stroke="white" strokeWidth="1" strokeDasharray="4" />
                    )}
                    {editMode === 'drawing' && activeTool === TOOLS.RECTANGLE && (
                        <rect x={Math.min(toScreen(startPos).x, toScreen(mousePos).x)} y={Math.min(toScreen(startPos).y, toScreen(mousePos).y)} width={Math.abs(toScreen(mousePos).x - toScreen(startPos).x)} height={Math.abs(toScreen(mousePos).y - toScreen(startPos).y)} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4"/>
                    )}
                    {editMode === 'drawing' && activeTool === TOOLS.ELLIPSE && (
                        <ellipse cx={toScreen({x: (startPos.x + mousePos.x)/2, y: (startPos.y + mousePos.y)/2}).x} cy={toScreen({x: (startPos.x + mousePos.x)/2, y: (startPos.y + mousePos.y)/2}).y} rx={Math.abs(toScreen(mousePos).x - toScreen(startPos).x)/2} ry={Math.abs(toScreen(mousePos).y - toScreen(startPos).y)/2} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4"/>
                    )}
                    {(activeTool === TOOLS.POLYLINE || (activeTool === TOOLS.ROI && editMode === 'drawing_freehand')) && polyPoints.length > 0 && (
                        <polyline points={polyPoints.map(p => { const s = toScreen(p); return `${s.x},${s.y}`; }).join(' ') + (activeTool === TOOLS.POLYLINE ? ` ${toScreen(mousePos).x},${toScreen(mousePos).y}` : '')} fill="none" stroke={activeTool === TOOLS.ROI ? "#eab308" : "#f97316"} strokeWidth="2" strokeDasharray={activeTool === TOOLS.POLYLINE ? "4" : "0"}/>
                    )}
                    {ictStep === 2 && tempThorax && <line x1={toScreen(tempThorax.start).x} y1={toScreen(tempThorax.start).y} x2={toScreen(tempThorax.end).x} y2={toScreen(tempThorax.end).y} stroke="#60a5fa" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />}
                    {activeTool === TOOLS.BIDIRECTIONAL && bidirectionalPoints.length > 0 && <line x1={toScreen(bidirectionalPoints[0].start).x} y1={toScreen(bidirectionalPoints[0].start).y} x2={toScreen(bidirectionalPoints[0].end).x} y2={toScreen(bidirectionalPoints[0].end).y} stroke="#a855f7" strokeWidth="2" opacity="0.8" />}
                </svg>
                {hoverData && (
                    <div className="absolute z-50 pointer-events-none flex flex-col gap-0.5 bg-black/80 backdrop-blur-sm border border-gray-700 p-2 rounded-lg shadow-xl text-[10px] font-mono leading-tight text-white" style={{ left: toScreen(hoverData).x + 20, top: toScreen(hoverData).y + 20 }}>
                        <div className="flex items-center gap-2"><span className="text-gray-400 font-bold">HU:</span><span className={`font-black text-sm ${hoverData.hu > 400 ? 'text-amber-400' : hoverData.hu < -500 ? 'text-cyan-400' : 'text-white'}`}>{hoverData.hu}</span></div>
                        <div className="text-gray-500">X:{hoverData.x} Y:{hoverData.y}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DicomViewer;