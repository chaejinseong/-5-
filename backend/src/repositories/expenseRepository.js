// repositories/expenseRepository.js
const db = require('../config/db'); // DB 커넥션 (예: mysql2/promise 기반)

const insertTempExpense = async (expense) => {
  const {
    user_id,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    spent_at
  } = expense;

  const sql = `
    INSERT INTO expenses_temp (
      user_id, category, title, amount,
      payment_method, is_fixed, memo, spent_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    user_id,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    spent_at
  ];

  await db.execute(sql, values);
};

module.exports = {
  insertTempExpense
};