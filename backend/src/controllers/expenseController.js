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

module.exports = {
  addTempExpense
};