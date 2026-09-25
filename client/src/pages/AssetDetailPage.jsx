import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { assetService } from '../services/assetService';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Cpu,
  ShieldCheck,
  Clock,
  History,
  AlertTriangle,
  FileCheck,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  User,
  CheckCircle2
} from 'lucide-react';
import Badge from '../components/Badge';
import BlockchainBadge from '../components/BlockchainBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatAddress, formatDate, formatDateTime } from '../utils/formatters';

export default function AssetDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        setLoading(true);
        const res = await assetService.getAssetById(id);
        if (res.success) {
          setAsset(res.asset);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Asset not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [id]);

  if (loading) return <LoadingSpinner message="Querying blockchain provenance for Asset..." />;
  if (error || !asset) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Asset Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'The requested asset does not exist in the ledger.'}</p>
        <Link to="/assets" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Registry
        </Link>
      </div>
    );
  }

  const isOwner = user && asset.currentOwnerId === user.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/assets" className="hover:text-slate-800">Assets</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono text-slate-800 font-bold">{asset.id}</span>
      </nav>

      {/* 1. Main Asset Header & Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Asset Image */}
          <div className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video lg:aspect-square relative">
            <img
              src={asset.primaryImageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'}
              alt={asset.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge status={asset.status} />
            </div>
          </div>

          {/* Asset Info & Ownership Details */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-200">
                  {asset.category}
                </span>
                <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                  {asset.id}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
                {asset.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {asset.description}
              </p>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Serial Number / IMEI</span>
                <span className="font-bold text-slate-800">{asset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Current Verified Owner</span>
                <span className="font-bold text-slate-800">{asset.currentOwner?.name}</span>
                <span className="block text-[10px] text-slate-500 font-sans">{asset.currentOwner?.organization}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Registered Timestamp</span>
                <span className="text-slate-700">{formatDateTime(asset.registeredAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Blockchain Record</span>
                <span className="text-indigo-600 font-bold">{formatAddress(asset.blockchainTxHash, 6)}</span>
              </div>
            </div>

            {/* Fast Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {isOwner && asset.status !== 'LOST' && (
                <Link
                  to={`/report-lost?assetId=${asset.id}`}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report This Asset as Lost
                </Link>
              )}

              <Link
                to="/blockchain"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Cpu className="w-4 h-4 text-indigo-400" />
                Inspect Block in Ledger
              </Link>
            </div>

          </div>

        </div>
      </div>

      {/* 2. Cryptographic Provenance & Ownership History Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Ownership Timeline */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Ownership History Timeline</h3>
              <p className="text-xs text-slate-500">Chronological ledger of custody and legal ownership transitions</p>
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {asset.ownershipHistory?.map((record, index) => (
              <div key={record.id} className="relative group">
                <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50"></span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">
                      {record.transferType === 'INITIAL_REGISTRATION'
                        ? 'Genesis Registration'
                        : 'Verified Ownership Transfer'}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(record.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {record.previousOwner
                      ? `Transferred from ${record.previousOwner.name} to ${record.newOwner.name}`
                      : `Registered by original owner ${record.newOwner.name}`}
                  </p>
                  {record.transferReason && (
                    <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                      "{record.transferReason}"
                    </p>
                  )}
                  {record.blockchainTxHash && (
                    <div className="font-mono text-[10px] text-indigo-600 pt-1">
                      Tx: {formatAddress(record.blockchainTxHash, 8)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Blockchain Transactions List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">Blockchain Transactions</h3>
              <p className="text-xs text-slate-500">Immutable cryptographic hashes stamped for this asset</p>
            </div>
          </div>

          <div className="space-y-3">
            {asset.blockchainTxs?.map((tx) => (
              <div
                key={tx.id}
                className="p-4 rounded-2xl bg-slate-900 text-white font-mono text-xs border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold">
                    {tx.actionType}
                  </span>
                  <span className="text-emerald-400 font-bold">Block #{tx.blockNumber}</span>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="text-slate-400">
                    Tx Hash: <span className="text-slate-200">{formatAddress(tx.txHash, 10)}</span>
                  </div>
                  <div className="text-slate-400">
                    From: <span className="text-slate-300">{formatAddress(tx.fromAddress, 6)}</span> → To: <span className="text-slate-300">{formatAddress(tx.toAddress, 6)}</span>
                  </div>
                  <div className="text-slate-400">
                    Payload Hash: <span className="text-slate-300">{formatAddress(tx.payloadHash, 8)}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800 flex justify-between">
                  <span>Network: {tx.networkName}</span>
                  <span>{formatDate(tx.blockTimestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
