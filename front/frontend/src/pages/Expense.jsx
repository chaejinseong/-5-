import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Expense.css';

const Expense = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyExpenses, setDailyExpenses] = useState([]);
  const [fixedExpenses, setFixedExpenses] = useState([]);
  const [fixedDate, setFixedDate] = useState({ year: '', month: '' });

  const token = localStorage.getItem('token');

  const years = ['2023', '2024', '2025'];
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const fetchDailyExpenses = async () => {
    const y = selectedDate.getFullYear();
    const m = selectedDate.getMonth() + 1;
    const d = selectedDate.getDate();

    try {
      const res = await fetch(`/api/expenses?year=${y}&month=${m}&day=${d}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('일별 지출 데이터를 불러오지 못했습니다.');
      const data = await res.json();
      setDailyExpenses(data);
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchFixedExpenses = async () => {
    const { year, month } = fixedDate;
    if (!year || !month) return;

    try {
      const res = await fetch(`/api/expenses/fixed?year=${year}&month=${parseInt(month)}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('고정 지출 데이터를 불러오지 못했습니다.');
      const data = await res.json();
      setFixedExpenses(data);
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyExpenses();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (activeTab === 'fixed' && fixedDate.year && fixedDate.month) {
      fetchFixedExpenses();
    }
  }, [fixedDate]);

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
              {dailyExpenses.length > 0 ? (
                dailyExpenses.map((exp, i) => (
                  <li key={i}>🔸 {exp.title} ({exp.category}) - {exp.amount.toLocaleString()}원</li>
                ))
              ) : (
                <li>지출 내역이 없습니다.</li>
              )}
            </ul>
            <div className="total-expense">
              총 지출: <strong>{totalDaily.toLocaleString()}원</strong>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fixed' && (
        <div className="fixed-section">
          <div className="fixed-date-select">
            <select value={fixedDate.year} onChange={(e) => setFixedDate({ ...fixedDate, year: e.target.value })}>
              <option value="">연도</option>
              {years.map((year) => <option key={year}>{year}</option>)}
            </select>
            <select value={fixedDate.month} onChange={(e) => setFixedDate({ ...fixedDate, month: e.target.value })}>
              <option value="">월</option>
              {months.map((month) => <option key={month}>{month}</option>)}
            </select>
          </div>
          <div className="result-panel">
            <h3>{fixedDate.year && fixedDate.month ? `${fixedDate.year}-${fixedDate.month} 고정 지출` : '고정 지출'}</h3>
            <ul>
              {fixedExpenses.length > 0 ? (
                fixedExpenses.map((exp, i) => (
                  <li key={i}>📌 {exp.title} ({exp.category}) - {exp.amount.toLocaleString()}원</li>
                ))
              ) : (
                <li>고정 지출 내역이 없습니다.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expense;