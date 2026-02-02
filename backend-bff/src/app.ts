import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pacsRoutes from './routes/pacsRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import logger from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// --- Middlewares de Seguridad y Utilidad ---
app.use(helmet());       // 1. Headers de seguridad HTTP
app.use(cors());         // 2. Permitir peticiones externas
app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
}));  // 3. Logger de peticiones
app.use(express.json()); // 4. Parser para recibir JSON en el body
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec)); // 5. Documentación Swagger

// --- Rutas ---
// Rutas de Negocio
app.use('/api/pacs', pacsRoutes);

// Healthcheck: Para que Docker o AWS sepan que estamos vivos
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