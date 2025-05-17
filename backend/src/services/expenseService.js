const expenseRepository = require('../repositories/expenseRepository');

// 지출 항목 저장 (바로 확정 저장)
const saveExpense = async (userId, expenseData) => {
  const {
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    year,
    month,
    day
  } = expenseData;

  await expenseRepository.insertExpense({
    user_id: userId,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    year,
    month,
    day
  });
};

// 특정 날짜의 지출 항목 조회
const getExpensesByDate = async (userId, year, month, day) => {
  return await expenseRepository.getExpensesByDate(userId, year, month, day);
};

module.exports = {
  saveExpense,
  getExpensesByDate
};