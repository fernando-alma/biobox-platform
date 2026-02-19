import cornerstone from "cornerstone-core";
import cornerstoneWADOImageLoader from "cornerstone-wado-image-loader";
import dicomParser from "dicom-parser";

/**
 * Inicializa el motor de renderizado médico Cornerstone y sus cargadores.
 * Se asegura de que las dependencias sean accesibles globalmente para
 * auditoría de metadatos y herramientas de medición.
 */
export default function initCornerstone() {
    // 1. ASIGNACIÓN GLOBAL CRÍTICA
    // Esto permite que componentes como TagBrowser accedan al motor mediante window.cornerstone
    window.cornerstone = cornerstone;

    // 2. Conectar dependencias externas para el cargador WADO
    cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

    // 3. Configurar el decodificador de imágenes
    // Se configura para usar FileObjects (esencial para la carga local "Drag & Drop")
    cornerstoneWADOImageLoader.configure({
        useWebWorkers: true,
        decodeConfig: {
            usePDFJS: false,
        },
    });

    // 4. Configuración de WebWorkers (Rutas relativas a la carpeta /public de Vite)
    // Esto optimiza el rendimiento al decodificar DICOMs pesados en hilos separados
    const config = {
        maxWebWorkers: navigator.hardwareConcurrency || 4,
        startWebWorkersOnDemand: true,
        webWorkerPath: '/workers/cornerstoneWADOImageLoaderWebWorker.bundle.min.js',
        taskConfiguration: {
            decodeTask: {
                loadCodecsOnDemand: true,
                initializeCodecsOnDemand: true,
            },
        },
    };

    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);

    console.log("✅ Motor Cornerstone inicializado y vinculado al scope global.");
}