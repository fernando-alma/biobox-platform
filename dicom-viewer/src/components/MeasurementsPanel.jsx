import React, { useState } from 'react';
import { TOOLS } from '../utils/constants';
import { generateDicomReport } from '../utils/pdfGenerator';
import { 
    Trash2, FileText, Ruler, Triangle, Square, Info, 
    Crosshair, Activity, Brain, ChevronRight, X,
    Waypoints, PenTool, Circle, Type // <--- AGREGADO: Icono Type
} from 'lucide-react';

const MeasurementsPanel = ({ measurements, activeIndex, setMeasurements, patientInfo }) => {
    // Filtramos medidas por la imagen activa
    const currentSpecs = (measurements || []).filter(m => m.imageIndex === activeIndex);

    const removeMeasure = (id) => {
        setMeasurements(prev => prev.filter(m => m.id !== id));
    };

    const clearAll = () => {
        if (window.confirm("¿Borrar todas las mediciones de esta imagen?")) {
            setMeasurements(prev => prev.filter(m => m.imageIndex !== activeIndex));
        }
    };

    const safeFormat = (val, decimals = 1) => {
        const num = parseFloat(val);
        return isNaN(num) ? "0.0" : num.toFixed(decimals);
    };

    // --- RENDERIZADO LÓGICO DE ICONOS Y COLORES ---
    const renderMeasureDetails = (m) => {
        switch (m.type) {
            case TOOLS.RULER:
                return { label: 'Regla', value: `${safeFormat(m.value)} mm`, color: 'text-cyan-400', Icon: Ruler };
            
            case TOOLS.ANGLE:
                return { label: 'Ángulo Cobb', value: `${safeFormat(m.value)}°`, color: 'text-emerald-400', Icon: Triangle };
            
            case TOOLS.RECTANGLE:
                return { label: 'Rectángulo', value: `${safeFormat(m.value, 1)} mm²`, color: 'text-sky-400', Icon: Square };
            
            case TOOLS.ROI: 
                return { label: 'Lápiz ROI', value: `${safeFormat(m.value, 1)} mm²`, color: 'text-amber-400', Icon: PenTool };
            
            case TOOLS.ELLIPSE:
                return { label: 'Elipse ROI', value: `${safeFormat(m.value, 1)} mm²`, color: 'text-yellow-400', Icon: Circle };
            
            case TOOLS.POLYLINE:
                return { label: 'Polilínea', value: `${safeFormat(m.value)} mm`, color: 'text-orange-400', Icon: Waypoints };

            // --- NUEVO CASO: ANOTACIÓN ---
            case TOOLS.ANNOTATION:
                return { label: 'Nota', value: m.text || "...", color: 'text-pink-400', Icon: Type };

            case TOOLS.BIDIRECTIONAL:
                return { 
                    label: 'Bidireccional', 
                    value: m.complexData ? `${m.complexData.axis1.value}x${m.complexData.axis2.value} mm` : `${m.value} mm`, 
                    color: 'text-purple-400', 
                    Icon: Crosshair 
                };

            case TOOLS.ICT_COMPLEX:
                return { label: 'Índice CTR', value: `${m.value}%`, color: 'text-blue-400', Icon: Activity };
            
            default:
                return { label: 'Medida', value: `${m.value}`, color: 'text-gray-400', Icon: Ruler };
        }
    };

    return (
        <div className="p-4 bg-gray-950 text-white h-full flex flex-col border-l border-blue-900/20 shadow-2xl overflow-hidden font-sans">
            {/* Header Profesional */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1">Análisis Técnico</h3>
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-bold text-gray-200 uppercase">BioBox Diagnostic</span>
                    </div>
                </div>
                {currentSpecs.length > 0 && (
                    <button onClick={clearAll} className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-xl transition-all duration-300">
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Listado de Hallazgos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
                {currentSpecs.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-3xl opacity-30">
                        <Info className="w-8 h-8 mb-2" />
                        <p className="text-[10px] uppercase font-bold tracking-widest text-center px-4">Esperando hallazgos...</p>
                    </div>
                ) : (
                    currentSpecs.map(m => {
                        const detail = renderMeasureDetails(m);
                        return (
                            <div key={m.id} className="bg-gray-900/50 border border-gray-800 hover:border-blue-500/50 p-4 rounded-2xl transition-all group relative">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className={`p-2 rounded-lg bg-black/40 ${detail.color}`}>
                                            <detail.Icon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-wider mb-0.5">{detail.label}</p>
                                            <p className={`text-lg font-black tracking-tighter ${detail.color}`}>{detail.value}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeMeasure(m.id)} className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-500 p-1 transition-all">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {/* Badge de Estado para ICT */}
                                {m.type === TOOLS.ICT_COMPLEX && m.complexData?.diagnosis && (
                                    <div className="mt-3 flex items-center gap-2 bg-black/30 p-2 rounded-xl border border-gray-800">
                                        <div className="w-2 h-2 rounded-full animate-pulse" style={{backgroundColor: m.complexData.diagnosis.color}} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{color: m.complexData.diagnosis.color}}>
                                            {m.complexData.diagnosis.label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bloque de Acción Final (Reporte) */}
            <div className="mt-6 pt-6 border-t border-gray-900">
                <button 
                    disabled={currentSpecs.length === 0}
                    onClick={() => generateDicomReport(patientInfo, measurements, activeIndex)}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-600 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/20 group"
                >
                    <FileText className="w-4 h-4" /> 
                    Exportar Informe PDF
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[8px] text-gray-600 mt-4 text-center uppercase font-bold tracking-widest">
                    Validez diagnóstica sujeta a revisión clínica
                </p>
            </div>
        </div>
    );
};

export default MeasurementsPanel;