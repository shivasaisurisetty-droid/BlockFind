import React from 'react';
import { getStatusBadgeProps } from '../utils/formatters';

export default function Badge({ status, label, className = '' }) {
  const { label: defaultLabel, bg, dot } = getStatusBadgeProps(status || label);
  const displayLabel = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {displayLabel}
    </span>
  );
}
