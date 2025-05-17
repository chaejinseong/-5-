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
    components: {            // ✅ 여기에 추가
      securitySchemes: {
        bearerAuth: {        // ✅ swagger에서 사용할 보안 방식 이름
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [              // ✅ 모든 API 기본 보안 설정
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const specs = swaggerJSDoc(options);
module.exports = specs;