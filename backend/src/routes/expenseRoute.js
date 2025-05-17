const express = require('express');
const router = express.Router();

const expenseController = require('../controllers/expenseController');
const { authenticateToken } = require('../middlewares/authmiddleware');
const validate = require('../middlewares/validate');
const { expenseSchema } = require('../dtos/expense.dto'); // ✅ dto 이름 통일 권장

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: 지출 관련 API
 */

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: 지출 항목 저장
 *     description: 사용자가 입력한 지출 항목을 저장합니다. (바로 확정 저장됩니다)
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
 *                 example: 버거킹 와퍼
 *               amount:
 *                 type: number
 *                 example: 8900
 *               payment_method:
 *                 type: string
 *                 enum: [카드, 현금, 계좌이체]
 *                 example: 카드
 *               is_fixed:
 *                 type: boolean
 *                 example: false
 *               memo:
 *                 type: string
 *                 example: 점심 식사
 *               year:
 *                 type: integer
 *                 example: 2025
 *               month:
 *                 type: integer
 *                 example: 5
 *               day:
 *                 type: integer
 *                 example: 20
 *     responses:
 *       201:
 *         description: 지출 항목이 저장되었습니다.
 *       400:
 *         description: 요청 형식 오류
 *       401:
 *         description: 인증 실패
 */
router.post(
  '/',
  authenticateToken,
  validate(expenseSchema), // ✅ 이름 변경 (기존: expenseTempSchema → expenseSchema)
  expenseController.addExpense // ✅ 이름도 임시가 아니므로 수정 추천
);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: 저장된 지출 항목 조회
 *     description: 특정 날짜(year, month, day)의 지출 항목 목록을 조회합니다.
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
  expenseController.getExpensesByDate // ✅ 이름 직관적 변경 추천
);

module.exports = router;