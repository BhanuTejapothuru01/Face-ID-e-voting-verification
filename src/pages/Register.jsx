import React, { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-8">
        <Link to="/" className="text-gray-500 hover:text-white flex items-center transition">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">Voter Registration</h1>
        <p className="text-gray-500 text-sm">Enroll a new eligible voter via biometrics.</p>
      </div>

      {!registered ? (
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-medium ml-1">Legal Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full bg-gray-900 border border-gray-800 focus:border-white rounded-xl px-4 py-3 outline-none transition"
            />
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <FaceScanner mode="register" voterName={name} onResult={handleResult} />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md border border-green-500/30 bg-green-950/20 rounded-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
          <div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Complete</h2>
            <p className="text-gray-400">Voter has been added to the secure index.</p>
          </div>
          <div className="bg-black border border-gray-800 p-4 rounded-xl text-left">
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium text-lg">{result?.name}</p>
            <p className="text-sm text-gray-500 mt-3">FaceVote ID</p>
            <p className="font-mono text-lg text-white">{result?.voter_id}</p>
          </div>
          <button onClick={() => { setRegistered(false); setName(''); }} className="text-sm text-gray-400 hover:text-white underline">
            Register another voter
          </button>
        </div>
      )}
    </div>
  );
}
