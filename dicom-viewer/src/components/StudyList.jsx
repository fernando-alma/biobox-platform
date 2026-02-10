import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Calendar, Database, Eye, RefreshCw, AlertCircle, Upload } from 'lucide-react';

const StudyList = ({ onSelectStudy, onTriggerFile }) => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para formatear la fecha DICOM (AAAAMMDD) a Humano (DD/MM/AAAA)
  const formatDate = (dicomDate) => {
    if (!dicomDate || dicomDate.length !== 8) return 'Sin fecha';
    const year = dicomDate.substring(0, 4);
    const month = dicomDate.substring(4, 6);
    const day = dicomDate.substring(6, 8);
    return `${day}/${month}/${year}`;
  };

  const fetchStudies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos la URL de tu backend BFF con la API KEY del .env
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/pacs/studies`, {
        headers: {
          'x-api-key': import.meta.env.VITE_API_KEY
        }
      });
      
      // Ordenar por fecha más reciente primero
      const sortedStudies = (response.data.data || []).sort((a, b) => {
        return (b.MainDicomTags?.StudyDate || '').localeCompare(a.MainDicomTags?.StudyDate || '');
      });

      setStudies(sortedStudies);
    } catch (err) {
      console.error("Error fetching studies:", err);
      setError("No se pudo conectar con el servidor de imágenes. Verifique que el PACS esté activo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudies();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-blue-400">
        <RefreshCw className="w-12 h-12 animate-spin mb-4" />
        <p className="text-lg font-medium animate-pulse">Sincronizando con Orthanc PACS...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-950 text-red-400 p-6">
        <AlertCircle className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error de Conexión</h3>
        <p className="text-gray-400 text-center max-w-md mb-6">{error}</p>
        <button 
          onClick={fetchStudies}
          className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-950 p-8 overflow-hidden font-sans">
      <div className="flex justify-between items-end mb-8">
  <div>
    <h1 className="text-3xl font-bold text-white mb-2">Gestión de Estudios</h1>
    <p className="text-gray-400 italic">Seleccione un estudio para iniciar el análisis radiológico.</p>
  </div>
  
  {/* CONTENEDOR DE ACCIONES (REFRESCAR + CARGA LOCAL) */}
      <div className="flex items-center gap-3">
<button 
  onClick={() => {
    console.log("📂 Abriendo selector de archivos local...");
    onTriggerFile();
  }} 
  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-[11px] font-black rounded-xl border border-gray-700 transition-all active:scale-95 uppercase tracking-wider"
>
  <Upload className="w-4 h-4 text-blue-400" /> IMPORTAR LOCAL
</button>

    <button 
      onClick={fetchStudies}
      className="p-2.5 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-700 transition-transform active:rotate-180 duration-500 shadow-lg"
      title="Refrescar lista del servidor"
    >
      <RefreshCw className="w-5 h-5 text-gray-300" />
    </button>
    </div>
      </div> 

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Paciente / ID</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Modalidad / Fecha</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Descripción del Estudio</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {studies.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500 italic">
                    No hay estudios almacenados en el servidor BioBox PACS.
                  </td>
                </tr>
              ) : (
                studies.map((study) => (
                  <tr key={study.ID} className="group hover:bg-blue-600/5 transition-colors cursor-default">
                    {/* COLUMNA PACIENTE */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-white font-semibold truncate max-w-[200px]">
                            {study.PatientMainDicomTags?.PatientName || 'Paciente Desconocido'}
                          </div>
                          <div className="text-gray-500 text-sm font-mono">
                            {study.PatientMainDicomTags?.PatientID || study.ID.substring(0,8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA MODALIDAD Y FECHA */}
                    <td className="p-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                           <span className="bg-blue-900/40 text-blue-300 text-[10px] font-black px-2 py-0.5 rounded border border-blue-800/50">
                             {study.MainDicomTags?.ModalitiesInStudy || 'OT'}
                           </span>
                           <span className="text-gray-300 text-sm font-medium">
                             {formatDate(study.MainDicomTags?.StudyDate)}
                           </span>
                        </div>
                        <div className="text-[10px] text-gray-600 flex items-center gap-1 uppercase tracking-tighter font-bold">
                           <Calendar size={10} /> Sincronizado
                        </div>
                      </div>
                    </td>

                    {/* COLUMNA DESCRIPCIÓN */}
                    <td className="p-5 text-gray-400 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-300">
                          {study.MainDicomTags?.StudyDescription || 'Estudio de Radiología'}
                        </span>
                        <span className="text-[10px] text-gray-600 mt-1 uppercase">
                          ID: {study.MainDicomTags?.StudyInstanceUID?.split('.').pop() || 'N/A'}
                        </span>
                      </div>
                    </td>

                    {/* COLUMNA ACCIÓN */}
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => onSelectStudy(study)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20 uppercase tracking-widest"
                      >
                        <Eye size={16} /> Ver Estudio
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudyList;