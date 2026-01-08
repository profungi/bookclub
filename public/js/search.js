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

let allEvents = [];
let filteredEvents = [];
let currentFilters = {
  search: '',
  dateRange: null,
  location: 'all',
  state: 'all',
  bayArea: false
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
  const stateSelect = document.getElementById('state-filter');

  if (stateSelect) {
    states.forEach(state => {
      if (state) {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateSelect.appendChild(option);
      }
    });
  }
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
        <a href="${getEventUrl(event.id)}">${event.title}</a>
      </td>
      <td>${badge}</td>
      <td class="library-name">${event.library}</td>
      <td class="event-date">${formatDate(event.start_date)}</td>
      <td>${weekSlotsHtml}</td>
      <td>
        <a href="${getEventUrl(event.id)}" class="details-link">View →</a>
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
  applyFilters();
}

/**
 * Handle quick filter click
 */
function handleQuickFilter(filterType) {
  // Remove active class from all quick filters
  document.querySelectorAll('.quick-filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  // Add active class to clicked button
  event.target.classList.add('active');

  // Apply appropriate filter
  if (filterType === 'bay-area') {
    currentFilters.bayArea = true;
    currentFilters.dateRange = null;
  } else {
    currentFilters.bayArea = false;
    currentFilters.dateRange = getDateRange(filterType);
  }

  applyFilters();
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
  applyFilters();
}

/**
 * Handle location filter change
 */
function handleLocationFilter(event) {
  currentFilters.location = event.target.value;
  applyFilters();
}

/**
 * Handle state filter change
 */
function handleStateFilter(event) {
  currentFilters.state = event.target.value;
  applyFilters();
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

  // Location filter
  const locationFilter = document.getElementById('location-filter');
  if (locationFilter) {
    locationFilter.addEventListener('change', handleLocationFilter);
  }

  // State filter
  const stateFilter = document.getElementById('state-filter');
  if (stateFilter) {
    stateFilter.addEventListener('change', handleStateFilter);
  }
}

/**
 * Initialize the app
 */
function init() {
  initEventListeners();
  loadEvents();
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
