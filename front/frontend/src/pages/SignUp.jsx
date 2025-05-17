// Signup.jsx
import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age_group: '20대',
    gender: 'none',
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/signup', formData);
      login(res.data.token); // 회원가입 후 자동 로그인
      alert('회원가입 완료! 메인 페이지로 이동합니다.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || '회원가입 실패';
      alert(msg);
    }
  };

  return (
    <>
      <Navbar />
      <div className="auth-container">
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" name="email" placeholder="이메일" onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} required />
          <input type="text" name="name" placeholder="이름" onChange={handleChange} />
          <select name="age_group" onChange={handleChange} value={formData.age_group}>
            <option value="10대">10대</option>
            <option value="20대">20대</option>
            <option value="30대">30대</option>
            <option value="40대">40대</option>
            <option value="50대 이상">50대 이상</option>
          </select>
          <select name="gender" onChange={handleChange} value={formData.gender}>
            <option value="none">선택 안함</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
          <button type="submit">가입하기</button>
        </form>
      </div>
    </>
  );
};

export default Signup;
