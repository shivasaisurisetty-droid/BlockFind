/**
 * Shorten Ethereum address or transaction hash
 */
export function formatAddress(address = '', chars = 4) {
  if (!address) return 'N/A';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Format ISO date to human-readable string
 */
export function formatDate(isoDate) {
  if (!isoDate) return 'N/A';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoDate;
  }
}

/**
 * Format date with time
 */
export function formatDateTime(isoDate) {
  if (!isoDate) return 'N/A';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoDate;
  }
}

/**
 * Get status color classes for Tailwind
 */
export function getStatusBadgeProps(status = '') {
  switch (status.toUpperCase()) {
    case 'REGISTERED':
      return {
        label: 'Registered',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500'
      };
    case 'VERIFIED':
      return {
        label: 'Verified & Secured',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500'
      };
    case 'LOST':
    case 'ACTIVE':
      return {
        label: 'Lost / Active',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500'
      };
    case 'FOUND':
    case 'AVAILABLE':
      return {
        label: 'Found / In Custody',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      };
    case 'CLAIM_PENDING':
    case 'PENDING_VERIFICATION':
      return {
        label: 'Claim Pending',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500'
      };
    case 'APPROVED':
    case 'RETURNED':
    case 'RESOLVED':
      return {
        label: 'Returned / Approved',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500'
      };
    case 'REJECTED':
      return {
        label: 'Claim Rejected',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-500'
      };
    default:
      return {
        label: status || 'Unknown',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400'
      };
  }
}
