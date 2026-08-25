import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SketchCheckmark } from '../components/ui/DoodleAccents';
import { ShieldCheck, Printer, ArrowRight } from 'lucide-react';

export default function VoteSuccess() {
  const [countdown, setCountdown] = useState(10);
  const navigate = useNavigate();

  const voterName = sessionStorage.getItem('voter_name') || 'Voter';
  const timestamp = sessionStorage.getItem('last_vote_timestamp') || new Date().toISOString();
  const receiptRef = `VOTE-REC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sessionStorage.clear();
          navigate('/vote');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-md mx-auto px-4 py-12 w-full flex-grow">
        <Card className="text-center space-y-6 p-8">
          <SketchCheckmark className="w-20 h-20 text-emerald-400 mx-auto" />

          <div className="space-y-1">
            <Badge variant="success">● BALLOT RECORDED</Badge>
            <h1 className="text-2xl font-bold text-white tracking-tight">Vote Submitted Successfully</h1>
            <p className="text-xs text-zinc-400">
              Thank you, <strong className="text-white">{voterName}</strong>. Your vote has been biometrically verified and recorded to the active session database.
            </p>
          </div>

          {/* Non-Coercive Receipt Box */}
          <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-left text-xs font-mono space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Receipt Ref</span>
              <span className="font-bold text-indigo-400">{receiptRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Timestamp</span>
              <span className="text-zinc-300">{new Date(timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Status</span>
              <span className="text-emerald-400">● Verified & Persisted</span>
            </div>
            <div className="pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 leading-tight">
              * Official proof of participation. Does not disclose candidate selection to prevent vote buying or coercion.
            </div>
          </div>

          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl space-y-1">
            <div className="text-xs text-zinc-400">Resetting terminal for next voter in</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{countdown}s</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="md"
              icon={Printer}
              className="w-full justify-center"
              onClick={handlePrintReceipt}
            >
              Print Receipt
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              className="w-full justify-center"
              onClick={() => {
                sessionStorage.clear();
                navigate('/vote');
              }}
            >
              Next Voter
            </Button>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
