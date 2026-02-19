import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pacsRoutes from './routes/pacsRoutes';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import logger from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

/**
 * --- Middlewares de Seguridad y Utilidad ---
 */

// 1. Headers de seguridad HTTP
// Ajustado para permitir que Swagger cargue sus assets y el visor renderice imágenes sin bloqueos de política
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 2. CONFIGURACIÓN DE CORS (Vital para la comunicación Vercel -> Render)
// Permitimos todos los orígenes en esta fase de demo para evitar bloqueos, 
// asegurando que las cabeceras personalizadas como x-api-key sean aceptadas.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    credentials: true
}));

// 3. Logger de peticiones (Stream hacia nuestro logger personalizado)
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

// 4. Parser para recibir JSON
app.use(express.json());

/**
 * --- Documentación y Rutas ---
 */

// 5. Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. Rutas de integración PACS
app.use('/api/pacs', pacsRoutes);

/**
 * --- Diagnóstico y Resiliencia ---
 */

// Healthcheck mejorado para diagnóstico en la nube
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'online',
        service: 'Biobox API Gateway (BFF)',
        version: '1.1.0',
        environment: process.env.NODE_ENV || 'production',
        pacs_status: process.env.ORTHANC_URL ? 'configured' : 'not_configured',
        timestamp: new Date().toISOString()
    });
});

// Middleware de manejo de errores global
app.use(errorHandler);

export default app;