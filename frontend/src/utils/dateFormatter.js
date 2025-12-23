// Central Date Formatter - SINGLE SOURCE OF TRUTH
// Replaces all ad-hoc formatting to ensure "2025-" artifact is removed

/**
 * Formats a date string for sector display (e.g. Flight Cards, Results)
 * @param {string} dateStr - The raw date string (e.g. "2025-12-27T10:00:00")
 * @returns {string} - Clean formatted date (e.g. "Sat, 27 Dec 2025") or just time if sector
 */
export const formatSectorDate = (dateStr) => {
  if (!dateStr || dateStr.includes('undefined')) return '';
  
  // If it's just a time string (e.g. "10:00"), return as is
  if (dateStr.length === 5 && dateStr.includes(':')) return dateStr;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Fallback if invalid

    // Airline Standard Format: "Sat, 27 Dec 2025"
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
};

/**
 * Formats time for flight cards
 * @param {string} dateStr 
 * @returns {string} - HH:MM
 */
export const formatSectorTime = (dateStr) => {
  if (!dateStr) return '--:--';
  // TBO sometimes sends full date-time "2025-12-27T10:00:00"
  if (dateStr.includes('T')) {
    return dateStr.split('T')[1].substring(0, 5);
  }
  // Or just "10:00:00"
  return dateStr.substring(0, 5);
};

/**
 * Clean Sector Label - Removes any "2025-" prefixes from City/Airport labels
 * @param {string} label - e.g. "DEL", "New Delhi", "2025-DEL"
 * @returns {string} - Clean label
 */
export const cleanSectorLabel = (label) => {
  if (!label) return '';
  // Remove year-like prefixes (e.g. "2025-", "2024-")
  return label.replace(/^\d{4}-/, '');
};
