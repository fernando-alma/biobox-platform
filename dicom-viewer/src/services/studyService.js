/**
 * Servicio de Gestión de Estudios
 * Configurado para soportar URLs dinámicas según el entorno (Vercel/Local)
 */

// Obtenemos la URL base desde las variables de entorno de Vite
// En Vercel será https://biobox-bff.onrender.com/api
// En local será http://localhost:3000/api
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_KEY = import.meta.env.VITE_API_KEY || "biobox_secret_token_2024";

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-api-key': API_KEY
});

/**
 * Obtiene la lista de estudios de un paciente
 */
export const getPatientStudies = async (patientId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacs/patients/${patientId}/studies`, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener estudios del paciente');
    return await response.json();
  } catch (error) {
    console.error('StudyService Error:', error);
    return [];
  }
};

/**
 * Obtiene las imágenes (instancias) de un estudio específico
 */
export const getStudyImages = async (studyId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/pacs/studies/${studyId}/instances`, {
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error('Error al obtener imágenes del estudio');
    return await response.json();
  } catch (error) {
    console.error('StudyService Error:', error);
    return [];
  }
};

/**
 * Obtiene la lista completa de estudios (Panel de Gestión)
 */
export const getAllStudies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pacs/studies`, {
        headers: getHeaders()
      });
      
      if (!response.ok) throw new Error('Error al obtener el listado global de estudios');
      return await response.json();
    } catch (error) {
      console.error('StudyService Error:', error);
      return [];
    }
  };