import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import '../styles/MyInfo.css'; // 스타일은 분리된 CSS로 관리

const MyInfo = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    fetch('/api/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('서버 오류');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(`사용자 정보를 불러오는 데 실패했습니다. (${err.message})`);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />
      <div className="container">
        <h2>🙋 내 정보</h2>

        {loading && <div className="loading">사용자 정보를 불러오는 중입니다...</div>}
        {error && <div className="error">{error}</div>}

        {user && (
          <>
            <div className="info-item">
              <span className="info-label">이메일:</span> {user.email}
            </div>
            <div className="info-item">
              <span className="info-label">이름:</span> {user.name}
            </div>
            <div className="info-item">
              <span className="info-label">성별:</span> {user.gender}
            </div>
            <div className="info-item">
              <span className="info-label">나이:</span> {user.age}
            </div>
            <div className="info-item">
              <span className="info-label">거주지역:</span> {user.residence}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default MyInfo;