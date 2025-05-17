// const fixedExpenseRepository = require('../repositories/fixedExpenseRepository');

// // ✅ 고정 지출 등록
// const saveFixedExpense = async (userId, expenseData) => {
//   const fixedExpense = {
//     user_id: userId,
//     category: expenseData.category,
//     title: expenseData.title,
//     amount: expenseData.amount,
//     payment_method: expenseData.payment_method || null,
//     memo: expenseData.memo || null,
//     year: expenseData.year,
//     month: expenseData.month
//   };

//   await fixedExpenseRepository.insertFixedExpense(fixedExpense);
// };

// // ✅ 고정 지출 조회
// const getFixedExpenses = async (userId, year, month) => {
//   return await fixedExpenseRepository.findFixedExpensesByDate(userId, year, month);
// };

// module.exports = {
//   saveFixedExpense,
//   getFixedExpenses
// };