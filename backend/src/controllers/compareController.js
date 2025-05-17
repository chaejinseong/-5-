const compareService = require('../services/compareService');

const compareDailyExpenses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { year, month } = req.query;

    // 유효성 검사
    if (!year || !month) {
      return res.status(400).json({ message: 'year와 month는 필수 쿼리입니다.' });
    }

    const result = await compareService.getDailyComparison(userId, parseInt(year), parseInt(month));

    res.status(200).json(result);
  } catch (error) {
    console.error('일별 지출 비교 오류:', error);
    res.status(500).json({ message: '일별 지출 비교 중 서버 오류' });
  }
};
const compareMonthlyExpenses = async (req, res) => {
    const { year, month } = req.query;
    const userId = req.user.userId;
  
    if (!year || !month) return res.status(400).json({ message: 'year와 month는 필수입니다.' });
  
    const result = await compareService.getMonthlyComparison(userId, year, month);
    res.status(200).json(result);
  };
  module.exports = {
    compareDailyExpenses,
    compareMonthlyExpenses, // ✅ 반드시 추가
  };