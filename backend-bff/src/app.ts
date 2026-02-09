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

// --- Middlewares de Seguridad y Utilidad ---

// 1. Headers de seguridad HTTP (Ajustado para permitir Swagger UI en desarrollo)
app.use(helmet({
    contentSecurityPolicy: false, // Desactivamos CSP temporalmente para no bloquear los estilos de Swagger
}));

// 2. CONFIGURACIÓN DE CORS (Crítico para que el navegador acepte el x-api-key)
app.use(cors({
    origin: '*', // Permite peticiones desde cualquier origen (luego lo cerraremos)
    allowedHeaders: ['Content-Type', 'x-api-key'], // <--- ESTO ES LO QUE FALTA PARA SWAGGER/FRONT
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// 3. Logger de peticiones
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use(express.json()); // 4. Parser para recibir JSON

// 5. Documentación Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Rutas ---
app.use('/api/pacs', pacsRoutes);

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'success',
        message: 'Biobox API Gateway v1.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

app.use(errorHandler);

export default app;