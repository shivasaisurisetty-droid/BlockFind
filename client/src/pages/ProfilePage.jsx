import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  ShieldCheck,
  Building,
  Phone,
  Key,
  Box,
  Layers,
  Cpu
} from 'lucide-react';
import BlockchainBadge from '../components/BlockchainBadge';
import { formatAddress } from '../utils/formatters';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">User Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Your authenticated cryptographic identity on the BlockFind network.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <img
            src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=6366f1&color=fff`}
            alt={user?.name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500/20 shadow-md"
          />
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-slate-900 font-display">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Role: {user?.role}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Verified Campus Member
              </span>
            </div>
          </div>
        </div>

        {/* Credentials and Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">User Identifier (UUID)</span>
            <div className="text-slate-800 font-bold break-all">{user?.id}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Department / Organization</span>
            <div className="text-slate-800 font-bold font-sans">{user?.organization || 'VIT Campus'}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Contact Phone</span>
            <div className="text-slate-800 font-bold">{user?.phone || 'Not provided'}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-slate-400 text-[10px] uppercase font-sans font-semibold">Cryptographic Address Reference</span>
            <div className="text-indigo-600 font-bold">{formatAddress(user?.email ? `0x${user.id.replace(/-/g, '')}` : '0x000', 8)}</div>
          </div>
        </div>

        {/* Blockchain Status Bar */}
        <div className="pt-2">
          <BlockchainBadge network="Demo Blockchain Environment" />
        </div>

      </div>

    </div>
  );
}
