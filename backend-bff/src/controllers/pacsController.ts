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
 * Endpoint WADO Proxy: Entrega la imagen DICOM al frontend.
 * Se ha corregido el tipado para asegurar que instanceId sea tratado como string.
 */
export const getWadoImage = async (req: Request, res: Response) => {
  // Forzamos el tipo a string para evitar el error 'string | string[]'
  const instanceId = req.params.instanceId as string;
  
  try {
    logger.info(`Proxying DICOM instance: ${instanceId}`);
    const streamResponse = await OrthancService.getInstanceFileStream(instanceId);

    // Indicamos al navegador que lo que viene es un archivo DICOM
    res.setHeader('Content-Type', 'application/dicom');
    
    // Conectamos el stream de Orthanc directamente a la respuesta
    streamResponse.data.pipe(res);
  } catch (error) {
    logger.error(`Proxy error para instancia ${instanceId}`);
    res.status(404).json({ status: 'error', message: 'Imagen médica no encontrada' });
  }
};