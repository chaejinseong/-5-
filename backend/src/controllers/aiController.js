const aiService = require('../services/aiService');

// 챗봇 요청 처리
const handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    const result = await aiService.askChatbot(userId, message);
    res.status(200).json(result);
  } catch (err) {
    console.error('Chatbot 호출 실패:', err);
    res.status(500).json({ message: 'AI 서버 호출 중 오류 발생' });
  }
};

// 소비 예측 요청 처리
const predictSpending = async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;

    const result = await aiService.predictSpending(userId, category);
    res.status(200).json(result);
  } catch (err) {
    console.error('소비 예측 실패:', err);
    res.status(500).json({ message: 'AI 예측 실패' });
  }
};

module.exports = {
  handleChatMessage,
  predictSpending
};