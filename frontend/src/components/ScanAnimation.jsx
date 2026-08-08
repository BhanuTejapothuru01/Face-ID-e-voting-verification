import React from 'react';

// States: FINDING, LOCKED, SCANNING, LIVENESS, EMBEDDING, SEARCHING, VERIFIED, REJECTED
export default function ScanAnimation({ state }) {
  
  // A mapping of states to text and border colors
  const stateConfig = {
    FINDING: { text: "Scanning for face...", color: "border-gray-500", opacity: "opacity-50" },
    LOCKED: { text: "Face Locked", color: "border-white", opacity: "opacity-100" },
    SCANNING: { text: "Capturing Biometrics...", color: "border-blue-500", opacity: "opacity-100 animate-pulse" },
    LIVENESS: { text: "Verifying Liveness...", color: "border-purple-500", opacity: "opacity-100 animate-pulse" },
    EMBEDDING: { text: "Generating Vector...", color: "border-indigo-500", opacity: "opacity-100" },
    SEARCHING: { text: "Matching against FAISS...", color: "border-yellow-500", opacity: "opacity-100 animate-pulse" },
    VERIFIED: { text: "Match Found", color: "border-green-500", opacity: "opacity-100" },
    REJECTED: { text: "Verification Failed", color: "border-red-500", opacity: "opacity-100" }
  };

  const config = stateConfig[state] || stateConfig.FINDING;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
      {/* Reticle / Pulse Animation */}
      <div className={`w-48 h-64 border-2 rounded-[2rem] transition-all duration-500 ease-in-out ${config.color} ${config.opacity}`}>
        {/* Scanning line for specific states */}
        {(state === 'SCANNING' || state === 'LIVENESS') && (
          <div className="w-full h-1 bg-blue-400 absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
        )}
      </div>
      
      <div className="absolute bottom-4 bg-black/60 px-4 py-1 rounded-full text-xs font-mono text-white tracking-widest backdrop-blur-sm transition-colors duration-300">
        {config.text}
      </div>
    </div>
  );
}
