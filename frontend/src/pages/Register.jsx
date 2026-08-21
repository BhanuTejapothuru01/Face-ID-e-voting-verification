import React, { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import { Link } from 'react-router-dom';
import { ChevronLeft, Check } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [registered, setRegistered] = useState(false);
  const [result, setResult] = useState(null);

  const handleResult = (res) => {
    if (res.success) {
      setResult(res.data);
      setRegistered(true);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex flex-col items-center font-sans">
      <div className="w-full max-w-md mb-6">
        <Link to="/" className="text-zinc-500 hover:text-zinc-200 text-xs font-mono flex items-center transition">
          <ChevronLeft className="w-4 h-4 mr-1" /> Home
        </Link>
      </div>

      <div className="text-center mb-6 space-y-1">
        <h1 className="text-xl font-bold tracking-tight text-white">Voter Registration</h1>
        <p className="text-zinc-500 text-xs">Enroll a new eligible voter into the biometric index.</p>
      </div>

      {!registered ? (
        <div className="w-full max-w-md space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400 font-medium">Legal Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition"
            />
          </div>
          
          <div className="pt-2">
            <FaceScanner mode="register" voterName={name} onResult={handleResult} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md border border-emerald-500/30 bg-zinc-900 rounded-xl p-6 text-center space-y-5">
          <div className="w-12 h-12 bg-zinc-950 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
            <Check className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white mb-1">Registration Complete</h2>
            <p className="text-xs text-zinc-400">Voter face embedding stored in FAISS vector index.</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-lg text-left font-mono text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Legal Name</span>
              <span className="font-bold text-white">{result?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Voter ID</span>
              <span className="font-bold text-zinc-200">{result?.voter_id}</span>
            </div>
          </div>
          <button 
            onClick={() => { setRegistered(false); setName(''); }} 
            className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium transition"
          >
            Register Another Voter
          </button>
        </div>
      )}
    </div>
  );
}
