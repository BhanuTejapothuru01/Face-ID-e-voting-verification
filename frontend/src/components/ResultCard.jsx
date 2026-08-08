import React from 'react';

export default function ResultCard({ result, onReset }) {
  if (!result) return null;

  const isEligible = result.data?.eligibility === 'ELIGIBLE';
  const isRegistered = result.data?.voter_id !== undefined;

  let borderColor = 'border-gray-700';
  let title = 'Not Verified';
  let color = 'text-gray-400';

  if (isRegistered) {
    if (isEligible) {
      borderColor = 'border-green-500';
      title = 'ELIGIBLE TO VOTE';
      color = 'text-green-500';
    } else {
      borderColor = 'border-red-500';
      title = 'NOT ELIGIBLE';
      color = 'text-red-500';
    }
  }

  return (
    <div className={`w-full max-w-md border ${borderColor} bg-gray-900 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center space-y-4`}>
      <h2 className={`text-2xl font-black tracking-widest ${color}`}>{title}</h2>
      
      {isRegistered && (
        <div className="w-full text-left bg-black p-4 rounded-lg border border-gray-800 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Name:</span>
            <span className="font-semibold text-white">{result.data.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Voter ID:</span>
            <span className="font-mono text-white">{result.data.voter_id}</span>
          </div>
        </div>
      )}

      {result.data?.similarity && (
        <div className="text-xs text-gray-500 font-mono flex gap-4 mt-4">
          <span>Match: {(result.data.similarity * 100).toFixed(1)}%</span>
          <span>Time: {result.data.processing_time_ms}ms</span>
        </div>
      )}

      <button onClick={onReset} className="mt-6 w-full py-3 border border-gray-700 hover:bg-gray-800 rounded-xl transition text-sm">
        Scan Again
      </button>
    </div>
  );
}
