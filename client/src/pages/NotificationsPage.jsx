import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCircle,
  CheckCheck,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDateTime } from '../utils/formatters';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (notification.linkUrl) {
      navigate(notification.linkUrl);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
              <Bell className="w-5 h-5" />
            </span>
            Notifications Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time alerts for lost reports, match discoveries, and claim verification milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-card">
        {loading ? (
          <LoadingSpinner message="Fetching your notifications..." />
        ) : notifications.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="You don't have any notifications right now."
            icon={Bell}
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`py-4 px-4 rounded-2xl transition-all cursor-pointer flex items-start gap-4 hover:bg-slate-50 ${
                  !n.isRead ? 'bg-indigo-50/40 border border-indigo-100/60' : ''
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  n.type === 'SUCCESS'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                    : n.type === 'ACTION_REQUIRED'
                    ? 'bg-purple-50 text-purple-600 border border-purple-100'
                    : n.type === 'WARNING'
                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                    : 'bg-brand-50 text-brand-600 border border-brand-100'
                }`}>
                  {n.type === 'SUCCESS' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : n.type === 'WARNING' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Info className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-slate-900">{n.title}</h3>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                      {formatDateTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                </div>

                {!n.isRead && (
                  <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0 mt-2"></span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
