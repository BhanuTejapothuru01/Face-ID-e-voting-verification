import React from 'react';
import { Link } from 'react-router-dom';
import { ScanFace, UserPlus, ShieldAlert } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full space-y-12">
        
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 border-2 border-white rounded-[2rem] flex items-center justify-center mb-6">
            <ScanFace className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter">FaceVote</h1>
          <p className="text-gray-400 font-mono text-sm uppercase tracking-widest">Biometric Verification Terminal</p>
        </div>

        <div className="space-y-4">
          <Link to="/verify" className="group relative w-full flex items-center justify-between p-6 bg-gray-900 border border-gray-800 hover:border-white rounded-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">Verify Voter</h2>
              <p className="text-sm text-gray-500">Live biometric verification</p>
            </div>
            <ScanFace className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors relative z-10" />
          </Link>
          
          <Link to="/register" className="group relative w-full flex items-center justify-between p-6 bg-gray-900 border border-gray-800 hover:border-white rounded-2xl transition-all overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <h2 className="text-xl font-bold mb-1">Register Voter</h2>
              <p className="text-sm text-gray-500">Enroll new face via biometrics</p>
            </div>
            <UserPlus className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors relative z-10" />
          </Link>
        </div>

        <div className="pt-8 text-center border-t border-gray-900">
          <Link to="/admin" className="text-sm text-gray-600 hover:text-gray-300 flex items-center justify-center transition-colors">
            <ShieldAlert className="w-4 h-4 mr-1" /> Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
