import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function BlockchainBadge({ txHash, blockNumber, network = 'Demo Blockchain Environment', className = '' }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs border border-indigo-500/30 shadow-sm ${className}`}
    >
      <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
      <div className="flex items-center gap-1.5 font-mono text-[11px]">
        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-slate-300 font-semibold">{network}</span>
        {blockNumber && (
          <span className="text-slate-400">
            • Block #{blockNumber}
          </span>
        )}
      </div>
      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-400/30 font-bold uppercase tracking-wider">
        Verifiable
      </span>
    </div>
  );
}
