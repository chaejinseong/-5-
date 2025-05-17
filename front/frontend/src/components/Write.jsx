import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Board.css';

const Write = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    content: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, content, password } = form;
    if (!title.trim() || !content.trim() || !password.trim()) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, password }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || '글 등록 실패');
      }

      alert('글이 등록되었습니다.');
      navigate('/list');
    } catch (err) {
      alert(`오류: ${err.message}`);
    }
  };

  return (
    <div className="container">
      <h2>절약 꿀팁 글 작성</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">제목</label>
        <input
          type="text"
          id="title"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label htmlFor="content">내용</label>
        <textarea
          id="content"
          value={form.content}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">삭제용 비밀번호</label>
        <input
          type="password"
          id="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <div className="buttons">
          <button type="submit" className="submit-btn">등록</button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/list')}
          >
            목록
          </button>
        </div>
      </form>
    </div>
  );
};

export default Write;