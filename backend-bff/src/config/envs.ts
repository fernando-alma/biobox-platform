import dotenv from 'dotenv';

dotenv.config();

// Validación estricta:(Fail Fast)
if (!process.env.ORTHANC_URL) {
    throw new Error(" Error Crítico: Falta la variable ORTHANC_URL en el archivo .env");
}

export const envs = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    orthanc: {
        url: process.env.ORTHANC_URL,
        user: process.env.ORTHANC_USER || 'orthanc',
        pass: process.env.ORTHANC_PASS || 'orthanc',
    },
    // Definimos quién puede pedir datos (Seguridad CORS)
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*']
};