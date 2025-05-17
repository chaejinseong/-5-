const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// 회원가입
router.post('/register', userController.register);

//로그인
router.post('/login', userController.login);

//내 정보 조회
router.get('/me', authMiddleware.authMiddlewareToken, userController.me);