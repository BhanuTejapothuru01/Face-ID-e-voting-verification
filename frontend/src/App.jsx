import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Verify from './pages/Verify';
import AdminDashboard from './pages/AdminDashboard';
import SessionManagement from './pages/SessionManagement';
import VoterTerminal from './pages/VoterTerminal';
import Ballot from './pages/Ballot';
import VoteSuccess from './pages/VoteSuccess';
import PublicElection from './pages/PublicElection';
import { ToastProvider } from './components/ui/Toast';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 text-center font-sans">
          <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl p-8 max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-white">Application Exception Caught</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              An unexpected runtime error occurred. Please refresh the page to restore state.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="md" icon={RefreshCw} onClick={() => window.location.reload()}>
                Reload Application
              </Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
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
            <Route path="/election/:sessionId" element={<PublicElection />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
