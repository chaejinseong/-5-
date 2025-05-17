const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authmiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 사용자 인증 및 정보 관련 API
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: 회원가입
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: 홍길동
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               age:
 *                 type: integer
 *                 example: 25
 *               gender:
 *                 type: string
 *                 enum: [male, female, none]
 *                 example: male
 *               residence:
 *                 type: string
 *                 example: 서울특별시
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *       400:
 *         description: 유효성 검사 실패
 *       409:
 *         description: 이메일 중복
 */
router.post('/register', userController.register);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: 로그인 성공 (JWT 토큰 포함)
 *       401:
 *         description: 인증 실패
 */
router.post('/login', userController.login);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 정보 조회
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 반환
 *       401:
 *         description: 토큰이 없거나 유효하지 않음
 */
router.get('/me', authMiddleware.authenticateToken, userController.me);
console.log('typeof userController.me:', typeof userController.me);
console.log('userController.me →', typeof userController.me);
console.log('authMiddleware.authenticateToken →', typeof authMiddleware.authenticateToken);
module.exports = router; 