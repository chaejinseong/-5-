// const express = require('express');
// const router = express.Router();
// const fixedExpenseController = require('../controllers/fixedExpenseController');
// const { authenticateToken } = require('../middlewares/authmiddleware');

// /**
//  * @swagger
//  * tags:
//  *   name: FixedExpenses
//  *   description: 월별 고정 지출 관련 API
//  */

// /**
//  * @swagger
//  * /api/fixed-expenses:
//  *   post:
//  *     summary: 월별 고정 지출 항목 등록
//  *     tags: [FixedExpenses]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               category:
//  *                 type: string
//  *                 example: 관리비
//  *               title:
//  *                 type: string
//  *                 example: 5월 관리비
//  *               amount:
//  *                 type: number
//  *                 example: 80000
//  *               payment_method:
//  *                 type: string
//  *                 example: 계좌이체
//  *               memo:
//  *                 type: string
//  *                 example: 국민은행 자동이체
//  *               year:
//  *                 type: integer
//  *                 example: 2025
//  *               month:
//  *                 type: integer
//  *                 example: 5
//  *     responses:
//  *       201:
//  *         description: 고정 지출 등록 완료
//  */
// router.post('/', authenticateToken, fixedExpenseController.addFixedExpense);

// /**
//  * @swagger
//  * /api/fixed-expenses:
//  *   get:
//  *     summary: 특정 월의 고정 지출 목록 조회
//  *     tags: [FixedExpenses]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: year
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 2025
//  *       - in: query
//  *         name: month
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 5
//  *     responses:
//  *       200:
//  *         description: 고정 지출 목록 반환
//  */
// router.get('/', authenticateToken, fixedExpenseController.getFixedExpenses);

// module.exports = router;