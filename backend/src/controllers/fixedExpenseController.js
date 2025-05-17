// const fixedExpenseService = require('../services/fixedExpenseService');

// // ✅ 고정 지출 등록
// const addFixedExpense = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const expenseData = req.body;

//     await fixedExpenseService.saveFixedExpense(userId, expenseData);

//     res.status(201).json({ message: '고정 지출이 등록되었습니다.' });
//   } catch (error) {
//     console.error('고정 지출 등록 오류:', error);
//     res.status(500).json({ message: '고정 지출 등록 실패' });
//   }
// };

// // ✅ 고정 지출 조회 (연도 + 월 기준)
// const getFixedExpenses = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { year, month } = req.query;

//     if (!year || !month) {
//       return res.status(400).json({ message: 'year와 month는 필수입니다.' });
//     }

//     const result = await fixedExpenseService.getFixedExpenses(userId, year, month);
//     res.status(200).json(result);
//   } catch (error) {
//     console.error('고정 지출 조회 오류:', error);
//     res.status(500).json({ message: '고정 지출 조회 실패' });
//   }
// };

// module.exports = {
//   addFixedExpense,
//   getFixedExpenses
// };