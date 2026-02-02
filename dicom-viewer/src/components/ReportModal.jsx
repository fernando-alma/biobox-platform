import React, { useState } from "react";
import { X, FileText, Download, Trash2, ImageIcon, Ruler, Edit3, Eye, MessageSquare } from "lucide-react";

const ReportModal = ({ 
    onClose, 
    patientInfo, 
    onGenerate, 
    capturedImages, 
    setCapturedImages 
}) => {
    const [findings, setFindings] = useState("");
    const [previewMode, setPreviewMode] = useState(false);
    const [selectedEvidence, setSelectedEvidence] = useState(null);

    // Eliminar una evidencia
    const removeImage = (idToRemove) => {
        setCapturedImages(prev => prev.filter((item) => item.id !== idToRemove));
        if (selectedEvidence?.id === idToRemove) {
            setSelectedEvidence(null);
        }
    };

    // Ver evidencia en detalle
    const viewEvidenceDetail = (evidence) => {
        setSelectedEvidence(evidence);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
                
                {/* ========================================
                    HEADER
                ======================================== */}
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600/20 rounded-2xl">
                            <FileText className="text-blue-500 w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">
                                Generar Informe Médico
                            </h2>
                            <p className="text-xs text-gray-400 font-mono">
                                Revisión de Evidencias Clínicas
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* ========================================
                    BODY - Layout con 2 columnas
                ======================================== */}
                <div className="flex-1 overflow-y-auto flex gap-4 p-6 custom-scrollbar">
                    
                    {/* COLUMNA IZQUIERDA: Formulario */}
                    <div className="flex-1 space-y-6">
                        
                        {/* Datos del Paciente */}
                        <div className="p-5 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-lg">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                <h3 className="text-sm font-black text-blue-400 uppercase tracking-wider">
                                    Información del Paciente
                                </h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                                        Nombre Completo
                                    </p>
                                    <p className="text-base text-white font-bold">
                                        {patientInfo.name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                                        ID del Estudio
                                    </p>
                                    <p className="text-sm text-gray-300 font-mono">
                                        {patientInfo.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                                        Fecha del Reporte
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        {new Date().toLocaleDateString('es-AR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">
                                        Total Evidencias
                                    </p>
                                    <p className="text-sm text-blue-400 font-bold">
                                        {capturedImages.length} imágenes
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Campo de Hallazgos Médicos */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs text-gray-400 font-black uppercase flex items-center gap-2">
                                    <Edit3 size={14} className="text-blue-500" />
                                    Informe Médico - Hallazgos Generales
                                </label>
                                <button
                                    onClick={() => setPreviewMode(!previewMode)}
                                    className="text-xs text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    {previewMode ? (
                                        <>
                                            <Edit3 size={12} /> Editar
                                        </>
                                    ) : (
                                        <>
                                            <Eye size={12} /> Vista Previa
                                        </>
                                    )}
                                </button>
                            </div>

                            {previewMode ? (
                                <div className="w-full min-h-[180px] bg-white border-2 border-gray-300 rounded-2xl p-6 text-gray-800 text-sm shadow-inner">
                                    {findings ? (
                                        <div className="whitespace-pre-wrap">{findings}</div>
                                    ) : (
                                        <p className="text-gray-400 italic">
                                            Sin hallazgos registrados. El médico podrá completar esta sección manualmente en el documento impreso.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={findings}
                                    onChange={(e) => setFindings(e.target.value)}
                                    placeholder="Escriba aquí los hallazgos médicos, diagnóstico preliminar, observaciones clínicas, recomendaciones, etc.&#10;&#10;Ejemplo:&#10;- Se observa opacidad en lóbulo superior derecho compatible con proceso inflamatorio.&#10;- Índice cardiotorácico dentro de límites normales (48%).&#10;- Recomendación: Control radiográfico en 7 días."
                                    className="w-full h-48 bg-gray-950 border-2 border-gray-700 rounded-2xl p-4 text-gray-200 text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none font-mono leading-relaxed"
                                />
                            )}

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <MessageSquare size={12} />
                                <span>
                                    {findings.length > 0 
                                        ? `${findings.length} caracteres escritos` 
                                        : "Si deja este campo vacío, el PDF incluirá líneas para completar a mano"
                                    }
                                </span>
                            </div>
                        </div>

                        {/* Instrucciones */}
                        <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
                            <p className="text-xs text-blue-400 leading-relaxed">
                                <strong>💡 Guía de uso:</strong> El PDF generado incluirá:
                                <br />• Página 1: Datos del paciente e informe médico
                                <br />• Páginas siguientes: Cada evidencia con su imagen y tabla de mediciones
                                <br />• Página final: Resumen consolidado de todas las mediciones
                            </p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: Galería de Evidencias */}
                    <div className="w-[45%] space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs text-gray-400 font-black uppercase flex items-center gap-2">
                                <ImageIcon size={14} className="text-blue-500" />
                                Evidencias Capturadas ({capturedImages.length})
                            </label>
                        </div>

                        {capturedImages.length > 0 ? (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                                {capturedImages.map((ev, idx) => (
                                    <div
                                        key={ev.id}
                                        className={`bg-black border rounded-xl overflow-hidden group hover:border-blue-500 transition-all cursor-pointer ${
                                            selectedEvidence?.id === ev.id 
                                                ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                                                : 'border-gray-800'
                                        }`}
                                        onClick={() => viewEvidenceDetail(ev)}
                                    >
                                        {/* Imagen */}
                                        <div className="relative aspect-video border-b border-gray-800">
                                            <img
                                                src={ev.image}
                                                alt={`Evidence ${idx + 1}`}
                                                className="w-full h-full object-contain bg-black"
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(ev.id);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <div className="absolute bottom-2 left-2 bg-black/80 px-3 py-1 rounded-full text-[10px] text-white font-bold border border-gray-700">
                                                EVIDENCIA #{idx + 1}
                                            </div>
                                        </div>

                                        {/* Info de Mediciones */}
                                        <div className="p-3 bg-gray-900/80">
                                            <div className="flex items-center gap-2 text-gray-400 mb-2">
                                                <Ruler size={12} className="text-blue-500" />
                                                <span className="text-[10px] font-bold uppercase">
                                                    {ev.measurements.length} Mediciones
                                                </span>
                                            </div>
                                            
                                            {ev.measurements.length > 0 ? (
                                                <div className="space-y-1">
                                                    {ev.measurements.slice(0, 3).map((m, i) => {
                                                        let displayValue = m.value;
                                                        let unit = "mm";
                                                        
                                                        if (m.type === 'ANGLE') unit = "°";
                                                        if (m.type === 'ICT_COMPLEX' || m.type === 'ICT') {
                                                            displayValue = m.value;
                                                            unit = "%";
                                                        }
                                                        if (m.type === 'ELLIPSE' || m.type === 'RECTANGLE' || m.type === 'ROI') {
                                                            unit = "mm²";
                                                        }

                                                        return (
                                                            <div
                                                                key={i}
                                                                className="flex justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1"
                                                            >
                                                                <span className="truncate">{m.type}</span>
                                                                <span className="text-blue-400 font-mono ml-2">
                                                                    {typeof displayValue === 'number' 
                                                                        ? displayValue.toFixed(1) 
                                                                        : displayValue
                                                                    }{unit}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                    {ev.measurements.length > 3 && (
                                                        <p className="text-[9px] text-gray-600 italic text-center pt-1">
                                                            +{ev.measurements.length - 3} más...
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-gray-600 italic">
                                                    Sin mediciones (referencia anatómica)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 border-2 border-dashed border-gray-800 rounded-3xl flex flex-col items-center justify-center text-gray-600">
                                <ImageIcon size={48} className="mb-3 text-gray-700" />
                                <p className="text-sm font-bold">No hay evidencias capturadas</p>
                                <p className="text-xs text-gray-700 mt-1">
                                    Use el botón "📸 FOTO" para capturar imágenes
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================
                    FOOTER - Botones de Acción
                ======================================== */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        {capturedImages.length > 0 ? (
                            <span>✅ Listo para generar PDF con {capturedImages.length} evidencia{capturedImages.length !== 1 ? 's' : ''}</span>
                        ) : (
                            <span>⚠️ Capture al menos una evidencia para generar el reporte</span>
                        )}
                    </div>
                    
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-400 hover:text-white text-xs font-bold uppercase transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={capturedImages.length === 0}
                            onClick={() => onGenerate(findings)}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg transition-all text-xs font-bold uppercase ${
                                capturedImages.length === 0
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                            }`}
                        >
                            <Download size={16} />
                            Generar y Descargar PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* ========================================
                MODAL DE DETALLE DE EVIDENCIA (Opcional)
            ======================================== */}
            {selectedEvidence && (
                <div 
                    className="fixed inset-0 z-[210] bg-black/95 flex items-center justify-center p-8"
                    onClick={() => setSelectedEvidence(null)}
                >
                    <div 
                        className="max-w-4xl max-h-[90vh] overflow-auto bg-gray-900 rounded-2xl p-6 border border-gray-700"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">Vista Detallada</h3>
                            <button
                                onClick={() => setSelectedEvidence(null)}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <img
                            src={selectedEvidence.image}
                            alt="Evidence detail"
                            className="w-full rounded-lg mb-4"
                        />
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-gray-400 uppercase">Mediciones:</h4>
                            {selectedEvidence.measurements.map((m, i) => (
                                <div key={i} className="flex justify-between text-sm p-2 bg-gray-800 rounded">
                                    <span className="text-gray-300">{m.type}</span>
                                    <span className="text-blue-400 font-mono">{m.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportModal;