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

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '식비',
    payment_method: '카드',
    is_fixed: false,
    memo: ''
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const date = selectedDate;

    const payload = {
      ...form,
      amount: Number(form.amount),
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('지출 등록 실패');
      alert('지출이 등록되었습니다.');
      setForm({
        title: '',
        amount: '',
        category: '식비',
        payment_method: '카드',
        is_fixed: false,
        memo: ''
      });
      setShowForm(false);
      fetchDailyExpenses(); // 목록 갱신
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
        <button className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>일별 지출</button>
        <button className={activeTab === 'fixed' ? 'active' : ''} onClick={() => setActiveTab('fixed')}>월별 고정 지출</button>
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
            <button onClick={() => setShowForm(true)}>+ 지출 등록</button>
          </div>

          {showForm && (
            <form className="expense-form" onSubmit={handleSubmit}>
              <input type="text" placeholder="항목명" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input type="number" placeholder="금액" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />

              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="식비">식비</option>
                <option value="교통">교통</option>
                <option value="생활">생활</option>
                <option value="쇼핑">쇼핑</option>
                <option value="기타">기타</option>
              </select>

              <select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })}>
                <option value="카드">카드</option>
                <option value="현금">현금</option>
                <option value="계좌이체">계좌이체</option>
              </select>

              <textarea placeholder="메모" value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} />

              <label>
                <input
                  type="checkbox"
                  checked={form.is_fixed}
                  onChange={(e) => setForm({ ...form, is_fixed: e.target.checked })}
                />
                고정 지출 여부
              </label>

              <div style={{ marginTop: '10px' }}>
                <button type="submit">지출 등록</button>
                <button type="button" onClick={() => setShowForm(false)}>취소</button>
              </div>
            </form>
          )}
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