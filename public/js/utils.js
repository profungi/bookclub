// Utility functions for date handling and formatting

/**
 * Format ISO date string to readable format
 * @param {string} isoDate - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(isoDate) {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = eventDate - today;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Format: "Tue · Jan 23 · 7:00 PM (PT)"
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const time = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  let dateStr = `${weekday} · ${month} ${day} · ${time}`;

  // Add relative time indicator
  if (diffDays === 0) {
    dateStr = `Today · ${time}`;
  } else if (diffDays === 1) {
    dateStr = `Tomorrow · ${time}`;
  } else if (diffDays === -1) {
    dateStr = `Yesterday · ${time}`;
  }

  return dateStr;
}

/**
 * Format full date for detail page
 * @param {string} isoDate - ISO date string
 * @returns {string} Full formatted date
 */
function formatFullDate(isoDate) {
  if (!isoDate) return '';

  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Get date range filter
 * @param {string} filter - Filter type (today, this-week, this-month, next-month)
 * @returns {Object} {start, end} Date objects
 */
function getDateRange(filter) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'tomorrow':
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      return {
        start: tomorrow,
        end: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'this-week':
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + (6 - today.getDay()));
      return {
        start: today,
        end: new Date(endOfWeek.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'this-month':
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return {
        start: today,
        end: new Date(endOfMonth.getTime() + 24 * 60 * 60 * 1000)
      };

    case 'next-month':
      const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);
      return {
        start: startOfNextMonth,
        end: new Date(endOfNextMonth.getTime() + 24 * 60 * 60 * 1000)
      };

    default:
      return null;
  }
}

/**
 * Check if event date is in range
 * @param {string} eventDate - ISO date string
 * @param {Object} range - {start, end} Date objects
 * @returns {boolean}
 */
function isDateInRange(eventDate, range) {
  if (!eventDate || !range) return true;

  const date = new Date(eventDate);
  return date >= range.start && date < range.end;
}

/**
 * Format location string
 * @param {Object} location - Location object
 * @param {boolean} isVirtual - Is virtual event
 * @returns {string} Formatted location
 */
function formatLocation(location, isVirtual) {
  if (isVirtual) {
    return 'Virtual Event';
  }

  if (!location || !location.name) {
    return 'Location TBA';
  }

  const parts = [];

  if (location.name) {
    parts.push(location.name);
  }

  if (location.city) {
    parts.push(location.city);
  }

  return parts.join(' · ');
}

/**
 * Format full address for detail page
 * @param {Object} location - Location object
 * @returns {string} Full address
 */
function formatFullAddress(location) {
  if (!location) return '';

  const parts = [];

  if (location.number && location.street) {
    parts.push(`${location.number} ${location.street}`);
  } else if (location.street) {
    parts.push(location.street);
  }

  if (location.city && location.state) {
    parts.push(`${location.city}, ${location.state} ${location.zip || ''}`);
  } else if (location.city) {
    parts.push(location.city);
  }

  if (location.details) {
    parts.push(location.details);
  }

  return parts.join(', ');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get unique values from array of objects
 * @param {Array} array - Array of objects
 * @param {string} key - Key to extract
 * @returns {Array} Unique values
 */
function getUniqueValues(array, key) {
  const values = array.map(item => item[key]).filter(Boolean);
  return [...new Set(values)].sort();
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Get event URL
 * @param {string} eventId - Event ID
 * @returns {string} Event detail page URL
 */
function getEventUrl(eventId) {
  return `event.html?id=${encodeURIComponent(eventId)}`;
}

/**
 * Get URL parameter
 * @param {string} name - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Scroll to top smoothly
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
