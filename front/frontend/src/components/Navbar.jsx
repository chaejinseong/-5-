import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert('로그아웃되었습니다.');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="menu-item">Home</Link>
        <Link to="/expense" className="menu-item">가계부 조회</Link>
        <Link to="/compare" className="menu-item">지출 비교</Link>
        <Link to="/chatbot" className="menu-item">AI를 활용한 소비패턴 분석</Link>
        <Link to="/community/list" className="menu-item">절약 꿀팁 커뮤니티</Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <span
              className="user-name clickable"
              onClick={() => navigate('/myinfo')}
              style={{ cursor: 'pointer', fontWeight: 'bold' }}
            >
              {user.name}님
            </span>
            <button onClick={handleLogout} className="auth-button">로그아웃</button>
          </>
        ) : (
          <>
            <Link to="/login" className="auth-button">로그인</Link>
            <Link to="/signup" className="auth-button">회원가입</Link>
          </>
        )}
      </div>
    </nav>
  );
}