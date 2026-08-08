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
      // Capture a burst of frames (e.g. 3 frames over 500ms for liveness)
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
      setTimeout(() => onResult({ success: true, data }), 800);
      
    } catch (err) {
      console.error(err);
      setScanState('REJECTED');
      setError(err.message);
      setTimeout(() => {
        setScanState('LOCKED');
        setIsProcessing(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-6">
      <div className="relative w-full">
        <Camera onCapture={handleCaptureReady} />
        <ScanAnimation state={scanState} />
      </div>
      
      {error && (
        <div className="bg-red-950/50 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg w-full text-sm">
          {error}
        </div>
      )}

      <button 
        onClick={triggerScan}
        disabled={!captureFn || isProcessing || (mode === 'register' && !voterName)}
        className={`w-full py-4 rounded-xl font-semibold tracking-wide transition-all ${
          !captureFn || isProcessing || (mode === 'register' && !voterName)
            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-200 active:scale-[0.98]'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Start Biometric Scan'}
      </button>
    </div>
  );
}
