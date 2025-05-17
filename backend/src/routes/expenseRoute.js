const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const { authenticateToken } = require('../middlewares/authmiddleware');
const validate = require('../middlewares/validate');
const { expenseTempSchema } = require('../dtos/expense.dto');

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: 지출 관련 API
 */

/**
 * @swagger
 * /api/expenses/temp:
 *   post:
 *     summary: 오늘 지출 항목 임시 저장
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [식비, 교통, 생활, 쇼핑, 기타]
 *                 example: 식비
 *               title:
 *                 type: string
 *                 example: 스타벅스 아메리카노
 *               amount:
 *                 type: number
 *                 example: 4500
 *               payment_method:
 *                 type: string
 *                 enum: [카드, 현금, 계좌이체]
 *                 example: 카드
 *               is_fixed:
 *                 type: boolean
 *                 example: false
 *               memo:
 *                 type: string
 *                 example: 친구랑 커피
 *               spent_at:
 *                 type: string
 *                 format: date
 *                 example: 2025-05-19
 *     responses:
 *       201:
 *         description: 지출 항목이 임시 저장되었습니다.
 *       400:
 *         description: 요청 형식 오류
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/temp',
  authenticateToken,
  validate(expenseTempSchema),
  expenseController.addTempExpense
);

module.exports = router;