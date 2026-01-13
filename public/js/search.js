// Search and filtering logic

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

// New England libraries list
const NEW_ENGLAND_LIBRARIES = [
  'Boston Public Library',
  'Providence Public Library',
  'Hartford Public Library',
  'New Haven Free Public Library',
  'Portland Public Library',
  'Manchester City Library',
  'Burlington Public Library',
  'Rhode Island State Library',
  'Connecticut State Library',
  'Maine State Library'
];

let allEvents = [];
let filteredEvents = [];
let currentFilters = {
  search: '',
  dateRange: null,
  location: 'all',
  state: 'all',
  bayArea: false,
  newEngland: false
};

/**
 * Load events data from JSON
 */
async function loadEvents() {
  try {
    showLoading();
    const response = await fetch('events.json');
    const data = await response.json();
    allEvents = data.events || [];
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
  // Get unique states
  const states = getUniqueValues(allEvents, 'state_full');
  const stateButtonsContainer = document.getElementById('state-buttons');

  if (stateButtonsContainer) {
    states.forEach(state => {
      if (state) {
        const button = document.createElement('button');
        button.className = 'filter-option-btn state-btn';
        button.dataset.value = state;
        button.textContent = state;
        stateButtonsContainer.appendChild(button);
      }
    });
  }

  // Update total events count
  updateEventsCount();
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

    // State filter
    if (currentFilters.state !== 'all') {
      if (event.state_full !== currentFilters.state) return false;
    }

    // Bay Area filter
    if (currentFilters.bayArea) {
      if (!BAY_AREA_LIBRARIES.includes(event.library)) return false;
    }

    // New England filter
    if (currentFilters.newEngland) {
      if (!NEW_ENGLAND_LIBRARIES.includes(event.library)) return false;
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
      Showing <span class="results-count">${count}</span> of ${total} events
    `;
  }
}

/**
 * Update total events count in header
 */
function updateEventsCount() {
  const eventsCountEl = document.getElementById('events-count');
  if (eventsCountEl && allEvents.length > 0) {
    eventsCountEl.textContent = `${allEvents.length}+ Events across North America`;
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
 * Update URL with current filters
 */
function updateURL() {
  const params = new URLSearchParams();

  if (currentFilters.search) {
    params.set('search', currentFilters.search);
  }

  if (currentFilters.dateRange) {
    // Determine which date filter is active
    if (currentFilters.bayArea) {
      params.set('filter', 'bay-area');
    } else if (currentFilters.newEngland) {
      params.set('filter', 'new-england');
    } else {
      // Figure out the date range type
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      if (currentFilters.dateRange.start.getTime() === today.getTime()) {
        params.set('filter', 'today');
      } else if (currentFilters.dateRange.start.getTime() === tomorrow.getTime()) {
        params.set('filter', 'tomorrow');
      } else {
        // Check for this-month or next-month
        const startMonth = currentFilters.dateRange.start.getMonth();
        if (startMonth === now.getMonth()) {
          params.set('filter', 'this-month');
        } else if (startMonth === now.getMonth() + 1) {
          params.set('filter', 'next-month');
        }
      }
    }
  }

  if (currentFilters.location !== 'all') {
    params.set('type', currentFilters.location);
  }

  if (currentFilters.state !== 'all') {
    params.set('state', currentFilters.state);
  }

  if (currentFilters.bayArea) {
    params.set('region', 'bay-area');
  } else if (currentFilters.newEngland) {
    params.set('region', 'new-england');
  }

  const newURL = params.toString() ? `?${params.toString()}` : window.location.pathname;
  window.history.pushState({}, '', newURL);
}

/**
 * Initialize filters from URL parameters
 */
function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  let hasAnyFilter = false;

  if (params.has('search')) {
    currentFilters.search = params.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = params.get('search');
    }
    hasAnyFilter = true;
  }

  if (params.has('filter')) {
    const filterValue = params.get('filter');
    currentFilters.dateRange = getDateRange(filterValue);

    if (filterValue === 'bay-area') {
      currentFilters.bayArea = true;
    } else if (filterValue === 'new-england') {
      currentFilters.newEngland = true;
    }

    // Deactivate "All Events" and activate the corresponding filter button
    const allEventsBtn = document.getElementById('all-events-btn');
    if (allEventsBtn) {
      allEventsBtn.classList.remove('active');
    }

    document.querySelectorAll('.quick-filter-btn').forEach(btn => {
      if (btn.dataset.filter === filterValue) {
        btn.classList.add('active');
      }
    });
    hasAnyFilter = true;
  }

  if (params.has('type')) {
    currentFilters.location = params.get('type');
    // Activate the corresponding button
    document.querySelectorAll('#event-type-buttons .filter-option-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.value === params.get('type')) {
        btn.classList.add('active');
      }
    });
    hasAnyFilter = true;
  }

  if (params.has('state')) {
    currentFilters.state = params.get('state');
    hasAnyFilter = true;
    // Will activate button after states are populated
  }

  if (params.has('region')) {
    const region = params.get('region');
    if (region === 'bay-area') {
      currentFilters.bayArea = true;
    } else if (region === 'new-england') {
      currentFilters.newEngland = true;
    }
    hasAnyFilter = true;
  }

  // If no filters from URL, ensure "All Events" is active
  if (!hasAnyFilter) {
    const allEventsBtn = document.getElementById('all-events-btn');
    if (allEventsBtn) {
      allEventsBtn.classList.add('active');
    }
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
      page_location: 'main_page'
    });
  }

  applyFilters();
  updateURL();
}

/**
 * Clear all filters and return to showing all events
 */
function clearAllFilters() {
  // Reset all filters
  currentFilters.search = '';
  currentFilters.dateRange = null;
  currentFilters.location = 'all';
  currentFilters.state = 'all';
  currentFilters.bayArea = false;
  currentFilters.newEngland = false;

  // Clear search input
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.value = '';
  }

  // Remove active class from all quick filter buttons
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Activate "All Events" button
  const allEventsBtn = document.getElementById('all-events-btn');
  if (allEventsBtn) {
    allEventsBtn.classList.add('active');
  }

  // Reset event type filter buttons
  document.querySelectorAll('#event-type-buttons .filter-option-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.value === 'all') {
      btn.classList.add('active');
    }
  });

  // Reset state filter buttons
  document.querySelectorAll('#state-buttons .filter-option-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.value === 'all') {
      btn.classList.add('active');
    }
  });

  applyFilters();
  updateURL();
}

/**
 * Handle quick filter click
 */
function handleQuickFilter(filterType) {
  // Handle "All Events" button - clear all filters
  if (filterType === 'all') {
    clearAllFilters();
    scrollToTop();
    return;
  }

  // Check if clicking an already active filter (toggle off)
  const clickedButton = event.target.closest('.quick-filter-btn');
  if (clickedButton && clickedButton.classList.contains('active')) {
    // Toggle off - return to all events
    clearAllFilters();
    scrollToTop();
    return;
  }

  // Remove active class from all quick filters
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  clickedButton.classList.add('active');

  // Track quick filter click
  if (typeof gtag !== 'undefined') {
    gtag('event', 'filter_click', {
      filter_type: 'quick_filter',
      filter_value: filterType,
      page_location: 'main_page'
    });
  }

  // Apply appropriate filter
  if (filterType === 'bay-area') {
    currentFilters.bayArea = true;
    currentFilters.newEngland = false;
    currentFilters.dateRange = null;
  } else if (filterType === 'new-england') {
    currentFilters.newEngland = true;
    currentFilters.bayArea = false;
    currentFilters.dateRange = null;
  } else {
    currentFilters.bayArea = false;
    currentFilters.newEngland = false;
    currentFilters.dateRange = getDateRange(filterType);
  }

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
  currentFilters.bayArea = false;
  currentFilters.newEngland = false;
  applyFilters();
  updateURL();
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
      page_location: 'main_page'
    });
  }

  currentFilters.location = value;
  applyFilters();
  updateURL();
}

/**
 * Handle state filter change
 */
function handleStateFilter(value) {
  // Remove active class from all state buttons
  document.querySelectorAll('#state-buttons .filter-option-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Track state filter
  if (typeof gtag !== 'undefined') {
    gtag('event', 'filter_click', {
      filter_type: 'state',
      filter_value: value,
      page_location: 'main_page'
    });
  }

  currentFilters.state = value;
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
      if (btn.classList.contains('active')) {
        clearQuickFilter();
      } else {
        handleQuickFilter(filterType);
      }
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

  // State filter buttons (delegated event since they're added dynamically)
  const stateButtonsContainer = document.getElementById('state-buttons');
  if (stateButtonsContainer) {
    stateButtonsContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('filter-option-btn')) {
        handleStateFilter(e.target.dataset.value);
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
      page_location: 'main_page'
    });
  }
}

/**
 * Initialize the app
 */
function init() {
  initEventListeners();
  initFromURL(); // Read URL parameters first
  loadEvents();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
