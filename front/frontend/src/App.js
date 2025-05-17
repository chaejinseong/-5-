import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Expense from './pages/Expense';

// 페이지 컴포넌트

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: '60px' }}> {/* Navbar 고정 높이 보정 */}
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/expense" element={<Expense />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
