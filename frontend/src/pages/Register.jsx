import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FaceScanner from '../components/FaceScanner';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SketchCheckmark } from '../components/ui/DoodleAccents';
import { ChevronLeft, UserCheck, ArrowRight, ShieldCheck, Check, Sparkles } from 'lucide-react';

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [registered, setRegistered] = useState(false);
  const [result, setResult] = useState(null);

  const handleResult = (res) => {
    if (res.success) {
      setResult(res.data);
      setRegistered(true);
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12 w-full flex-grow">
        {/* Header Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Return to Home
          </Link>
        </div>

        <div className="text-center mb-8 space-y-2">
          <Badge variant="indigo">Voter Enrollment</Badge>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Biometric Registration</h1>
          <p className="text-xs text-zinc-400">Enroll a new eligible voter into the biometric vector index.</p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { id: 1, name: '1. Personal Details' },
            { id: 2, name: '2. Face Scan' },
            { id: 3, name: '3. Confirmation' },
          ].map((s) => (
            <div
              key={s.id}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                step === s.id
                  ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                  : step > s.id
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400'
                  : 'bg-[#0D0D0D] border-zinc-800 text-zinc-500'
              }`}
            >
              {s.name}
            </div>
          ))}
        </div>

        {/* STEP 1: Personal Details */}
        {step === 1 && (
          <Card className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">Full Legal Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                className="w-full bg-zinc-900/90 border border-zinc-700/80 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition"
              />
              <p className="text-[11px] text-zinc-500">Must match official voter identity documentation.</p>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                isDisabled={!name.trim()}
                icon={ArrowRight}
                onClick={() => setStep(2)}
              >
                Continue to Face Scan
              </Button>
            </div>
          </Card>
        )}

        {/* STEP 2: Face Scan */}
        {step === 2 && (
          <Card className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Capture Facial Vector</h3>
                <p className="text-xs text-zinc-400">Position face inside reticle for 512D feature extraction.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                Back to Details
              </Button>
            </div>

            <div className="pt-2">
              <FaceScanner mode="register" voterName={name} onResult={handleResult} />
            </div>
          </Card>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && registered && (
          <Card className="text-center space-y-6 py-8 px-6">
            <SketchCheckmark className="w-16 h-16 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Voter Registration Successful</h2>
              <p className="text-xs text-zinc-400">Facial vector embedding generated and stored in FAISS index.</p>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-left text-xs font-mono space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-zinc-500">Legal Name</span>
                <span className="font-bold text-white">{result?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Voter ID</span>
                <span className="font-bold text-indigo-400">{result?.voter_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Vector Status</span>
                <span className="text-emerald-400">● 512D Unit Vector Indexed</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setRegistered(false);
                  setName('');
                  setStep(1);
                }}
              >
                Register Another Voter
              </Button>
              <Link to="/vote">
                <Button variant="primary" size="md" icon={ShieldCheck}>
                  Go to Voting Terminal
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}
