/**
 * @fileoverview Public menu display application with filtering, sorting, and dynamic theming
 * @author MobiTouch.online
 * @version 2.0.0
 */

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
  { category: "dips", label: "Dips" }
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
  gridGap: 2
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
  settings: null
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
  scrollToTopBtn: null
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
      <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ ${escapeHtml(message)}</p>
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
 * @returns {Promise<Object>} Settings object
 */
async function loadAndApplySettings() {
  try {
    const response = await fetch("/api/settings", {
      cache: "default",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const settings = await response.json();
    
    // Validate settings structure
    if (!settings || typeof settings !== "object") {
      throw new Error("Invalid settings format");
    }
    
    state.settings = settings;
    applySettings(settings);
    
    // Store filter categories
    if (settings.filterCategories && Array.isArray(settings.filterCategories)) {
      state.filterCategories = settings.filterCategories.filter(f => f && f.enabled);
    } else {
      state.filterCategories = DEFAULT_FILTER_CATEGORIES;
    }
    
    renderFilters();
    return settings;
  } catch (error) {
    console.error("Error loading settings:", error);
    state.settings = DEFAULT_SETTINGS;
    applySettings(DEFAULT_SETTINGS);
    state.filterCategories = DEFAULT_FILTER_CATEGORIES;
    renderFilters();
    return DEFAULT_SETTINGS;
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
    root.style.setProperty("--primary-color", settings.primaryColor || DEFAULT_SETTINGS.primaryColor);
    root.style.setProperty("--secondary-color", settings.secondaryColor || DEFAULT_SETTINGS.secondaryColor);
    root.style.setProperty("--text-color", settings.textColor || DEFAULT_SETTINGS.textColor);
    root.style.setProperty("--accent-color", settings.accentColor || DEFAULT_SETTINGS.accentColor);
    
    const cardBg = `rgba(255, 255, 255, ${settings.cardOpacity || DEFAULT_SETTINGS.cardOpacity})`;
    root.style.setProperty("--card-bg", cardBg);
    
    if (elements.menuGrid) {
      elements.menuGrid.style.gap = `${settings.gridGap || DEFAULT_SETTINGS.gridGap}rem`;
    }
    
    const heroH1 = document.querySelector(".hero h1");
    if (heroH1) {
      heroH1.style.fontSize = `${settings.headingFontSize || DEFAULT_SETTINGS.headingFontSize}rem`;
    }
    
    // Update existing menu item elements if requested
    if (updateElements) {
      const itemNames = document.querySelectorAll(".item-name");
      const itemDescs = document.querySelectorAll(".item-desc");
      const itemPrices = document.querySelectorAll(".item-price");
      
      itemNames.forEach((el) => {
        el.style.fontSize = `${settings.itemNameSize || DEFAULT_SETTINGS.itemNameSize}rem`;
      });
      
      itemDescs.forEach((el) => {
        el.style.fontSize = `${settings.descriptionSize || DEFAULT_SETTINGS.descriptionSize}rem`;
      });
      
      itemPrices.forEach((el) => {
        el.style.fontSize = `${settings.priceSize || DEFAULT_SETTINGS.priceSize}rem`;
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
    `<button class="filter-btn ${activeCategory === "all" ? "active" : ""}" data-category="all" aria-label="Show all items">All</button>`
  ];
  
  state.filterCategories.forEach(filter => {
    if (!filter || !filter.category || !filter.label) return;
    
    const isActive = activeCategory.toLowerCase() === filter.category.toLowerCase();
    const categoryEscaped = escapeHtml(filter.category);
    const labelEscaped = escapeHtml(filter.label);
    
    filterButtons.push(
      `<button class="filter-btn ${isActive ? "active" : ""}" data-category="${categoryEscaped}" aria-label="Filter by ${labelEscaped}">${labelEscaped}</button>`
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
      const allFilterBtns = elements.filtersContainer?.querySelectorAll(".filter-btn");
      if (allFilterBtns) {
        allFilterBtns.forEach((b) => b.classList.remove("active"));
      }
      
      newBtn.classList.add("active");

      state.currentCategory = newBtn.getAttribute("data-category") || "all";
      
      const filteredItems = state.currentCategory === "all" 
        ? state.menuData 
        : state.menuData.filter(
            (item) => item.category && item.category.toLowerCase() === state.currentCategory.toLowerCase()
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
  if (!elements.sortModal || !elements.openSortBtn || !elements.closeSortBtn) return;
  
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
          item => item.category && item.category.toLowerCase() === state.currentCategory.toLowerCase()
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
    "default": "Default",
    "name-asc": "Name (A-Z)",
    "name-desc": "Name (Z-A)",
    "price-asc": "Price (Low-High)",
    "price-desc": "Price (High-Low)"
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
    emptyMessage.style.cssText = "grid-column: 1 / -1; text-align: center; padding: 2rem; color: rgba(255, 255, 255, 0.6);";
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
    
    const menuItem = document.createElement("div");
    menuItem.className = "menu-item";
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
 * Load menu data from server
 * @returns {Promise<Array>} Promise resolving to menu data array
 */
async function loadMenuData() {
  try {
    const response = await fetch("data.json", {
      cache: "default",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate data structure
    if (!Array.isArray(data)) {
      throw new Error("Invalid menu data format");
    }
    
    state.menuData = data;
    return data;
  } catch (error) {
    console.error("Error loading menu data:", error);
    throw error;
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
      loadMenuData()
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
    
    // Hide loading screen
    hideLoadingScreen();
  } catch (error) {
    console.error("Error initializing:", error);
    showError(error.message || "Failed to load menu. Please refresh the page.");
    hideLoadingScreen();
  }
}

// ============================================================================
// START APPLICATION
// ============================================================================

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initialize);
} else {
  initialize();
}
