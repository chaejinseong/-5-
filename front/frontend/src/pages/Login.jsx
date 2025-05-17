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
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { email, password });
      login(res.data.token);
      alert('로그인 성공!');
      navigate('/');
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
          <input type="email" placeholder="이메일" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="비밀번호" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">로그인</button>
        </form>
      </div>
    </>
  );
};

export default Login;
