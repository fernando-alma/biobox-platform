import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Biobox API Gateway',
      version: '1.0.0',
      description: 'Documentación oficial de la API intermedia (BFF) para el visor DICOM.',
      contact: {
        name: 'Equipo de Desarrollo Biobox Med',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de Desarrollo Local',
      },
    ],
  },
  
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], 
};

export const swaggerSpec = swaggerJSDoc(options);