import { Router } from 'express';
import { getPacsInfo, getPatients } from '../controllers/pacsController';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PACS               
 *     description: Endpoints de comunicación con Orthanc  // 
 */

/**
 * @swagger
 * /pacs/system:
 *  get:
 *    summary: Obtiene estado del servidor Orthanc
 *    tags:
 *      - PACS
 *    responses:
 *      200:
 *        description: Información del sistema
 *      503:
 *        description: Error de conexión con Orthanc
 */
router.get('/system', getPacsInfo);

/**
 * @swagger
 * /pacs/patients:
 *  get:
 *    summary: Lista todos los pacientes
 *    tags:
 *      - PACS
 *    responses:
 *      200:
 *        description: Lista de IDs de pacientes
 *      500:
 *        description: Error del servidor
 */
router.get('/patients', getPatients);

export default router;