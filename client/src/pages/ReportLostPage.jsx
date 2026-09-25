import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { assetService } from '../services/assetService';
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { formatDateTime } from '../utils/formatters';

const categories = ['LAPTOP', 'PHONE', 'ELECTRONICS', 'DOCUMENTS', 'KEYS', 'BAG', 'OTHER'];

export default function ReportLostPage() {
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId');
  const navigate = useNavigate();

  const [myAssets, setMyAssets] = useState([]);
  const [formData, setFormData] = useState({
    assetId: preselectedAssetId || '',
    itemName: '',
    category: 'LAPTOP',
    description: '',
    lastKnownLocation: '',
    dateLost: new Date().toISOString().split('T')[0],
    approximateTime: '14:00',
    additionalInfo: ''
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const loadUserAssets = async () => {
      try {
        const res = await assetService.getMyAssets();
        if (res.success) {
          setMyAssets(res.assets);
          if (preselectedAssetId) {
            const found = res.assets.find(a => a.id === preselectedAssetId);
            if (found) {
              setFormData(prev => ({
                ...prev,
                assetId: found.id,
                itemName: found.name,
                category: found.category,
                description: found.description
              }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching user assets:', err);
      }
    };
    loadUserAssets();
  }, [preselectedAssetId]);

  const handleAssetSelect = (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      const selected = myAssets.find(a => a.id === selectedId);
      if (selected) {
        setFormData({
          ...formData,
          assetId: selected.id,
          itemName: selected.name,
          category: selected.category,
          description: selected.description
        });
        return;
      }
    }
    setFormData({ ...formData, assetId: '' });
  };

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
      if (formData.assetId) data.append('assetId', formData.assetId);
      data.append('itemName', formData.itemName);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('lastKnownLocation', formData.lastKnownLocation);
      data.append('dateLost', formData.dateLost);
      if (formData.approximateTime) data.append('approximateTime', formData.approximateTime);
      if (formData.additionalInfo) data.append('additionalInfo', formData.additionalInfo);
      if (file) data.append('image', file);

      const res = await reportService.createLostReport(data);
      if (res.success) {
        setSuccessData(res);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to file lost report.');
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation Screen (Requirement 5)
  if (successData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 font-display">
              Lost Asset Report Successfully Registered
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Your lost item report has been logged into the central security registry and timestamped onto the blockchain ledger.
            </p>
          </div>

          {/* Generated Confirmation ID Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 text-left font-mono text-xs space-y-2.5 border border-rose-500/30">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-slate-400">Lost Report ID:</span>
              <span className="text-rose-400 font-bold text-sm">{successData.reportId}</span>
            </div>
            {successData.assetId && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Linked Asset ID:</span>
                <span className="text-brand-300 font-bold">{successData.assetId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-300">{formatDateTime(successData.timestamp)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Current Status:</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-400/30 uppercase text-[10px] font-bold">
                LOST / SEARCH ACTIVE
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/lost-reports"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
            >
              View All Lost Reports
            </Link>
            <Link
              to={`/search?q=${encodeURIComponent(formData.itemName)}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md transition-colors"
            >
              Scan Found Item Registry for Matches →
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
          <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </span>
          Report Lost Asset
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Broadcast a missing item alert to campus security and start automated smart matching.
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
          
          {/* Optional: Link to Existing Registered Asset */}
          {myAssets.length > 0 && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Link to Registered Asset (Optional)
              </label>
              <select
                value={formData.assetId}
                onChange={handleAssetSelect}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              >
                <option value="">-- Or report an unlisted item below --</option>
                {myAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.id}) - {asset.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="itemName"
                required
                value={formData.itemName}
                onChange={handleChange}
                placeholder="e.g. Dell Inspiron 15 (Core i7)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 font-medium"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Distinguishing Features <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={3}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Black Dell laptop with a small scratch near the touchpad and a GitHub sticker on the back..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 leading-relaxed"
            />
          </div>

          {/* Last Known Location, Date, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Last Known Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="lastKnownLocation"
                required
                value={formData.lastKnownLocation}
                onChange={handleChange}
                placeholder="e.g. Central Library 2nd Floor Desk #42"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="dateLost"
                required
                value={formData.dateLost}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                name="approximateTime"
                value={formData.approximateTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Additional Information (e.g. accessories, charger, contents)
            </label>
            <input
              type="text"
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="e.g. In a blue laptop bag with power cable and student notes."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reference Image (Optional)</label>
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
                    <span className="text-[11px] text-rose-600 font-semibold mt-2">Click to replace photo</span>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-slate-400" />
                    <p className="text-xs text-slate-600 font-medium">Upload photo of your item</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Registering Lost Asset Report on Ledger...</span>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Lost Asset Report</span>
              </>
            )}
          </button>

        </form>

      </div>

    </div>
  );
}
