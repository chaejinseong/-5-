import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css'; // CSS 파일 분리

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className='menu-item'>Home</Link>
                <Link to="/expense" className="menu-item">가계부 조회</Link>
                <Link to="/compare" className="menu-item">지출 비교</Link>
                <Link to="/chatbot" className="menu-item">AI를 활용한 소비패턴 분석</Link>
                <Link to="/community" className="menu-item">전략 꿀팁 커뮤니티</Link>
                
                
            </div>
            <div className="navbar-right">
                <Link to="/login" className="auth-button">로그인</Link>
                <Link to="/signup" className="auth-button">회원가입</Link>
            </div>
        </nav>
    );
}