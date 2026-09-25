import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { claimService } from '../services/claimService';
import { reportService } from '../services/reportService';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  Search,
  Filter,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  FileCheck,
  User,
  PlusCircle,
  Upload
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ProofViewerModal from '../components/ProofViewerModal';
import { formatDate, formatDateTime } from '../utils/formatters';

const statuses = ['ALL', 'PENDING_VERIFICATION', 'APPROVED', 'REJECTED'];

export default function ClaimsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const foundReportIdParam = searchParams.get('foundReportId');

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProofClaim, setSelectedProofClaim] = useState(null);

  // New claim modal state (if ?foundReportId was passed)
  const [isFilingClaim, setIsFilingClaim] = useState(!!foundReportIdParam);
  const [targetFoundReport, setTargetFoundReport] = useState(null);
  const [claimFormData, setClaimFormData] = useState({
    foundReportId: foundReportIdParam || '',
    claimReason: '',
    identificationDetails: '',
    contactPhone: user?.phone || '+91 98765 43210',
    additionalProof: ''
  });
  const [proofFile, setProofFile] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await claimService.getClaims({
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
      if (res.success) {
        setClaims(res.claims);
      }
    } catch (err) {
      console.error('Error fetching claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [statusFilter]);

  // Load found report details if user clicked "Claim Ownership" on a found item
  useEffect(() => {
    if (foundReportIdParam) {
      const loadReport = async () => {
        try {
          const res = await reportService.getFoundReportById(foundReportIdParam);
          if (res.success) {
            setTargetFoundReport(res.report);
            setIsFilingClaim(true);
            setClaimFormData(prev => ({ ...prev, foundReportId: foundReportIdParam }));
          }
        } catch (e) {
          console.error(e);
        }
      };
      loadReport();
    }
  }, [foundReportIdParam]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');
    setSubmittingClaim(true);

    try {
      const data = new FormData();
      data.append('foundReportId', claimFormData.foundReportId);
      data.append('claimReason', claimFormData.claimReason);
      data.append('identificationDetails', claimFormData.identificationDetails);
      data.append('contactPhone', claimFormData.contactPhone);
      if (claimFormData.additionalProof) data.append('additionalProof', claimFormData.additionalProof);
      if (proofFile) data.append('proofDocument', proofFile);

      const res = await claimService.createClaim(data);
      if (res.success) {
        setClaimSuccess(res.message);
        setIsFilingClaim(false);
        fetchClaims();
      }
    } catch (err) {
      setClaimError(err.response?.data?.message || 'Failed to submit ownership claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const isVerifierOrAdmin = user?.role === 'VERIFIER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Layers className="w-5 h-5" />
            </span>
            Ownership Claims & Verification
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isVerifierOrAdmin
              ? 'Authorized Verification Queue – Review evidence and approve ownership transfers.'
              : 'Track the status of your submitted ownership claims and proof reviews.'}
          </p>
        </div>

        {!isFilingClaim && (
          <Link
            to="/found-reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors self-start"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            Browse Found Items to Claim
          </Link>
        )}
      </div>

      {/* Claim Submission Modal (Requirement 8) */}
      {isFilingClaim && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Claim Submission Workflow
              </span>
              <h2 className="text-xl font-bold text-slate-900 font-display mt-1">
                Claim Ownership for {targetFoundReport ? `"${targetFoundReport.itemName}"` : 'Found Item'}
              </h2>
            </div>
            <button
              onClick={() => setIsFilingClaim(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>

          {claimError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{claimError}</span>
            </div>
          )}

          <form onSubmit={handleClaimSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Found Report ID <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={claimFormData.foundReportId}
                  onChange={(e) => setClaimFormData({ ...claimFormData, foundReportId: e.target.value })}
                  placeholder="e.g. FR-2026-0001"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={claimFormData.contactPhone}
                  onChange={(e) => setClaimFormData({ ...claimFormData, contactPhone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Claim Reason & Context of Loss <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={claimFormData.claimReason}
                onChange={(e) => setClaimFormData({ ...claimFormData, claimReason: e.target.value })}
                placeholder="Explain how and where you misplaced this item..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hardware Identifiers / Specific Proof Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={claimFormData.identificationDetails}
                onChange={(e) => setClaimFormData({ ...claimFormData, identificationDetails: e.target.value })}
                placeholder="State serial numbers, desktop wallpaper, passcode hint, engraving, or specific markings that prove physical possession..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Additional Proof / Invoice Reference / Order ID
              </label>
              <input
                type="text"
                value={claimFormData.additionalProof}
                onChange={(e) => setClaimFormData({ ...claimFormData, additionalProof: e.target.value })}
                placeholder="e.g. Amazon Invoice #INV-882190 or DigiLocker Verified ID"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Upload Purchase Invoice / ID Proof / Image
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => setProofFile(e.target.files[0])}
                className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={submittingClaim}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-md shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submittingClaim ? (
                <span>Submitting Claim for Cryptographic Verification...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Ownership Claim for Verification</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Success Notification Banner */}
      {claimSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{claimSuccess}</span>
          </div>
          <button
            onClick={() => setClaimSuccess('')}
            className="text-xs font-bold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap ${
              statusFilter === s
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Claims List */}
      {loading ? (
        <LoadingSpinner message="Querying verification ledger for claims..." />
      ) : claims.length === 0 ? (
        <EmptyState
          title="No claims found"
          description="There are currently no ownership claims matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                    {claim.id}
                  </span>
                  <Badge status={claim.status} />
                  <span className="text-[11px] text-slate-400">
                    • Filed: {formatDateTime(claim.createdAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 font-display">
                  Claim for: <span className="text-brand-600">{claim.foundReport?.itemName || 'Found Item'}</span>
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  <span className="font-semibold text-slate-700">Reason:</span> {claim.claimReason}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                  <span>Claimant: <strong className="text-slate-800">{claim.claimant?.name}</strong></span>
                  <span>Phone: <strong className="text-slate-800">{claim.contactPhone}</strong></span>
                  {claim.verifier && (
                    <span className="text-emerald-700 font-bold font-sans">
                      Verified by: {claim.verifier.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0">
                {claim.proofDocumentUrl && (
                  <button
                    onClick={() => setSelectedProofClaim(claim)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Proof
                  </button>
                )}

                <Link
                  to={`/claims/${claim.id}`}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>{isVerifierOrAdmin ? 'Review & Verify' : 'View Claim Details'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Proof Viewer Modal */}
      <ProofViewerModal
        isOpen={!!selectedProofClaim}
        onClose={() => setSelectedProofClaim(null)}
        claim={selectedProofClaim}
      />

    </div>
  );
}
