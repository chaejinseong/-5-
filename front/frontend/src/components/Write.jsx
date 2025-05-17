import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Board.css'; // 기존 CSS와 통합된 Board.css 사용

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

  const handleSubmit = (e) => {
    e.preventDefault();

    const { title, content, password } = form;
    if (!title.trim() || !content.trim() || !password.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const token = localStorage.getItem('token');

    await fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        password
      })
    });

    alert('글이 등록되었습니다.');
    navigate('/list');
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

        <label htmlFor="password">삭제 비밀번호</label>
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