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

  const monthlyData = {
    labels: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    average: [300, 280, 290, 310, 295, 305, 320, 310, 300, 295, 310, 300],
    mine:    [320, 260, 270, 340, 300, 310, 350, 320, 310, 280, 330, 310]
  };

  const renderChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    if (mode === 'monthly') {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: monthlyData.labels,
          datasets: [
            {
              label: '나의 소비 (만원)',
              data: monthlyData.mine,
              backgroundColor: 'rgba(52, 152, 219, 0.7)'
            },
            {
              label: '전체 평균 소비 (만원)',
              data: monthlyData.average,
              backgroundColor: 'rgba(231, 76, 60, 0.6)'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${year}년 월별 지출 비교`
            }
          }
        }
      });
    } else {
      const days = new Date(year, month, 0).getDate();
      const labels = Array.from({ length: days }, (_, i) => `${month}/${i + 1}`);
      const mine = Array.from({ length: days }, () => Math.floor(Math.random() * 6 + 4) * 10);
      const average = Array.from({ length: days }, () => Math.floor(Math.random() * 5 + 3) * 10);

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: '나의 소비 (천원)',
              data: mine,
              borderColor: 'rgba(52, 152, 219, 1)',
              backgroundColor: 'rgba(52, 152, 219, 0.2)',
              fill: true,
              tension: 0.3
            },
            {
              label: '전체 평균 소비 (천원)',
              data: average,
              borderColor: 'rgba(231, 76, 60, 1)',
              backgroundColor: 'rgba(231, 76, 60, 0.2)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: `${year}년 ${month}월 일별 지출 비교`
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value}천원`
              }
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    renderChart();
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
                    <option key={i + 1} value={i + 1}>{i + 1}월</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={() => setMode('monthly')}>📅 월별 지출 비교</button>
            <button onClick={() => setMode('daily')}>📆 일별 지출 비교</button>
          </div>
          <p><strong>기준:</strong> 전체 사용자 평균과 나의 소비 비교</p>
        </div>

        <div className="main">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default Compare;