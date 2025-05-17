import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { sender: 'user', text: '이번 달에 지출을 줄이려면 어떻게 해야 할까?' },
    { sender: 'bot', text: '식비를 줄이는 것이 효과적이에요. 장보기를 주 1회로 제한해보세요!' },
    { sender: 'user', text: '교통비도 줄일 수 있을까?' },
    { sender: 'bot', text: '자전거나 대중교통을 이용해보세요. 환승 할인도 챙기면 좋아요.' }
  ]);
  const [input, setInput] = useState('');

  const appendMessage = (text, sender) => {
    setMessages((prev) => [...prev, { sender, text }]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    appendMessage(text, 'user');
    setInput('');

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      appendMessage(data.reply || '응답이 없습니다.', 'bot');
    } catch (error) {
      appendMessage('오류가 발생했습니다. 다시 시도해주세요.', 'bot');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="chat-wrapper">
      <Navbar />
      <div className="chat-container">
        <div className="chat-window">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>{msg.text}</div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="챗봇에게 질문해보세요..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}>전송</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;