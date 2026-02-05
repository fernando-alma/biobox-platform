import swaggerJsdoc from 'swagger-jsdoc';
import { envs } from './envs';

/**
 * Configuración maestra de Swagger (OpenAPI 3.0)
 * RUTA: backend-bff/src/config/swagger.ts
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BioBox Platform API',
      version: '1.0.0',
      description: 'API BFF para la integración del Visor DICOM con el PACS Orthanc',
    },
    servers: [
      {
        url: `http://localhost:${envs.port}`,
        description: 'Servidor Local de Desarrollo',
      },
    ],
    tags: [
      {
        name: 'PACS',
        description: 'Endpoints de orquestación con el servidor Orthanc',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJsdoc(options);

// Exportación por defecto para simplificar el import
export default swaggerSpec;