import React, { useState, useEffect, useRef, useCallback } from 'react';
import Camera from './Camera';
import { Shield, CheckCircle2 } from 'lucide-react';

export default function AutoFaceScanner({ sessionTitle, sessionId, shareToken, onVerified }) {
  // State Machine: CAMERA_STARTING, SEARCHING_FACE, FACE_DETECTED, FACE_LOCKING, FACE_LOCKED, IDENTITY_VERIFIED, ALREADY_VOTED, UNKNOWN_FACE, MULTIPLE_FACES, LOW_QUALITY
  const [scannerState, setScannerState] = useState('CAMERA_STARTING');
  const [statusMessage, setStatusMessage] = useState('Initializing camera stream...');
  const [voterName, setVoterName] = useState('');
  const [captureFn, setCaptureFn] = useState(null);
  
  const isProcessingRef = useRef(false);
  const cooldownRef = useRef(false);

  const handleCaptureReady = useCallback((capture) => {
    setCaptureFn(() => capture);
    setScannerState('SEARCHING_FACE');
    setStatusMessage('Please look at the camera');
  }, []);

  // Continuous Detection Loop
  useEffect(() => {
    if (!captureFn || cooldownRef.current) return;

    let isMounted = true;

    const processLoop = async () => {
      if (!isMounted || isProcessingRef.current || cooldownRef.current) return;
      isProcessingRef.current = true;

      try {
        const frameBlob = await captureFn();
        if (!frameBlob) {
          isProcessingRef.current = false;
          return;
        }

        const formData = new FormData();
        formData.append('frames', frameBlob, 'frame.jpg');
        if (sessionId) formData.append('session_id', sessionId);
        if (shareToken) formData.append('share_token', shareToken);

        const res = await fetch('http://localhost:8000/api/voting/verify-face-lock', {
          method: 'POST',
          body: formData
        });

        if (!res.ok) throw new Error('Network error');

        const data = await res.json();
        const status = data.status;

        if (status === 'NO_FACE') {
          setScannerState('SEARCHING_FACE');
          setStatusMessage('Please look at the camera');
        } 
        else if (status === 'MULTIPLE_FACES') {
          setScannerState('MULTIPLE_FACES');
          setStatusMessage('Please make sure only one person is visible.');
        }
        else if (status === 'LOW_QUALITY') {
          setScannerState('LOW_QUALITY');
          setStatusMessage(data.message || 'Please improve lighting and try again.');
        }
        else if (status === 'UNKNOWN_FACE') {
          setScannerState('UNKNOWN_FACE');
          setStatusMessage('We couldn\'t recognize you. Please try again.');
          
          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
            setScannerState('SEARCHING_FACE');
            setStatusMessage('Please look at the camera');
          }, 3000);
        }
        else if (status === 'ALREADY_VOTED') {
          setScannerState('ALREADY_VOTED');
          setVoterName(data.name || '');
          setStatusMessage('Vote Already Recorded for this session.');
          
          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
            setScannerState('SEARCHING_FACE');
          }, 4000);
        }
        else if (status === 'IDENTITY_VERIFIED') {
          setScannerState('IDENTITY_VERIFIED');
          setVoterName(data.name || 'Voter');
          setStatusMessage('Biometric verification successful. Redirecting to ballot...');

          cooldownRef.current = true;
          
          setTimeout(() => {
            if (onVerified) {
              onVerified({
                vote_token: data.vote_token,
                voter_id: data.voter_id,
                name: data.name
              });
            }
          }, 1500);
        }

      } catch (err) {
        console.error('Frame loop error:', err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const intervalId = setInterval(processLoop, 450);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [captureFn, onVerified]);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl w-full max-w-sm mx-auto font-sans flex flex-col items-center justify-between min-h-[520px]">
      
      {/* Session Title Header Bar */}
      <div className="w-full flex items-center justify-between text-xs border-b border-slate-100 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">{sessionTitle || 'Student Council Election 2026'}</span>
        </div>
      </div>

      {/* VERIFIED SCREEN CARD */}
      {scannerState === 'IDENTITY_VERIFIED' ? (
        <div className="my-auto flex flex-col items-center text-center space-y-5 animate-scale-up py-4">
          <div className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Identity Verified</h2>
            <p className="text-xs text-slate-500">Welcome,</p>
            <h3 className="text-xl font-black text-emerald-600">{voterName}</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-xs">
            Biometric verification successful. Redirecting to ballot...
          </p>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
            <div className="bg-emerald-500 h-full w-full animate-pulse" />
          </div>
        </div>
      ) : (
        /* CAMERA SCANNER RETICLE VIEW */
        <div className="w-full flex flex-col items-center space-y-4 my-auto">
          
          <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-square flex items-center justify-center">
            <Camera onCapture={handleCaptureReady} />

            {/* Corner Bracket Reticle Frame */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
              <div className={`w-52 h-52 rounded-2xl transition-all duration-300 relative flex items-center justify-center ${
                scannerState === 'ALREADY_VOTED' ? 'border-2 border-amber-400 shadow-lg shadow-amber-400/20' :
                scannerState === 'MULTIPLE_FACES' || scannerState === 'UNKNOWN_FACE' ? 'border-2 border-red-400 shadow-lg shadow-red-400/20' :
                'border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
              }`}>
                {/* 4 Corner Bracket Accents */}
                <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-indigo-500 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-indigo-500 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-indigo-500 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-indigo-500 rounded-br" />

                {/* Scan animation line */}
                {scannerState === 'SEARCHING_FACE' && (
                  <div className="w-full h-0.5 bg-indigo-400 animate-scan-line shadow-xs shadow-indigo-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status Message Label below video */}
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {scannerState === 'SEARCHING_FACE' && 'Looking for your face...'}
              {scannerState === 'FACE_DETECTED' && 'Face Detected'}
              {scannerState === 'FACE_LOCKED' && 'Face Locked'}
              {scannerState === 'UNKNOWN_FACE' && 'Face Not Recognized'}
              {scannerState === 'MULTIPLE_FACES' && 'Multiple Faces Detected'}
              {scannerState === 'ALREADY_VOTED' && 'Vote Already Recorded'}
              {scannerState === 'LOW_QUALITY' && 'Poor Lighting'}
            </h3>
            <p className="text-xs text-slate-500">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Bottom Footer Tag */}
      <div className="pt-3 border-t border-slate-100 w-full text-center text-[10px] text-slate-400 font-mono">
        Powered by Face Recognition
      </div>

    </div>
  );
}
