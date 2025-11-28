/**
 * @fileoverview Admin panel for menu management with CRUD operations and UI customization
 * @author MobiTouch.online
 * @version 2.0.0
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

/**
 * Application state
 * @type {Object}
 */
const state = {
  menuItems: [],
  editingItemId: null,
  currentSort: "default",
  currentFilter: "",
  uiSettings: null,
  isAuthenticated: false
};

// ============================================================================
// DOM ELEMENTS (Cached for performance)
// ============================================================================

const elements = {
  loginView: null,
  dashboardView: null,
  loginForm: null,
  passwordInput: null,
  loginError: null,
  logoutBtn: null,
  itemForm: null,
  itemId: null,
  itemName: null,
  itemCategory: null,
  itemPrice: null,
  itemDescription: null,
  formTitle: null,
  submitBtn: null,
  cancelBtn: null,
  itemsList: null,
  itemCount: null,
  itemFilter: null,
  successMessage: null,
  settingsPanel: null,
  settingsOverlay: null,
  closeSettingsPanel: null,
  settingsForm: null,
  resetSettingsBtn: null,
  filtersList: null,
  addFilterBtn: null,
  navItems: null,
  menuSection: null,
  itemModal: null,
  closeItemModal: null,
  addItemBtn: null,
  refreshBtn: null,
  pageTitle: null,
  submitBtnText: null
};

/**
 * Event listeners registry for cleanup
 * @type {Array<{element: Element, event: string, handler: Function}>}
 */
const eventListeners = [];

/**
 * Initialize DOM element references
 */
function initializeElements() {
  try {
    elements.loginView = document.getElementById("login-view");
    elements.dashboardView = document.getElementById("dashboard-view");
    elements.loginForm = document.getElementById("login-form");
    elements.passwordInput = document.getElementById("password-input");
    elements.loginError = document.getElementById("login-error");
    elements.logoutBtn = document.getElementById("logout-btn");
    elements.itemForm = document.getElementById("item-form");
    elements.itemId = document.getElementById("item-id");
    elements.itemName = document.getElementById("item-name");
    elements.itemCategory = document.getElementById("item-category");
    elements.itemPrice = document.getElementById("item-price");
    elements.itemDescription = document.getElementById("item-description");
    elements.formTitle = document.getElementById("form-title");
    elements.submitBtn = document.getElementById("submit-btn");
    elements.cancelBtn = document.getElementById("cancel-btn");
    elements.itemsList = document.getElementById("items-list");
    elements.itemCount = document.getElementById("item-count");
    elements.itemFilter = document.getElementById("item-filter");
    elements.successMessage = document.getElementById("success-message");
    elements.settingsPanel = document.getElementById("settings-panel");
    elements.settingsOverlay = document.getElementById("settings-overlay");
    elements.closeSettingsPanel = document.getElementById("close-settings-panel");
    elements.settingsForm = document.getElementById("settings-form");
    elements.resetSettingsBtn = document.getElementById("reset-settings-btn");
    elements.filtersList = document.getElementById("filters-list");
    elements.addFilterBtn = document.getElementById("add-filter-btn");
    elements.navItems = document.querySelectorAll(".nav-item");
    elements.menuSection = document.getElementById("menu-section");
    elements.itemModal = document.getElementById("item-modal");
    elements.closeItemModal = document.getElementById("close-item-modal");
    elements.addItemBtn = document.getElementById("add-item-btn");
    elements.refreshBtn = document.getElementById("refresh-btn");
    elements.pageTitle = document.getElementById("page-title");
    elements.submitBtnText = document.getElementById("submit-btn-text");
    
    if (!elements.loginForm) {
      console.error("Critical element 'login-form' not found!");
    }
  } catch (error) {
    console.error("Error initializing elements:", error);
  }
}

/**
 * Add event listener with cleanup tracking
 * @param {Element} element - DOM element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event options
 */
function addEventListener(element, event, handler, options = {}) {
  if (!element || typeof element.addEventListener !== "function") {
    console.warn("Cannot add event listener: element is not a valid DOM element", element);
    return;
  }
  element.addEventListener(event, handler, options);
  eventListeners.push({ element, event, handler });
}

