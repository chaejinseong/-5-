import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import Navbar from '../components/Navbar';
import '../styles/Compare.css';

const Compare = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [mode, setMode] = useState('monthly');
  const [year, setYear] = useState('2024');
  const [month, setMonth] = useState('1');

  const token = localStorage.getItem('token');

  const fetchMonthlyData = async () => {
    try {
      const res = await fetch(`/api/compare/monthly?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('월별 데이터를 불러오지 못했습니다.');
      const data = await res.json();
      return data;
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const fetchDailyData = async () => {
    try {
      const res = await fetch(`/api/compare/daily?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('일별 데이터를 불러오지 못했습니다.');
      const data = await res.json();
      return data;
    } catch (err) {
      alert(err.message);
      return null;
    }
  };

  const renderMonthlyChart = async () => {
    const data = await fetchMonthlyData();
    if (!data) return;

    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [`${month}월`],
        datasets: [
          {
            label: '나의 총 소비 (만원)',
            data: [data.my_total / 10000],
            backgroundColor: 'rgba(52, 152, 219, 0.7)',
          },
          {
            label: '전체 평균 소비 (만원)',
            data: [data.avg_total / 10000],
            backgroundColor: 'rgba(231, 76, 60, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${year}년 ${month}월 총합 지출 비교`,
          },
        },
      },
    });
  };

  const renderDailyChart = async () => {
    const data = await fetchDailyData();
    if (!data) return;

    const labels = data.map((d) => `${month}/${d.day}`);
    const mySpent = data.map((d) => d.my_spent);
    const avgSpent = data.map((d) => d.avg_spent);

    const ctx = chartRef.current.getContext('2d');
    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: '나의 소비 (천원)',
            data: mySpent,
            borderColor: 'rgba(52, 152, 219, 1)',
            backgroundColor: 'rgba(52, 152, 219, 0.2)',
            fill: true,
            tension: 0.3,
          },
          {
            label: '전체 평균 소비 (천원)',
            data: avgSpent,
            borderColor: 'rgba(231, 76, 60, 1)',
            backgroundColor: 'rgba(231, 76, 60, 0.2)',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `${year}년 ${month}월 일별 지출 비교`,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `${value}원`,
            },
          },
        },
      },
    });
  };

  useEffect(() => {
    if (!token) return;
    if (mode === 'monthly') renderMonthlyChart();
    else renderDailyChart();
  }, [mode, year, month]);

  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="sidebar">
          <div className="controls">
            <label htmlFor="yearSelect">연도 선택:</label>
            <select id="yearSelect" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="2024">2024년</option>
              <option value="2023">2023년</option>
            </select>

            {mode === 'daily' && (
              <div>
                <label htmlFor="monthSelect">월 선택:</label>
                <select id="monthSelect" value={month} onChange={(e) => setMonth(e.target.value)}>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}월
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={() => setMode('monthly')}>📅 월별 지출 비교</button>
            <button onClick={() => setMode('daily')}>📆 일별 지출 비교</button>
          </div>
          <p>
            <strong>기준:</strong> 전체 사용자 평균과 나의 소비 비교
          </p>
        </div>

        <div className="main">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Compare;