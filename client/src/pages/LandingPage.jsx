import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  Cpu,
  Lock,
  Database,
  Cloud,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  FileCheck2,
  Users,
  Award
} from 'lucide-react';
import BlockchainBadge from '../components/BlockchainBadge';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 bg-gradient-to-b from-indigo-50/60 via-white to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Top Announcement Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-brand-800 text-xs font-semibold shadow-subtle animate-in fade-in slide-in-from-top-4 duration-500">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Next-Gen Cryptographic Asset Protection</span>
              <span className="w-1 h-1 rounded-full bg-brand-400"></span>
              <span className="text-brand-600">B.Tech Prototype</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight font-display leading-[1.1]">
              Recover What <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">Matters</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              A secure and transparent platform for managing lost and found assets with trusted ownership verification, tamper-evident blockchain provenance, and cloud-native architecture.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/report-lost"
                className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                Report Lost Item
              </Link>

              <Link
                to="/report-found"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <FileCheck2 className="w-4 h-4 text-amber-500" />
                Report Found Item
              </Link>

              <Link
                to="/search"
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Search className="w-4 h-4 text-indigo-300" />
                Search Registry
              </Link>
            </div>

            {/* Ledger status indicator */}
            <div className="pt-4 flex justify-center">
              <BlockchainBadge network="Demo Blockchain Environment" />
            </div>
          </div>

          {/* Feature Showcase Card Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-3xl p-2 bg-gradient-to-b from-indigo-200/50 to-slate-200/30 shadow-2xl border border-white/80">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-inner">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Zero Fraud Claims</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Cryptographic identity matching and hardware serial verification prevent false ownership claims.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 md:pl-6 pt-4 md:pt-0">
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Blockchain Ledger</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Every asset registration and ownership transfer is permanently hashed on an immutable ledger.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 md:pl-6 pt-4 md:pt-0">
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">Smart Matching</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Automated category, location, and description matching connects lost items with found deposits.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            Streamlined Workflow
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display mt-3">
            How BlockFind Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            A transparent 4-stage lifecycle from registration to physical recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 font-black text-sm flex items-center justify-center mb-4 border border-brand-200">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Register Asset</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Register high-value assets (laptops, phones, gear) with hardware serials to create a unique Asset ID on the ledger.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 font-black text-sm flex items-center justify-center mb-4 border border-rose-200">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Report Lost/Found</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Submit reports with geo-locations, timestamps, photos, and item characteristics in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 font-black text-sm flex items-center justify-center mb-4 border border-amber-200">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Verify Ownership</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Submit proof of purchase, serial identifiers, or photo evidence. Authorized Verifiers review against registry logs.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all relative group">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center mb-4 border border-emerald-200">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Recover & Settle</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Upon claim approval, ownership is cryptographically transferred and the asset is returned safely at campus security.
            </p>
          </div>

        </div>
      </section>

      {/* 3. Built for Trust & Security Section */}
      <section className="bg-slate-900 text-white py-16 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
              Built for Trust
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-display mt-3">
              Cryptographic Integrity at Every Step
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              BlockFind resolves the systemic trust deficits in traditional college and enterprise lost-and-found desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">Blockchain Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immutable SHA-256 block hashing guarantees historical transactions cannot be modified or forged.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">Role-Based Access</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Strict segregation of duties between regular Students, Campus Verifiers, and Infrastructure Admins.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">Auditable Trail</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every login, status change, claim filing, and approval is logged into an immutable audit event stream.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white font-display">Cloud-Native Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Architected for high availability on AWS EC2, Amazon RDS PostgreSQL, Amazon S3, and Elastic Load Balancing.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Ready to Get Started Banner */}
      <section className="max-w-5xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Start Securing Your Campus Assets
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Explore the registry, report an incident, or test out the cryptographic verification layer right now.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-all"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-all"
          >
            Sign In with Demo Credentials
          </Link>
        </div>
      </section>

    </div>
  );
}
