// Bay Area specific search and filtering logic

// Bay Area libraries list
const BAY_AREA_LIBRARIES = [
  'San Francisco Public Library',
  'San José Public Library',
  'Oakland Public Library',
  'San Mateo County Libraries',
  'Santa Clara County Library',
  'Alameda County Library',
  'Contra Costa County Library',
  'Palo Alto City Library',
  'Pleasanton Public Library'
];

let allEvents = [];
let filteredEvents = [];
let currentFilters = {
  search: '',
  dateRange: null,
  location: 'all',
  library: 'all'
};

/**
 * Load events data from JSON and filter for Bay Area only
 */
async function loadEvents() {
  try {
    showLoading();
    const response = await fetch('events.json');
    const data = await response.json();

    // Filter to only include Bay Area libraries
    allEvents = (data.events || []).filter(event =>
      BAY_AREA_LIBRARIES.includes(event.library)
    );

    filteredEvents = [...allEvents];
    hideLoading();
    applyFilters();
    populateFilterOptions();
  } catch (error) {
    console.error('Error loading events:', error);
    showError('Failed to load events. Please try again later.');
  }
}

/**
 * Populate filter dropdown options
 */
function populateFilterOptions() {
  // Get unique libraries
  const libraries = getUniqueValues(allEvents, 'library');
  const libraryButtonsContainer = document.getElementById('library-buttons');

  if (libraryButtonsContainer) {
    libraries.forEach(library => {
      if (library) {
        const button = document.createElement('button');
        button.className = 'filter-option-btn library-btn';
        button.dataset.value = library;
        button.textContent = library;

        // Activate if this library matches the URL parameter
        if (currentFilters.library === library) {
          button.classList.add('active');
          // Also deactivate "All Libraries" button
          const allButton = libraryButtonsContainer.querySelector('[data-value="all"]');
          if (allButton) {
            allButton.classList.remove('active');
          }
        }

        libraryButtonsContainer.appendChild(button);
      }
    });
  }

  // Update total events count
  updateEventsCount();
}

/**
 * Update URL with current filter state
 */
function updateURL() {
  const params = new URLSearchParams();

  // Add search parameter
  if (currentFilters.search) {
    params.set('search', currentFilters.search);
  }

  // Add location/type parameter
  if (currentFilters.location !== 'all') {
    params.set('type', currentFilters.location);
  }

  // Add library parameter
  if (currentFilters.library !== 'all') {
    params.set('library', currentFilters.library);
  }

  // Add date range parameter
  if (currentFilters.dateRange) {
    const dateRangeType = getDateRangeType(currentFilters.dateRange);
    if (dateRangeType) {
      params.set('date', dateRangeType);
    }
  }

  // Update URL without reloading page
  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  window.history.pushState({}, '', newURL);
}

/**
 * Get date range type identifier from date range object
 */
function getDateRangeType(dateRange) {
  if (!dateRange) return null;

  const today = getDateRange('today');
  const tomorrow = getDateRange('tomorrow');
  const thisWeek = getDateRange('this-week');
  const thisMonth = getDateRange('this-month');
  const nextMonth = getDateRange('next-month');

  if (dateRange.start.getTime() === today.start.getTime() &&
      dateRange.end.getTime() === today.end.getTime()) {
    return 'today';
  }
  if (dateRange.start.getTime() === tomorrow.start.getTime() &&
      dateRange.end.getTime() === tomorrow.end.getTime()) {
    return 'tomorrow';
  }
  if (dateRange.start.getTime() === thisWeek.start.getTime() &&
      dateRange.end.getTime() === thisWeek.end.getTime()) {
    return 'this-week';
  }
  if (dateRange.start.getTime() === thisMonth.start.getTime() &&
      dateRange.end.getTime() === thisMonth.end.getTime()) {
    return 'this-month';
  }
  if (dateRange.start.getTime() === nextMonth.start.getTime() &&
      dateRange.end.getTime() === nextMonth.end.getTime()) {
    return 'next-month';
  }

  return null;
}

/**
 * Initialize filters from URL parameters
 */
