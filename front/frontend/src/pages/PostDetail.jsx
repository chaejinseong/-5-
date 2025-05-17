// src/pages/PostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/PostDetail.css';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const found = posts.find(p => p.id === Number(id));
    setPost(found);
  }, [id]);

  if (!post) {
    return <div className="container">해당 글을 찾을 수 없습니다.</div>;
  }

  return (
    <div className="container">
      <div className="title">{post.title}</div>
      <div className="meta">작성자: {post.author} | 날짜: {post.date}</div>
      <div className="content">{post.content}</div>
      <Link to="/community" className="back-btn">← 목록으로 돌아가기</Link>
    </div>
  );
};

export default PostDetail;
