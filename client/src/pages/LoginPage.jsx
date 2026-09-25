import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, CheckCircle2, UserCheck, Shield, Key } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);
    try {
      const res = await login(demoEmail, demoPassword);
      if (res.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-4">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display">
            Welcome to BlockFind
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Sign in to access your registered assets, claims, and verification portal.
          </p>
        </div>

        {/* Demo Accounts Quick Login Section (Requirement 19) */}
        <div className="bg-gradient-to-br from-indigo-50/80 to-brand-50/40 p-4 rounded-2xl border border-indigo-100/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 font-display">
              <Key className="w-3.5 h-3.5 text-brand-600" />
              Demo Credentials (1-Click Login)
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-brand-100 text-brand-700 rounded-md">
              Instant Access
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            
            {/* Demo User */}
            <button
              type="button"
              onClick={() => handleQuickDemo('user@blockfind.demo', 'User@123')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-left transition-all hover:scale-[1.02] flex flex-col"
            >
              <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> User
              </span>
              <span className="text-[11px] font-semibold text-slate-800 truncate mt-1">Varun (Student)</span>
              <span className="text-[9px] text-slate-400 truncate">user@blockfind.demo</span>
            </button>

            {/* Demo Verifier */}
            <button
              type="button"
              onClick={() => handleQuickDemo('verifier@blockfind.demo', 'Verifier@123')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-left transition-all hover:scale-[1.02] flex flex-col"
            >
              <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verifier
              </span>
              <span className="text-[11px] font-semibold text-slate-800 truncate mt-1">Meenakshi S.</span>
              <span className="text-[9px] text-slate-400 truncate">verifier@blockfind.demo</span>
            </button>

            {/* Demo Admin */}
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@blockfind.demo', 'Admin@123')}
              className="p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-left transition-all hover:scale-[1.02] flex flex-col"
            >
              <span className="text-[10px] font-bold text-purple-600 uppercase flex items-center gap-1">
                <Shield className="w-3 h-3" /> Admin
              </span>
              <span className="text-[11px] font-semibold text-slate-800 truncate mt-1">Dr. Rajesh Nair</span>
              <span className="text-[9px] text-slate-400 truncate">admin@blockfind.demo</span>
            </button>

          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-card">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating with Cryptographic Session...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Register as Student or Faculty
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
