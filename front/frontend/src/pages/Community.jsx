// src/pages/Community.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Community.css';

const Community = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const defaultPosts = [
      {
        id: 1,
        title: '공지사항: 커뮤니티 이용 수칙 안내',
        author: '운영자',
        date: '2025-05-01',
        content: '커뮤니티를 건강하게 운영하기 위한 기본 규칙을 확인해주세요.',
        password: '1234'
      },
      {
        id: 2,
        title: '오늘 점심 뭐 드셨나요?',
        author: 'user123',
        date: '2025-05-17',
        content: '저는 김치찌개 먹었어요. 여러분은요?',
        password: 'abcd'
      },
      {
        id: 3,
        title: '자바스크립트 질문 있습니다!',
        author: '코딩초보',
        date: '2025-05-16',
        content: 'forEach와 map의 차이를 잘 모르겠어요... 도와주세요!',
        password: '1111'
      }
    ];

    const stored = localStorage.getItem('posts');
    if (!stored) localStorage.setItem('posts', JSON.stringify(defaultPosts));
    setPosts(JSON.parse(localStorage.getItem('posts')));
  }, []);

  const deletePost = (index) => {
    const input = prompt('비밀번호를 입력하세요:');
    if (input === posts[index].password) {
      if (window.confirm('정말 삭제하시겠습니까?')) {
        const updated = [...posts];
        updated.splice(index, 1);
        localStorage.setItem('posts', JSON.stringify(updated));
        setPosts(updated);
      }
    } else {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="actions">
          <button onClick={() => alert('글 작성 페이지로 이동합니다 (구현 필요)')}>➕ 글 작성</button>
        </div>
        {posts.map((post, index) => (
          <div className="post" key={post.id}>
            <Link to={`/post/${post.id}`} className="post-title">{post.title}</Link>
            <div className="post-meta">{post.author} | {post.date}</div>
            <div className="post-content">{post.content}</div>
            <button className="delete-btn" onClick={() => deletePost(index)}>삭제</button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Community;