// Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); // ✅ 오타 수정

    try {
      const res = await axios.post('/api/users/login', {
        email,
        password
      });

      const token = res.data.token;
      login(token); // ✅ Context에 저장 + localStorage 저장 포함됨
      alert('로그인 성공!');
      navigate('/list'); // 로그인 후 게시판으로 이동

    } catch (err) {
      const msg = err.response?.data?.message || '서버 오류';
      alert('로그인 실패: ' + msg);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2>로그인</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">로그인</button>
        </form>
      </div>
    </>
  );
};

export default Login;