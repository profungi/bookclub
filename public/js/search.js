// Search and filtering logic

let allEvents = [];
let filteredEvents = [];
let currentFilters = {
  search: '',
  dateRange: null,
  location: 'all',
  state: 'all'
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
  filteredEvents = allEvents.filter(event => {
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
 * Create event card HTML
 */
function createEventCard(event) {
  const imageHtml = event.image
    ? `<img src="${event.image}" alt="${event.title}" class="event-image">`
    : `<div class="event-image no-image">📚</div>`;

  const badge = event.is_virtual
    ? '<span class="event-badge online">ONLINE</span>'
    : '<span class="event-badge in-person">IN PERSON</span>';

  const bookHtml = event.book
    ? `<div class="event-book">
         <div class="event-book-title">📖 ${event.book.title}</div>
         ${event.book.author ? `<div class="event-book-author">by ${event.book.author}</div>` : ''}
       </div>`
    : '';

  const tagsHtml = event.categories && event.categories.length > 0
    ? `<div class="event-tags">
         ${event.categories.slice(0, 3).map(cat => `<span class="event-tag">${cat}</span>`).join('')}
       </div>`
    : '';

  const location = formatLocation(event.location, event.is_virtual);

  return `
    <a href="${getEventUrl(event.id)}" class="event-card">
      ${imageHtml}
      <div class="event-content">
        <div class="event-header">
          <h3 class="event-title">${event.title}</h3>
          ${badge}
        </div>
        <div class="event-library">${event.library}</div>
        <div class="event-date">🗓️ ${formatDate(event.start_date)}</div>
        <div class="event-location">📍 ${location}</div>
        ${bookHtml}
        ${tagsHtml}
      </div>
    </a>
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
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h3>No events found</h3>
        <p>Try adjusting your filters or search terms</p>
      </div>
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

  // Apply date range filter
  currentFilters.dateRange = getDateRange(filterType);
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
