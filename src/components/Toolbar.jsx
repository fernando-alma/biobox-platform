import React from "react";
import { 
  Ruler, Triangle, Square, Type, RotateCw, 
  Trash2, ZoomIn, ZoomOut, Play, Pause, 
  RefreshCw, Activity, Crosshair, Sun, Moon, Cloud, Circle,
  Waypoints, PenTool, Database, SunMedium, Layers, Camera // <--- 1. Importar Icono Camera
} from "lucide-react";
import { TOOLS } from "../utils/constants";

const Toolbar = ({ 
  activeTool, onToolChange, onClearMeasurements, 
  onRotate, onReset, 
  zoom, onZoomChange,
  isCinePlaying, onToggleCine,
  onApplyPreset,
  onOpenTags,
  onOpenMpr,
  onScreenshot // <--- 2. Recibir la función aquí
}) => {
  
  const tools = [
    { id: TOOLS.WWWC, name: "Ajuste W/L", icon: SunMedium, description: "Brillo y Contraste" },
    { id: TOOLS.RULER, name: "Regla", icon: Ruler, description: "Medir distancias" },
    { id: TOOLS.POLYLINE, name: "Polilínea", icon: Waypoints, description: "Medición Multi-segmento" },
    { id: TOOLS.ANGLE, name: "Cobb", icon: Triangle, description: "Ángulo de Cobb" },
    { id: TOOLS.ROI, name: "Lápiz ROI", icon: PenTool, description: "Dibujo libre" },
    { id: TOOLS.RECTANGLE, name: "Rectángulo", icon: Square, description: "ROI Rectangular" },
    { id: TOOLS.ELLIPSE, name: "Elipse", icon: Circle, description: "ROI Circular" },
    { id: TOOLS.BIDIRECTIONAL, name: "Bidireccional", icon: Crosshair, description: "Tumoral" },
    { id: TOOLS.ICT_COMPLEX, name: 'ICT Auto', icon: Activity, description: "Índice Cardiotorácico" },
    { id: TOOLS.ANNOTATION, name: "Texto", icon: Type, description: "Notas" },
  ];

  const presets = [
    { name: "Cerebro", center: 40, width: 80, icon: Moon, color: "text-blue-400" },
    { name: "Pulmón", center: -600, width: 1500, icon: Cloud, color: "text-cyan-400" },
    { name: "Hueso", center: 480, width: 2500, icon: Sun, color: "text-amber-400" },
  ];

  return (
    <div className="w-16 bg-gray-900 border-r border-blue-900/30 flex flex-col items-center py-4 gap-3 shadow-2xl z-40 relative h-full overflow-y-auto no-scrollbar">
      
      {/* ZOOM */}
      <div className="flex flex-col items-center bg-gray-800/50 rounded-xl p-1 gap-1 border border-gray-700">
        <button onClick={() => onZoomChange && onZoomChange(Math.min(zoom + 10, 400))} className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-400 hover:text-white"><ZoomIn className="w-4 h-4" /></button>
        <span className="text-[9px] font-black text-gray-400">{zoom}%</span>
        <button onClick={() => onZoomChange && onZoomChange(Math.max(zoom - 10, 10))} className="p-2 hover:bg-blue-600 rounded-lg transition-colors text-blue-400 hover:text-white"><ZoomOut className="w-4 h-4" /></button>
      </div>

      <div className="w-8 border-t border-gray-800" />

      {/* HERRAMIENTAS */}
      <div className="flex flex-col gap-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id} 
              onClick={() => onToolChange && onToolChange(isActive ? TOOLS.NONE : tool.id)}
              className={`group relative p-2.5 rounded-xl transition-all ${
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              title={tool.description}
            >
              <Icon className="w-5 h-5" />
              <div className="absolute left-14 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl border border-gray-700 font-bold uppercase tracking-widest transition-opacity">
                {tool.name}
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-8 border-t border-gray-800" />

      {/* PRESETS */}
      <div className="flex flex-col gap-2">
        {presets.map((p) => (
          <button
            key={p.name} 
            onClick={() => onApplyPreset && onApplyPreset(p.center, p.width)}
            className={`group relative p-2.5 bg-gray-800 ${p.color} hover:bg-gray-700 rounded-xl transition-all border border-transparent hover:border-gray-600`}
            title={`Preset ${p.name}`}
          >
            <p.icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      <div className="w-8 border-t border-gray-800" />

      {/* ACCIONES */}
      <div className="flex flex-col gap-2 pb-6">
        
        {/* BOTÓN MPR */}
        <button 
          onClick={onOpenMpr} 
          className="p-2.5 bg-indigo-900/50 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all border border-indigo-900/30 group relative"
        >
          <Layers className="w-5 h-5" />
          <div className="absolute left-14 bg-indigo-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl font-bold uppercase tracking-widest transition-opacity">
             RECONSTRUCCIÓN 3D
          </div>
        </button>

        {/* --- 3. NUEVO: BOTÓN CÁMARA --- */}
        <button 
          onClick={onScreenshot} 
          className="p-2.5 bg-gray-800 text-teal-400 hover:bg-teal-600 hover:text-white rounded-xl transition-all border border-teal-900/30 group relative"
        >
          <Camera className="w-5 h-5" />
          <div className="absolute left-14 bg-teal-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none shadow-xl font-bold uppercase tracking-widest transition-opacity">
             CAPTURAR IMAGEN
          </div>
        </button>
        {/* --------------------------- */}

        <button onClick={onOpenTags} className="p-2.5 bg-gray-800 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-900/30">
          <Database className="w-5 h-5" />
        </button>
        <button onClick={onToggleCine} className={`p-2.5 rounded-xl transition-all ${isCinePlaying ? "bg-green-600 text-white animate-pulse" : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800"}`}>
          {isCinePlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button onClick={onRotate} className="p-2.5 bg-gray-900 text-gray-400 hover:bg-purple-600 hover:text-white rounded-xl transition-all border border-gray-800">
          <RotateCw className="w-5 h-5" />
        </button>
        <button onClick={onReset} className="p-2.5 bg-gray-900 text-gray-400 hover:bg-gray-800 rounded-xl transition-all border border-gray-800">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={() => { if(window.confirm("¿Eliminar todas las mediciones?")) onClearMeasurements(); }} className="p-2.5 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-900/30">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;