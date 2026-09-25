import React from 'react';
import { X, ExternalLink, ShieldCheck, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function ProofViewerModal({ isOpen, onClose, claim }) {
  if (!isOpen || !claim) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-display">Ownership Evidence Verification</h3>
              <p className="text-[11px] text-slate-400 font-mono">Claim ID: {claim.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Claimant Information */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Claimant Profile & Contact
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Name:</span> <span className="font-semibold text-slate-800">{claim.claimant?.name}</span>
              </div>
              <div>
                <span className="text-slate-500">Email:</span> <span className="font-semibold text-slate-800">{claim.claimant?.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span> <span className="font-semibold text-slate-800">{claim.contactPhone}</span>
              </div>
              <div>
                <span className="text-slate-500">Department:</span> <span className="font-semibold text-slate-800">{claim.claimant?.organization || 'VIT Campus'}</span>
              </div>
            </div>
          </div>

          {/* Claim Statement & Identifiers */}
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason & Context for Claim</label>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 leading-relaxed">
                {claim.claimReason}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Identifying Features / Hardware Markers</label>
              <div className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 leading-relaxed font-mono text-[11px]">
                {claim.identificationDetails}
              </div>
            </div>

            {claim.additionalProof && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Additional Supporting Details / Invoice Ref</label>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-800 border border-slate-200 leading-relaxed">
                  {claim.additionalProof}
                </div>
              </div>
            )}
          </div>

          {/* Proof Document / Image Attachment */}
          <div>
            <label className="font-bold text-xs text-slate-700 block mb-2">Submitted Supporting Document</label>
            {claim.proofDocumentUrl ? (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-center relative group">
                <img
                  src={claim.proofDocumentUrl}
                  alt="Proof document"
                  className="max-h-64 mx-auto object-contain p-2"
                />
                <a
                  href={claim.proofDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Size
                </a>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center text-xs text-slate-500">
                No electronic attachment uploaded. Physical verification in person.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            Close Proof Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
