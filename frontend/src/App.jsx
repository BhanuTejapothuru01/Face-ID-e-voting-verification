import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import AdminDashboard from './pages/AdminDashboard';
import SessionManagement from './pages/SessionManagement';
import VoterTerminal from './pages/VoterTerminal';
import Ballot from './pages/Ballot';
import VoteSuccess from './pages/VoteSuccess';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/sessions" element={<SessionManagement />} />
        <Route path="/vote" element={<VoterTerminal />} />
        <Route path="/vote/ballot" element={<Ballot />} />
        <Route path="/vote/success" element={<VoteSuccess />} />
        <Route path="/vote/:shareToken" element={<VoterTerminal />} />
      </Routes>
    </Router>
  );
}

export default App;
