import React, { useRef, useEffect, useState } from "react";
import { TOOLS } from "../utils/constants";

// --- UTILIDADES MATEMÁTICAS PARA ICT ---
const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const getPerpendicularDist = (p, lineStart, lineEnd) => {
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;
  const { x: x0, y: y0 } = p;
  
  if (x1 === x2 && y1 === y2) return { distance: 0, intersection: lineStart };

  const numerator = Math.abs((x2 - x1) * (y1 - y0) - (x1 - x0) * (y2 - y1));
  const denominator = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  const distance = numerator / denominator;

  // Proyección para encontrar el punto de intersección
  const u = ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / (denominator * denominator);
  const intersection = {
    x: x1 + u * (x2 - x1),
    y: y1 + u * (y2 - y1)
  };

  return { distance, intersection };
};

// Constante de calibración (Simulación: 1 px = 0.5 mm)
const PIXEL_SPACING = 0.5;

const Viewport = ({
  imageUrl,
  imageIndex,
  activeTool,
  zoom,
  rotation,
  brightness,
  contrast,
  measurements,
  onAddMeasurement,
  onSelect,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Estados de Panning
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPanPoint, setStartPanPoint] = useState({ x: 0, y: 0 });

  // Estados de Dibujo Genérico
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [currentPoint, setCurrentPoint] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- ESTADO ESPECÍFICO PARA ICT ---
  const [ictState, setIctState] = useState({
    step: 0, // 0: Midline, 1: Thorax, 2: HeartRight, 3: HeartLeft
    midline: null, // { start, end }
    thorax: null,  // { start, end }
    heartRight: null, // { point, intersection, distance }
  });

  // Resetear estado ICT si cambia la herramienta
  useEffect(() => {
    if (activeTool !== TOOLS.ICT) {
      setIctState({ step: 0, midline: null, thorax: null, heartRight: null });
    }
  }, [activeTool]);

  // --- 1. SETUP ---

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        if (imageLoaded) requestAnimationFrame(drawCanvas);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [imageLoaded, zoom, rotation, pan]);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      setPan({ x: 0, y: 0 });
      drawCanvas();
    };
    img.onerror = () => console.error(`❌ Error img: ${imageUrl}`);
  }, [imageUrl]);

  useEffect(() => {
    if (imageLoaded) drawCanvas();
  }, [zoom, rotation, brightness, contrast, measurements, currentPoint, points, pan, ictState]);


  // --- 2. MATRICES ---
  
  const getTransformMatrix = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return new DOMMatrix();

    const matrix = new DOMMatrix();
    matrix.translateSelf(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y);
    matrix.rotateSelf(rotation);
    const safeZoom = Math.max(zoom, 1); 
    matrix.scaleSelf(safeZoom / 100, safeZoom / 100);
    matrix.translateSelf(-img.width / 2, -img.height / 2);

    return matrix;
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    try {
        const matrix = getTransformMatrix();
        const inverse = matrix.inverse();
        const point = new DOMPoint(x, y);
        const transformedPoint = point.matrixTransform(inverse);
        return { x: transformedPoint.x, y: transformedPoint.y };
    } catch (error) {
        return { x: 0, y: 0 };
    }
  };


  // --- 3. DIBUJO ---

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;

    if (!canvas || !ctx || !img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    const matrix = getTransformMatrix();
    ctx.setTransform(matrix);

    // Imagen
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    const safeZoom = Math.max(zoom, 1);
    const currentScale = safeZoom / 100;
    const markerSize = 6 / currentScale;
    
    ctx.lineWidth = 2 / currentScale;
    ctx.shadowBlur = 0;

    // A. Dibujar Mediciones Guardadas
    const myMeasurements = measurements.filter(m => m.imageIndex === imageIndex);
    myMeasurements.forEach(m => {
        try { drawMeasurement(ctx, m, false, currentScale, markerSize); } catch (e) {}
    });

    // B. Dibujar Herramienta Genérica Activa (Regla, Angulo, ROI)
    if (activeTool !== TOOLS.ICT && points.length > 0 && currentPoint) {
      const tempMeasurement = {
        type: activeTool,
        points: [...points, currentPoint],
      };
      try { drawMeasurement(ctx, tempMeasurement, true, currentScale, markerSize); } catch (e) {}
    }

    // C. Dibujar Estado ICT Activo (Pasos intermedios)
    if (activeTool === TOOLS.ICT) {
        drawActiveICT(ctx, currentScale, markerSize);
    }

    ctx.restore();
  };

  // Función específica para dibujar el estado PROGRESIVO del ICT
  const drawActiveICT = (ctx, scale, markerSize) => {
      const fontSize = Math.max(12, 14 / scale);
      ctx.font = `bold ${fontSize}px Arial`;

      // 1. Línea Media (Si existe o se está dibujando)
      let midStart = ictState.midline?.start;
      let midEnd = ictState.midline?.end;
      
      // Si estamos en el paso 0 y dibujando, usar puntos temporales
      if (ictState.step === 0 && isDrawing && points.length > 0 && currentPoint) {
          midStart = points[0];
          midEnd = currentPoint;
      }

      if (midStart && midEnd) {
          ctx.beginPath();
          ctx.strokeStyle = "#06b6d4"; // Cyan
          ctx.setLineDash([5/scale, 5/scale]);
          ctx.moveTo(midStart.x, midStart.y);
          ctx.lineTo(midEnd.x, midEnd.y);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.fillStyle = "#06b6d4";
          ctx.fillText("Media", midEnd.x + 10/scale, midEnd.y);
      }

      // 2. Tórax (C)
      let thoraxStart = ictState.thorax?.start;
      let thoraxEnd = ictState.thorax?.end;

      if (ictState.step === 1 && isDrawing && points.length > 0 && currentPoint) {
          thoraxStart = points[0];
          thoraxEnd = currentPoint;
      }

      if (thoraxStart && thoraxEnd) {
          ctx.beginPath();
          ctx.strokeStyle = "#22c55e"; // Green
          ctx.moveTo(thoraxStart.x, thoraxStart.y);
          ctx.lineTo(thoraxEnd.x, thoraxEnd.y);
          ctx.stroke();
          ctx.fillStyle = "#22c55e";
          ctx.fillText("C (Tórax)", thoraxEnd.x + 10/scale, thoraxEnd.y);
      }

      // 3. Corazón Derecho (A)
      if (ictState.heartRight) {
           const { point, intersection } = ictState.heartRight;
           ctx.beginPath();
           ctx.strokeStyle = "#ef4444"; // Red
           ctx.moveTo(point.x, point.y);
           ctx.lineTo(intersection.x, intersection.y);
           ctx.stroke();
           ctx.fillStyle = "#ef4444";
           ctx.fillRect(point.x - markerSize/2, point.y - markerSize/2, markerSize, markerSize);
           ctx.fillText("A", point.x - 10/scale, point.y);
      }

      // Feedback de Texto (Instrucciones)
      // Dibujamos esto en coordenadas de pantalla, no de imagen, pero dentro del canvas es complejo.
      // Lo ideal es dibujarlo cerca del mouse o en una esquina fija transformada.
      // Aquí simplificado:
      /* if (midStart) {
          ctx.fillStyle = "white";
          ctx.fillText(
            ictState.step === 0 ? "Traza Línea Media" : 
            ictState.step === 1 ? "Traza Diámetro Tórax" : 
            ictState.step === 2 ? "Click Borde Derecho" : "Click Borde Izquierdo", 
            midStart.x, midStart.y - 20/scale
          );
      }
      */
  };

  const drawMeasurement = (ctx, measurement, isTemporary, scale, markerSize) => {
    ctx.save();
    const color = isTemporary ? "#00ff00" : (measurement.type === TOOLS.ICT ? "#d946ef" : "#00ffff"); 
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    
    // CASO ESPECIAL: ICT GUARDADO
    if (measurement.type === TOOLS.ICT) {
        const d = measurement.drawingData;
        if (d) {
            // Re-dibujar Línea Media
            ctx.strokeStyle = "#06b6d4"; ctx.setLineDash([5/scale, 5/scale]);
            ctx.beginPath(); ctx.moveTo(d.midline.start.x, d.midline.start.y); ctx.lineTo(d.midline.end.x, d.midline.end.y); ctx.stroke();
            
            // Re-dibujar Tórax
            ctx.strokeStyle = "#22c55e"; ctx.setLineDash([]);
            ctx.beginPath(); ctx.moveTo(d.thorax.start.x, d.thorax.start.y); ctx.lineTo(d.thorax.end.x, d.thorax.end.y); ctx.stroke();

            // Re-dibujar A y B
            ctx.strokeStyle = "#ef4444";
            [d.heartRight, d.heartLeft].forEach((side, idx) => {
                if(side) {
                    ctx.beginPath(); ctx.moveTo(side.point.x, side.point.y); ctx.lineTo(side.intersection.x, side.intersection.y); ctx.stroke();
                    ctx.fillText(idx === 0 ? "A" : "B", side.point.x, side.point.y - 10/scale);
                }
            });

            // Etiqueta Final ICT
            if (!isTemporary) {
                const labelX = d.midline.start.x;
                const labelY = d.midline.start.y;
                const label = `ICT: ${measurement.value}`;
                
                // Fondo etiqueta
                ctx.fillStyle = "rgba(0,0,0,0.8)";
                const metrics = ctx.measureText(label);
                ctx.fillRect(labelX, labelY - 20/scale, metrics.width + 10/scale, 20/scale);
                
                ctx.fillStyle = "#d946ef"; // Magenta
                ctx.fillText(label, labelX + 2/scale, labelY - 5/scale);
            }
        }
        ctx.restore();
        return;
    }

    // ... (El resto de tu lógica de RULER, ANGLE, ROI se mantiene igual) ...
    const pts = measurement.points;
    if (!Array.isArray(pts) || pts.length === 0) { ctx.restore(); return; }

    const drawLabel = (text, x, y) => {
        if (!text) return;
        ctx.save();
        const fontSize = Math.max(12, 14 / scale);
        ctx.font = `bold ${fontSize}px Arial`;
        const metrics = ctx.measureText(text);
        const padding = 4 / scale;
        const w = metrics.width + padding * 2;
        const h = fontSize + padding * 2;

        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(x, y - h, w, h);
        
        ctx.fillStyle = isTemporary ? "#00ff00" : "#ffff00";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, x + padding, y - padding/2);
        ctx.restore();
    };

    switch (measurement.type) {
      case TOOLS.RULER:
        if (pts.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          ctx.lineTo(pts[1].x, pts[1].y);
          ctx.stroke();
          ctx.fillRect(pts[0].x - markerSize/2, pts[0].y - markerSize/2, markerSize, markerSize);
          ctx.fillRect(pts[1].x - markerSize/2, pts[1].y - markerSize/2, markerSize, markerSize);
          if (!isTemporary && measurement.value !== undefined) {
             const val = measurement.value || 0;
             drawLabel(`${val.toFixed(1)} mm`, (pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
          }
        }
        break;

      case TOOLS.ANGLE:
        if (pts.length >= 2) {
            const p1 = pts[0]; const p2 = pts[1];
            ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            if (Number.isFinite(5/scale)) {
                ctx.beginPath(); ctx.setLineDash([5/scale, 5/scale]); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p1.x + (50/scale), p1.y); ctx.stroke(); ctx.setLineDash([]);
            }
            const radius = 30 / scale;
            const angleRad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            ctx.beginPath(); ctx.arc(p1.x, p1.y, radius, 0, angleRad, angleRad < 0); ctx.stroke();
            ctx.fillRect(p1.x - markerSize/2, p1.y - markerSize/2, markerSize, markerSize);
            ctx.fillRect(p2.x - markerSize/2, p2.y - markerSize/2, markerSize, markerSize);
            if (!isTemporary && measurement.value !== undefined) {
                const val = measurement.value || 0;
                drawLabel(`${Math.abs(val).toFixed(1)}°`, p1.x + radius + (10/scale), p1.y);
            }
        }
        break;
        
      case TOOLS.ROI:
        if (pts.length >= 2) {
            const w = pts[1].x - pts[0].x; const h = pts[1].y - pts[0].y;
            if (Number.isFinite(5/scale)) {
                ctx.setLineDash([5/scale, 5/scale]); ctx.strokeRect(pts[0].x, pts[0].y, w, h); ctx.setLineDash([]);
            } else { ctx.strokeRect(pts[0].x, pts[0].y, w, h); }
            ctx.globalAlpha = 0.2; ctx.fillRect(pts[0].x, pts[0].y, w, h); ctx.globalAlpha = 1.0;
            if (!isTemporary && measurement.stats) {
                const area = measurement.stats.area || 0; 
                drawLabel(`Área: ${area.toFixed(1)} mm²`, pts[0].x, pts[0].y);
            }
        }
        break;

      case TOOLS.ANNOTATION:
        if (pts.length >= 1) {
            ctx.fillRect(pts[0].x - markerSize/2, pts[0].y - markerSize/2, markerSize, markerSize);
            if (measurement.text) drawLabel(measurement.text, pts[0].x, pts[0].y);
        }
        break;
    }
    ctx.restore();
  };


  // --- 4. INTERACCIÓN ---

  const handleMouseDown = (e) => {
    if (onSelect) onSelect();
    const pos = getMousePos(e);

    // LOGICA ICT: PASOS 0 y 1 (Dibujar líneas)
    if (activeTool === TOOLS.ICT) {
        if (ictState.step <= 1) {
            setPoints([pos]);
            setIsDrawing(true);
            setCurrentPoint(pos);
        }
        return;
    }

    // LOGICA GENERAL
    if (activeTool === TOOLS.NONE) {
      setIsPanning(true);
      setStartPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    if (activeTool === TOOLS.ANNOTATION) return; 

    setPoints([pos]);
    setIsDrawing(true);
    setCurrentPoint(pos);
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - startPanPoint.x; const dy = e.clientY - startPanPoint.y;
      setPan(prev => ({ x: prev.x + dx, y: prev.y + dy })); setStartPanPoint({ x: e.clientX, y: e.clientY }); return;
    }
    
    // Solo actualizar currentPoint si estamos dibujando
    if (isDrawing) { 
        const pos = getMousePos(e); 
        setCurrentPoint(pos); 
    }
  };

  const handleMouseUp = (e) => {
    if (isPanning) { setIsPanning(false); return; }
    
    // --- LÓGICA ICT (El corazón de la funcionalidad) ---
    if (activeTool === TOOLS.ICT) {
        const pos = getMousePos(e);

        // Paso 0: Terminar Línea Media
        if (ictState.step === 0 && isDrawing) {
            setIctState(prev => ({ ...prev, step: 1, midline: { start: points[0], end: pos } }));
            setIsDrawing(false); setPoints([]);
        }
        // Paso 1: Terminar Tórax
        else if (ictState.step === 1 && isDrawing) {
            setIctState(prev => ({ ...prev, step: 2, thorax: { start: points[0], end: pos } }));
            setIsDrawing(false); setPoints([]);
        }
        // Paso 2: Click Lado Derecho (A)
        else if (ictState.step === 2) {
             const { distance, intersection } = getPerpendicularDist(pos, ictState.midline.start, ictState.midline.end);
             // Convertir px a mm
             const distMm = distance * PIXEL_SPACING;
             setIctState(prev => ({ 
                 ...prev, 
                 step: 3, 
                 heartRight: { point: pos, intersection, distance: distMm } 
             }));
        }
        // Paso 3: Click Lado Izquierdo (B) -> FINALIZAR
        else if (ictState.step === 3) {
            const { distance, intersection } = getPerpendicularDist(pos, ictState.midline.start, ictState.midline.end);
            const distBMm = distance * PIXEL_SPACING;
            
            // CALCULAR ICT FINAL
            const A = ictState.heartRight.distance;
            const B = distBMm;
            const C = getDistance(ictState.thorax.start, ictState.thorax.end) * PIXEL_SPACING;
            
            const ictValue = (A + B) / C;

            const finalMeasurement = {
                type: TOOLS.ICT,
                value: ictValue.toFixed(2), // 0.48
                details: { A, B, C },
                drawingData: {
                    ...ictState,
                    heartLeft: { point: pos, intersection, distance: distBMm }
                }
            };

            onAddMeasurement(finalMeasurement);
            // Reiniciar para siguiente medición
            setIctState({ step: 0, midline: null, thorax: null, heartRight: null });
        }
        return;
    }

    // LOGICA GENERAL (RULER, ANGLE, ETC)
    if (!isDrawing && points.length === 0) return;
    const endPoint = getMousePos(e); const startPoint = points[0];
    
    if (activeTool === TOOLS.RULER || activeTool === TOOLS.ROI || activeTool === TOOLS.ANGLE) {
        let value = 0; let stats = null;
        if (activeTool === TOOLS.RULER) {
            const dx = endPoint.x - startPoint.x; const dy = endPoint.y - startPoint.y;
            value = Math.sqrt(dx * dx + dy * dy) * PIXEL_SPACING;
        } else if (activeTool === TOOLS.ANGLE) {
            const dy = endPoint.y - startPoint.y; const dx = endPoint.x - startPoint.x;
            value = Math.atan2(-dy, dx) * (180 / Math.PI);
        } else if (activeTool === TOOLS.ROI) {
            const w = Math.abs(endPoint.x - startPoint.x); const h = Math.abs(endPoint.y - startPoint.y);
            const areaMm = (w * PIXEL_SPACING) * (h * PIXEL_SPACING);
            stats = { area: areaMm, mean: 0, stdDev: 0 };
        }
        const dist = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2));
        if (dist > 2) { 
            onAddMeasurement({ type: activeTool, points: [startPoint, endPoint], value, stats });
        }
        setIsDrawing(false); setPoints([]); setCurrentPoint(null);
    }
  };

  const handleClick = (e) => {
      if (activeTool === TOOLS.ANNOTATION) {
          const pos = getMousePos(e); const text = prompt("Texto:");
          if (text) { onAddMeasurement({ type: TOOLS.ANNOTATION, points: [pos], text }); }
          setIsDrawing(false); setPoints([]);
      }
      // Nota: Los clicks de ICT los manejo en MouseUp para evitar conflictos
  };

  const getCursor = () => { if (activeTool !== TOOLS.NONE) return "crosshair"; if (isPanning) return "grabbing"; return "grab"; };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ cursor: getCursor() }}
        className="block touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onMouseLeave={() => setIsPanning(false)}
      />
      
      {/* Indicador de Ayuda Flotante para ICT */}
      {activeTool === TOOLS.ICT && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm border border-magenta-500 pointer-events-none">
             {ictState.step === 0 && "1. Arrastra la Línea Media (Columna)"}
             {ictState.step === 1 && "2. Arrastra el Diámetro Torácico (C)"}
             {ictState.step === 2 && "3. Click en Borde Derecho Corazón (A)"}
             {ictState.step === 3 && "4. Click en Borde Izquierdo Corazón (B)"}
          </div>
      )}
    </div>
  );
};

export default Viewport;