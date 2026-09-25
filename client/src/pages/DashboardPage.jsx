import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assetService } from '../services/assetService';
import { reportService } from '../services/reportService';
import { claimService } from '../services/claimService';
import { chatService } from '../services/chatService';
import {
  Box,
  AlertTriangle,
  FileCheck,
  Layers,
  PlusCircle,
  Search,
  Cpu,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Lock,
  User,
  CheckCheck
} from 'lucide-react';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import BlockchainBadge from '../components/BlockchainBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';

export default function DashboardPage() {
  const { user } = useAuth();
  const [myAssets, setMyAssets] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [lostReports, setLostReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [assetsRes, claimsRes, lostRes, chatRes] = await Promise.all([
          assetService.getMyAssets(),
          claimService.getClaims(),
          reportService.getLostReports({ limit: 5 }),
          chatService.getMyConversations()
        ]);

        if (assetsRes.success) setMyAssets(assetsRes.assets);
        if (claimsRes.success) setMyClaims(claimsRes.claims);
        if (lostRes.success) setLostReports(lostRes.reports);
        if (chatRes.success) setConversations(chatRes.conversations);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your BlockFind Dashboard..." />;
  }

  const activeLostCount = myAssets.filter(a => a.status === 'LOST').length;
  const pendingClaimsCount = myClaims.filter(c => c.status === 'PENDING_VERIFICATION').length;
  const activeChats = conversations.filter(c => c.status !== 'RESOLVED');
  const resolvedChats = conversations.filter(c => c.status === 'RESOLVED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header with fast action buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 font-display">
              Hello, {user?.name}
            </h1>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {user?.organization || 'VIT Campus'} • Dual Asset Lifecycle (Registered & Direct Incident Reporting)
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/messages"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Secure Chat ({conversations.length})
          </Link>
          <Link
            to="/report-lost"
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Report Lost
          </Link>
          <Link
            to="/report-found"
            className="px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-3.5 h-3.5" />
            Report Found
          </Link>
          <Link
            to="/register-asset"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Register Asset (Optional)
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Requirement 18) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Active Conversations"
          value={activeChats.length}
          subtitle="Anonymous chat & verification"
          icon={MessageSquare}
          color="brand"
        />
        <StatCard
          title="Lost Incidents"
          value={activeLostCount}
          subtitle={activeLostCount > 0 ? 'Active searches underway' : 'All assets accounted for'}
          icon={AlertTriangle}
          color={activeLostCount > 0 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Submitted Claims"
          value={myClaims.length}
          subtitle={`${pendingClaimsCount} pending verification`}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Resolved Cases"
          value={resolvedChats.length}
          subtitle="Two-sided confirmation complete"
          icon={CheckCheck}
          color="emerald"
        />
      </div>

      {/* 3. Main Dashboard Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Anonymous Conversations & Registered Assets */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Conversations Widget (Requirement 18) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  Active Secure Conversations
                </h3>
                <p className="text-xs text-slate-500">Anonymous messaging threads with finders & claimants</p>
              </div>
              <Link
                to="/messages"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Open Messenger <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeChats.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl p-4">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No active conversation threads.</p>
                <Link
                  to="/search"
                  className="mt-3 inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                >
                  Browse Lost & Found Items
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeChats.map((c) => (
                  <div key={c.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {c.itemTitle}
                        </span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                          c.status === 'VERIFIED'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : c.status === 'RETURN_PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span>Role: <strong className="text-indigo-600 font-sans">{c.myRole}</strong></span>
                        <span>•</span>
                        <span>Participant: {c.otherUser?.alias}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {c.latestMessage?.content || 'No messages yet'}
                      </p>
                    </div>

                    <Link
                      to={`/messages/${c.id}`}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>Open Chat</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Resolved Cases Widget */}
          {resolvedChats.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
              <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Resolved & Recovered Cases
              </h3>

              <div className="divide-y divide-slate-100">
                {resolvedChats.map((c) => (
                  <div key={c.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{c.itemTitle}</span>
                      <div className="text-[11px] text-emerald-700 font-mono">
                        ✓ Returned & Confirmed • Blockchain Stamped
                      </div>
                    </div>
                    <Link
                      to={`/messages/${c.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      View Case
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My Registered Assets List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-display">My Registered Assets</h3>
                <p className="text-xs text-slate-500">Optional pre-registered physical devices</p>
              </div>
              <Link
                to="/assets"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                View all ({myAssets.length}) <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {myAssets.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-200 rounded-2xl p-4">
                <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">You have not registered any assets in advance.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Asset registration is optional. You can directly report lost items whenever needed.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {myAssets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <Link to={`/assets/${asset.id}`} className="text-xs font-bold text-slate-900 hover:text-indigo-600 block">
                        {asset.name}
                      </Link>
                      <span className="font-mono text-[10px] text-slate-400">{asset.id} • {asset.category}</span>
                    </div>
                    <Badge status={asset.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Col: Quick Search & Blockchain Telemetry */}
        <div className="space-y-8">
          
          {/* Quick Smart Search */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold font-display">Search Lost & Found</h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Find misplaced items across campus using rule-based smart matching.
            </p>
            <Link
              to="/search"
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Search className="w-4 h-4 text-indigo-600" />
              Open Search & Matching Engine
            </Link>
          </div>

          {/* Blockchain Node Telemetry */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Blockchain Provenance
              </h3>
              <Cpu className="w-4 h-4 text-slate-400" />
            </div>

            <BlockchainBadge network="Demo Blockchain Environment" />

            <div className="space-y-2 text-xs font-mono pt-2">
              <div className="flex items-center justify-between text-slate-600">
                <span>Ledger Integrity</span>
                <span className="text-emerald-600 font-bold">100% Intact</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Consensus Protocol</span>
                <span className="text-slate-900 font-semibold">PoA (BFT)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Case Proofs Stamped</span>
                <span className="text-indigo-600 font-bold">SHA-256</span>
              </div>
            </div>

            <Link
              to="/blockchain"
              className="mt-2 w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-200 transition-colors"
            >
              <span>Explore Ledger Blocks</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
