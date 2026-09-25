import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading BlockFind Registry...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-brand-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-brand-600"></div>
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-600 tracking-wide">{message}</p>
    </div>
  );
}
