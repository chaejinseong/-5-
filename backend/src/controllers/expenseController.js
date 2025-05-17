// controllers/expenseController.js
const expenseService = require('../services/expenseService');

// 오늘의 임시 지출 항목 추가
const addTempExpense = async (req, res) => {
  try {
    const userId = req.user.id; // JWT 인증에서 유저 ID 확보
    const expenseData = req.body;

    await expenseService.saveTempExpense(userId, expenseData);

    res.status(201).json({
      message: '지출 항목이 임시 저장되었습니다.'
    });
  } catch (error) {
    console.error('임시 지출 저장 오류:', error);
    res.status(500).json({
      message: '서버 오류: 지출 항목 저장에 실패했습니다.'
    });
  }
};

// 임시 지출 → 확정 지출로 저장
const confirmExpenses = async (req, res) => {
  try {
    const userId = req.user.id; // JWT 인증에서 유저 ID 확보

    const result = await expenseService.confirmExpenses(userId); // ✅ 올바른 userId 전달

    res.status(200).json({
      message: '지출 항목이 확정 저장되었습니다.',
      confirmedCount: result
    });
  } catch (error) {
    console.error('지출 확정 중 오류:', error);
    res.status(500).json({
      message: '서버 오류: 지출 항목 확정에 실패했습니다.'
    });
  }
};
const getConfirmedExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { year, month, day } = req.query;

    // 필수 파라미터 체크
    if (!year || !month || !day) {
      return res.status(400).json({ message: 'year, month, day는 필수 쿼리입니다.' });
    }

    // 서비스로 위임
    const expenses = await expenseService.getConfirmedExpenses(userId, year, month, day);

    res.status(200).json(expenses);
  } catch (error) {
    console.error('지출 조회 오류:', error);
    res.status(500).json({ message: '서버 오류: 지출을 불러오지 못했습니다.' });
  }
};
module.exports = {
  addTempExpense,
  confirmExpenses,
  getConfirmedExpenses
};