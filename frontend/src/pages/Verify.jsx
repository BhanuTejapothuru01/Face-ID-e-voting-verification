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
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-8">
        <Link to="/" className="text-gray-500 hover:text-white flex items-center transition">
          <ChevronLeft className="w-5 h-5 mr-1" /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-2">Terminal Verification</h1>
        <p className="text-gray-500 text-sm">Scan face to verify voter eligibility.</p>
      </div>

      {!result ? (
        <FaceScanner mode="verify" onResult={handleResult} />
      ) : (
        <ResultCard result={result} onReset={() => setResult(null)} />
      )}
    </div>
  );
}