function initFromURL() {
  const params = new URLSearchParams(window.location.search);

  // Read search parameter
  if (params.has('search')) {
    currentFilters.search = params.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = currentFilters.search;
    }
  }

  // Read type parameter
  if (params.has('type')) {
    currentFilters.location = params.get('type');
    // Activate corresponding button
    document.querySelectorAll('#event-type-buttons .filter-option-btn').forEach(btn => {
      if (btn.dataset.value === currentFilters.location) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Read library parameter
  if (params.has('library')) {
    currentFilters.library = params.get('library');
    // Note: library buttons are added dynamically, will be activated after population
  }

  // Read date parameter
  if (params.has('date')) {
    const dateType = params.get('date');
    currentFilters.dateRange = getDateRange(dateType);
    // Activate corresponding quick filter button
    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      if (btn.dataset.filter === dateType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

/**
 * Clear all filters and return to "All Events" view
 */
function clearAllFilters() {
  // Reset all filter state
  currentFilters.search = '';
  currentFilters.dateRange = null;
  currentFilters.location = 'all';
  currentFilters.library = 'all';

  // Reset search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }

  // Reset quick filter buttons
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    if (btn.dataset.filter === 'all') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Reset event type buttons
  document.querySelectorAll('#event-type-buttons .filter-option-btn').forEach(btn => {
    if (btn.dataset.value === 'all') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Reset library buttons
  document.querySelectorAll('#library-buttons .filter-option-btn').forEach(btn => {
    if (btn.dataset.value === 'all') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply filters and update URL
  applyFilters();
  updateURL();
}

/**
 * Apply all active filters
 */
function applyFilters() {
  const now = new Date();

  filteredEvents = allEvents.filter(event => {
    // Filter out expired events (events that have already ended)
    if (event.end_date) {
      const endDate = new Date(event.end_date);
      if (endDate < now) {
        return false;
      }
    } else if (event.start_date) {
      // If no end date, use start date + 3 hours as approximate end
      const startDate = new Date(event.start_date);
      const approximateEnd = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
      if (approximateEnd < now) {
        return false;
      }
    }

    // Search filter
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm) ||
        event.library.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        (event.book && event.book.title && event.book.title.toLowerCase().includes(searchTerm)) ||
        (event.categories && event.categories.some(cat => cat.toLowerCase().includes(searchTerm)));

      if (!matchesSearch) return false;
    }

    // Date range filter
    if (currentFilters.dateRange) {
      if (!isDateInRange(event.start_date, currentFilters.dateRange)) {
        return false;
      }
    }

    // Location filter (online/in-person)
    if (currentFilters.location !== 'all') {
      if (currentFilters.location === 'online' && !event.is_virtual) return false;
      if (currentFilters.location === 'in-person' && event.is_virtual) return false;
    }

    // Library filter
    if (currentFilters.library !== 'all') {
      if (event.library !== currentFilters.library) return false;
    }

    return true;
  });

  renderEvents();
  updateResultsCount();
}

/**
 * Render events to the page
 */
function renderEvents() {
  const container = document.getElementById('events-container');
  if (!container) return;

  if (filteredEvents.length === 0) {
    showEmptyState();
    return;
  }

  container.innerHTML = filteredEvents.map(event => createEventCard(event)).join('');
}

/**
 * Create event table row HTML
 */
function createEventCard(event) {
  const badge = event.is_virtual
    ? '<span class="type-badge online">ONLINE</span>'
    : '<span class="type-badge in-person">IN PERSON</span>';

  // Generate week day slots (use compact mode for mobile)
  const weekSlotsHtml = generateWeekSlots(event.start_date, false);

  return `
    <tr>
      <td class="event-name">
        <a href="${getEventUrl(event.id)}" onclick="trackEventClick('${event.id}', '${event.title.replace(/'/g, "\\'")}', '${event.library.replace(/'/g, "\\'")}', 'title_link')">${event.title}</a>
      </td>
      <td>${badge}</td>
      <td class="library-name">${event.library}</td>
      <td class="event-date">${formatDate(event.start_date)}</td>
      <td>${weekSlotsHtml}</td>
      <td>
        <a href="${getEventUrl(event.id)}" class="details-link" onclick="trackEventClick('${event.id}', '${event.title.replace(/'/g, "\\'")}', '${event.library.replace(/'/g, "\\'")}', 'view_button')">View →</a>
      </td>
    </tr>
  `;
}

/**
 * Update results count
 */
function updateResultsCount() {
  const resultsInfo = document.getElementById('results-info');
  if (resultsInfo) {
    const count = filteredEvents.length;
    const total = allEvents.length;
    resultsInfo.innerHTML = `
      Showing <span class="results-count">${count}</span> of ${total} Bay Area events
    `;
  }
}

/**
 * Update total events count in header
 */
function updateEventsCount() {
  const eventsCountEl = document.getElementById('events-count');
  if (eventsCountEl && allEvents.length > 0) {
    eventsCountEl.textContent = `${allEvents.length} Bay Area Library Events`;
  }
}

/**
 * Show loading state
 */
function showLoading() {
  const container = document.getElementById('events-container');
  if (container) {
    container.innerHTML = `
      <div class="loading">
        <div class="loading-spinner"></div>
        <p>Loading book club events...</p>
      </div>
    `;
  }
}

/**
 * Hide loading state
 */
function hideLoading() {
  // Loading will be replaced by events or empty state
}

/**
 * Show error message
 */
function showError(message) {
  const container = document.getElementById('events-container');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Oops!</h3>
        <p>${message}</p>
      </div>
    `;
  }
}

/**
 * Show empty state
 */
function showEmptyState() {
  const container = document.getElementById('events-container');
  if (container) {
    container.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>No events found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        </td>
      </tr>
    `;
  }
}

/**
 * Handle search input
 */
function handleSearch(event) {
  currentFilters.search = event.target.value;

  // Track search event
  if (typeof gtag !== 'undefined' && currentFilters.search) {
    gtag('event', 'search', {
      search_term: currentFilters.search,
      page_location: 'bay_area_page'
    });
  }

  applyFilters();
  updateURL();
}

/**
 * Handle quick filter click
 */
function handleQuickFilter(filterType) {
  // If "all" button clicked, clear all filters
  if (filterType === 'all') {
    clearAllFilters();
    scrollToTop();
    return;
  }

  // Check if clicking already active filter (toggle off)
  const clickedButton = event.target.closest('.quick-filter-btn');
  if (clickedButton && clickedButton.classList.contains('active')) {
    // Toggle off - return to All Events
    clearAllFilters();
    scrollToTop();
    return;
  }

  // Remove active class from all quick filters
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Track quick filter click
  if (typeof gtag !== 'undefined') {
    gtag('event', 'filter_click', {
      filter_type: 'quick_filter',
      filter_value: filterType,
      page_location: 'bay_area_page'
    });
  }

  // Apply date range filter
  currentFilters.dateRange = getDateRange(filterType);
  applyFilters();
  updateURL();
  scrollToTop();
}

/**
 * Clear quick filter
 */
function clearQuickFilter() {
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  currentFilters.dateRange = null;
  applyFilters();
}

/**
 * Handle location filter change
 */
function handleLocationFilter(value) {
  // Remove active class from all event type buttons
  document.querySelectorAll('#event-type-buttons .filter-option-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Track event type filter
  if (typeof gtag !== 'undefined') {
    gtag('event', 'filter_click', {
      filter_type: 'event_type',
      filter_value: value,
      page_location: 'bay_area_page'
    });
  }

  currentFilters.location = value;
  applyFilters();
  updateURL();
}

/**
 * Handle library filter change
 */
function handleLibraryFilter(value) {
  // Remove active class from all library buttons
  document.querySelectorAll('#library-buttons .filter-option-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Track library filter
  if (typeof gtag !== 'undefined') {
    gtag('event', 'filter_click', {
      filter_type: 'library',
      filter_value: value,
      page_location: 'bay_area_page'
    });
  }

  currentFilters.library = value;
  applyFilters();
  updateURL();
}

/**
 * Toggle advanced filters
 */
function toggleAdvancedFilters() {
  const filters = document.getElementById('advanced-filters');
  if (filters) {
    filters.classList.toggle('show');
  }
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
  // Search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleSearch, 300));
  }

  // Quick filters
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const filterType = btn.dataset.filter;
      handleQuickFilter(filterType);
    });
  });

  // Advanced filter toggle
  const filterToggle = document.getElementById('filter-toggle');
  if (filterToggle) {
    filterToggle.addEventListener('click', toggleAdvancedFilters);
  }

  // Filters close button
  const filtersClose = document.getElementById('filters-close');
  if (filtersClose) {
    filtersClose.addEventListener('click', toggleAdvancedFilters);
  }

  // Event type filter buttons
  const eventTypeButtons = document.querySelectorAll('#event-type-buttons .filter-option-btn');
  eventTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleLocationFilter(btn.dataset.value);
    });
  });

  // Library filter buttons (delegated event since they're added dynamically)
  const libraryButtonsContainer = document.getElementById('library-buttons');
  if (libraryButtonsContainer) {
    libraryButtonsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-option-btn')) {
        handleLibraryFilter(e.target.dataset.value);
      }
    });
  }
}

/**
 * Track event click
 */
function trackEventClick(eventId, eventTitle, libraryName, clickSource) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'select_content', {
      content_type: 'event',
      content_id: eventId,
      item_name: eventTitle,
      library: libraryName,
      click_source: clickSource,
      page_location: 'bay_area_page'
    });
  }
}

/**
 * Initialize the app
 */
function init() {
  initEventListeners();
  initFromURL();
  loadEvents();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
