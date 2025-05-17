import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import '../styles/Auth.css';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'none',
    residence: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('/api/users/register', formData);
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');
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
          <input type="text" name="name" placeholder="이름" onChange={handleChange} required />
          <input type="email" name="email" placeholder="이메일" onChange={handleChange} required />
          <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} required />
          
          <input type="number" name="age" placeholder="나이" onChange={handleChange} required />

          <select name="gender" onChange={handleChange} value={formData.gender}>
            <option value="none">성별 선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>

          <input type="text" name="residence" placeholder="거주지 (예: 서울특별시)" onChange={handleChange} required />

          <button type="submit">가입하기</button>
        </form>
      </div>
    </>
  );
};

export default Signup;