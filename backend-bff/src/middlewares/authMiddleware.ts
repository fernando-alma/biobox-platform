import { Request, Response, NextFunction } from 'express';
import { envs } from '../config/envs';
import logger from '../utils/logger';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const clientApiKey = req.header('x-api-key');

  if (!clientApiKey || clientApiKey !== envs.apiKey) {
    logger.warn(`Acceso no autorizado intentado desde IP: ${req.ip}`);
    
    return res.status(401).json({
      status: 'error',
      message: 'Acceso no autorizado: API Key inválida o ausente.'
    });
  }

  next();
};