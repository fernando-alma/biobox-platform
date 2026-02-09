import { Router } from 'express';
import { 
  getPacsInfo, 
  getPatients, 
  getStudies, 
  getStudyInstances, 
  getWadoImage 
} from '../controllers/pacsController';
import { validateApiKey } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: PACS
 *     description: Endpoints de orquestación con el servidor Orthanc (Protegidos por API-Key)
 */

// APLICAMOS EL MIDDLEWARE A TODAS LAS RUTAS DE ESTE ROUTER
router.use(validateApiKey);

/**
 * @swagger
 * /api/pacs/system:
 *   get:
 *     summary: Obtiene estado del servidor Orthanc
 *     tags:
 *       - PACS
 *     responses:
 *       200:
 *         description: Información del sistema
 *       503:
 *         description: Error de conexión con Orthanc
 */
router.get('/system', getPacsInfo);

/**
 * @swagger
 * /api/pacs/patients:
 *   get:
 *     summary: Lista todos los pacientes
 *     tags:
 *       - PACS
 *     responses:
 *       200:
 *         description: Lista de pacientes expandida
 */
router.get('/patients', getPatients);

/**
 * @swagger
 * /api/pacs/studies:
 *   get:
 *     summary: Lista todos los estudios disponibles en el PACS
 *     tags:
 *       - PACS
 *     responses:
 *       200:
 *         description: Lista de estudios expandida
 */
router.get('/studies', getStudies);

/**
 * @swagger
 * /api/pacs/studies/{studyId}/instances:
 *   get:
 *     summary: Obtiene la lista de IDs de instancias de un estudio
 *     tags:
 *       - PACS
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del estudio en Orthanc
 *     responses:
 *       200:
 *         description: Lista de IDs de instancias
 */
router.get('/studies/:studyId/instances', getStudyInstances);

/**
 * @swagger
 * /api/pacs/wado/instance/{instanceId}:
 *   get:
 *     summary: Obtiene el archivo DICOM binario mediante proxy
 *     tags:
 *       - PACS
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la instancia DICOM en Orthanc
 *     responses:
 *       200:
 *         description: Archivo DICOM (binary stream)
 *       404:
 *         description: Instancia no encontrada
 */
router.get('/wado/instance/:instanceId', getWadoImage);

export default router;