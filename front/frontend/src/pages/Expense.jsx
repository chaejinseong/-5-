import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Expense.css';

const Expense = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fixedDate, setFixedDate] = useState({ year: '', month: '' });

  const years = ['2023', '2024', '2025'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // 예시 일별 지출 항목
  const dailyExpenses = [
    { item: '점심', amount: 8000 },
    { item: '커피', amount: 4500 },
    { item: '교통비', amount: 1250 },
  ];
  const totalDaily = dailyExpenses.reduce((acc, cur) => acc + cur.amount, 0);

  return (
    <div className="expense-container">
      <div className="tab-buttons">
        <button className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>일별</button>
        <button className={activeTab === 'fixed' ? 'active' : ''} onClick={() => setActiveTab('fixed')}>고정</button>
      </div>

      {activeTab === 'daily' && (
        <div className="daily-section">
          <div className="calendar-panel">
            <Calendar onChange={setSelectedDate} value={selectedDate} />
          </div>
          <div className="result-panel">
            <h3>{formatDate(selectedDate)}의 지출 내역</h3>
            <ul>
              {dailyExpenses.map((exp, i) => (
                <li key={i}>🔸 {exp.item} - {exp.amount.toLocaleString()}원</li>
              ))}
            </ul>
            <div className="total-expense">총 지출: <strong>{totalDaily.toLocaleString()}원</strong></div>
          </div>
        </div>
      )}

      {activeTab === 'fixed' && (
        <div className="fixed-section">
          <div className="fixed-date-select">
            <select onChange={(e) => setFixedDate({ ...fixedDate, year: e.target.value })}>
              <option>연도</option>
              {years.map((year) => <option key={year}>{year}</option>)}
            </select>
            <select onChange={(e) => setFixedDate({ ...fixedDate, month: e.target.value })}>
              <option>월</option>
              {months.map((month) => <option key={month}>{month}</option>)}
            </select>
          </div>
          <div className="result-panel">
            <h3>{fixedDate.year && fixedDate.month ? `${fixedDate.year}-${fixedDate.month}` : '고정 지출'}</h3>
            <ul>
              <li>🏠 월세 - 500,000원</li>
              <li>📱 통신비 - 50,000원</li>
              <li>🧾 넷플릭스 - 13,000원</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expense;
