const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '지출 관리 API 문서',
      version: '1.0.0',
      description: '해커톤 지출 관리 백엔드 Swagger Docs'
    },
    servers: [
      {
        url: 'http://localhost:3000'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']  // Swagger 주석이 작성된 라우터 경로
};

const specs = swaggerJSDoc(options);
module.exports = specs;