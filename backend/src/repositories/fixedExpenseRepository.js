// const db = require('../config/db'); // 또는 db.js (사용자 환경에 맞게)

// // ✅ 고정 지출 등록
// const insertFixedExpense = async (expense) => {
//   const {
//     user_id,
//     category,
//     title,
//     amount,
//     payment_method,
//     memo,
//     year,
//     month
//   } = expense;

//   const query = `
//     INSERT INTO fixed_expenses (
//       user_id, category, title, amount,
//       payment_method, memo, year, month, created_at
//     )
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
//   `;

//   const values = [
//     user_id,
//     category,
//     title,
//     amount,
//     payment_method,
//     memo,
//     year,
//     month
//   ];

//   await db.execute(query, values);
// };

// // ✅ 연도/월 기준 고정 지출 조회
// const findFixedExpensesByDate = async (userId, year, month) => {
//   const query = `
//     SELECT id, category, title, amount, payment_method, memo, year, month
//     FROM fixed_expenses
//     WHERE user_id = ? AND year = ? AND month = ?
//     ORDER BY created_at ASC
//   `;

//   const [rows] = await db.execute(query, [userId, year, month]);
//   return rows;
// };

// module.exports = {
//   insertFixedExpense,
//   findFixedExpensesByDate
// };