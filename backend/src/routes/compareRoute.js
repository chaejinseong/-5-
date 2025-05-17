const express = require('express');
const router = express.Router();
const compareController = require('../controllers/compareController');
const { authenticateToken } = require('../middlewares/authmiddleware');

/**
 * @swagger
 * tags:
 *   name: Compare
 *   description: 지출 비교 기능 (나 vs 전체 평균)
 */

/**
 * @swagger
 * /api/compare/daily:
 *   get:
 *     summary: 특정 월의 일별 지출 비교 (나 vs 전체 평균)
 *     tags: [Compare]
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
 *     responses:
 *       200:
 *         description: 일별 지출 비교 결과
 */
router.get('/daily', authenticateToken, compareController.compareDailyExpenses);
/**
 * @swagger
 * /api/compare/monthly:
 *   get:
 *     summary: 특정 월의 지출 총합 비교 (나 vs 전체 평균)
 *     tags: [Compare]
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
 *     responses:
 *       200:
 *         description: 나의 월 지출 총합과 전체 사용자 평균 지출 총합을 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 my_total:
 *                   type: number
 *                   description: 나의 월 총 지출
 *                   example: 537000
 *                 avg_total:
 *                   type: number
 *                   description: 전체 사용자의 평균 월 총 지출
 *                   example: 421600
 *       400:
 *         description: 잘못된 요청 (year, month 누락 등)
 *       401:
 *         description: 인증 실패 (JWT 누락 등)
 */
router.get('/monthly', authenticateToken, compareController.compareMonthlyExpenses);
module.exports = router;