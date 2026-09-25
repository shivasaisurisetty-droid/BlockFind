import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No records found',
  description = 'No matching items or reports were found in the registry.',
  actionText,
  actionLink,
  onAction,
  icon: Icon = PackageOpen
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white rounded-2xl border border-dashed border-slate-300">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 font-display">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 leading-relaxed">{description}</p>
      
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
        >
          {actionText}
        </Link>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
