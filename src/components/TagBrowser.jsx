import React, { useState } from 'react';
import { X, Search, FileText, Info } from 'lucide-react';

// Diccionario de referencia para auditoría técnica
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

const TagBrowser = ({ tags, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");

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
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Herramienta de Auditoría</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl transition-all">
                        <X className="w-7 h-7" />
                    </button>
                </div>

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
                        <thead className="sticky top-0 bg-gray-900 text-[10px] text-gray-500 uppercase font-black border-b border-gray-800 z-10">
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
            </div>
        </div>
    );
};

export default TagBrowser;