import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import {
  FileCheck,
  Upload,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  PackageCheck,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const categories = ['LAPTOP', 'PHONE', 'ELECTRONICS', 'DOCUMENTS', 'KEYS', 'BAG', 'OTHER'];

export default function ReportFoundPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    itemName: '',
    category: 'LAPTOP',
    description: '',
    foundLocation: '',
    dateFound: new Date().toISOString().split('T')[0],
    timeFound: '16:00',
    storageLocation: 'Campus Security Desk - Main Block Vault',
    additionalDetails: ''
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
      data.append('itemName', formData.itemName);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('foundLocation', formData.foundLocation);
      data.append('dateFound', formData.dateFound);
      if (formData.timeFound) data.append('timeFound', formData.timeFound);
      if (formData.storageLocation) data.append('storageLocation', formData.storageLocation);
      if (formData.additionalDetails) data.append('additionalDetails', formData.additionalDetails);
      if (file) data.append('image', file);

      const res = await reportService.createFoundReport(data);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log found item.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Found Item Successfully Logged
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Thank you for turning in this item! It is now listed in the verified registry where rightful owners can submit ownership proof.
            </p>
          </div>

          {/* Generated Found Receipt */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-left font-mono text-xs space-y-2.5 border border-amber-500/30">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Found Report ID:</span>
              <span className="text-amber-400 font-bold text-sm">{successData.reportId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Item Name:</span>
              <span className="text-white font-semibold">{successData.report.itemName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Deposited At:</span>
              <span className="text-slate-300">{successData.report.storageLocation}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-300">{formatDateTime(successData.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Status:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 uppercase text-[10px] font-bold">
                AVAILABLE FOR CLAIM
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/found-reports"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              View Found Registry
            </Link>
            <Link
              to="/search"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              Search All Items
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
        <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <FileCheck className="w-5 h-5" />
          </span>
          Log a Found Item
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Record a found article in the campus custody registry for secure recovery.
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Name / Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Description & Found Condition <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Silver wireless headphones found inside black zipper case on food court table 14..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Found Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="foundLocation"
                required
                value={formData.foundLocation}
                onChange={handleChange}
                placeholder="e.g. Main Food Court, Table 14"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date Found <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dateFound"
                required
                value={formData.dateFound}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Found
              </label>
              <input
                type="time"
                name="timeFound"
                value={formData.timeFound}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Current Physical Storage Vault / Custody Location
            </label>
            <input
              type="text"
              name="storageLocation"
              value={formData.storageLocation}
              onChange={handleChange}
              placeholder="e.g. Campus Central Security Desk - Main Block Vault A1"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Photograph of Found Item</label>
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
                    <span className="text-[11px] text-amber-600 font-semibold mt-2">Click to replace photo</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-600 font-medium">Upload photo of the found article</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Logging Found Item on Central Ledger...</span>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                <span>Log Found Item in Registry</span>
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
