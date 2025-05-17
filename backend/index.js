const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// ✅ Swagger 설정
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// ✅ 라우터 불러오기
const expenseRoutes = require('./src/routes/expenseRoute');
const userRoutes = require('./src/routes/userRoute');
const postRoutes = require('./src/routes/postRoute');
const compareRoutes = require('./src/routes/compareRoute'); // ✅ 추가됨

// ✅ 미들웨어 등록
app.use(cors());
app.use(express.json());

// ✅ Swagger UI 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ API 라우터 등록
app.use('/api/expenses', expenseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/compare', compareRoutes); // ✅ 추가됨

// ✅ 기본 라우트
app.get('/', (req, res) => {
  res.send('💸 지출 관리 서버가 실행 중입니다.');
});

// ✅ 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
  console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
});