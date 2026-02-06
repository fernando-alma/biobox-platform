import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/envs';
import logger from '../utils/logger';

/**
 * Middleware para validar la presencia y validez de la API KEY.
 * Protege los recursos médicos asegurando que solo el cliente autorizado
 * (nuestro Visor DICOM) pueda realizar consultas al PACS.
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  // Extraemos la llave de la cabecera 'x-api-key'
  const clientApiKey = req.header('x-api-key');

  // Si la llave no existe o no coincide con nuestra variable de entorno...
  if (!clientApiKey || clientApiKey !== envs.apiKey) {
    logger.warn(`Acceso no autorizado intentado desde IP: ${req.ip}`);
    
    return res.status(401).json({
      status: 'error',
      message: 'Acceso no autorizado: API Key inválida o ausente.'
    });
  }

  // Si todo está bien, permitimos que la petición siga su camino
  next();
};