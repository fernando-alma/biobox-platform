import axios from 'axios';
import { envs } from '../config/envs';
import logger from '../utils/logger';

export class OrthancService {
  // Instancia de axios pre-configurada con Auth de Orthanc
  private static client = axios.create({
    baseURL: envs.orthanc.url,
    auth: {
      username: envs.orthanc.user,
      password: envs.orthanc.password,
    },
    timeout: 15000, // 15 segundos para imágenes pesadas
  });

  /**
   * Obtiene información del sistema para verificar la conexión
   */
  static async getSystemInfo() {
    const { data } = await this.client.get('/system');
    return data;
  }

  /**
   * OPTIMIZACIÓN N+1:
   * Usamos '?expand' para que Orthanc devuelva todos los detalles
   * de los estudios en una sola llamada HTTP, en lugar de una por cada ID.
   */
  static async getAllStudies() {
    try {
      logger.info('Solicitando lista de estudios expandida a Orthanc...');
      const { data } = await this.client.get('/studies?expand');
      return data;
    } catch (error) {
      logger.error('Error al obtener estudios de Orthanc:', error);
      throw error;
    }
  }

  /**
   * Obtiene la lista de pacientes de forma expandida (una sola petición)
   */
  static async getAllPatients() {
    try {
      logger.info('Solicitando lista de pacientes expandida a Orthanc...');
      const { data } = await this.client.get('/patients?expand');
      return data;
    } catch (error) {
      logger.error('Error al obtener pacientes de Orthanc:', error);
      throw error;
    }
  }

  /**
   * Obtiene todas las instancias (imágenes) asociadas a un estudio.
   * Útil para que el visor sepa qué archivos pedir.
   */
  static async getStudyInstances(studyId: string) {
    try {
      logger.info(`Obteniendo instancias para el estudio: ${studyId}`);
      const { data } = await this.client.get(`/studies/${studyId}/instances`);
      return data;
    } catch (error) {
      logger.error(`Error al obtener instancias del estudio ${studyId}:`, error);
      throw error;
    }
  }

  /**
   * Proxy binario: Obtiene el archivo DICOM como un flujo de datos (stream)
   */
  static async getInstanceFileStream(instanceId: string) {
    try {
      return await this.client.get(`/instances/${instanceId}/file`, {
        responseType: 'stream',
      });
    } catch (error) {
      logger.error(`Error al obtener el stream de la instancia ${instanceId}:`, error);
      throw error;
    }
  }
}