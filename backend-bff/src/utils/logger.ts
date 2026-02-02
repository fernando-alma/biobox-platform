import winston from 'winston';
import { envs } from '../config/envs';

const logger = winston.createLogger({
  level: envs.nodeEnv === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json() // En producción guarda JSON (útil para Datadog/Elastic)
  ),
  transports: [
    // Mostrar en consola con colores si es desarrollo
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    }),
  ],
});

export default logger;