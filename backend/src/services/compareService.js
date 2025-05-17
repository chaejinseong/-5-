const compareRepository = require('../repositories/compareRepository');

// ✅ 특정 월의 일별 지출 비교
const getDailyComparison = async (userId, year, month) => {
  console.log('📌 getDailyComparison 파라미터:', { userId, year, month });

  const daysInMonth = new Date(year, month, 0).getDate(); // 해당 월의 마지막 일 구하기

  // 1. 사용자 본인의 일별 지출 총액
  const myData = await compareRepository.getUserDailySums(userId, year, month);
  // { '1': 12000, '2': 0, ... }

  // 2. 전체 사용자 평균 일별 지출
  const avgData = await compareRepository.getAllUserDailyAverages(year, month);
  // { '1': 8000, '2': 7000, ... }

  const result = [];

  for (let day = 1; day <= daysInMonth; day++) {
    result.push({
      day,
      my_spent: myData[day] || 0,
      avg_spent: avgData[day] || 0
    });
  }

  return result;
};
const getMonthlyComparison = async (userId, year, month) => {
    const myTotal = await compareRepository.getUserMonthlyTotal(userId, year, month);
    const avgTotal = await compareRepository.getAllUserMonthlyAverage(year, month);
    return { my_total: myTotal, avg_total: avgTotal };
  };
  module.exports = {
    getDailyComparison,
    getMonthlyComparison, // ✅ 추가해야 오류 안 남
  };