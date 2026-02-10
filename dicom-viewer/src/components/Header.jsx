import React from "react";
import { Activity, Upload, Monitor, Square, LayoutGrid, Grid, Grid3X3, Database, ArrowLeft } from "lucide-react";

const Header = ({ 
  patientData,         // Datos del paciente
  currentLayout,       // Estado de la grilla
  onLayoutChange,      // Función para cambiar grilla
  onTriggerFile,       // Función para abrir selector de archivos
  onShowTags,          // Función para abrir TagBrowser
  onTogglePresent,     // Función (Opcional) modo presentación
  onGoBack,            // Función para volver al listado (NUEVA)
  isListView           // Prop para saber si estamos en el listado (NUEVA)
}) => {

  // Helper para pintar el botón activo
  const isActive = (r, c) => currentLayout?.rows === r && currentLayout?.cols === c;

  return (
    <header className="bg-gray-900 border-b border-blue-900/30 px-6 py-3 flex items-center justify-between z-50 shadow-lg">
      
{/* 1. LOGO O BOTÓN DE RETROCESO */}
<div className="flex items-center gap-6">
  {isListView ? (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-600/20 rounded-lg">
        <Activity className="w-6 h-6 text-blue-500" />
      </div>
      <div>
        <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none">BioBox Med</h1>
        <p className="text-[10px] text-gray-400 font-mono tracking-widest">PACS SYSTEM</p>
      </div>
    </div>
  ) : (
    <button 
      onClick={onGoBack}
      className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black rounded-lg transition-all border border-gray-700 group"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
      VOLVER AL PANEL
    </button>
  )}
  {/* EL BOTÓN DE UPLOAD QUE ESTABA AQUÍ HA SIDO ELIMINADO */}
</div>

      {/* 2. INFO PACIENTE */}
      <div className="hidden md:flex flex-col items-center text-center">
         {patientData?.name && patientData?.name !== "Sin Estudio" ? (
             <>
                <span className="text-sm font-bold text-gray-200 uppercase tracking-tight">{patientData.name}</span>
                <span className="text-[10px] text-gray-500 font-mono uppercase">ID: {patientData.id}</span>
             </>
         ) : (
            <span className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">BioBox Med Diagnostic Platform</span>
         )}
      </div>

      {/* 3. HERRAMIENTAS DE CONTROL (Ocultas en modo lista para limpieza) */}
      {!isListView && (
        <div className="flex items-center gap-4">
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
            {[
              { r: 1, c: 1, icon: Square, title: "1x1" },
              { r: 1, c: 2, icon: LayoutGrid, title: "1x2", rotate: true },
              { r: 2, c: 2, icon: Grid, title: "2x2" },
              { r: 2, c: 3, icon: Grid3X3, title: "2x3" }
            ].map((item) => (
              <button 
                key={`${item.r}-${item.c}`}
                onClick={() => onLayoutChange(item.r, item.c)}
                className={`p-2 rounded-lg transition-all ${isActive(item.r, item.c) ? "bg-blue-600 text-white shadow-lg" : "text-gray-500 hover:text-white hover:bg-gray-800"}`}
                title={`Vista ${item.title}`}
              >
                <item.icon className={`w-4 h-4 ${item.rotate ? 'rotate-90' : ''}`} />
              </button>
            ))}
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
      )}
    </header>
  );
};

export default Header;