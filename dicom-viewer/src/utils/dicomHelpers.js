import cornerstone from 'cornerstone-core';
import cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

export const extractDicomTags = (imageId) => {
  if (!imageId) return [];
  const tags = [];

  // 1. INTENTO PRINCIPAL: Cache de WADO (Archivos Locales)
  // Esto accede directo a la memoria del archivo cargado.
  let dataSet = cornerstoneWADOImageLoader.wadouri.dataSetCacheManager.get(imageId);

  // 2. INTENTO SECUNDARIO: Proveedor de Metadatos (Si ya fue procesado)
  if (!dataSet) {
      // Si no tenemos el dataset crudo, intentamos sacar info básica del provider
      const instance = cornerstone.metaData.get('instance', imageId);
      if (instance) {
          // Si Cornerstone ya tiene datos, construimos un array manual
          return [
              { tag: '(0010,0010)', vr: 'PN', name: 'Patient Name', value: cornerstone.metaData.get('patient', imageId)?.name || 'N/A' },
              { tag: '(0010,0020)', vr: 'LO', name: 'Patient ID', value: cornerstone.metaData.get('patient', imageId)?.id || 'N/A' },
              { tag: '(0008,0060)', vr: 'CS', name: 'Modality', value: cornerstone.metaData.get('generalSeries', imageId)?.modality || 'N/A' },
              { tag: 'INFO', vr: 'TXT', name: 'Nota', value: 'Visualizando metadatos cacheados.' }
          ];
      }
      
      // Si falla todo
      return [{ tag: 'ERROR', vr: '!!!', name: 'Error', value: 'No se pudo leer el DataSet. Intente recargar la imagen.' }];
  }

  // DICCIONARIO PARA NOMBRES AMIGABLES
  const tagDict = {
    'x00100010': 'Nombre Paciente',
    'x00100020': 'ID Paciente',
    'x00100030': 'Fecha Nacimiento',
    'x00100040': 'Sexo',
    'x00080020': 'Fecha Estudio',
    'x00080060': 'Modalidad',
    'x00200010': 'ID Estudio',
    'x00200011': 'Número Serie',
    'x00200013': 'Número Instancia',
    'x00280010': 'Filas (Alto)',
    'x00280011': 'Columnas (Ancho)',
    'x00280030': 'Pixel Spacing',
    'x00180050': 'Espesor Corte',
    'x0008103e': 'Descripción Serie',
    'x00080080': 'Institución'
  };

  // ITERAR EL DATASET CRUDO
  for (const tagKey in dataSet.elements) {
      const element = dataSet.elements[tagKey];
      if (!element) continue;

      let value = "";
      
      // Intentamos leer texto
      try { value = dataSet.string(tagKey); } catch(e) {}
      
      // Si falla, intentamos número (si es dato corto)
      if ((!value || value === "") && element.length < 10) {
           try { value = dataSet.uint16(tagKey); } catch(e) {}
      }
      
      // Validar que el valor sirva
      if (value === undefined || value === null || value === "") continue;

      // Formatear Tag
      const group = tagKey.substring(1, 5).toUpperCase();
      const elem = tagKey.substring(5, 9).toUpperCase();
      const tagName = tagDict[tagKey] || `Tag (${group},${elem})`;

      tags.push({
          tag: `(${group},${elem})`,
          vr: element.vr || '??',
          name: tagName,
          value: value.toString().replace(/[^a-zA-Z0-9 ._-\u00C0-\u00FF:/\\]/g, ' ') 
      });
  }

  tags.sort((a, b) => a.tag.localeCompare(b.tag));
  return tags;
};