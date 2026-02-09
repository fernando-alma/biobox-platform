import { Request, Response } from 'express';
import { OrthancService } from '../services/orthancService';
import logger from '../utils/logger';

export const getPacsInfo = async (_req: Request, res: Response) => {
  try {
    const info = await OrthancService.getSystemInfo();
    res.json({ status: 'success', data: info });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Servidor PACS no responde' });
  }
};

export const getPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await OrthancService.getAllPatients();
    res.json({ status: 'success', data: patients });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al consultar pacientes' });
  }
};

export const getStudies = async (_req: Request, res: Response) => {
  try {
    const studies = await OrthancService.getAllStudies();
    res.json({ status: 'success', data: studies });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al consultar estudios' });
  }
};

/**
 * Obtiene la lista de IDs de instancias para un estudio específico.
 */
export const getStudyInstances = async (req: Request, res: Response) => {
  const studyId = req.params.studyId as string;
  
  try {
    const instances = await OrthancService.getStudyInstances(studyId);
    res.json({ status: 'success', data: instances });
  } catch (error) {
    logger.error(`Error al obtener instancias para el estudio ${studyId}:`, error);
    res.status(500).json({ status: 'error', message: 'Error al obtener instancias del estudio' });
  }
};

/**
 * Endpoint WADO Proxy: Entrega la imagen DICOM al frontend.
 */
export const getWadoImage = async (req: Request, res: Response) => {
  // CORRECCIÓN: Forzamos el tipo a string
  const instanceId = req.params.instanceId as string;
  
  try {
    logger.info(`Proxying DICOM instance: ${instanceId}`);
    const streamResponse = await OrthancService.getInstanceFileStream(instanceId);

    res.setHeader('Content-Type', 'application/dicom');
    res.setHeader('Content-Disposition', `attachment; filename="${instanceId}.dcm"`);
    
    streamResponse.data.pipe(res);

    streamResponse.data.on('error', (err: any) => {
      logger.error(`Stream error para instancia ${instanceId}:`, err);
      res.end();
    });

  } catch (error) {
    logger.error(`Proxy error para instancia ${instanceId}:`, error);
    res.status(404).json({ status: 'error', message: 'Imagen médica no encontrada' });
  }
};