import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dicomParser from 'dicom-parser';
import { X, Search, FileText, RefreshCw, AlertCircle } from 'lucide-react';

const COMMON_TAGS = {
    "0010,0010": "Patient Name",
    "0010,0020": "Patient ID",
    "0008,0060": "Modality",
    "0008,0070": "Manufacturer",
    "0008,1030": "Study Description",
    "0018,5101": "View Position (PA/AP)",
    "0028,0010": "Rows",
    "0028,0011": "Columns",
    "0028,0030": "Pixel Spacing",
    "0018,0050": "Slice Thickness",
    "0020,000D": "Study Instance UID",
    "0020,000E": "Series Instance UID"
};

const TagBrowser = ({ imageId, onClose }) => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndParseMetadata = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. Extraer ID de la instancia de la URL (si es wadouri)
                const instanceId = imageId.includes('instance/') 
                    ? imageId.split('instance/').pop() 
                    : null;

                let byteArray;

                if (instanceId) {
                    // CASO REMOTO: Descargamos el archivo DICOM completo para parsearlo
                    const response = await axios.get(`http://localhost:3000/api/pacs/wado/instance/${instanceId}`, {
                        headers: { 'x-api-key': import.meta.env.VITE_API_KEY },
                        responseType: 'arraybuffer'
                    });
                    byteArray = new Uint8Array(response.data);
                } else {
                    // CASO LOCAL: Intentamos obtenerlo del manager de Cornerstone
                    const image = window.cornerstone.getImage(imageId);
                    if (image && image.data) {
                        byteArray = image.data.byteArray;
                    }
                }

                if (!byteArray) throw new Error("No se pudo obtener el contenido binario del DICOM.");

                // 2. Parsear con dicomParser
                const dataSet = dicomParser.parseDicom(byteArray);
                const extractedTags = [];

                // Recorremos todos los elementos del dataset
                for (const tag in dataSet.elements) {
                    const element = dataSet.elements[tag];
                    // Formatear tag de xGGGGEEEE a GGGG,EEEE
                    const formattedTag = `${tag.substring(1, 5)},${tag.substring(5, 9)}`.toUpperCase();
                    
                    try {
                        const value = dataSet.string(tag);
                        if (value && value.trim() !== "") {
                            extractedTags.push({
                                tag: formattedTag,
                                value: value
                            });
                        }
                    } catch (e) {
                        // Algunos tags son binarios y fallan al leerse como string, los saltamos
                    }
                }

                setTags(extractedTags);
            } catch (err) {
                console.error("Error en Metadata Sync:", err);
                setError("Error al leer los metadatos desde el servidor.");
            } finally {
                setLoading(false);
            }
        };

        if (imageId) fetchAndParseMetadata();
    }, [imageId]);

    const filteredTags = tags.filter(t => 
        t.tag.includes(searchTerm.toUpperCase()) || 
        t.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (COMMON_TAGS[t.tag] || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10">
            <div className="bg-gray-900 border border-blue-900/40 w-full max-w-5xl h-full max-h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                
                {/* Header */}
                <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="font-black uppercase tracking-tighter text-lg text-white">DICOM Tag Explorer</h2>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Auditoría Técnica en Tiempo Real</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>

                {/* Contenido Dinámico */}
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                        <p className="text-gray-400 font-mono text-xs uppercase animate-pulse">Sincronizando Metadatos con el PACS...</p>
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-red-500">
                        <AlertCircle className="w-12 h-12" />
                        <p className="font-mono text-sm uppercase">{error}</p>
                        <button onClick={onClose} className="px-6 py-2 bg-gray-800 text-white rounded-lg">Cerrar</button>
                    </div>
                ) : (
                    <>
                        {/* Buscador */}
                        <div className="p-4 bg-gray-900/50 border-b border-gray-800">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                <input 
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar por Tag (0028), Atributo (Spacing) o Valor..."
                                    className="w-full bg-black border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-sm text-blue-100 focus:border-blue-500 outline-none transition-all font-mono"
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Tabla de Tags */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-gray-900 text-[10px] text-gray-400 uppercase font-black border-b border-gray-800 z-10">
                                    <tr>
                                        <th className="p-4 w-32">Tag ID</th>
                                        <th className="p-4 w-64">Atributo / Descripción</th>
                                        <th className="p-4">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="font-mono text-[11px] divide-y divide-gray-900">
                                    {filteredTags.map((t, i) => {
                                        const description = COMMON_TAGS[t.tag];
                                        return (
                                            <tr key={i} className="hover:bg-blue-900/10 transition-colors group">
                                                <td className="p-4 text-blue-500 font-bold">({t.tag})</td>
                                                <td className="p-4 text-gray-400 font-sans italic">
                                                    {description || <span className="text-gray-700">Unknown</span>}
                                                </td>
                                                <td className="p-4 text-gray-200 break-all select-all group-hover:text-blue-200">
                                                    {t.value}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TagBrowser;