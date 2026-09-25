import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assetService } from '../services/assetService';
import {
  Box,
  PlusCircle,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Hash,
  Laptop,
  Smartphone,
  Watch,
  FileText,
  Key,
  Briefcase
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatAddress, formatDate } from '../utils/formatters';

const categories = ['ALL', 'LAPTOP', 'PHONE', 'ELECTRONICS', 'DOCUMENTS', 'KEYS', 'BAG', 'OTHER'];
const statuses = ['ALL', 'REGISTERED', 'LOST', 'FOUND', 'CLAIM_PENDING', 'VERIFIED', 'RETURNED'];

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const res = await assetService.getAssets({
          search: search || undefined,
          category: category !== 'ALL' ? category : undefined,
          status: status !== 'ALL' ? status : undefined
        });
        if (res.success) {
          setAssets(res.assets);
        }
      } catch (err) {
        console.error('Error loading assets:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchAssets, 200);
    return () => clearTimeout(timeout);
  }, [search, category, status]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display">Asset Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered physical assets with cryptographic provenance and ownership records
          </p>
        </div>

        <Link
          to="/register-asset"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          Register New Asset
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-col md:flex-row items-center gap-3">
        
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Asset ID (e.g. BF-LAP-00128), Name, Serial Number..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Asset Cards Grid */}
      {loading ? (
        <LoadingSpinner message="Scanning decentralized asset registry..." />
      ) : assets.length === 0 ? (
        <EmptyState
          title="No assets found"
          description="No registered physical assets matched your active filters or search criteria."
          actionText="Register Asset"
          actionLink="/register-asset"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col group"
            >
              {/* Asset Media Banner */}
              <div className="h-44 bg-slate-100 relative overflow-hidden">
                <img
                  src={asset.primaryImageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge status={asset.status} />
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] bg-slate-900/80 backdrop-blur text-white px-2 py-1 rounded-lg font-bold">
                  {asset.id}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                    {asset.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mt-0.5 group-hover:text-brand-600 transition-colors line-clamp-1">
                    {asset.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 font-mono text-[11px]">
                  {asset.serialNumber && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Serial Tag:</span>
                      <span className="font-semibold">{asset.serialNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400">Current Owner:</span>
                    <span className="font-semibold text-slate-800">{asset.currentOwner?.name}</span>
                  </div>
                  {asset.blockchainTxHash && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="text-slate-400">Ledger Hash:</span>
                      <span className="text-indigo-600 font-medium">
                        {formatAddress(asset.blockchainTxHash)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2">
                  <Link
                    to={`/assets/${asset.id}`}
                    className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                  >
                    <span>View Provenance Details</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
