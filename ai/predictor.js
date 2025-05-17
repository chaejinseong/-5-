// backend/src/utils/predictor.js
function predictTrend(data) {
  // 여기에 예측 알고리즘 삽입 (예: 평균, 머신러닝, 시계열 분석 등)
  const total = data.reduce((acc, item) => acc + item.amount, 0);
  const avg = total / data.length;
  return { predictedAverage: avg };
}

module.exports = predictTrend;
