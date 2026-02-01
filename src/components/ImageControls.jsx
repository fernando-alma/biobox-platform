import React from "react";
import { Sliders, Sun, Moon, Palette } from "lucide-react"; // Importamos Palette

const ImageControls = ({ 
  zoom, onZoomChange, 
  brightness, onBrightnessChange, 
  contrast, onContrastChange, 
  colormap, onColormapChange, // Recibimos las props nuevas
  onReset 
}) => {
  
  // Lista de Colormaps soportados nativamente por Cornerstone
  const colormaps = [
    { id: 'gray', name: 'Original (Gris)' },
    { id: 'hot', name: 'Hot Iron (Fuego)' },
    { id: 'jet', name: 'Jet (Arcoíris)' },
    { id: 'hsv', name: 'HSV (Espectro)' },
    { id: 'cool', name: 'Cool (Azul/Cyan)' },
    { id: 'spring', name: 'Spring (Magenta)' },
    { id: 'summer', name: 'Summer (Verde)' },
    { id: 'autumn', name: 'Autumn (Rojo)' },
    { id: 'winter', name: 'Winter (Hielo)' },
    { id: 'bone', name: 'Bone (Hueso)' },
    { id: 'copper', name: 'Copper (Cobre)' },
  ];

  return (
    <div className="flex flex-col gap-4 text-white text-xs">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-800">
        <Sliders className="w-4 h-4 text-blue-400" />
        <span className="font-bold uppercase tracking-wider text-gray-400">Ajustes de Imagen</span>
      </div>

      {/* --- NUEVO: SELECTOR DE COLOR --- */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-gray-400 flex items-center gap-2">
            <Palette className="w-3 h-3" /> Mapa de Color
          </label>
        </div>
        <select 
          value={colormap} 
          onChange={(e) => onColormapChange(e.target.value)}
          className="w-full bg-gray-950 border border-gray-700 text-white rounded p-2 focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {colormaps.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {/* ------------------------------- */}

      {/* ZOOM */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label className="text-gray-400">Zoom</label>
          <span className="font-mono text-blue-400">{zoom}%</span>
        </div>
        <input 
          type="range" min="10" max="500" value={zoom} 
          onChange={(e) => onZoomChange(parseInt(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>

      {/* BRILLO (LEVEL) */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label className="text-gray-400 flex items-center gap-1"><Sun className="w-3 h-3"/> Brillo</label>
          <span className="font-mono text-yellow-400">{brightness}%</span>
        </div>
        <input 
          type="range" min="0" max="200" value={brightness} 
          onChange={(e) => onBrightnessChange(parseInt(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
      </div>

      {/* CONTRASTE (WIDTH) */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <label className="text-gray-400 flex items-center gap-1"><Moon className="w-3 h-3"/> Contraste</label>
          <span className="font-mono text-gray-300">{contrast}%</span>
        </div>
        <input 
          type="range" min="0" max="200" value={contrast} 
          onChange={(e) => onContrastChange(parseInt(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-gray-500"
        />
      </div>

      <button 
        onClick={onReset}
        className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors border border-gray-700 font-bold"
      >
        RESET
      </button>
    </div>
  );
};

export default ImageControls;