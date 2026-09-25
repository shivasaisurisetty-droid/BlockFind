import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Box,
  AlertTriangle,
  FileCheck,
  Layers,
  Cpu,
  Activity,
  UserCheck,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Search,
  CheckCircle,
  FileText,
  MessageSquare,
  ArrowUpRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDateTime, formatAddress } from '../utils/formatters';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [disputesList, setDisputesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes, disputesRes] = await Promise.all([
          adminService.getStatistics(),
          adminService.getUsers({ limit: 50 }),
          chatService.getDisputes()
        ]);

        if (statsRes.success) setStatsData(statsRes);
        if (usersRes.success) setUsersList(usersRes.users);
        if (disputesRes.success) setDisputesList(disputesRes.disputes);
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      const res = await adminService.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList(prev =>
          prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (err) {
      console.error('Error changing user role:', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) return <LoadingSpinner message="Aggregating platform analytics & telemetry..." />;

  const stats = statsData?.stats || {};
  const charts = statsData?.charts || {};
  const recentActivity = statsData?.recentActivity || [];

  const filteredUsers = usersList.filter(u => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q) ||
      u.organization?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 font-display">
              System Administration & Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time analytics, user privilege administration, and institutional security monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Ledger Node: Operational</span>
        </div>
      </div>

      {/* 2. Key Metrics Grid (Requirement 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
          color="brand"
        />
        <StatCard
          title="Protected Assets"
          value={stats.totalAssets || 0}
          icon={Box}
          color="indigo"
        />
        <StatCard
          title="Active Lost"
          value={stats.lostAssets || 0}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Found Items"
          value={stats.foundAssets || 0}
          icon={FileCheck}
          color="amber"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims || 0}
          icon={Layers}
          color="purple"
        />
        <StatCard
          title="Resolved Rate"
          value={stats.recoveryRate || '85%'}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* 3. Visual Charts Grid (Requirement 11) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Lost vs Found Monthly Trend */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Monthly Incident & Recovery Trend
              </h3>
              <p className="text-xs text-slate-500">Comparative velocity of reported lost vs recovered items</p>
            </div>
            <BarChart3 className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyTrendData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="lost" name="Lost Items" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="found" name="Found Items" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" name="Verified & Returned" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Claims by Status & Category Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Asset Categories Distribution
              </h3>
              <p className="text-xs text-slate-500">Breakdown of registered physical assets by type</p>
            </div>
            <PieIcon className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-64 w-full text-xs flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.categoryChartData || []}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {(charts.categoryChartData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. User Administration Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              User & Privilege Management
            </h3>
            <p className="text-xs text-slate-500">Manage user roles and assign verification cell privileges</p>
          </div>

          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user name, email, dept..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">Department / Org</th>
                <th className="pb-3 font-semibold">Activity Counts</th>
                <th className="pb-3 font-semibold">Current Role</th>
                <th className="pb-3 font-semibold text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-slate-900">{u.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </td>
                  <td className="py-3.5 text-slate-600">
                    {u.organization || 'VIT Campus'}
                  </td>
                  <td className="py-3.5 font-mono text-[11px] text-slate-500">
                    {u._count?.ownedAssets || 0} Assets • {u._count?.submittedClaims || 0} Claims
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : u.role === 'VERIFIER'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <select
                      value={u.role}
                      disabled={updatingUserId === u.id || u.id === user.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="VERIFIER">VERIFIER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Disputed Cases & Flagged Inquiries Panel (Requirement 19) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Disputed Cases & Flagged Inquiries ({disputesList.length})
            </h3>
            <p className="text-xs text-slate-500">
              Conversations reported by users for security review, identity inspection, and dispute arbitration
            </p>
          </div>
        </div>

        {disputesList.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200 font-medium">
            ✓ Zero active disputes. All peer verifications and returns operating smoothly.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider font-sans">
                  <th className="pb-3 font-semibold">Case Item</th>
                  <th className="pb-3 font-semibold">Claimant / Owner (Authorized View)</th>
                  <th className="pb-3 font-semibold">Finder (Authorized View)</th>
                  <th className="pb-3 font-semibold">Dispute Reason</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {disputesList.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 font-sans">
                      {d.foundReport?.itemName || d.lostReport?.itemName || 'Item'}
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">{d.participantOne?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.participantOne?.email} • {d.participantOne?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5">
                      <div className="font-semibold text-slate-800">{d.participantTwo?.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{d.participantTwo?.email} • {d.participantTwo?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-3.5 text-rose-600 font-semibold max-w-xs truncate">
                      {d.resolutions[0]?.disputeReason || 'Dispute filed by user'}
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to={`/messages/${d.id}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                      >
                        <span>Inspect Chat Thread</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Recent System Activity Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Recent System Activity Stream
            </h3>
            <p className="text-xs text-slate-500">Immutable chronological events captured across the network</p>
          </div>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                  {act.eventType}
                </span>
                <span className="text-slate-800 font-medium">{act.details}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">
                {formatDateTime(act.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
