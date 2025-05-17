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
/**
 * @swagger
 * /api/expenses/confirm:
 *   post:
 *     summary: 오늘 임시 지출 항목들을 확정 저장
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 임시 지출이 확정 저장되었습니다.
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/confirm',
  authenticateToken,
  expenseController.confirmExpenses // ✅ 새로운 컨트롤러 함수
);
/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: 확정 지출 항목 조회
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         example: 2025
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         example: 5
 *       - in: query
 *         name: day
 *         required: true
 *         schema:
 *           type: integer
 *         example: 20
 *     responses:
 *       200:
 *         description: 선택한 날짜의 지출 목록을 반환합니다.
 */
router.get(
  '/',
  authenticateToken,
  expenseController.getConfirmedExpenses
);
module.exports = router;