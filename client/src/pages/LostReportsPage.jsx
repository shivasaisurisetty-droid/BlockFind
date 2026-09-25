import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportService } from '../services/reportService';
import {
  AlertTriangle,
  PlusCircle,
  Search,
  MapPin,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';

const categories = ['ALL', 'LAPTOP', 'PHONE', 'ELECTRONICS', 'DOCUMENTS', 'KEYS', 'BAG', 'OTHER'];

export default function LostReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await reportService.getLostReports({
          search: search || undefined,
          category: category !== 'ALL' ? category : undefined
        });
        if (res.success) {
          setReports(res.reports);
        }
      } catch (err) {
        console.error('Error fetching lost reports:', err);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchReports, 200);
    return () => clearTimeout(timeout);
  }, [search, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </span>
            Active Lost Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Items reported missing across campus and facilities currently being tracked.
          </p>
        </div>

        <Link
          to="/report-lost"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors self-start"
        >
          <PlusCircle className="w-4 h-4" />
          File Lost Report
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
            placeholder="Search by Item Name, Location, Description, Report ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium w-full md:w-auto"
        >
          {categories.map((c) => (
            <option key={c} value={c}>Category: {c}</option>
          ))}
        </select>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <LoadingSpinner message="Fetching active lost item registry..." />
      ) : reports.length === 0 ? (
        <EmptyState
          title="No lost reports found"
          description="No missing item reports matched your search criteria."
          actionText="File a Lost Report"
          actionLink="/report-lost"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
            >
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                <img
                  src={report.imageUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'}
                  alt={report.itemName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <Badge status={report.status} />
                </div>
                <div className="absolute top-3 right-3 font-mono text-[10px] bg-rose-950/80 backdrop-blur text-rose-200 px-2 py-1 rounded-lg font-bold border border-rose-500/30">
                  {report.id}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    {report.category}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-display mt-0.5 group-hover:text-rose-600 transition-colors line-clamp-1">
                    {report.itemName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {report.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{report.lastKnownLocation}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {report.dateLost}
                    </span>
                    <span>Reporter: {report.reporter?.name}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Link
                    to={`/search?q=${encodeURIComponent(report.itemName)}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Check Matches
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
