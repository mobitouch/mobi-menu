/**
 * @fileoverview Public menu display application with filtering, sorting, and dynamic theming
 * @author MobiTouch.online
 * @version 2.0.0
 */

/**
 * Format time from 24-hour to 12-hour format
 * @param {string} time24 - Time in 24-hour format (HH:MM)
 * @returns {string} Formatted time
 */
function formatTime12(time24) {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format date and time for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date/time
 */
function formatDateTime(date) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${month} ${day} at ${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default filter categories fallback
 * @type {Array<{category: string, label: string}>}
 */
const DEFAULT_FILTER_CATEGORIES = [
  { category: "starters", label: "Starters" },
  { category: "lorem ipsum", label: "Lorem Ipsum" },
  { category: "chicken burgers", label: "Chicken Burgers" },
  { category: "fries", label: "Fries" },
  { category: "dessert", label: "Dessert" },
  { category: "drinks", label: "Drinks" },
  { category: "add ons", label: "Add Ons" },
  { category: "dips", label: "Dips" },
];

/**
 * Default UI settings fallback
 * @type {Object}
 */
const DEFAULT_SETTINGS = {
  primaryColor: "#0d3b2e",
  secondaryColor: "#1a5c4a",
  textColor: "#ffffff",
  accentColor: "#ffd700",
  headingFontSize: 4,
  itemNameSize: 1.8,
  descriptionSize: 0.95,
  priceSize: 1.5,
  cardOpacity: 0.05,
  gridGap: 2,
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Application state
 * @type {Object}
 */
const state = {
  menuData: [],
  filterCategories: [],
  currentSort: "default",
  currentCategory: "all",
  settings: null,
  lastMenuDataHash: null, // Hash of menu data for change detection
  lastSettingsHash: null, // Hash of settings for change detection
  autoRefreshInterval: null, // Auto-refresh interval ID
};

// ============================================================================
// DOM ELEMENTS (Cached for performance)
// ============================================================================

const elements = {
  menuGrid: null,
  filtersContainer: null,
  loadingScreen: null,
  sortModal: null,
  openSortBtn: null,
  closeSortBtn: null,
  scrollToTopBtn: null,
};

/**
 * Initialize DOM element references
 */
function initializeElements() {
  elements.menuGrid = document.getElementById("menu-grid");
  elements.filtersContainer = document.getElementById("filters");
  elements.loadingScreen = document.getElementById("loading-screen");
  elements.sortModal = document.getElementById("sort-modal");
  elements.openSortBtn = document.getElementById("open-sort-modal");
  elements.closeSortBtn = document.getElementById("close-sort-modal");
  elements.scrollToTopBtn = document.getElementById("scroll-to-top");
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML string
 */
function escapeHtml(text) {
  if (typeof text !== "string") return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
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
 * Show error message to user
 * @param {string} message - Error message to display
 */
function showError(message) {
  if (!elements.menuGrid) return;

  elements.menuGrid.innerHTML = `
    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.8);">
      <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ ${escapeHtml(
        message
      )}</p>
      <button onclick="location.reload()" style="
        padding: 0.75rem 1.5rem;
        background: var(--accent-color, #ffd700);
        color: var(--primary-color, #0d3b2e);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        font-size: 1rem;
      ">Reload Page</button>
    </div>
  `;
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Load and apply UI settings from server
 * @param {boolean} checkChanges - Whether to check for changes only (returns null if no changes)
 * @returns {Promise<Object|null>} Settings object or null if no changes
 */
async function loadAndApplySettings(checkChanges = false) {
  try {
    const response = await fetch("/api/settings", {
      cache: checkChanges ? "no-store" : "default",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const settings = await response.json();

    // Validate settings structure
    if (!settings || typeof settings !== "object") {
      throw new Error("Invalid settings format");
    }

    // Check for changes if requested
    if (checkChanges) {
      const newHash = generateDataHash(settings);
      if (newHash === state.lastSettingsHash) {
        return null; // No changes
      }
      state.lastSettingsHash = newHash;
    } else {
      // Store hash on initial load
      state.lastSettingsHash = generateDataHash(settings);
    }

    state.settings = settings;
    applySettings(settings);

    // Store filter categories
    if (settings.filterCategories && Array.isArray(settings.filterCategories)) {
      state.filterCategories = settings.filterCategories.filter(
        (f) => f && f.enabled
      );
    } else {
      state.filterCategories = DEFAULT_FILTER_CATEGORIES;
    }

    renderFilters();
    return settings;
  } catch (error) {
    if (!checkChanges) {
      state.settings = DEFAULT_SETTINGS;
      applySettings(DEFAULT_SETTINGS);
      state.filterCategories = DEFAULT_FILTER_CATEGORIES;
      renderFilters();
      return DEFAULT_SETTINGS;
    }
    return null;
  }
}

/**
 * Apply visual settings to the page
 * @param {Object} settings - Settings object to apply
 * @param {boolean} updateElements - Whether to update existing DOM elements
 */
function applySettings(settings, updateElements = false) {
  if (!settings || typeof settings !== "object") return;

  const root = document.documentElement;

  requestAnimationFrame(() => {
    // Apply CSS variables
    root.style.setProperty(
      "--primary-color",
      settings.primaryColor || DEFAULT_SETTINGS.primaryColor
    );
    root.style.setProperty(
      "--secondary-color",
      settings.secondaryColor || DEFAULT_SETTINGS.secondaryColor
    );
    root.style.setProperty(
      "--text-color",
      settings.textColor || DEFAULT_SETTINGS.textColor
    );
    root.style.setProperty(
      "--accent-color",
      settings.accentColor || DEFAULT_SETTINGS.accentColor
    );

    const cardBg = `rgba(255, 255, 255, ${
      settings.cardOpacity || DEFAULT_SETTINGS.cardOpacity
    })`;
    root.style.setProperty("--card-bg", cardBg);

    if (elements.menuGrid) {
      elements.menuGrid.style.gap = `${
        settings.gridGap || DEFAULT_SETTINGS.gridGap
      }rem`;
    }

    const heroH1 = document.querySelector(".hero h1");
    if (heroH1) {
      heroH1.style.fontSize = `${
        settings.headingFontSize || DEFAULT_SETTINGS.headingFontSize
      }rem`;
    }

    // Update existing menu item elements if requested
    if (updateElements) {
      const itemNames = document.querySelectorAll(".item-name");
      const itemDescs = document.querySelectorAll(".item-desc");
      const itemPrices = document.querySelectorAll(".item-price");

      itemNames.forEach((el) => {
        el.style.fontSize = `${
          settings.itemNameSize || DEFAULT_SETTINGS.itemNameSize
        }rem`;
      });

      itemDescs.forEach((el) => {
        el.style.fontSize = `${
          settings.descriptionSize || DEFAULT_SETTINGS.descriptionSize
        }rem`;
      });

      itemPrices.forEach((el) => {
        el.style.fontSize = `${
          settings.priceSize || DEFAULT_SETTINGS.priceSize
        }rem`;
        el.style.color = settings.accentColor || DEFAULT_SETTINGS.accentColor;
      });
    }
  });
}

/**
 * Apply visual settings to existing menu items (without re-rendering)
 * @param {Object} settings - Settings object to apply
 */
function applyVisualSettingsOnly(settings) {
  applySettings(settings, true);
}

// ============================================================================
// FILTER MANAGEMENT
// ============================================================================

/**
 * Render filter buttons dynamically
 */
function renderFilters() {
  if (!elements.filtersContainer) return;

  const activeCategory = state.currentCategory || "all";

  // Build filter HTML efficiently
  const filterButtons = [
    `<button class="filter-btn ${
      activeCategory === "all" ? "active" : ""
    }" data-category="all" aria-label="Show all items">All</button>`,
  ];

  state.filterCategories.forEach((filter) => {
    if (!filter || !filter.category || !filter.label) return;

    const isActive =
      activeCategory.toLowerCase() === filter.category.toLowerCase();
    const categoryEscaped = escapeHtml(filter.category);
    const labelEscaped = escapeHtml(filter.label);

    filterButtons.push(
      `<button class="filter-btn ${
        isActive ? "active" : ""
      }" data-category="${categoryEscaped}" aria-label="Filter by ${labelEscaped}">${labelEscaped}</button>`
    );
  });

  elements.filtersContainer.innerHTML = filterButtons.join("");
  attachFilterListeners();
}

/**
 * Attach event listeners to filter buttons
 */
function attachFilterListeners() {
  const filterBtns = elements.filtersContainer?.querySelectorAll(".filter-btn");
  if (!filterBtns || filterBtns.length === 0) return;

  filterBtns.forEach((btn) => {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener("click", () => {
      const allFilterBtns =
        elements.filtersContainer?.querySelectorAll(".filter-btn");
      if (allFilterBtns) {
        allFilterBtns.forEach((b) => b.classList.remove("active"));
      }

      newBtn.classList.add("active");

      state.currentCategory = newBtn.getAttribute("data-category") || "all";

      const filteredItems =
        state.currentCategory === "all"
          ? state.menuData
          : state.menuData.filter(
              (item) =>
                item.category &&
                item.category.toLowerCase() ===
                  state.currentCategory.toLowerCase()
            );
      renderMenu(filteredItems);
    });
  });
}

// ============================================================================
// SORTING FUNCTIONALITY
// ============================================================================

/**
 * Sort menu items based on sort type
 * @param {Array} items - Array of menu items to sort
 * @param {string} sortType - Sort type (default, name-asc, name-desc, price-asc, price-desc)
 * @returns {Array} Sorted array of menu items
 */
function sortMenuItems(items, sortType) {
  if (!Array.isArray(items)) return [];

  const sorted = [...items]; // Create copy to avoid mutating original

  switch (sortType) {
    case "name-asc":
      return sorted.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    case "name-desc":
      return sorted.sort((a, b) => {
        const nameA = (a.name || "").toLowerCase();
        const nameB = (b.name || "").toLowerCase();
        return nameB.localeCompare(nameA);
      });
    case "price-asc":
      return sorted.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceB - priceA;
      });
    default:
      // Default: sort by ID
      return sorted.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });
  }
}

/**
 * Initialize sort modal functionality
 */
function initSortModal() {
  if (!elements.sortModal || !elements.openSortBtn || !elements.closeSortBtn)
    return;

  const sortOptionBtns = document.querySelectorAll(".sort-option-btn");

  // Open modal
  elements.openSortBtn.addEventListener("click", () => {
    elements.sortModal.classList.add("show");
    updateSortModalDisplay();
  });

  // Close modal
  elements.closeSortBtn.addEventListener("click", () => {
    elements.sortModal.classList.remove("show");
  });

  // Close modal when clicking outside
  elements.sortModal.addEventListener("click", (e) => {
    if (e.target === elements.sortModal) {
      elements.sortModal.classList.remove("show");
    }
  });

  // Close modal with Escape key
  const handleEscape = (e) => {
    if (e.key === "Escape" && elements.sortModal.classList.contains("show")) {
      elements.sortModal.classList.remove("show");
    }
  };
  document.addEventListener("keydown", handleEscape);

  // Handle sort option selection
  sortOptionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      sortOptionBtns.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked button
      btn.classList.add("active");

      state.currentSort = btn.getAttribute("data-sort") || "default";

      // Get filtered items based on current category
      let itemsToSort = state.menuData;
      if (state.currentCategory !== "all") {
        itemsToSort = state.menuData.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === state.currentCategory.toLowerCase()
        );
      }

      renderMenu(itemsToSort);
      updateSortButtonText();
      elements.sortModal.classList.remove("show");
    });
  });
}

