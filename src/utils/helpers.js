// ─── Date formatting ──────────────────────────────────────────────────────────

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return formatDate(dateStr);
};

// ─── Status helpers — aligned to backend Complaint.Status enum ────────────────
// Backend statuses: OPEN | IN_PROGRESS | RESOLVED | CLOSED

export const STATUS_META = {
  OPEN:        { label: 'Open',        color: '#2563eb', bg: '#eff6ff', dot: '#2563eb' },
  IN_PROGRESS: { label: 'In Progress', color: '#d97706', bg: '#fffbeb', dot: '#d97706' },
  RESOLVED:    { label: 'Resolved',    color: '#059669', bg: '#ecfdf5', dot: '#059669' },
  CLOSED:      { label: 'Closed',      color: '#6b7280', bg: '#f9fafb', dot: '#4b5563' },
};

// Allowed next statuses faculty can transition to
export const STATUS_TRANSITIONS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

// ─── Category helpers (frontend-defined; backend accepts free-text) ───────────
export const CATEGORY_META = {
  Infrastructure: { label: 'Infrastructure', icon: '🏗️' },
  Academic:       { label: 'Academic',       icon: '📚' },
  Hostel:         { label: 'Hostel',         icon: '🏠' },
  Transport:      { label: 'Transport',      icon: '🚌' },
  Library:        { label: 'Library',        icon: '📖' },
  Canteen:        { label: 'Canteen',        icon: '🍽️' },
  Sports:         { label: 'Sports',         icon: '⚽' },
  IT:             { label: 'IT / Computer',  icon: '💻' },
  Other:          { label: 'Other',          icon: '📝' },
};

export const CATEGORIES = Object.keys(CATEGORY_META);

// ─── Misc ─────────────────────────────────────────────────────────────────────

export const truncate = (str, max = 80) =>
  str && str.length > max ? str.slice(0, max) + '…' : str;

export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
