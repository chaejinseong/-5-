const expenseService = require('../services/expenseService');

// 지출 항목 저장 (바로 확정 저장)
const addExpense = async (req, res) => {
  try {
    const userId = req.user.userId;
    const expenseData = req.body;

    await expenseService.saveExpense(userId, expenseData);

    res.status(201).json({
      message: '지출 항목이 저장되었습니다.'
    });
  } catch (error) {
    console.error('지출 저장 오류:', error);
    res.status(500).json({
      message: '서버 오류: 지출 항목 저장에 실패했습니다.'
    });
  }
};

// 특정 날짜의 지출 항목 조회
const getExpensesByDate = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month, day } = req.query;

    if (!year || !month || !day) {
      return res.status(400).json({ message: 'year, month, day는 필수 쿼리입니다.' });
    }

    const expenses = await expenseService.getExpensesByDate(userId, year, month, day);

    res.status(200).json(expenses);
  } catch (error) {
    console.error('지출 조회 오류:', error);
    res.status(500).json({ message: '서버 오류: 지출을 불러오지 못했습니다.' });
  }
};

module.exports = {
  addExpense,
  getExpensesByDate
};