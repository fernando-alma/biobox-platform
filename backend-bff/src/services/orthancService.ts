import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Configuración base de Axios para Orthanc
const orthancApi = axios.create({
    baseURL: process.env.ORTHANC_URL || 'http://localhost:8042',
    auth: {
        username: process.env.ORTHANC_USER || 'orthanc',
        password: process.env.ORTHANC_PASS || 'orthanc'
    },
    timeout: 10000, // 10 segundos máximo de espera
});

export const OrthancService = {
    // 1. Verificar si Orthanc está vivo
    async getSystemInfo() {
        try {
            const response = await orthancApi.get('/system');
            return response.data;
        } catch (error: any) {
            console.error('Error conectando a Orthanc:', error.message);
            throw new Error('El servicio de imágenes no responde');
        }
    },

    // 2. Listar todos los pacientes
    async getAllPatients() {
        try {
            // Orthanc devuelve un array de IDs, luego hay que pedir detalles si queremos nombres
            const response = await orthancApi.get('/patients'); 
            return response.data;
        } catch (error: any) {
            throw new Error(`Error obteniendo pacientes: ${error.message}`);
        }
    },

    // 3. Proxy para WADO (La magia para el visor)
    // Esto toma el "stream" de la imagen y se lo pasa al frontend
    async getWadoImage(instanceId: string) {
        try {
            const response = await orthancApi.get(`/instances/${instanceId}/file`, {
                responseType: 'arraybuffer' // Importante: Pedimos datos binarios (la imagen real)
            });
            return response.data;
        } catch (error: any) {
            throw new Error(`Error obteniendo imagen DICOM: ${error.message}`);
        }
    }
};