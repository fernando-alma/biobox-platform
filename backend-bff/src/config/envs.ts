import 'dotenv/config';

/**
 * Este objeto centraliza todas las variables de entorno.
 * Si una variable no existe en el .env, definimos un valor por defecto (fallback).
 */
export const envs = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuración de conexión al PACS Orthanc
  orthanc: {
    url: process.env.ORTHANC_URL || 'http://localhost:8042',
    user: process.env.ORTHANC_USER || 'orthanc',
    password: process.env.ORTHANC_PASSWORD || 'orthanc',
  },

  // Llave de seguridad para peticiones entre Front y Back
  apiKey: process.env.API_KEY || 'biobox_secret_token_2024',
  
  logLevel: process.env.LOG_LEVEL || 'info',
};