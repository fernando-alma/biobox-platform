import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error en ${req.method} ${req.url}: ${err.message}`);

    const status = err.statusCode || 500;
    const message = err.message || 'Error Interno del Servidor';

    res.status(status).json({
        status: 'error',
        message,
        // En producción no mostramos el stack 
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};