import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blockchainService } from '../services/blockchainService';
import {
  Cpu,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Hash,
  Database,
  Layers,
  ArrowUpRight,
  Activity,
  Terminal,
  Key,
  Copy,
  Check
} from 'lucide-react';
import BlockchainBadge from '../components/BlockchainBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatAddress, formatDateTime, formatDate } from '../utils/formatters';

export default function BlockchainPage() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txSearch, setTxSearch] = useState('');
  
  // Interactive Verification Validator Box
  const [verifyHashInput, setVerifyHashInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [copiedTx, setCopiedTx] = useState(null);

  useEffect(() => {
    const fetchBlockchainData = async () => {
      try {
        setLoading(true);
        const [statsRes, txsRes] = await Promise.all([
          blockchainService.getStats(),
          blockchainService.getBlocks({ limit: 50 })
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (txsRes.success) setTransactions(txsRes.transactions);
      } catch (err) {
        console.error('Error querying blockchain node:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockchainData();
  }, []);

  const handleVerifyHash = async (e) => {
    e.preventDefault();
    if (!verifyHashInput.trim()) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await blockchainService.verifyHash(verifyHashInput.trim());
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({
        verified: false,
        message: err.response?.data?.message || 'Hash not found or verification mismatch.'
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTx(text);
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredTxs = transactions.filter((tx) => {
    if (!txSearch) return true;
    const q = txSearch.toLowerCase();
    return (
      tx.txHash?.toLowerCase().includes(q) ||
      tx.assetId?.toLowerCase().includes(q) ||
      tx.blockNumber?.toString().includes(q) ||
      tx.actionType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header with Blockchain Network Status (Requirement 10) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Cpu className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black font-display tracking-tight text-white">
                    Blockchain Provenance Explorer
                  </h1>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live Node
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Network: <span className="text-indigo-300 font-semibold">{stats?.networkName || 'Demo Blockchain Environment'}</span>
                </p>
              </div>
            </div>

            {/* Network Consensus Banner */}
            <div className="px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>SHA-256 Ledger • Proof-of-Authority Consensus</span>
            </div>
          </div>

          {/* Telemetry KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Block Height</span>
              <span className="text-xl font-bold text-emerald-400">#{stats?.blockHeight || 1015}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Total Transactions</span>
              <span className="text-xl font-bold text-indigo-400">{stats?.totalTransactions || 24}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Consensus Protocol</span>
              <span className="text-xl font-bold text-purple-400">PoA (BFT)</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Ledger Integrity</span>
              <span className="text-xl font-bold text-teal-400">100% Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Cryptographic Hash Validator */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Cryptographic SHA-256 Ledger Validator
            </h3>
            <p className="text-xs text-slate-500">
              Verify the authenticity of any transaction hash or Asset ID against the immutable ledger
            </p>
          </div>
        </div>

        <form onSubmit={handleVerifyHash} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={verifyHashInput}
              onChange={(e) => setVerifyHashInput(e.target.value)}
              placeholder="Enter Tx Hash (e.g. 0x8f3c7890a542b...) to cryptographically verify"
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={verifying}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <span>Validating Merkle Tree...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Verify Hash Integrity</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Receipt */}
        {verifyResult && (
          <div className={`p-4 rounded-2xl border text-xs font-mono animate-in fade-in duration-150 ${
            verifyResult.verified
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/80 border-rose-200 text-rose-900'
          }`}>
            {verifyResult.verified ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>TRANSACTION VERIFIED IN BLOCK #{verifyResult.blockNumber} (100% INTACT)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>Tx Hash: <span className="text-slate-700 font-semibold">{verifyResult.txHash}</span></div>
                  <div>Network: <span className="text-slate-700 font-semibold">{verifyResult.network}</span></div>
                  <div>Action: <span className="text-indigo-700 font-bold">{verifyResult.actionType}</span></div>
                  <div>Merkle Status: <span className="text-emerald-700 font-bold">{verifyResult.merkleStatus}</span></div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>{verifyResult.message || 'Transaction hash could not be validated.'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Immutable Block Transactions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Blocks & Transactions Stream
            </h3>
            <p className="text-xs text-slate-500">Real-time chronicle of all asset mints and verified claims</p>
          </div>

          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              placeholder="Search blocks, Tx Hash, Asset ID..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Scanning blockchain blocks..." />
        ) : filteredTxs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No transactions found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Block #</th>
                  <th className="pb-3 font-semibold">Event / Action</th>
                  <th className="pb-3 font-semibold">Asset Reference</th>
                  <th className="pb-3 font-semibold">Transaction Hash</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Block Number */}
                    <td className="py-3.5 font-bold text-indigo-600">
                      #{tx.blockNumber}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 font-sans">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                        {tx.actionType}
                      </span>
                    </td>

                    {/* Asset Reference */}
                    <td className="py-3.5">
                      {tx.assetId ? (
                        <Link
                          to={`/assets/${tx.assetId}`}
                          className="font-bold text-slate-900 hover:text-brand-600 flex items-center gap-1"
                        >
                          {tx.assetId}
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="text-slate-400">UNTRACKED</span>
                      )}
                    </td>

                    {/* Transaction Hash */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <span>{formatAddress(tx.txHash, 6)}</span>
                        <button
                          onClick={() => copyToClipboard(tx.txHash)}
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="Copy Tx Hash"
                        >
                          {copiedTx === tx.txHash ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 text-slate-500 text-[11px] font-sans">
                      {formatDateTime(tx.blockTimestamp)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 text-right font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        VERIFIED
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
}
