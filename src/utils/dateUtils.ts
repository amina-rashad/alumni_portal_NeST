/**
 * Universal Date and Time Formatting Utilities
 * Handles timezone-safe parsing and display throughout the application.
 * Ensures timestamps stored in UTC (e.g. from MongoDB/backend) are accurately
 * converted to local time (Indian Standard Time: en-IN, UTC+5:30) with 12-hour AM/PM format.
 */

export const parseDateTime = (dateVal?: string | Date | number | null): Date | null => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    return isNaN(dateVal.getTime()) ? null : dateVal;
  }
  if (typeof dateVal === 'number') {
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? null : d;
  }

  let s = String(dateVal).trim();
  if (!s || s === 'N/A' || s === 'Recently' || s === 'null' || s === 'undefined') {
    return null;
  }

  // If already ends with Z or has timezone offset (+HH:MM or -HH:MM), parse directly
  if (s.endsWith('Z') || /[+-]\d{2}(:?\d{2})?$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // If it's an ISO datetime string without timezone (e.g. '2026-10-23T07:42:32' or '2026-10-23 07:42:32'),
  // MongoDB UTC timestamps were sent without Z. Treat as UTC by appending 'Z'
  if (s.includes('T') || (s.includes(' ') && s.includes(':'))) {
    const d = new Date(s.replace(' ', 'T') + 'Z');
    if (!isNaN(d.getTime())) return d;
  }

  // For YYYY-MM-DD date-only strings, parse into local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (!isNaN(dateObj.getTime())) return dateObj;
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Format date & time: "23 Oct 2026, 1:12 pm"
 */
export const formatDateTime = (dateVal?: string | Date | number | null, fallback = 'N/A'): string => {
  const d = parseDateTime(dateVal);
  if (!d) return fallback;
  try {
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return String(dateVal || fallback);
  }
};

/**
 * Format date only: "23 Oct 2026"
 */
export const formatDateOnly = (dateVal?: string | Date | number | null, fallback = 'N/A'): string => {
  const d = parseDateTime(dateVal);
  if (!d) return fallback;
  try {
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return String(dateVal || fallback);
  }
};

/**
 * Format time only: "1:12 pm"
 */
export const formatTimeOnly = (dateVal?: string | Date | number | null, fallback = ''): string => {
  const d = parseDateTime(dateVal);
  if (!d) return fallback;
  try {
    return d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return fallback;
  }
};

/**
 * Format relative time ago: "Just now", "5m ago", "2h ago", "3d ago", or "23 Oct 2026"
 */
export const formatTimeAgo = (dateVal?: string | Date | number | null, fallback = 'Recently'): string => {
  if (!dateVal || dateVal === 'Recently') return fallback;
  const d = parseDateTime(dateVal);
  if (!d) return fallback;

  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0 && diffMs > -60000) return 'Just now'; // small clock skew
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;

  return formatDateOnly(d);
};

/**
 * Format 24-hr or custom time string to 12-hour AM/PM: "14:30" -> "02:30 PM", "9:00" -> "09:00 AM"
 */
export const formatTimeTo12Hour = (timeStr?: string | null): string => {
  if (!timeStr) return '';
  const s = String(timeStr).trim();
  if (/AM|PM/i.test(s)) return s;
  const parts = s.split(':');
  if (parts.length < 2) return s;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return s;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  return `${formattedHours}:${minutes} ${ampm}`;
};

/**
 * Returns local YYYYMMDD date tag (e.g. "20261026") using local time, preventing UTC shift.
 */
export const getLocalDateTag = (dateVal: Date = new Date()): string => {
  const year = dateVal.getFullYear();
  const month = String(dateVal.getMonth() + 1).padStart(2, '0');
  const day = String(dateVal.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * Returns local YYYY-MM-DD date string (e.g. "2026-10-26") using local time, preventing UTC shift.
 */
export const getLocalDateString = (dateVal: Date = new Date()): string => {
  const year = dateVal.getFullYear();
  const month = String(dateVal.getMonth() + 1).padStart(2, '0');
  const day = String(dateVal.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default {
  parseDateTime,
  formatDateTime,
  formatDateOnly,
  formatTimeOnly,
  formatTimeAgo,
  formatTimeTo12Hour,
  getLocalDateTag,
  getLocalDateString
};

