import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import ResultCard from '../components/ResultCard';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, ShieldCheck } from 'lucide-react';

export default function Verify() {
  const [result, setResult] = useState(null);

  const handleResult = (res) => {
    if (res.success) {
      setResult(res);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 w-full flex-grow">
        <div className="mb-6">
          <Link to="/" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>

        <div className="text-center mb-8 space-y-2">
          <Badge variant="indigo">Biometric Guard</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Identity Verification</h1>
          <p className="text-xs text-zinc-400">Position face inside reticle for 512D vector matching and liveness check.</p>
        </div>

        {!result ? (
          <Card className="p-6">
            <FaceScanner mode="verify" onResult={handleResult} />
          </Card>
        ) : (
          <ResultCard result={result} onReset={() => setResult(null)} />
        )}
      </main>

      <Footer />
    </div>
  );
}
