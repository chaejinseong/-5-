const db = require('../config/db');

// ✅ 1. 사용자 일별 지출 합계
const getUserDailySums = async (userId, year, month) => {
  const query = `
    SELECT day, SUM(amount) AS total
    FROM expenses
    WHERE user_id = ? AND year = ? AND month = ?
    GROUP BY day
  `;
  const [rows] = await db.execute(query, [userId, year, month]);

  const result = {};
  for (const row of rows) {
    result[parseInt(row.day)] = row.total ?? 0;
  }

  return result;
};

// ✅ 2. 전체 사용자 일별 평균 지출 (사용자 수 포함)
const getAllUserDailyAverages = async (year, month) => {
  // 사용자 수 먼저 구하기
  const [[userCountRow]] = await db.execute(`SELECT COUNT(*) AS total_users FROM users`);
  const totalUsers = userCountRow.total_users;

  if (totalUsers === 0) return {}; // 사용자 없음 → 빈 객체 반환

  // 날짜별 지출 총합 구한 뒤 사용자 수로 나누기
  const query = `
    SELECT 
      d.day AS day,
      IFNULL(SUM(e.amount), 0) AS total
    FROM (
      SELECT 1 AS day UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION
      SELECT 8 UNION SELECT 9 UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION
      SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION SELECT 21 UNION
      SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION
      SELECT 29 UNION SELECT 30 UNION SELECT 31
    ) d
    LEFT JOIN expenses e
      ON e.day = d.day AND e.year = ? AND e.month = ?
    GROUP BY d.day
  `;

  const [rows] = await db.execute(query, [year, month]);

  const result = {};
  for (const row of rows) {
    result[parseInt(row.day)] = Math.round((row.total ?? 0) / totalUsers);
  }

  return result;
};

// ✅ 3. 사용자 월 지출 총합
const getUserMonthlyTotal = async (userId, year, month) => {
  const query = `
    SELECT SUM(amount) AS total
    FROM expenses
    WHERE user_id = ? AND year = ? AND month = ?
  `;
  const [[row]] = await db.execute(query, [userId, year, month]);
  return row.total ?? 0;
};

// ✅ 4. 전체 사용자 월 평균 지출
const getAllUserMonthlyAverage = async (year, month) => {
  const query = `
    SELECT AVG(user_total) AS avg_total FROM (
      SELECT user_id, SUM(amount) AS user_total
      FROM expenses
      WHERE year = ? AND month = ?
      GROUP BY user_id
    ) t
  `;
  const [[row]] = await db.execute(query, [year, month]);
  return Math.round(row.avg_total ?? 0);
};

module.exports = {
  getUserDailySums,
  getAllUserDailyAverages,
  getUserMonthlyTotal,
  getAllUserMonthlyAverage,
};