/**
 * Clean up all event listeners
 */
function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners.length = 0;
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
 * Show message to user
 * @param {string} message - Message to display
 * @param {string} type - Message type (success, error)
 */
function showMessage(message, type = "success") {
  if (!elements.successMessage) return;
  
  elements.successMessage.textContent = message;
  elements.successMessage.className = type;
  elements.successMessage.style.display = "block";

  setTimeout(() => {
    if (elements.successMessage) {
      elements.successMessage.style.display = "none";
    }
  }, 3000);
}

// ============================================================================
// VIEW MANAGEMENT
// ============================================================================

function showLogin() {
  if (elements.loginView) elements.loginView.style.display = "block";
  if (elements.dashboardView) elements.dashboardView.style.display = "none";
  state.isAuthenticated = false;
}

function showDashboard() {
  if (elements.loginView) elements.loginView.style.display = "none";
  if (elements.dashboardView) elements.dashboardView.style.display = "block";
  state.isAuthenticated = true;
  showMenuSection();
}

function showMenuSection() {
  if (elements.menuSection) elements.menuSection.style.display = "block";
  if (elements.pageTitle) elements.pageTitle.textContent = "Menu Items";
  updateActiveNav("menu");
}

function showItemModal() {
  if (elements.itemModal) {
    elements.itemModal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

function hideItemModal() {
  if (elements.itemModal) {
    elements.itemModal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

function updateActiveNav(section) {
  if (elements.navItems) {
    elements.navItems.forEach(item => {
      if (item.dataset.section === section) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Check authentication status
 * @returns {Promise<void>}
 */
async function checkAuth() {
  try {
    const response = await fetch("/api/auth/status", {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();

    if (data.isAuthenticated) {
      state.isAuthenticated = true;
      showDashboard();
      await loadMenuItems();
      initializeSortButtons();
      resetFilter();
    } else {
      showLogin();
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    showLogin();
  }
}

function initializeSortButtons() {
  const defaultSortBtn = document.querySelector('.sort-btn[data-sort="default"]');
  if (defaultSortBtn && !document.querySelector(".sort-btn.active")) {
    defaultSortBtn.classList.add("active");
  }
}

function resetFilter() {
  if (elements.itemFilter) {
    elements.itemFilter.value = "";
    state.currentFilter = "";
  }
}

/**
 * Initialize authentication event listeners
 */
function initAuth() {
  // Ensure login form exists
  const loginForm = elements.loginForm || document.getElementById("login-form");
  if (!loginForm) {
    console.error("Login form not found!");
    return;
  }
  
  // Use native addEventListener as fallback if our custom one fails
  const loginHandler = async (e) => {
    e.preventDefault();

    const passwordInput = elements.passwordInput || document.getElementById("password-input");
    const loginError = elements.loginError || document.getElementById("login-error");
    const password = passwordInput?.value;
    
    if (!password) {
      if (loginError) {
        loginError.textContent = "Please enter a password";
        loginError.style.display = "block";
      }
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        state.isAuthenticated = true;
        showDashboard();
        await loadMenuItems();
        if (passwordInput) passwordInput.value = "";
        if (loginError) loginError.style.display = "none";
      } else {
        if (loginError) {
          loginError.textContent = data.message || "Incorrect password";
          loginError.style.display = "block";
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (loginError) {
        loginError.textContent = "Login failed. Please try again.";
        loginError.style.display = "block";
      }
    }
  };
  
  try {
    addEventListener(loginForm, "submit", loginHandler);
  } catch (error) {
    loginForm.addEventListener("submit", loginHandler);
  }

  const logoutBtn = elements.logoutBtn || document.querySelector('.logout-nav');
  if (logoutBtn) {
    const logoutHandler = async (e) => {
      e.preventDefault();
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        showLogin();
        state.menuItems = [];
        state.editingItemId = null;
        resetFilter();
      } catch (error) {
        console.error("Logout error:", error);
      }
    };
    
    try {
      addEventListener(logoutBtn, "click", logoutHandler);
    } catch (error) {
      logoutBtn.addEventListener("click", logoutHandler);
    }
  }
}

// ============================================================================
// MENU CRUD OPERATIONS
// ============================================================================

/**
 * Load menu items from server
 * @returns {Promise<void>}
 */
async function loadMenuItems() {
  try {
    const response = await fetch("/api/menu", {
      cache: "no-store",
      headers: {
        "Accept": "application/json"
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to load menu items`);
    }

    state.menuItems = await response.json();
    renderMenuItems();
    initializeSortButtons();
    resetFilter();
  } catch (error) {
    console.error("Error loading menu items:", error);
    showMessage("Error loading menu items", "error");
  }
}

/**
 * Sort menu items
 * @param {Array} items - Array of menu items
 * @param {string} sortType - Sort type
 * @returns {Array} Sorted array
 */
function sortMenuItems(items, sortType) {
  if (!Array.isArray(items)) return [];
  
  const sorted = [...items];
  
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
      return sorted.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });
  }
}

/**
 * Filter menu items by search term
 * @param {Array} items - Array of menu items
 * @param {string} filterText - Search term
 * @returns {Array} Filtered array
 */
function filterMenuItems(items, filterText) {
  if (!Array.isArray(items)) return [];
  if (!filterText || filterText.trim() === "") {
    return items;
  }
  
  const searchTerm = filterText.toLowerCase().trim();
  return items.filter(item => {
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    const price = (item.price || 0).toString();
    
    return name.includes(searchTerm) || 
           category.includes(searchTerm) || 
           description.includes(searchTerm) || 
           price.includes(searchTerm);
  });
}

/**
 * Render menu items to the DOM
 */
function renderMenuItems() {
  if (!elements.itemsList || !elements.itemCount) return;

  const filteredItems = filterMenuItems(state.menuItems, state.currentFilter);
  const sortedItems = sortMenuItems(filteredItems, state.currentSort);
  const countText = `${sortedItems.length}${state.currentFilter ? ` of ${state.menuItems.length}` : ''}`;
  
  elements.itemCount.textContent = countText;

  if (sortedItems.length === 0) {
    if (state.menuItems.length === 0) {
      elements.itemsList.innerHTML =
        '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No items yet. Add your first item!</p>';
    } else {
      elements.itemsList.innerHTML =
        '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No items match your search. Try a different term.</p>';
    }
    return;
  }

  const fragment = document.createDocumentFragment();
  const tempDiv = document.createElement("div");
  
  tempDiv.innerHTML = sortedItems
    .map((item) => {
      const id = item.id || "";
      const name = escapeHtml(item.name || "");
      const category = escapeHtml(item.category || "");
      const description = escapeHtml(item.description || "");
      const price = parseFloat(item.price) || 0;
      
      return `
        <div class="item-card" data-id="${id}">
          <div class="item-info">
            <h3>${name}</h3>
            <span class="category-badge">${category}</span>
            ${description ? `<p class="item-description">${description}</p>` : ''}
            <p class="item-price">$${price.toFixed(2)}</p>
          </div>
          <div class="item-actions">
            <button class="btn-edit" onclick="editItem(${id})" aria-label="Edit ${name}">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 2.5a1.5 1.5 0 010 2.12l-7 7L2 13l1.38-2.5 7-7a1.5 1.5 0 012.12 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Edit
            </button>
            <button class="btn-delete" onclick="deleteItem(${id})" aria-label="Delete ${name}">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4h10zM6 7v4M10 7v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete
            </button>
          </div>
        </div>
      `;
    })
    .join("");
  
  while (tempDiv.firstChild) {
    fragment.appendChild(tempDiv.firstChild);
  }
  
  elements.itemsList.innerHTML = "";
  elements.itemsList.appendChild(fragment);
}

/**
 * Initialize form submission handler
 */
function initItemForm() {
  if (!elements.itemForm) return;
  
  addEventListener(elements.itemForm, "submit", async (e) => {
    e.preventDefault();

    const itemData = {
      name: elements.itemName?.value?.trim() || "",
      category: elements.itemCategory?.value?.trim() || "",
      price: parseFloat(elements.itemPrice?.value) || 0,
      description: elements.itemDescription?.value?.trim() || "",
    };

    if (!itemData.name) {
      showMessage("Item name is required", "error");
      return;
    }
    if (!itemData.category) {
      showMessage("Category is required", "error");
      return;
    }
    if (isNaN(itemData.price) || itemData.price < 0) {
      showMessage("Valid price is required", "error");
      return;
    }

    try {
      let response;
      const url = state.editingItemId 
        ? `/api/menu/${state.editingItemId}`
        : "/api/menu";
      const method = state.editingItemId ? "PUT" : "POST";

      response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage(data.message || "Item saved successfully", "success");
        await loadMenuItems();
        resetForm();
        hideItemModal();
      } else {
        showMessage(data.message || "Failed to save item", "error");
      }
    } catch (error) {
      console.error("Error saving item:", error);
      showMessage("Failed to save item. Please try again.", "error");
    }
  });

  if (elements.cancelBtn) {
    addEventListener(elements.cancelBtn, "click", resetForm);
  }
}

/**
 * Edit menu item
 * @param {number} id - Item ID
 */
window.editItem = function(id) {
  const item = state.menuItems.find((i) => i.id === id);
  if (!item) {
    showMessage("Item not found", "error");
    return;
  }

  state.editingItemId = id;

  if (elements.itemId) elements.itemId.value = item.id || "";
  if (elements.itemName) elements.itemName.value = item.name || "";
  if (elements.itemCategory) elements.itemCategory.value = item.category || "";
  if (elements.itemPrice) elements.itemPrice.value = item.price || 0;
  if (elements.itemDescription) elements.itemDescription.value = item.description || "";

  if (elements.formTitle) elements.formTitle.textContent = "Edit Item";
  if (elements.submitBtnText) elements.submitBtnText.textContent = "Update Item";
  if (elements.cancelBtn) elements.cancelBtn.style.display = "inline-block";

  showItemModal();
};

/**
 * Delete menu item
 * @param {number} id - Item ID
 */
window.deleteItem = async function(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const response = await fetch(`/api/menu/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      showMessage(data.message || "Item deleted successfully", "success");
      await loadMenuItems();

      // If we're editing this item, reset the form
      if (state.editingItemId === id) {
        resetForm();
      }
    } else {
      showMessage(data.message || "Failed to delete item", "error");
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    showMessage("Failed to delete item. Please try again.", "error");
  }
};

/**
 * Reset form to add mode
 */
function resetForm() {
  state.editingItemId = null;

  if (elements.itemForm) elements.itemForm.reset();
  if (elements.itemId) elements.itemId.value = "";
  if (elements.formTitle) elements.formTitle.textContent = "Add New Item";
  if (elements.submitBtnText) elements.submitBtnText.textContent = "Add Item";
  if (elements.cancelBtn) elements.cancelBtn.style.display = "inline-block";
}

// ============================================================================
// FILTERING & SORTING
// ============================================================================

/**
 * Initialize filter and sort functionality
 */
function initFilterAndSort() {
  if (elements.itemFilter) {
    const debouncedFilter = debounce((e) => {
      state.currentFilter = e.target.value;
      renderMenuItems();
    }, 300);
    addEventListener(elements.itemFilter, "input", debouncedFilter);
  }

  document.querySelectorAll(".sort-btn").forEach((btn) => {
    addEventListener(btn, "click", () => {
      document.querySelectorAll(".sort-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.currentSort = btn.getAttribute("data-sort") || "default";
      renderMenuItems();
    });
  });
}

// ============================================================================
// SETTINGS MODAL
// ============================================================================

/**
 * Get default settings
 * @returns {Object} Default settings object
 */
function getDefaultSettings() {
  return {
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
    filterCategories: [
      { category: "starters", label: "Starters", enabled: true },
      { category: "lorem ipsum", label: "Lorem Ipsum", enabled: true },
      { category: "chicken burgers", label: "Chicken Burgers", enabled: true },
      { category: "fries", label: "Fries", enabled: true },
      { category: "dessert", label: "Dessert", enabled: true },
      { category: "drinks", label: "Drinks", enabled: true },
      { category: "add ons", label: "Add Ons", enabled: true },
      { category: "dips", label: "Dips", enabled: true }
    ]
  };
}

/**
 * Get available categories from menu items
 * @returns {Promise<Array<string>>}
 */
async function getAvailableCategories() {
  try {
    const response = await fetch("/api/menu", {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Failed to load menu");
    
    const items = await response.json();
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))].sort();
    return categories;
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
}

/**
 * Load settings from server
 * @returns {Promise<Object>}
 */
async function loadSettings() {
  try {
    const response = await fetch("/api/settings", {
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Failed to load settings");
    
    state.uiSettings = await response.json();
    
    // If no filter categories exist, try to auto-detect from menu items
    if (!state.uiSettings.filterCategories || state.uiSettings.filterCategories.length === 0) {
      const availableCategories = await getAvailableCategories();
      if (availableCategories.length > 0) {
        state.uiSettings.filterCategories = availableCategories.map(cat => ({
          category: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1),
          enabled: true
        }));
      } else {
        state.uiSettings.filterCategories = getDefaultSettings().filterCategories;
      }
    }
    
    populateSettingsForm(state.uiSettings);
  } catch (error) {
    console.error("Error loading settings:", error);
    state.uiSettings = getDefaultSettings();
    populateSettingsForm(state.uiSettings);
  }
}

/**
 * Populate settings form with values
 * @param {Object} settings - Settings object
 */
function populateSettingsForm(settings) {
  const colorInputs = ["primary", "secondary", "text", "accent"];
  
  colorInputs.forEach((colorType) => {
    const colorInput = document.getElementById(`${colorType}-color`);
    const textInput = document.getElementById(`${colorType}-color-text`);
    const value = settings[`${colorType}Color`] || getDefaultSettings()[`${colorType}Color`];
    
    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value;
  });
  
  const numericInputs = {
    "heading-font-size": "headingFontSize",
    "item-name-size": "itemNameSize",
    "description-size": "descriptionSize",
    "price-size": "priceSize",
    "card-opacity": "cardOpacity",
    "grid-gap": "gridGap"
  };
  
  Object.entries(numericInputs).forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = settings[key] || getDefaultSettings()[key];
    }
  });
  
  renderFilterCategories(settings.filterCategories || getDefaultSettings().filterCategories);
}

/**
 * Sync color picker with text input
 */
function initColorInputs() {
  ["primary", "secondary", "text", "accent"].forEach((colorType) => {
    const colorInput = document.getElementById(`${colorType}-color`);
    const textInput = document.getElementById(`${colorType}-color-text`);
    
    if (colorInput && textInput) {
      addEventListener(colorInput, "input", (e) => {
        textInput.value = e.target.value;
      });
      
      addEventListener(textInput, "input", (e) => {
        const value = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
          colorInput.value = value;
        }
      });
    }
  });
}

/**
 * Render filter categories in settings
 * @param {Array} filters - Array of filter objects
 */
function renderFilterCategories(filters) {
  if (!elements.filtersList) return;
  
  elements.filtersList.innerHTML = filters.map((filter, index) => `
    <div class="filter-item" data-index="${index}">
      <span class="filter-drag-handle">☰</span>
      <input type="checkbox" class="filter-enabled" ${filter.enabled ? 'checked' : ''} />
      <input type="text" class="filter-category" value="${escapeHtml(filter.category || "")}" placeholder="Category value" />
      <input type="text" class="filter-label" value="${escapeHtml(filter.label || "")}" placeholder="Display label" />
      <button type="button" class="btn-remove-filter" onclick="removeFilter(${index})" aria-label="Remove filter">Remove</button>
    </div>
  `).join("");
  
  enableDragAndDrop();
}

/**
 * Get current filter categories from form
 * @returns {Array<Object>}
 */
function getFilterCategories() {
  const filterItems = document.querySelectorAll(".filter-item");
  return Array.from(filterItems).map(item => ({
    category: item.querySelector(".filter-category")?.value?.trim() || "",
    label: item.querySelector(".filter-label")?.value?.trim() || "",
    enabled: item.querySelector(".filter-enabled")?.checked || false
  })).filter(f => f.category && f.label);
}

/**
 * Remove filter category
 * @param {number} index - Filter index
 */
window.removeFilter = function(index) {
  const filters = getFilterCategories();
  filters.splice(index, 1);
  renderFilterCategories(filters);
};

/**
 * Add new filter category
 */
async function addFilter() {
  const filters = getFilterCategories();
  const availableCategories = await getAvailableCategories();
  
  let newCategory = "";
  let newLabel = "";
  
  if (availableCategories.length > 0) {
    const existingCategories = filters.map(f => f.category.toLowerCase());
    const unusedCategory = availableCategories.find(cat => !existingCategories.includes(cat.toLowerCase()));
    if (unusedCategory) {
      newCategory = unusedCategory;
      newLabel = unusedCategory.charAt(0).toUpperCase() + unusedCategory.slice(1);
    }
  }
  
  filters.push({ category: newCategory, label: newLabel, enabled: true });
  renderFilterCategories(filters);
}

/**
 * Enable drag and drop for filters
 */
function enableDragAndDrop() {
  if (!elements.filtersList) return;
  
  let draggedElement = null;
  
  document.querySelectorAll(".filter-item").forEach(item => {
    item.draggable = true;
    const handle = item.querySelector(".filter-drag-handle");
    if (handle) handle.style.cursor = "move";
    
    addEventListener(item, "dragstart", (e) => {
      draggedElement = item;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    
    addEventListener(item, "dragend", () => {
      item.classList.remove("dragging");
      draggedElement = null;
    });
    
    addEventListener(item, "dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const afterElement = getDragAfterElement(elements.filtersList, e.clientY);
      if (afterElement == null) {
        elements.filtersList.appendChild(draggedElement);
      } else {
        elements.filtersList.insertBefore(draggedElement, afterElement);
      }
    });
  });
}

/**
 * Get element after drag position
 * @param {Element} container - Container element
 * @param {number} y - Y coordinate
 * @returns {Element|null}
 */
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".filter-item:not(.dragging)")];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Initialize settings modal
 */
function showSettingsPanel() {
  if (elements.settingsPanel) {
    elements.settingsPanel.classList.add("show");
    if (elements.settingsOverlay) {
      elements.settingsOverlay.classList.add("show");
    }
    document.body.style.overflow = "hidden";
    updateActiveNav("settings");
  }
}

function hideSettingsPanel() {
  if (elements.settingsPanel) {
    elements.settingsPanel.classList.remove("show");
    if (elements.settingsOverlay) {
      elements.settingsOverlay.classList.remove("show");
    }
    document.body.style.overflow = "";
    updateActiveNav("menu");
  }
}

function initSettingsPanel() {
  if (!elements.settingsPanel || !elements.closeSettingsPanel) return;
  
  const settingsNavItem = document.querySelector('.nav-item[data-section="settings"]');
  if (settingsNavItem) {
    addEventListener(settingsNavItem, "click", async (e) => {
      e.preventDefault();
      await loadSettings();
      showSettingsPanel();
    });
  }

  if (elements.closeSettingsPanel) {
    addEventListener(elements.closeSettingsPanel, "click", () => {
      hideSettingsPanel();
    });
  }

  if (elements.settingsOverlay) {
    addEventListener(elements.settingsOverlay, "click", () => {
      hideSettingsPanel();
    });
  }

  addEventListener(document, "keydown", (e) => {
    if (e.key === "Escape" && elements.settingsPanel && elements.settingsPanel.classList.contains("show")) {
      hideSettingsPanel();
    }
  });

  if (elements.settingsForm) {
    addEventListener(elements.settingsForm, "submit", async (e) => {
      e.preventDefault();
      
      const filterCategories = getFilterCategories();
      
      const invalidFilters = filterCategories.filter(f => !f.category || !f.label);
      if (invalidFilters.length > 0) {
        showMessage("Please fill in all filter category and label fields", "error");
        return;
      }
      
      const categoryValues = filterCategories.map(f => f.category.toLowerCase());
      const duplicates = categoryValues.filter((cat, index) => categoryValues.indexOf(cat) !== index);
      if (duplicates.length > 0) {
        showMessage("Duplicate category values found. Please use unique categories.", "error");
        return;
      }
      
      const colorRegex = /^#[0-9A-F]{6}$/i;
      const colors = {
        primary: document.getElementById("primary-color")?.value,
        secondary: document.getElementById("secondary-color")?.value,
        text: document.getElementById("text-color")?.value,
        accent: document.getElementById("accent-color")?.value
      };
      
      for (const [name, value] of Object.entries(colors)) {
        if (!value || !colorRegex.test(value)) {
          showMessage(`Invalid ${name} color format. Please use hex format (e.g., #0d3b2e)`, "error");
          return;
        }
      }
      
      const settings = {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        textColor: colors.text,
        accentColor: colors.accent,
        headingFontSize: parseFloat(document.getElementById("heading-font-size")?.value),
        itemNameSize: parseFloat(document.getElementById("item-name-size")?.value),
        descriptionSize: parseFloat(document.getElementById("description-size")?.value),
        priceSize: parseFloat(document.getElementById("price-size")?.value),
        cardOpacity: parseFloat(document.getElementById("card-opacity")?.value),
        gridGap: parseFloat(document.getElementById("grid-gap")?.value),
        filterCategories: filterCategories
      };
      
      if (isNaN(settings.headingFontSize) || settings.headingFontSize < 2 || settings.headingFontSize > 8) {
        showMessage("Heading font size must be between 2 and 8", "error");
        return;
      }
      
      if (isNaN(settings.cardOpacity) || settings.cardOpacity < 0 || settings.cardOpacity > 1) {
        showMessage("Card opacity must be between 0 and 1", "error");
        return;
      }
      
      try {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          showMessage("Settings saved successfully!", "success");
          state.uiSettings = settings;
          setTimeout(() => {
            hideSettingsPanel();
          }, 1000);
        } else {
          showMessage(data.message || "Failed to save settings", "error");
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        showMessage("Failed to save settings. Please try again.", "error");
      }
    });
  }

  if (elements.resetSettingsBtn) {
    addEventListener(elements.resetSettingsBtn, "click", () => {
      if (confirm("Are you sure you want to reset all settings to default?")) {
        const defaultSettings = getDefaultSettings();
        populateSettingsForm(defaultSettings);
        renderFilterCategories(defaultSettings.filterCategories);
      }
    });
  }

  if (elements.addFilterBtn) {
    addEventListener(elements.addFilterBtn, "click", addFilter);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the admin panel
 */
function initNavigation() {
  if (elements.navItems) {
    elements.navItems.forEach(item => {
      if (item.dataset.section === "menu") {
        addEventListener(item, "click", (e) => {
          e.preventDefault();
          hideSettingsPanel();
          showMenuSection();
        });
      }
    });
  }

  if (elements.addItemBtn) {
    addEventListener(elements.addItemBtn, "click", () => {
      resetForm();
      showItemModal();
    });
  }

  if (elements.closeItemModal) {
    addEventListener(elements.closeItemModal, "click", () => {
      resetForm();
      hideItemModal();
    });
  }

  if (elements.itemModal) {
    addEventListener(elements.itemModal, "click", (e) => {
      if (e.target === elements.itemModal) {
        resetForm();
        hideItemModal();
      }
    });
  }

  addEventListener(document, "keydown", (e) => {
    if (e.key === "Escape" && elements.itemModal && elements.itemModal.classList.contains("show")) {
      resetForm();
      hideItemModal();
    }
  });

  if (elements.cancelBtn) {
    addEventListener(elements.cancelBtn, "click", () => {
      resetForm();
      hideItemModal();
    });
  }

  if (elements.refreshBtn) {
    addEventListener(elements.refreshBtn, "click", async () => {
      await loadMenuItems();
    });
  }
}

function initialize() {
  try {
    initializeElements();
    
    if (!elements.loginForm) {
      console.error("Login form not found. Page may not be fully loaded.");
      setTimeout(initialize, 100);
      return;
    }
    
    initAuth();
    initItemForm();
    initFilterAndSort();
    initSettingsPanel();
    initColorInputs();
    initNavigation();
    checkAuth();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", cleanupEventListeners);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    setTimeout(initialize, 0);
  }
}

