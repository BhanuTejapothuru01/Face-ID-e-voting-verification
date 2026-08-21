import React, { useState } from 'react';
import FaceScanner from '../components/FaceScanner';
import ResultCard from '../components/ResultCard';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function Verify() {
  const [result, setResult] = useState(null);

  const handleResult = (res) => {
    if (res.success) {
      setResult(res);
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
        <h1 className="text-xl font-bold tracking-tight text-white">Biometric Verification</h1>
        <p className="text-zinc-500 text-xs">Scan face to verify voter eligibility and cast single ballot.</p>
      </div>

      {!result ? (
        <FaceScanner mode="verify" onResult={handleResult} />
      ) : (
        <ResultCard result={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
}
