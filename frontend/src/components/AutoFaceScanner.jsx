import React, { useState, useEffect, useRef, useCallback } from 'react';
import Camera from './Camera';
import { VerificationProgress } from './biometric/VerificationProgress';
import { ShieldCheck, CheckCircle2, AlertTriangle, UserX, CameraOff } from 'lucide-react';
import { Badge } from './ui/Badge';
import { SketchFaceFrame } from './ui/DoodleAccents';

import { API_BASE_URL } from '../config/api';

export default function AutoFaceScanner({ sessionTitle, sessionId, shareToken, onVerified }) {
  const [scannerState, setScannerState] = useState('CAMERA_STARTING');
  const [statusMessage, setStatusMessage] = useState('Initializing camera stream...');
  const [voterName, setVoterName] = useState('');
  const [captureFn, setCaptureFn] = useState(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const isProcessingRef = useRef(false);
  const cooldownRef = useRef(false);

  const handleCaptureReady = useCallback((capture) => {
    setCaptureFn(() => capture);
    setScannerState('SEARCHING_FACE');
    setStatusMessage('Position face clearly inside scanning frame');
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

        const res = await fetch(`${API_BASE_URL}/api/voting/verify-face-lock`, {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error('Network error');

        const data = await res.json();
        const status = data.status;

        if (status === 'NO_FACE') {
          setScannerState('SEARCHING_FACE');
          setStatusMessage('Looking for face...');
        } else if (status === 'MULTIPLE_FACES') {
          setScannerState('MULTIPLE_FACES');
          setStatusMessage('Please ensure only one person is visible.');
        } else if (status === 'LOW_QUALITY') {
          setScannerState('LOW_QUALITY');
          setStatusMessage(data.message || 'Poor lighting. Adjust camera alignment.');
        } else if (status === 'UNKNOWN_FACE') {
          setScannerState('UNKNOWN_FACE');
          setAttemptsLeft((prev) => Math.max(0, prev - 1));
          setStatusMessage('Identity not recognized in voter database.');

          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
            setScannerState('SEARCHING_FACE');
            setStatusMessage('Position face clearly inside scanning frame');
          }, 3000);
        } else if (status === 'ALREADY_VOTED') {
          setScannerState('ALREADY_VOTED');
          setVoterName(data.name || '');
          setStatusMessage('Vote already recorded for this session.');

          cooldownRef.current = true;
          setTimeout(() => {
            cooldownRef.current = false;
            setScannerState('SEARCHING_FACE');
          }, 4000);
        } else if (status === 'IDENTITY_VERIFIED') {
          setScannerState('IDENTITY_VERIFIED');
          setVoterName(data.name || 'Verified Voter');
          setStatusMessage('Biometric match verified. Generating token...');

          cooldownRef.current = true;

          setTimeout(() => {
            if (onVerified) {
              onVerified({
                vote_token: data.vote_token,
                voter_id: data.voter_id,
                name: data.name,
              });
            }
          }, 1500);
        }
      } catch (err) {
        console.error('Frame scan error:', err);
      } finally {
        isProcessingRef.current = false;
      }
    };

    const intervalId = setInterval(processLoop, 450);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [captureFn, onVerified, sessionId, shareToken]);

  const currentStep =
    scannerState === 'CAMERA_STARTING'
      ? 1
      : scannerState === 'SEARCHING_FACE'
      ? 2
      : scannerState === 'IDENTITY_VERIFIED'
      ? 3
      : 2;

  return (
    <div className="bg-[#0D0D0D] border border-zinc-800 rounded-2xl p-6 shadow-2xl w-full max-w-md mx-auto font-sans flex flex-col items-center justify-between space-y-6">
      
      {/* Session Title Header Bar */}
      <div className="w-full flex items-center justify-between text-xs pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white tracking-tight truncate max-w-[200px]">
            {sessionTitle || 'Active Election Terminal'}
          </span>
        </div>
        <Badge variant="indigo">Biometric Guard</Badge>
      </div>

      {/* VERIFIED SUCCESS SCREEN */}
      {scannerState === 'IDENTITY_VERIFIED' ? (
        <div className="my-auto flex flex-col items-center text-center space-y-5 py-6">
          <div className="w-20 h-20 rounded-full bg-emerald-950/60 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/50">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight">Identity Verified</h2>
            <p className="text-xs text-zinc-400">Welcome,</p>
            <h3 className="text-lg font-black text-emerald-400 font-mono">{voterName}</h3>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
            Single-use ballot authorization token generated. Preparing digital ballot...
          </p>
        </div>
      ) : (
        /* CAMERA SCANNER RETICLE VIEW */
        <div className="w-full flex flex-col items-center space-y-5">
          <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 aspect-square flex items-center justify-center">
            <Camera onCapture={handleCaptureReady} />

            {/* Corner Bracket Reticle Frame */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              <div
                className={`w-56 h-56 rounded-2xl transition-all duration-300 relative flex items-center justify-center ${
                  scannerState === 'ALREADY_VOTED'
                    ? 'border-2 border-amber-400 shadow-lg shadow-amber-400/20'
                    : scannerState === 'MULTIPLE_FACES' || scannerState === 'UNKNOWN_FACE'
                    ? 'border-2 border-red-400 shadow-lg shadow-red-400/20'
                    : 'border-2 border-indigo-500 shadow-lg shadow-indigo-500/20'
                }`}
              >
                {/* 4 Corner Bracket Accents */}
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-indigo-500 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-indigo-500 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-indigo-500 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-indigo-500 rounded-br" />

                {/* Scan animation line */}
                {scannerState === 'SEARCHING_FACE' && (
                  <div className="w-full h-0.5 bg-indigo-400 animate-scan-line shadow-sm shadow-indigo-400" />
                )}
              </div>
            </div>
          </div>

          {/* Status Message Label below video */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-white">
              {scannerState === 'SEARCHING_FACE' && 'Looking for face...'}
              {scannerState === 'FACE_DETECTED' && 'Face Detected'}
              {scannerState === 'UNKNOWN_FACE' && 'Face Not Recognized'}
              {scannerState === 'MULTIPLE_FACES' && 'Multiple Faces Detected'}
              {scannerState === 'ALREADY_VOTED' && 'Vote Already Recorded'}
              {scannerState === 'LOW_QUALITY' && 'Lighting Adjustment Required'}
            </h3>
            <p className="text-xs text-zinc-400">{statusMessage}</p>
          </div>
        </div>
      )}

      {/* Progress & Attempts */}
      <VerificationProgress currentStep={currentStep} totalSteps={3} statusText={statusMessage} />
    </div>
  );
}
