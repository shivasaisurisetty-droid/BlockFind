import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import {
  FileText,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  Clock,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDateTime, formatAddress } from '../utils/formatters';

const eventTypes = [
  'ALL',
  'USER_REGISTERED',
  'ASSET_REGISTERED',
  'ITEM_REPORTED_LOST',
  'ITEM_REPORTED_FOUND',
  'CLAIM_SUBMITTED',
  'CLAIM_APPROVED',
  'CLAIM_REJECTED',
  'OWNERSHIP_TRANSFERRED'
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminService.getAuditLogs({
          eventType: selectedEventType !== 'ALL' ? selectedEventType : undefined,
          limit: 50
        });
        if (res.success) {
          setLogs(res.logs);
        }
      } catch (err) {
        console.error('Error loading audit logs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [selectedEventType]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      log.details?.toLowerCase().includes(q) ||
      log.assetId?.toLowerCase().includes(q) ||
      log.user?.name?.toLowerCase().includes(q) ||
      log.blockchainTxHash?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <FileText className="w-5 h-5" />
            </span>
            System Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Read-only, tamper-evident chronological record of all actions, claims, and state changes.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Audit Log Immutability Active</span>
        </div>
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
            placeholder="Search audit details, Asset ID, actor, or Tx hash..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        <select
          value={selectedEventType}
          onChange={(e) => setSelectedEventType(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium w-full md:w-auto"
        >
          {eventTypes.map((t) => (
            <option key={t} value={t}>Event: {t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
        {loading ? (
          <LoadingSpinner message="Scanning immutable audit logs..." />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            description="No system events match your selected event filter or query."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Event Type</th>
                  <th className="pb-3 font-semibold">Actor / User</th>
                  <th className="pb-3 font-semibold">Event Details</th>
                  <th className="pb-3 font-semibold">Asset Reference</th>
                  <th className="pb-3 font-semibold text-right">Blockchain Tx</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors text-xs">
                    
                    {/* Timestamp */}
                    <td className="py-3.5 text-slate-500 text-[11px] whitespace-nowrap font-mono">
                      {formatDateTime(log.createdAt)}
                    </td>

                    {/* Event Type */}
                    <td className="py-3.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {log.eventType}
                      </span>
                    </td>

                    {/* Actor */}
                    <td className="py-3.5 font-medium text-slate-800">
                      {log.user ? (
                        <div>
                          <div>{log.user.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{log.user.role}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono">System Automated</span>
                      )}
                    </td>

                    {/* Details */}
                    <td className="py-3.5 text-slate-700 max-w-xs leading-relaxed">
                      {log.details}
                    </td>

                    {/* Asset */}
                    <td className="py-3.5 font-mono text-[11px]">
                      {log.assetId ? (
                        <span className="text-brand-600 font-bold">{log.assetId}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Blockchain Tx */}
                    <td className="py-3.5 text-right font-mono text-[11px]">
                      {log.blockchainTxHash ? (
                        <span className="text-indigo-600 font-medium">
                          {formatAddress(log.blockchainTxHash, 5)}
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
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
