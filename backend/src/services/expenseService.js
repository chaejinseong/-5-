// services/expenseService.js
const expenseRepository = require('../repositories/expenseRepository');

// 오늘의 임시 지출 항목 저장
const saveTempExpense = async (userId, expenseData) => {
  const {
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    spent_at
  } = expenseData;

  await expenseRepository.insertTempExpense({
    user_id: userId,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    spent_at
  });
};

module.exports = {
  saveTempExpense
};