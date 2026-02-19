import axios from 'axios';
import { envs } from '../config/envs';
import logger from '../utils/logger';

export class OrthancService {
  // Instancia de axios pre-configurada con Auth de Orthanc
  // Bajamos el timeout a 5 segundos para que la demo no se quede "colgada" esperando al PACS
  private static client = axios.create({
    baseURL: envs.orthanc.url,
    auth: {
      username: envs.orthanc.user,
      password: envs.orthanc.password,
    },
    timeout: 5000, 
  });

  /**
   * Obtiene información del sistema para verificar la conexión
   */
  static async getSystemInfo() {
    try {
      const { data } = await this.client.get('/system');
      return data;
    } catch (error) {
      logger.warn('⚠️ PACS System Info no accesible. Ignorando para modo demo.');
      return { status: "unavailable", version: "unknown" };
    }
  }

  /**
   * OPTIMIZACIÓN N+1 con Resiliencia:
   * Si el PACS no responde (común en despliegues cloud de demo),
   * devolvemos una lista vacía [] en lugar de lanzar un error 500.
   */
  static async getAllStudies() {
    try {
      logger.info('Solicitando lista de estudios a Orthanc...');
      const { data } = await this.client.get('/studies?expand');
      return data;
    } catch (error) {
      //  SILENCIO POSITIVO: Evita el error 500 en Render
      logger.warn('⚠️ No se pudo conectar con el PACS para obtener estudios. Devolviendo lista vacía.');
      return []; 
    }
  }

  /**
   * Obtiene la lista de pacientes de forma expandida
   */
  static async getAllPatients() {
    try {
      logger.info('Solicitando lista de pacientes a Orthanc...');
      const { data } = await this.client.get('/patients?expand');
      return data;
    } catch (error) {
      logger.warn('⚠️ No se pudo conectar con el PACS para obtener pacientes. Devolviendo lista vacía.');
      return [];
    }
  }

  /**
   * Obtiene todas las instancias asociadas a un estudio.
   */
  static async getStudyInstances(studyId: string) {
    try {
      logger.info(`Obteniendo instancias para el estudio: ${studyId}`);
      const { data } = await this.client.get(`/studies/${studyId}/instances`);
      return data;
    } catch (error) {
      logger.error(`Error al obtener instancias del estudio ${studyId}:`, error);
      return [];
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
      logger.error(`Error crítico al obtener el stream de la instancia ${instanceId}`);
      throw error; // En este caso sí lanzamos error porque es una petición directa a un archivo
    }
  }
}