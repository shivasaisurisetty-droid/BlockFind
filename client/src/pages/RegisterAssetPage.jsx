import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { assetService } from '../services/assetService';
import {
  Box,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowRight,
  AlertCircle,
  Hash,
  Laptop,
  Smartphone,
  Layers,
  FileCheck
} from 'lucide-react';
import BlockchainBadge from '../components/BlockchainBadge';
import { formatAddress } from '../utils/formatters';

const categories = [
  { id: 'LAPTOP', label: 'Laptop / Computer', icon: Laptop },
  { id: 'PHONE', label: 'Smartphone / Tablet', icon: Smartphone },
  { id: 'ELECTRONICS', label: 'Electronics & Audio', icon: Cpu },
  { id: 'DOCUMENTS', label: 'ID Cards & Certificates', icon: FileCheck },
  { id: 'KEYS', label: 'Vehicle Keys / Access Fob', icon: Hash },
  { id: 'BAG', label: 'Backpack / Luggage', icon: Layers },
  { id: 'OTHER', label: 'Other Valuables', icon: Box },
];

export default function RegisterAssetPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'LAPTOP',
    serialNumber: '',
    description: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      if (formData.serialNumber) data.append('serialNumber', formData.serialNumber);
      data.append('description', formData.description);
      if (file) data.append('image', file);

      const res = await assetService.createAsset(data);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register asset.');
    } finally {
      setLoading(false);
    }
  };

  // If successfully registered, show confirmation screen
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Asset Successfully Registered!
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your physical asset has been recorded in the system and an immutable genesis block has been created on the ledger.
            </p>
          </div>

          {/* Asset & Blockchain Details Receipt Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-left font-mono text-xs space-y-2.5 border border-indigo-500/30">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Unique Asset ID:</span>
              <span className="text-brand-300 font-bold text-sm">{successData.asset.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Asset Name:</span>
              <span className="text-white font-semibold">{successData.asset.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Blockchain Network:</span>
              <span className="text-indigo-300">{successData.blockchain.networkName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Block Number:</span>
              <span className="text-emerald-400">#{successData.blockchain.blockNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction Hash:</span>
              <span className="text-indigo-400">{formatAddress(successData.blockchain.txHash, 8)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Verification Status:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase text-[10px] font-bold">
                CONFIRMED ON LEDGER
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to={`/assets/${successData.asset.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              View Asset Details & Timeline
            </Link>
            <Link
              to="/blockchain"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              Inspect on Blockchain Explorer
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 font-display">Register Physical Asset</h1>
        <p className="text-xs text-slate-500 mt-1">
          Mint an immutable ownership record for your laptops, gadgets, or personal valuables.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
        
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Select Asset Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = formData.category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: c.id })}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 text-brand-700 ring-2 ring-brand-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name & Serial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Asset Name & Model <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dell Inspiron 15 (Core i7)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hardware Serial Number / IMEI / Tag
              </label>
              <input
                type="text"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                placeholder="e.g. DL-INSP-2026-001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Distinguishing Features & Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe color, scratches, stickers, skin, or unique identifiers that prove physical possession..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Asset Photograph</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl bg-slate-50 hover:bg-slate-100/60 transition-colors cursor-pointer relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="space-y-2 text-center">
                {preview ? (
                  <div className="flex flex-col items-center">
                    <img src={preview} alt="Preview" className="h-32 object-contain rounded-xl shadow-sm" />
                    <span className="text-[11px] text-brand-600 font-semibold mt-2">Click or drop to replace image</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <div className="flex text-xs text-slate-600 justify-center">
                      <span className="font-semibold text-brand-600 hover:text-brand-500">Upload a photo</span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WEBP up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Generating Cryptographic Block Hash & Registering...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Register Asset & Record on Blockchain</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
