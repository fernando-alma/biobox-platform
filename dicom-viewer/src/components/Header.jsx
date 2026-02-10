import React from "react";
import { Activity, Upload, Monitor, Square, LayoutGrid, Grid, Grid3X3, Database } from "lucide-react";

const Header = ({ 
  patientData,          // Datos del paciente (Vienen de App.jsx)
  currentLayout,        // Estado de la grilla (Viene de App.jsx)
  onLayoutChange,       // Función para cambiar grilla
  onTriggerFile,        // Función para abrir el selector de archivos de App.jsx
  onShowTags,           // Función para abrir el TagBrowser
  onTogglePresent       // Función (Opcional) para modo presentación
}) => {

  // Helper para pintar el botón activo
  const isActive = (r, c) => currentLayout?.rows === r && currentLayout?.cols === c;

  return (
    <header className="bg-gray-900 border-b border-blue-900/30 px-6 py-3 flex items-center justify-between z-50 shadow-lg">
      
      {/* 1. LOGO Y BOTÓN DE CARGA */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">BioBox Med</h1>
            <p className="text-[10px] text-gray-400 font-mono tracking-widest">DICOM VIEWER</p>
          </div>
        </div>

        <button 
          onClick={onTriggerFile} // <--- Conectado a App.jsx (Input oculto)
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95 border border-blue-400/20"
        >
          <Upload className="w-4 h-4" /> ABRIR ESTUDIO
        </button>
      </div>

      {/* 2. INFO PACIENTE (Si existe) */}
      <div className="hidden md:flex flex-col items-center">
         {patientData?.name !== "Sin Estudio" && (
             <>
                <span className="text-sm font-bold text-gray-200">{patientData.name}</span>
                <span className="text-[10px] text-gray-500 font-mono">{patientData.id} | {patientData.studyDate}</span>
             </>
         )}
      </div>

      {/* 3. HERRAMIENTAS DE HEADER */}
      <div className="flex items-center gap-4">
        
        {/* BOTÓN TAG BROWSER */}
        <button 
          onClick={onShowTags}
          className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-white text-[10px] font-bold rounded-lg border border-gray-700 transition-all"
          title="Inspeccionar Metadatos DICOM"
        >
          <Database className="w-4 h-4" /> METADATOS
        </button>

        <div className="h-6 w-px bg-gray-800" />

        {/* GRILLA DE LAYOUTS */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800 gap-1">
          <button 
            onClick={() => onLayoutChange(1, 1)}
            className={`p-2 rounded-lg transition-all ${isActive(1, 1) ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-gray-800"}`}
            title="Vista 1x1"
          >
            <Square className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => onLayoutChange(1, 2)}
            className={`p-2 rounded-lg transition-all ${isActive(1, 2) ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-gray-800"}`}
            title="Vista 1x2"
          >
            <LayoutGrid className="w-4 h-4 rotate-90" />
          </button>

          <button 
            onClick={() => onLayoutChange(2, 2)}
            className={`p-2 rounded-lg transition-all ${isActive(2, 2) ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-gray-800"}`}
            title="Vista 2x2"
          >
            <Grid className="w-4 h-4" />
          </button>

          <button 
            onClick={() => onLayoutChange(2, 3)}
            className={`p-2 rounded-lg transition-all ${isActive(2, 3) ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-gray-800"}`}
            title="Vista 2x3"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
        </div>

        {onTogglePresent && (
            <>
                <div className="h-8 w-px bg-gray-800" />
                <button onClick={onTogglePresent} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-gray-400 border border-gray-700 transition-all hover:text-white">
                <Monitor className="w-5 h-5" />
                </button>
            </>
        )}
      </div>
    </header>
  );
};

export default Header;