/**
 * Update sort modal to show current selection
 */
function updateSortModalDisplay() {
  const sortOptionBtns = document.querySelectorAll(".sort-option-btn");
  sortOptionBtns.forEach((btn) => {
    if (btn.getAttribute("data-sort") === state.currentSort) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

/**
 * Update sort button text based on current sort
 */
function updateSortButtonText() {
  if (!elements.openSortBtn) return;

  const sortLabels = {
    default: "Default",
    "name-asc": "Name (A-Z)",
    "name-desc": "Name (Z-A)",
    "price-asc": "Price (Low-High)",
    "price-desc": "Price (High-Low)",
  };

  const label = sortLabels[state.currentSort] || "Sort Options";
  const span = elements.openSortBtn.querySelector("span");
  if (span) {
    span.textContent = label;
  }
}

// ============================================================================
// MENU RENDERING
// ============================================================================

/**
 * Render menu items to the DOM
 * @param {Array} items - Array of menu items to render
 */
function renderMenu(items) {
  if (!elements.menuGrid) return;

  if (!Array.isArray(items) || items.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.style.cssText =
      "grid-column: 1 / -1; text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);";
    const p = document.createElement("p");
    p.textContent = "No items found.";
    emptyMessage.appendChild(p);
    elements.menuGrid.innerHTML = "";
    elements.menuGrid.appendChild(emptyMessage);
    return;
  }

  const sortedItems = sortMenuItems(items, state.currentSort);
  const fragment = document.createDocumentFragment();

  // Build DOM elements directly for better performance (avoids innerHTML parsing)
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const name = escapeHtml(item.name || "");
    const price = parseFloat(item.price) || 0;
    const description = escapeHtml(item.description || "");
    const category = escapeHtml(item.category || "");
    const isAvailable = item.available !== false; // Default to true if not set

    // Check schedule availability
    const scheduleInfo = item.scheduleAvailability || {};
    const isScheduledAvailable = scheduleInfo.isAvailable !== false;
    const finalAvailable = isAvailable && isScheduledAvailable;

    const menuItem = document.createElement("div");
    menuItem.className = `menu-item ${finalAvailable ? "" : "unavailable"}`;
    menuItem.dataset.id = item.id || "";

    const content = document.createElement("div");
    content.className = "menu-item-content";

    // Add image if available
    if (item.image) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "menu-item-image-container";
      const img = document.createElement("img");
      img.className = "menu-item-image";
      img.src = item.image;
      img.alt = name;
      img.loading = "lazy";
      if (!finalAvailable) {
        img.style.opacity = "0.5";
        img.style.filter = "grayscale(100%)";
      }
      imageContainer.appendChild(img);
      content.appendChild(imageContainer);
    }

    const header = document.createElement("div");
    header.className = "item-header";

    const nameEl = document.createElement("h3");
    nameEl.className = "item-name";
    nameEl.textContent = name;

    const priceEl = document.createElement("span");
    priceEl.className = "item-price";
    priceEl.textContent = `$${price.toFixed(2)}`;

    header.appendChild(nameEl);
    header.appendChild(priceEl);

    // Add schedule info badge if scheduled
    if (item.schedule && Object.keys(item.schedule).length > 0) {
      const scheduleBadge = document.createElement("span");
      scheduleBadge.className = `schedule-badge ${isScheduledAvailable ? "available" : "unavailable"}`;
      
      if (isScheduledAvailable) {
        // Show when it's available
        if (item.schedule.timeRange?.start && item.schedule.timeRange?.end) {
          scheduleBadge.textContent = `Available ${formatTime12(item.schedule.timeRange.start)} - ${formatTime12(item.schedule.timeRange.end)}`;
        } else if (item.schedule.timeRange?.start) {
          scheduleBadge.textContent = `From ${formatTime12(item.schedule.timeRange.start)}`;
        } else if (item.schedule.timeRange?.end) {
          scheduleBadge.textContent = `Until ${formatTime12(item.schedule.timeRange.end)}`;
        } else {
          scheduleBadge.textContent = "Scheduled";
        }
      } else {
        // Show why it's unavailable
        scheduleBadge.textContent = scheduleInfo.reason || "Not available now";
        if (scheduleInfo.nextAvailable) {
          scheduleBadge.title = `${scheduleInfo.reason || "Not available"}. Next available: ${formatDateTime(scheduleInfo.nextAvailable)}`;
        } else {
          scheduleBadge.title = scheduleInfo.reason || "Not available";
        }
      }
      
      header.appendChild(scheduleBadge);
    }

    // Add unavailable badge if item is manually unavailable
    if (!isAvailable) {
      const unavailableBadge = document.createElement("span");
      unavailableBadge.className = "unavailable-badge";
      unavailableBadge.textContent = "Unavailable";
      if (item.unavailableReason) {
        unavailableBadge.title = item.unavailableReason;
      }
      header.appendChild(unavailableBadge);
    } else if (!isScheduledAvailable && !item.schedule) {
      // Only show unavailable badge if not scheduled (scheduled items show schedule badge instead)
      const unavailableBadge = document.createElement("span");
      unavailableBadge.className = "unavailable-badge";
      unavailableBadge.textContent = "Unavailable";
      header.appendChild(unavailableBadge);
    }

    const descEl = document.createElement("p");
    descEl.className = "item-desc";
    descEl.textContent = description;

    const footer = document.createElement("div");
    footer.className = "item-footer";

    const categoryEl = document.createElement("span");
    categoryEl.className = "item-category";
    categoryEl.textContent = category;

    footer.appendChild(categoryEl);

    content.appendChild(header);
    content.appendChild(descEl);
    content.appendChild(footer);
    menuItem.appendChild(content);
    fragment.appendChild(menuItem);
  }

  elements.menuGrid.innerHTML = "";
  elements.menuGrid.appendChild(fragment);

  if (state.settings) {
    applyVisualSettingsOnly(state.settings);
  }
}

// ============================================================================
// SCROLL TO TOP
// ============================================================================

/**
 * Initialize scroll to top functionality
 */
function initScrollToTop() {
  if (!elements.scrollToTopBtn) return;

  const handleScroll = debounce(() => {
    elements.scrollToTopBtn.classList.toggle("show", window.pageYOffset > 300);
  }, 100);

  window.addEventListener("scroll", handleScroll, { passive: true });
  elements.scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ============================================================================
// LOADING SCREEN
// ============================================================================

/**
 * Hide loading screen with smooth transition
 */
function hideLoadingScreen() {
  if (!elements.loadingScreen) return;

  elements.loadingScreen.classList.add("fade-out");
  document.body.classList.remove("loading");

  requestAnimationFrame(() => {
    setTimeout(() => {
      elements.loadingScreen.style.display = "none";
    }, 200);
  });
}

// ============================================================================
// DATA LOADING
// ============================================================================

/**
 * Generate a simple hash from data for change detection
 * @param {any} data - Data to hash
 * @returns {string} Hash string
 */
function generateDataHash(data) {
  try {
    const jsonString = JSON.stringify(data);
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  } catch (error) {
    return null;
  }
}

/**
 * Load menu data from server
 * @param {boolean} checkChanges - Whether to check for changes only (returns null if no changes)
 * @returns {Promise<Array|null>} Promise resolving to menu data array or null if no changes
 */
async function loadMenuData(checkChanges = false) {
  try {
    const response = await fetch("data.json", {
      cache: checkChanges ? "no-store" : "default",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid menu data format");
    }

    // Check for changes if requested
    if (checkChanges) {
      const newHash = generateDataHash(data);
      if (newHash === state.lastMenuDataHash) {
        return null; // No changes
      }
      state.lastMenuDataHash = newHash;
    } else {
      // Store hash on initial load
      state.lastMenuDataHash = generateDataHash(data);
    }

    state.menuData = data;
    return data;
  } catch (error) {
    if (!checkChanges) {
      throw error;
    }
    return null;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 */
async function initialize() {
  try {
    // Initialize DOM elements
    initializeElements();

    // Validate critical elements
    if (!elements.menuGrid || !elements.filtersContainer) {
      throw new Error("Required DOM elements not found");
    }

    // Load settings and menu data in parallel for faster loading
    const [settingsResult, menuResult] = await Promise.allSettled([
      loadAndApplySettings(),
      loadMenuData(),
    ]);

    // Process settings
    if (settingsResult.status === "fulfilled" && settingsResult.value) {
      // Settings already applied in loadAndApplySettings
    } else {
      state.settings = DEFAULT_SETTINGS;
      applySettings(DEFAULT_SETTINGS);
      state.filterCategories = DEFAULT_FILTER_CATEGORIES;
      renderFilters();
    }

    // Process menu data
    if (menuResult.status === "fulfilled" && menuResult.value) {
      state.menuData = menuResult.value;
      renderMenu(state.menuData);
    } else {
      throw new Error("Failed to load menu data");
    }

    // Initialize components (non-blocking)
    initSortModal();
    updateSortButtonText();
    initScrollToTop();

    // Start auto-refresh mechanism
    startAutoRefresh();

    // Hide loading screen
    hideLoadingScreen();
  } catch (error) {
    showError(error.message || "Failed to load menu. Please refresh the page.");
    hideLoadingScreen();
  }
}

// ============================================================================
// AUTO-REFRESH MECHANISM
// ============================================================================

/**
 * Check for updates and refresh if changes detected
 */
async function checkForUpdates() {
  try {
    // Check both menu data and settings in parallel
    const [menuData, settings] = await Promise.all([
      loadMenuData(true), // checkChanges = true
      loadAndApplySettings(true), // checkChanges = true
    ]);

    let needsRefresh = false;

    // Check if menu data changed
    if (menuData !== null) {
      // Menu data has changed
      state.menuData = menuData;
      needsRefresh = true;
    }

    // Check if settings changed
    if (settings !== null) {
      // Settings have changed - already applied in loadAndApplySettings
      // Filters have been re-rendered, but we need to re-render menu items too
      needsRefresh = true;
    }

    // Refresh display if changes detected
    if (needsRefresh) {
      // Preserve current filter and sort
      const currentCategory = state.currentCategory;
      const currentSort = state.currentSort;

      // Apply current filter
      const filteredItems =
        currentCategory === "all"
          ? state.menuData
          : state.menuData.filter(
              (item) =>
                item.category &&
                item.category.toLowerCase() === currentCategory.toLowerCase()
            );

      // Apply current sort
      const sortedItems = sortMenuItems(filteredItems, currentSort);

      // Re-render menu (this will update the display with new data)
      renderMenu(sortedItems);
      
      // If settings changed, filters were already re-rendered by loadAndApplySettings
      // But we need to make sure the active filter button is still highlighted
      if (settings !== null && elements.filtersContainer) {
        const filterBtns = elements.filtersContainer.querySelectorAll(".filter-btn");
        filterBtns.forEach((btn) => {
          const btnCategory = btn.getAttribute("data-category") || "all";
          if (btnCategory.toLowerCase() === currentCategory.toLowerCase()) {
            btn.classList.add("active");
          } else {
            btn.classList.remove("active");
          }
        });
      }
    }
  } catch (error) {
    // Silently fail - don't interrupt user experience
    // Silently fail - don't interrupt user experience
  }
}

/**
 * Start auto-refresh mechanism
 * Checks for updates every 5 seconds
 */
function startAutoRefresh() {
  // Clear any existing interval
  if (state.autoRefreshInterval) {
    clearInterval(state.autoRefreshInterval);
  }

  // Check for updates every 5 seconds
  state.autoRefreshInterval = setInterval(() => {
    checkForUpdates();
  }, 5000); // 5 seconds

  // Also check when page becomes visible (user switches back to tab)
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Page became visible, check for updates immediately
      checkForUpdates();
    }
  });

  // Check when window regains focus
  window.addEventListener("focus", () => {
    checkForUpdates();
  });
}


// ============================================================================
// START APPLICATION
// ============================================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
