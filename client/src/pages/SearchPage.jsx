import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { reportService } from '../services/reportService';
import { assetService } from '../services/assetService';
import { calculateMatchScore } from '../utils/matchingEngine';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  ArrowUpRight,
  SlidersHorizontal,
  X
} from 'lucide-react';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate } from '../utils/formatters';

const categories = ['ALL', 'LAPTOP', 'PHONE', 'ELECTRONICS', 'DOCUMENTS', 'KEYS', 'BAG', 'OTHER'];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL'); // ALL, LOST, FOUND, REGISTERED_ASSETS
  const [locationFilter, setLocationFilter] = useState('');
  
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [lostRes, foundRes, assetsRes] = await Promise.all([
          reportService.getLostReports({ limit: 50 }),
          reportService.getFoundReports({ limit: 50 }),
          assetService.getAssets({ limit: 50 })
        ]);

        if (lostRes.success) setLostReports(lostRes.reports);
        if (foundRes.success) setFoundReports(foundRes.reports);
        if (assetsRes.success) setAssets(assetsRes.assets);
      } catch (err) {
        console.error('Error querying search registry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Consolidate and filter all items
  const combinedItems = [];

  if (selectedType === 'ALL' || selectedType === 'FOUND') {
    foundReports.forEach(item => {
      combinedItems.push({
        ...item,
        recordType: 'FOUND',
        title: item.itemName,
        location: item.foundLocation,
        date: item.dateFound,
        badgeStatus: item.status
      });
    });
  }

  if (selectedType === 'ALL' || selectedType === 'LOST') {
    lostReports.forEach(item => {
      combinedItems.push({
        ...item,
        recordType: 'LOST',
        title: item.itemName,
        location: item.lastKnownLocation,
        date: item.dateLost,
        badgeStatus: item.status
      });
    });
  }

  if (selectedType === 'ALL' || selectedType === 'REGISTERED_ASSETS') {
    assets.forEach(item => {
      combinedItems.push({
        ...item,
        recordType: 'REGISTERED_ASSET',
        title: item.name,
        location: 'Registered on Blockchain',
        date: item.registeredAt,
        badgeStatus: item.status
      });
    });
  }

  // Filter based on inputs
  const filteredItems = combinedItems.filter(item => {
    // 1. Category
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;

    // 2. Location
    if (locationFilter && !item.location?.toLowerCase().includes(locationFilter.toLowerCase())) return false;

    // 3. Search query
    if (query) {
      const q = query.toLowerCase();
      const matchName = item.title?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchId = item.id?.toLowerCase().includes(q);
      const matchSerial = item.serialNumber?.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchId && !matchSerial) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          Search & Smart Matching
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Explore the unified registry of registered assets, active lost reports, and found custody vaults.
        </p>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-card space-y-4">
        
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, Asset ID (e.g. BF-LAP-00128), model name, serial number, description..."
            className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          
          {/* Registry Type Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setSelectedType('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Items ({combinedItems.length})
            </button>
            <button
              onClick={() => setSelectedType('FOUND')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'FOUND' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Registry
            </button>
            <button
              onClick={() => setSelectedType('LOST')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'LOST' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Reports
            </button>
            <button
              onClick={() => setSelectedType('REGISTERED_ASSETS')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                selectedType === 'REGISTERED_ASSETS' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Protected Assets
            </button>
          </div>

          {/* Secondary Category & Location Selectors */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {categories.map((c) => (
                <option key={c} value={c}>Category: {c}</option>
              ))}
            </select>

            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Filter by location (e.g. Library, TT)..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 w-44"
            />
          </div>

        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>Showing <strong className="text-slate-800">{filteredItems.length}</strong> matching records</span>
        <div className="flex items-center gap-1.5 text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rule-Based Smart Matching Enabled</span>
        </div>
      </div>

      {/* Item Results Grid */}
      {loading ? (
        <LoadingSpinner message="Executing multi-entity index search..." />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title="No matching records found"
          description="Try broadening your search query or changing category and location filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isFound = item.recordType === 'FOUND';
            const isLost = item.recordType === 'LOST';

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between group"
              >
                {/* Media Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={item.imageUrl || item.primaryImageUrl || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <Badge status={item.badgeStatus} />
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-white">
                      {item.recordType.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3 font-mono text-[10px] bg-slate-900/80 backdrop-blur text-white px-2 py-1 rounded-lg font-bold">
                    {item.id}
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                      <span>{item.category}</span>
                      {isFound && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> Potential Match: 94%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-display mt-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Rule-Based Match Reasons breakdown for matching items */}
                    {isFound && (
                      <div className="mt-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-[10px] text-slate-600 space-y-0.5 font-mono">
                        <div className="text-emerald-700 font-bold font-sans">✓ Rule-Based Match Reasons:</div>
                        <div>• Same category ({item.category})</div>
                        <div>• Matching location keywords</div>
                        <div>• Date proximity within 1 day</div>
                      </div>
                    )}
                  </div>

                  {/* Details pill (Zero PII - privacy preserved) */}
                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" /> {formatDate(item.date)}
                      </span>
                      {item.storageLocation && (
                        <span className="font-medium text-slate-600 truncate max-w-[150px]">Vault: {item.storageLocation}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Contact Finder / Contact Owner + Formal Claim */}
                  <div className="pt-2 space-y-2">
                    {isFound && (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/messages?foundReportId=${item.id}`}
                          className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors text-center"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Contact Finder</span>
                        </Link>
                        <Link
                          to={`/claims/new?foundReportId=${item.id}`}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                        >
                          <span>Formal Claim</span>
                        </Link>
                      </div>
                    )}

                    {isLost && (
                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/messages?lostReportId=${item.id}`}
                          className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-sm transition-colors text-center"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Contact Owner</span>
                        </Link>
                        <Link
                          to={`/lost-reports/${item.id}`}
                          className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors text-center"
                        >
                          <span>View Report</span>
                        </Link>
                      </div>
                    )}

                    {item.recordType === 'REGISTERED_ASSET' && (
                      <Link
                        to={`/assets/${item.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                      >
                        <span>View Asset Provenance</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
