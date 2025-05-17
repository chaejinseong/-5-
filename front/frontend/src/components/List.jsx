// List.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Board.css';

const List = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      method = "POST";
      if (!res.ok) throw new Error('서버 오류로 데이터를 불러올 수 없습니다.');
      const data = await res.json();
      setPosts(data);
      
    } catch (err) {
      alert(err.message);
    }
  };

  const deletePost = async (id) => {
    const confirmed = window.confirm('정말로 이 글을 삭제하시겠습니까?');
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('삭제되었습니다.');
        fetchPosts();
      } else {
        const result = await res.json();
        alert(result.message || '삭제 실패');
      }
    } catch (err) {
      alert('오류 발생: ' + err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="actions">
          <button onClick={() => navigate('/write')}>+ 새 글 작성</button>
        </div>
        <div id="postList">
          {posts.map((post) => (
            <div className="post" key={post.id}>
              <div className="post-title">
                <a href={`/view/${post.id}`}>{post.title}</a>
              </div>
              <div className="post-author">작성자 ID: {post.user_id}</div>
              <div className="post-meta">작성일: {new Date(post.created_at).toLocaleString()}</div>
              <div className="post-content">
                {post.content.length > 50 ? post.content.slice(0, 50) + '...' : post.content}
              </div>
              <button className="delete-btn" onClick={() => deletePost(post.id)}>삭제</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default List;