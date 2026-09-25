import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { claimService } from '../services/claimService';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Clock,
  FileText,
  ExternalLink,
  Cpu,
  History,
  ArrowLeft,
  Lock,
  ChevronRight
} from 'lucide-react';
import Badge from '../components/Badge';
import BlockchainBadge from '../components/BlockchainBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatDateTime, formatAddress } from '../utils/formatters';

export default function ClaimDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Verification action states
  const [remarks, setRemarks] = useState('Physical serial number and proof of purchase verified against campus security registry.');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchClaim = async () => {
    try {
      setLoading(true);
      const res = await claimService.getClaimById(id);
      if (res.success) {
        setClaim(res.claim);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load claim details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaim();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      const res = await claimService.approveClaim(claim.id, remarks);
      if (res.success) {
        setActionSuccess(res);
        fetchClaim();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve claim.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError('A valid rejection reason is required.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      const res = await claimService.rejectClaim(claim.id, rejectionReason);
      if (res.success) {
        setShowRejectModal(false);
        fetchClaim();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject claim.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading claim verification ledger..." />;
  if (error && !claim) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Claim Record Not Found</h2>
        <p className="text-xs text-slate-500">{error}</p>
        <Link to="/claims" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold">
          Return to Claims
        </Link>
      </div>
    );
  }

  const isVerifierOrAdmin = user && (user.role === 'VERIFIER' || user.role === 'ADMIN');
  const isPending = claim.status === 'PENDING_VERIFICATION';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/claims" className="hover:text-slate-800">Claims Queue</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-mono text-slate-800 font-bold">{claim.id}</span>
      </nav>

      {/* Success banner after ownership transfer */}
      {actionSuccess && (
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-bold font-display">Ownership successfully verified and transferred!</h3>
          </div>
          <p className="text-xs text-emerald-700 font-mono">
            Blockchain Tx: {actionSuccess.blockchain?.txHash} • Block #{actionSuccess.blockchain?.blockNumber}
          </p>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              {claim.id}
            </span>
            <Badge status={claim.status} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-display">
            Claim for "{claim.foundReport?.itemName}"
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submitted {formatDateTime(claim.createdAt)} by {claim.claimant?.name}
          </p>
        </div>

        <BlockchainBadge network="Demo Blockchain Environment" />
      </div>

      {/* 2-Column Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Evidence, Reason, Claimant, Item Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Found Item Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Found Asset Information
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-28 h-28 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                <img
                  src={claim.foundReport?.imageUrl || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=300&auto=format&fit=crop&q=80'}
                  alt="Found item"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="font-bold text-sm text-slate-900">{claim.foundReport?.itemName}</div>
                <div>Category: <span className="font-semibold text-slate-800">{claim.foundReport?.category}</span></div>
                <div>Found Location: <span className="font-semibold text-slate-800">{claim.foundReport?.foundLocation}</span></div>
                <div>Storage Custody: <span className="font-semibold text-indigo-600">{claim.foundReport?.storageLocation}</span></div>
                <p className="text-slate-500 italic mt-1">"{claim.foundReport?.description}"</p>
              </div>
            </div>
          </div>

          {/* Claimant Submitted Evidence & Statements */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-display">
              Claimant Evidence & Identification Proof
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason for Claim</label>
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-800 border border-slate-200 leading-relaxed">
                  {claim.claimReason}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specific Hardware & Distinguishing Features</label>
                <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-800 border border-slate-200 leading-relaxed font-mono text-[11px]">
                  {claim.identificationDetails}
                </div>
              </div>

              {claim.additionalProof && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Invoice / External References</label>
                  <div className="p-3.5 bg-slate-50 rounded-2xl text-slate-800 border border-slate-200 leading-relaxed">
                    {claim.additionalProof}
                  </div>
                </div>
              )}

              {/* Uploaded Evidence Media */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Submitted Document Proof</label>
                {claim.proofDocumentUrl ? (
                  <div className="p-2 border border-slate-200 rounded-2xl bg-slate-900 overflow-hidden relative group">
                    <img
                      src={claim.proofDocumentUrl}
                      alt="Proof"
                      className="max-h-64 mx-auto object-contain rounded-lg"
                    />
                    <a
                      href={claim.proofDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-4 right-4 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Full Size
                    </a>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs italic">
                    No electronic document attached. Verification conducted in-person.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Right 1 Col: Claimant Identity, Verifier Remarks & Action Controls */}
        <div className="space-y-6">
          
          {/* Claimant Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Claimant Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{claim.claimant?.name}</div>
                <div className="text-[11px] text-slate-500">{claim.claimant?.email}</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600 font-mono">
              <div>Phone: <strong className="text-slate-800">{claim.contactPhone}</strong></div>
              <div>Organization: <span className="text-slate-700">{claim.claimant?.organization}</span></div>
            </div>
          </div>

          {/* Verifier Decisions / Actions (Requirement 9) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Verification Actions
            </h3>

            {isPending && isVerifierOrAdmin ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Verification Audit Remarks <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter security verification notes..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 leading-relaxed"
                  />
                </div>

                <div className="space-y-2">
                  {/* Approve button */}
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Claim & Transfer Ownership</span>
                  </button>

                  {/* Reject button */}
                  <button
                    type="button"
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Claim</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <Badge status={claim.status} />
                </div>
                {claim.verifier && (
                  <div>
                    <span className="text-slate-500 block">Verified By:</span>
                    <span className="font-bold text-slate-800">{claim.verifier.name}</span>
                  </div>
                )}
                {claim.verificationRemarks && (
                  <div>
                    <span className="text-slate-500 block">Remarks:</span>
                    <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100 mt-1">
                      "{claim.verificationRemarks}"
                    </p>
                  </div>
                )}
                {claim.verifiedAt && (
                  <div className="text-[11px] text-slate-400">
                    Timestamp: {formatDateTime(claim.verifiedAt)}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Reject Ownership Claim
            </h3>
            <p className="text-xs text-slate-500">
              Please state the explicit reason for rejecting this claim. This reason will be logged in the immutable audit trail and sent to the claimant.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Serial numbers provided did not match physical hardware inspection..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
