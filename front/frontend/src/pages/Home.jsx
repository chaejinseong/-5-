import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>💸 스마트 가계부에 오신 것을 환영합니다</h1>
        <p>지출 내역을 기록하고, AI 분석으로 소비 습관을 개선해보세요.</p>
      </header>

      <div className="feature-cards">
        <div className="card">
          <h3>📅 가계부 조회</h3>
          <p>일별로 지출을 기록하고 한눈에 확인하세요.</p>
        </div>
        <div className="card">
          <h3>📊 지출 비교</h3>
          <p>다른 사용자와 비교하여 나의 소비 습관을 점검할 수 있어요.</p>
        </div>
        <div className="card">
          <h3>🤖 AI를 활용한 소비패턴 분석</h3>
          <p>AI가 분석한 나만의 소비 패턴을 받아보세요.</p>
        </div>
        <div className="card">
          <h3>🤖 전략 꿀팁 커뮤니티</h3>
          <p>나만의 소비 꿀팁을 공유해보세요.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;