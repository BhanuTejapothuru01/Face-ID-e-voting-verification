import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, LogOut, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [voters, setVoters] = useState([]);
  const [error, setError] = useState(null);

  const fetchVoters = async (authToken) => {
    try {
      const res = await fetch('http://localhost:8000/api/voters', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setVoters(data.voters || []);
    } catch (err) {
      if (err.message.includes('fetch')) {
        setToken(null);
        localStorage.removeItem('admin_token');
      }
    }
  };

  useEffect(() => {
    if (token) fetchVoters(token);
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (!res.ok) throw new Error('Invalid credentials');
      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('admin_token', data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const toggleStatus = async (voterId, currentStatus) => {
    const newStatus = currentStatus === 'ELIGIBLE' ? 'NOT ELIGIBLE' : 'ELIGIBLE';
    try {
      await fetch(`http://localhost:8000/api/voters/${voterId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchVoters(token);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteVoter = async (voterId) => {
    if (!window.confirm("Are you sure you want to delete this voter?")) return;
    try {
      await fetch(`http://localhost:8000/api/voters/${voterId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchVoters(token);
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-6">
          <Link to="/" className="text-gray-500 hover:text-white flex items-center transition mb-8">
            <ChevronLeft className="w-5 h-5 mr-1" /> Back
          </Link>
          <div>
            <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
            <p className="text-sm text-gray-500 mb-6">Enter secret to access voter management.</p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-white transition mb-4"
            />
            <button type="submit" className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition">
              Login
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12 border-b border-gray-900 pb-6 mt-8">
        <div>
          <h1 className="text-2xl font-bold">Voter Registry</h1>
          <p className="text-gray-500 text-sm">{voters.length} total voters</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-sm hover:border-white transition">
            Home
          </Link>
          <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-white transition">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-sm uppercase tracking-wider">
              <th className="py-4 px-4 font-medium">Voter ID</th>
              <th className="py-4 px-4 font-medium">Name</th>
              <th className="py-4 px-4 font-medium">Status</th>
              <th className="py-4 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900/50">
            {voters.map((v) => (
              <tr key={v.voter_id} className="hover:bg-gray-900/30 transition-colors">
                <td className="py-4 px-4 font-mono text-gray-400">{v.voter_id}</td>
                <td className="py-4 px-4 font-medium">{v.name}</td>
                <td className="py-4 px-4">
                  <button 
                    onClick={() => toggleStatus(v.voter_id, v.eligibility_status)}
                    className={`text-xs px-3 py-1 rounded-full border ${v.eligibility_status === 'ELIGIBLE' ? 'border-green-500 text-green-400 bg-green-500/10' : 'border-red-500 text-red-400 bg-red-500/10'}`}
                  >
                    {v.eligibility_status}
                  </button>
                </td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => deleteVoter(v.voter_id)} className="text-gray-600 hover:text-red-500 p-2 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {voters.length === 0 && (
              <tr>
                <td colSpan="4" className="py-8 text-center text-gray-600">No registered voters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
