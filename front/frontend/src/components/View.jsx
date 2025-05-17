// View.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/Board.css';

const View = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`/api/posts/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          if (res.status === 401) throw new Error('인증되지 않은 사용자입니다.');
          if (res.status === 404) throw new Error('해당 글을 찾을 수 없습니다.');
          throw new Error('서버 오류가 발생했습니다.');
        }

        const data = await res.json();
        setPost(data);
      } catch (err) {
        alert(err.message);
      }
    };

    fetchPost();
  }, [id, navigate]);

  if (!post) return <div className="container">로딩 중...</div>;

  return (
    <div className="container">
      <h2>{post.title}</h2>
      <div className="meta">
        작성자 ID: {post.user_id} | {new Date(post.created_at).toLocaleString()}
      </div>
      <div className="content">{post.content}</div>
      <button className="back-btn" onClick={() => navigate('/list')}>목록</button>
    </div>
  );
};

export default View;