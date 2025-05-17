const mysql = require('mysql2/promise');

// MySQL 연결 설정
const connectionConfig = {
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'your_database',
};

(async () => {
  const conn = await mysql.createConnection(connectionConfig);

  // 1. 월별 총 소비 집계
  const [rows] = await conn.execute(`
    SELECT 
      YEAR(date) AS year,
      MONTH(date) AS month,
      SUM(totalConsumption) AS total
    FROM consumptions
    GROUP BY year, month
    ORDER BY year, month
  `);

  // 2. 평균 및 표준편차 계산
  const totals = rows.map(r => r.total);
  const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
  const stdDev = Math.sqrt(totals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / totals.length);

  // 3. 이상치 탐지 (Z-score 기준: |편차| > 3)
  const threshold = 3;

  console.log('📊 이상치 감지 결과:\n');
  rows.forEach(({ year, month, total }) => {
    const z = (total - avg) / stdDev;
    if (Math.abs(z) > threshold) {
      console.log(
        `⚠️ ${year}-${month}월: 소비 = ${total} → 평균(${avg.toFixed(2)}) 대비 편차 ${z.toFixed(2)}σ`
      );
    }
  });

  await conn.end();
})();
