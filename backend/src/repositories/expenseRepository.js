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
const getTempExpensesByUser = async (userId) => {
  const query = `SELECT * FROM expenses_temp WHERE user_id = ?`;
  const [rows] = await db.execute(query, [userId]);
  return rows;
};
const saveConfirmedExpenses = async (expenses) => {
  const query = `
    INSERT INTO expenses (user_id, category, title, amount, payment_method, is_fixed, memo, spent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const expense of expenses) {
      await conn.execute(query, [
        expense.user_id,
        expense.category,
        expense.title,
        expense.amount,
        expense.payment_method,
        expense.is_fixed,
        expense.memo,
        expense.spent_at
      ]);
    }

    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

const deleteTempExpensesByUser = async (userId) => {
  const query = `DELETE FROM expenses_temp WHERE user_id = ?`;
  await db.execute(query, [userId]);
};

const getConfirmedExpenses = async (userId, year, month, day) => {
  const query = `
    SELECT id, category, title, amount, payment_method, is_fixed, memo, spent_at
    FROM expenses
    WHERE user_id = ?
      AND YEAR(spent_at) = ?
      AND MONTH(spent_at) = ?
      AND DAY(spent_at) = ?
    ORDER BY spent_at ASC
  `;

  const [rows] = await db.execute(query, [userId, year, month, day]);
  return rows;
};
module.exports = {
  insertTempExpense,
  getTempExpensesByUser,
  saveConfirmedExpenses,
  deleteTempExpensesByUser,
  getConfirmedExpenses
};