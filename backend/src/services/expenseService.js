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
const confirmExpenses = async (userId) => {
  // 1. 임시 지출 목록 가져오기
  const tempExpenses = await expenseRepository.getTempExpensesByUser(userId);

  if (!tempExpenses.length) return 0; // 저장할 항목이 없을 경우

  // 2. 확정 테이블에 저장
  await expenseRepository.saveConfirmedExpenses(tempExpenses);

  // 3. 임시 테이블에서 삭제
  await expenseRepository.deleteTempExpensesByUser(userId);

  // 4. 확정된 건수 반환
  return tempExpenses.length;
};
const getConfirmedExpenses = async (userId, year, month, day) => {
  return await expenseRepository.getConfirmedExpenses(userId, year, month, day);
};


module.exports = {
  saveTempExpense,
  confirmExpenses,
  getConfirmedExpenses
};