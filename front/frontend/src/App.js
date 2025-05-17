import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Expense from './pages/Expense';
import Compare from './pages/Compare';
import Chatbot from './pages/Chatbot';
import View from './components/View';
import List from './components/List';
import Write from './components/Write';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import MyInfo from './pages/MyInfo';

import { AuthProvider } from './context/AuthContext'; // 정확한 경로 확인

// 페이지 컴포넌트

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ paddingTop: '60px' }}> {/* Navbar 고정 높이 보정 */}
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path="/expense" element={<Expense />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/chatbot" element={<Chatbot />} />
            <Route path="/community/view" element={<View />} />
            <Route path="/community/list" element={<List />} />
            <Route path="/community/write" element={<Write />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path='/myinfo' element={<MyInfo />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
