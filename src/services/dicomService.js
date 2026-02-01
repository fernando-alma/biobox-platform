import dicomParser from 'dicom-parser';
import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 1,
    startWebWorkersOnDemand: true,
    webWorkerPath: '/workers/index.worker.bundle.min.worker.js',
    taskConfiguration: { decodeTask: { initializeCodecsOnStartup: true, strict: false } }
};

if (typeof window !== 'undefined') {
    cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
}

/**
 * Mapeo básico de nombres de tags comunes para facilitar la lectura en el Browser
 */
const TAG_DICT = {
    '00100010': 'Patient Name',
    '00100020': 'Patient ID',
    '00080060': 'Modality',
    '00185101': 'View Position',
    '00280010': 'Rows',
    '00280011': 'Columns',
    '00280030': 'Pixel Spacing',
    '00080070': 'Manufacturer',
    '00081030': 'Study Description',
    '0020000D': 'Study Instance UID',
    '0020000E': 'Series Instance UID',
    '00180050': 'Slice Thickness'
};

export const parseDicomMetadata = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const byteArray = new Uint8Array(e.target.result);
                const dataSet = dicomParser.parseDicom(byteArray);
                
                // --- EXTRACCIÓN MASIVA PARA TAG BROWSER ---
                const rawTags = [];
                for (const tagKey in dataSet.elements) {
                    const tagClean = tagKey.substring(1).toUpperCase(); // x00100010 -> 00100010
                    const value = dataSet.string(tagKey);
                    
                    if (value !== undefined) {
                        rawTags.push({
                            tag: `(${tagKey.substring(1, 5)},${tagKey.substring(5)})`.toUpperCase(),
                            name: TAG_DICT[tagClean] || 'Unknown Tag',
                            value: value
                        });
                    }
                }

                resolve({
                    patientName: dataSet.string('x00100010') || 'Anónimo',
                    patientId: dataSet.string('x00100020') || '---',
                    modality: dataSet.string('x00080060') || 'OT',
                    viewPosition: (dataSet.string('x00185101') || 'N/A').toUpperCase(),
                    pixelSpacing: dataSet.string('x00280030') || "1.0\\1.0",
                    seriesUID: dataSet.string('x0020000e') || 'default_series',
                    allTags: rawTags // Aquí viaja toda la data para el Browser
                });
            } catch (err) {
                console.error("Error al parsear DICOM:", err);
                resolve({ patientName: 'Error', seriesUID: 'error', allTags: [] });
            }
        };
        reader.readAsArrayBuffer(file);
    });
};

export const loadDicomImage = (file) => {
    try {
        const imageId = cornerstoneWADOImageLoader.wadouri.fileManager.add(file);
        return cornerstone.loadAndCacheImage(imageId);
    } catch (err) {
        throw err;
    }
};