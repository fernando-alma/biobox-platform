import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

export default function initCornerstone() {
    // 1. Conectar las dependencias externas
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

    // 2. Configurar el Image Loader para usar FileObjects (archivos locales)
    // Esto permite usar IDs tipo "wadouri:..." o identificadores de archivo
    cornerstoneWADOImageLoader.configure({
        useWebWorkers: true, // Intentar usar workers para decodificar rápido
    });

    // NOTA: En un entorno de producción real con Vite, configurar los WebWorkers 
    // requiere copiar los archivos .js de workers a la carpeta public. 
    // Por ahora, para desarrollo básico, Cornerstone intentará funcionar sin ellos 
    // o con la configuración por defecto.
}