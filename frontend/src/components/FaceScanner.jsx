import React, { useState, useCallback } from 'react';
import Camera from './Camera';
import ScanAnimation from './ScanAnimation';

export default function FaceScanner({ mode = 'verify', onResult, voterName = '' }) {
  const [scanState, setScanState] = useState('FINDING');
  const [captureFn, setCaptureFn] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleCaptureReady = useCallback((capture) => {
    setCaptureFn(() => capture);
    setScanState('LOCKED');
  }, []);

  const triggerScan = async () => {
    if (!captureFn || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    setScanState('SCANNING');

    try {
      const frames = [];
      for (let i = 0; i < 3; i++) {
        const frameBlob = await captureFn();
        if (frameBlob) frames.push(frameBlob);
        await new Promise(r => setTimeout(r, 150));
      }

      setScanState('LIVENESS');
      
      const formData = new FormData();
      frames.forEach((frame, idx) => {
        formData.append('frames', frame, `frame_${idx}.jpg`);
      });

      if (mode === 'register') {
        formData.append('name', voterName);
      }

      setScanState('EMBEDDING');
      
      const endpoint = mode === 'register' ? '/api/register' : '/api/verify';
      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        body: formData
      });

      setScanState('SEARCHING');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Scan failed.");
      }

      setScanState('VERIFIED');
      setTimeout(() => onResult({ success: true, data }), 600);
      
    } catch (err) {
      console.error(err);
      setScanState('REJECTED');
      setError(err.message);
      setTimeout(() => {
        setScanState('LOCKED');
        setIsProcessing(false);
      }, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-4">
      <div className="relative w-full rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <Camera onCapture={handleCaptureReady} />
        <ScanAnimation state={scanState} />
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3.5 py-2.5 rounded-lg w-full text-xs font-medium text-center">
          {error}
        </div>
      )}

      <button 
        onClick={triggerScan}
        disabled={!captureFn || isProcessing || (mode === 'register' && !voterName)}
        className={`w-full py-3 rounded-lg text-xs font-semibold tracking-wide transition ${
          !captureFn || isProcessing || (mode === 'register' && !voterName)
            ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
            : 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-[0.99] shadow-sm'
        }`}
      >
        {isProcessing ? 'Processing Biometrics...' : 'Start Scan'}
      </button>
    </div>
  );
}
