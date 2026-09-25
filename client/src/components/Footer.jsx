import React from 'react';
import { ShieldCheck, Lock, Database, Cpu, Cloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Project Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base font-display">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              BlockFind
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Enterprise Cryptographic Lost & Found Asset Management and Decentralized Provenance Verification.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-[11px] text-brand-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Blockchain Telemetry
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Quick Portals</h4>
            <ul className="space-y-2">
              <li><Link to="/search" className="hover:text-white transition-colors">Search Lost & Found Registry</Link></li>
              <li><Link to="/report-lost" className="hover:text-white transition-colors">Report Lost Asset</Link></li>
              <li><Link to="/report-found" className="hover:text-white transition-colors">Log Found Item</Link></li>
              <li><Link to="/claims" className="hover:text-white transition-colors">Submit Ownership Claim</Link></li>
            </ul>
          </div>

          {/* Col 3: Architecture & Security */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">System Architecture</h4>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                Solidity / Hardhat / SHA-256
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Prisma ORM + PostgreSQL / SQLite
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                AWS EC2, RDS, S3, ELB Ready
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                RBAC & JWT Cryptographic Auth
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Security */}
          <div className="space-y-2.5">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider">Platform Security</h4>
            <p className="text-slate-400 text-xs">
              Zero-Knowledge Verification Architecture<br />
              SHA-256 Chain of Custody<br />
              Decentralized Identity & Asset Ledger
            </p>
            <div className="pt-1">
              <Link to="/blockchain" className="text-brand-400 hover:text-brand-300 underline text-xs">
                Explore Cryptographic Ledger →
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 BlockFind Asset Management System. All cryptographic proofs verified.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Proof of Authority Consensus</span>
            <span>•</span>
            <span>Zero-Knowledge Privacy Standard</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
