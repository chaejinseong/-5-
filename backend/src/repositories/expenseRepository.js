const db = require('../config/db');

// ✅ 지출 항목 저장
const insertExpense = async (expense) => {
  console.log('💬 insertExpense 요청 받은 값:', expense);

  const {
    user_id,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    year,
    month,
    day
  } = expense;

  const sql = `
    INSERT INTO expenses (
      user_id, category, title, amount,
      payment_method, is_fixed, memo,
      year, month, day, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    user_id,
    category,
    title,
    amount,
    payment_method,
    is_fixed,
    memo,
    year,
    month,
    day
  ];

  await db.execute(sql, values);
};

// ✅ 지출 항목 조회 (일별)
const getExpensesByDate = async (userId, year, month, day) => {
  const query = `
    SELECT id, category, title, amount, payment_method, is_fixed, memo, year, month, day
    FROM expenses
    WHERE user_id = ?
      AND year = ?
      AND month = ?
      AND day = ?
    ORDER BY created_at ASC
  `;
  const [rows] = await db.execute(query, [userId, year, month, day]);
  return rows;
};

// ✅ 지출 항목 전체 조회 (월별)
const getMonthlyExpenses = async (userId, year, month) => {
  const query = `
    SELECT id, category, title, amount, payment_method, is_fixed, memo, year, month, day
    FROM expenses
    WHERE user_id = ?
      AND year = ?
      AND month = ?
    ORDER BY day ASC
  `;
  const [rows] = await db.execute(query, [userId, year, month]);
  return rows;
};

// ✅ 전체 사용자 월별 평균 지출 계산
const getMonthlyAverageExpenses = async (year, month) => {
  const query = `
    SELECT day, AVG(amount) AS avg_amount
    FROM expenses
    WHERE year = ? AND month = ?
    GROUP BY day
    ORDER BY day ASC
  `;
  const [rows] = await db.execute(query, [year, month]);
  return rows;
};

module.exports = {
  insertExpense,
  getExpensesByDate,
  getMonthlyExpenses,
  getMonthlyAverageExpenses
};