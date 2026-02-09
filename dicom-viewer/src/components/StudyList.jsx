import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Calendar, Database, Eye, RefreshCw, AlertCircle } from 'lucide-react';

const StudyList = ({ onSelectStudy }) => {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStudies = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usamos la URL de tu backend BFF
      const response = await axios.get('http://localhost:3000/api/pacs/studies', {
        headers: {
          'x-api-key': 'biobox_secret_token_2024' // En el futuro esto vendrá de un .env o login
        }
      });
      
      // Orthanc devuelve un array de objetos estudio con '?expand'
      setStudies(response.data.data || []);
    } catch (err) {
      console.error("Error fetching studies:", err);
      setError("No se pudo conectar con el servidor de imágenes.");
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
          <p className="text-gray-400 italic">Seleccione un paciente para iniciar el análisis del Índice Cardiotorácico.</p>
        </div>
        <button 
          onClick={fetchStudies}
          className="p-2 bg-gray-900 hover:bg-gray-800 rounded-full border border-gray-700 transition-transform active:rotate-180 duration-500"
        >
          <RefreshCw className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col">
        <div className="overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Paciente / ID</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Fecha Estudio</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider">Descripción</th>
                <th className="p-5 text-gray-400 font-bold text-xs uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {studies.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-500">
                    No hay estudios almacenados en el servidor BioBox.
                  </td>
                </tr>
              ) : (
                studies.map((study) => (
                  <tr key={study.ID} className="group hover:bg-blue-600/5 transition-colors cursor-default">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="text-white font-semibold">{study.PatientMainDicomTags.PatientName || 'N/A'}</div>
                          <div className="text-gray-500 text-sm font-mono">{study.PatientMainDicomTags.PatientID || study.ID.substring(0,8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar size={16} className="text-gray-500" />
                        {study.MainDicomTags.StudyDate || 'Sin fecha'}
                      </div>
                    </td>
                    <td className="p-5 text-gray-400 italic">
                      {study.MainDicomTags.StudyDescription || 'Estudio de Radiología'}
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => onSelectStudy(study)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-lg transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                      >
                        <Eye size={16} /> VER ESTUDIO
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