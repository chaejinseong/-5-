const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

// Swagger 설정
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// 라우터
const expenseRoutes = require('./src/routes/expenseRoute');

app.use(cors());
app.use(express.json()); // JSON 파싱

// Swagger UI 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API 라우터 등록
app.use('/api/expenses', expenseRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.send('💸 지출 관리 서버가 실행 중입니다.');
});

// 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
});