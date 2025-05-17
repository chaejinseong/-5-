const axios = require('axios');

const AI_SERVER_URL = 'http://localhost:5000'; // Flask 서버 주소

// 챗봇 요청
const askChatbot = async (userId, message) => {
  const res = await axios.post(`${AI_SERVER_URL}/api/chat`, {
    userId,
    message
  });
  return res.data;
};

// 소비 예측 요청
const predictSpending = async (userId, category) => {
  const res = await axios.post(`${AI_SERVER_URL}/api/predict`, {
    userId,
    category
  });
  return res.data;
};

module.exports = { askChatbot, predictSpending };