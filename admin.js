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
  isAuthenticated: false,
  selectedItems: new Set(),
  theme: "dark",
  layout: "grid",
  newCategories: new Set(),
  initialFormState: null,
  csrfToken: null,
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
  itemTags: null,
  itemImage: null,
  imagePreview: null,
  imagePreviewContainer: null,
  removeImageBtn: null,
  itemAvailable: null,
  itemUnavailableReason: null,
  enableSchedule: null,
  scheduleOptions: null,
  scheduleDays: null,
  scheduleStartTime: null,
  scheduleEndTime: null,
  scheduleStartDate: null,
  scheduleEndDate: null,
  formTitle: null,
  submitBtn: null,
  cancelBtn: null,
  itemsList: null,
  itemCount: null,
  itemFilter: null,
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
  submitBtnText: null,
  sidebar: null,
  sidebarToggle: null,
  mobileMenuBtn: null,
  sidebarOverlay: null,
  statsSection: null,
  categoriesSection: null,
  categoriesList: null,
  categoryCount: null,
  exportBtn: null,
  importBtn: null,
  previewMenuBtn: null,
  bulkActionsBar: null,
  selectedCount: null,
  bulkDeleteBtn: null,
  clearSelectionBtn: null,
  importModal: null,
  closeImportModal: null,
  cancelImportBtn: null,
  confirmImportBtn: null,
  importFileInput: null,
  importReplaceCheckbox: null,
  confirmModal: null,
  confirmModalTitle: null,
  confirmModalMessage: null,
  confirmModalOk: null,
  confirmModalCancel: null,
  clearSearchBtn: null,
  themeToggleBtn: null,
  sortPopupBtn: null,
  sortModal: null,
  closeSortModal: null,
  sortPopupLabel: null,
  printMenuBtn: null,
  categoryModal: null,
  categoryModalTitle: null,
  categoryModalInput: null,
  categoryModalError: null,
  categoryModalSave: null,
  categoryModalCancel: null,
  closeCategoryModal: null,
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
    elements.itemTags = document.getElementById("item-tags");
    elements.itemImage = document.getElementById("item-image");
    elements.imagePreview = document.getElementById("image-preview");
    elements.imagePreviewContainer = document.getElementById(
      "image-preview-container"
    );
    elements.removeImageBtn = document.getElementById("remove-image-btn");
    elements.itemAvailable = document.getElementById("item-available");
    elements.itemUnavailableReason = document.getElementById("item-unavailable-reason");
    elements.enableSchedule = document.getElementById("enable-schedule");
    elements.scheduleOptions = document.getElementById("schedule-options");
    elements.scheduleDays = document.querySelectorAll(".schedule-day");
    elements.scheduleStartTime = document.getElementById("schedule-start-time");
    elements.scheduleEndTime = document.getElementById("schedule-end-time");
    elements.scheduleStartDate = document.getElementById("schedule-start-date");
    elements.scheduleEndDate = document.getElementById("schedule-end-date");
    elements.formTitle = document.getElementById("form-title");
    elements.submitBtn = document.getElementById("submit-btn");
    elements.cancelBtn = document.getElementById("cancel-btn");
    elements.itemsList = document.getElementById("items-list");
    elements.itemCount = document.getElementById("item-count");
    elements.itemFilter = document.getElementById("item-filter");
    elements.settingsPanel = document.getElementById("settings-panel");
    elements.settingsOverlay = document.getElementById("settings-overlay");
    elements.closeSettingsPanel = document.getElementById(
      "close-settings-panel"
    );
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
    elements.sidebar = document.getElementById("sidebar");
    elements.sidebarToggle = document.getElementById("sidebar-toggle");
    elements.mobileMenuBtn = document.getElementById("mobile-menu-btn");
    elements.sidebarOverlay = document.getElementById("sidebar-overlay");
    elements.statsSection = document.getElementById("stats-section");
    elements.categoriesSection = document.getElementById("categories-section");
    elements.categoriesList = document.getElementById("categories-list");
    elements.categoryCount = document.getElementById("category-count");
    elements.exportBtn = document.getElementById("export-btn");
    elements.importBtn = document.getElementById("import-btn");
    elements.previewMenuBtn = document.getElementById("preview-menu-btn");
    elements.bulkActionsBar = document.getElementById("bulk-actions-bar");
    elements.selectedCount = document.getElementById("selected-count");
    elements.bulkDeleteBtn = document.getElementById("bulk-delete-btn");
    elements.clearSelectionBtn = document.getElementById("clear-selection-btn");
    elements.importModal = document.getElementById("import-modal");
    elements.closeImportModal = document.getElementById("close-import-modal");
    elements.cancelImportBtn = document.getElementById("cancel-import-btn");
    elements.confirmImportBtn = document.getElementById("confirm-import-btn");
    elements.importFileInput = document.getElementById("import-file-input");
    elements.importReplaceCheckbox = document.getElementById(
      "import-replace-checkbox"
    );
    elements.confirmModal = document.getElementById("confirm-modal");
    elements.confirmModalTitle = document.getElementById("confirm-modal-title");
    elements.confirmModalMessage = document.getElementById(
      "confirm-modal-message"
    );
    elements.confirmModalOk = document.getElementById("confirm-modal-ok");
    elements.confirmModalCancel = document.getElementById(
      "confirm-modal-cancel"
    );
    elements.clearSearchBtn = document.getElementById("clear-search-btn");
    elements.themeToggleBtn = document.getElementById("theme-toggle-btn");
    elements.sortPopupBtn = document.getElementById("sort-popup-btn");
    elements.sortModal = document.getElementById("sort-modal");
    elements.closeSortModal = document.getElementById("close-sort-modal");
    elements.sortPopupLabel = document.getElementById("sort-popup-label");
    elements.printMenuBtn = document.getElementById("print-menu-btn");
    elements.layoutToggleBtn = document.getElementById("layout-toggle-btn");
    elements.categoryModal = document.getElementById("category-modal");
    elements.categoryModalTitle = document.getElementById("category-modal-title");
    elements.categoryModalInput = document.getElementById("category-modal-input");
    elements.categoryModalError = document.getElementById("category-modal-error");
    elements.categoryModalSave = document.getElementById("category-modal-save");
    elements.categoryModalCancel = document.getElementById("category-modal-cancel");
    elements.closeCategoryModal = document.getElementById("close-category-modal");

    if (!elements.loginForm) {
    }
  } catch (error) {
    // Silently handle initialization errors
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
    return;
  }
  try {
    element.addEventListener(event, handler, options);
    eventListeners.push({ element, event, handler });
  } catch (error) {
    // Silently handle event listener errors
  }
}

/**
 * Clean up all event listeners
 */
function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    try {
      if (element && typeof element.removeEventListener === "function") {
        element.removeEventListener(event, handler);
      }
    } catch (error) {
      // Silently ignore cleanup errors
    }
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
 * Show toast notification (replaces old showMessage)
 * @param {string} message - Message to display
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds (default: 4000)
 */
function showMessage(message, type = "success", duration = 4000) {
  const toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    return;
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  // Icon based on type
  let iconSvg = "";
  switch (type) {
    case "success":
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      break;
    case "error":
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      break;
    case "warning":
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 9v4M12 17h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
      break;
    default:
      iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" aria-label="Close notification">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div class="toast-progress"></div>
  `;

  // Add to container
  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Close button handler
  const closeBtn = toast.querySelector(".toast-close");
  const closeToast = () => {
    toast.classList.remove("show");
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  };

  if (closeBtn) {
    closeBtn.addEventListener("click", closeToast);
  }

  // Auto-dismiss after duration
  const progressBar = toast.querySelector(".toast-progress");
  if (progressBar) {
    progressBar.style.animationDuration = `${duration}ms`;
  }

  const timeout = setTimeout(closeToast, duration);

  // Pause on hover
  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
    if (progressBar) {
      progressBar.style.animationPlayState = "paused";
    }
  });

  toast.addEventListener("mouseleave", () => {
    const newTimeout = setTimeout(closeToast, duration);
    if (progressBar) {
      progressBar.style.animationPlayState = "running";
    }
  });
}

/**
 * Show confirmation modal
 * @param {string} message - Confirmation message
 * @param {string} title - Modal title (optional)
 * @param {string} okText - OK button text (optional)
 * @param {string} cancelText - Cancel button text (optional)
 * @param {string} type - Modal type: 'delete', 'warning', 'info' (optional)
 * @returns {Promise<boolean>} Promise that resolves to true if confirmed, false if cancelled
 */
function showConfirmModal(
  message,
  title = "Confirm Action",
  okText = "Confirm",
  cancelText = "Cancel",
  type = "info"
) {
  return new Promise((resolve) => {
    if (!elements.confirmModal || !elements.confirmModalMessage) {
      resolve(false);
      return;
    }

    // Set modal content
    if (elements.confirmModalTitle) {
      elements.confirmModalTitle.textContent = title;
    }
    if (elements.confirmModalMessage) {
      elements.confirmModalMessage.textContent = message;
    }

    // Set button text and styles
    if (elements.confirmModalOk) {
      elements.confirmModalOk.textContent = okText;
      // Reset classes first
      elements.confirmModalOk.className = "btn-primary";
      // Set button style based on type
      if (type === "delete") {
        elements.confirmModalOk.classList.remove("btn-primary");
        elements.confirmModalOk.classList.add("btn-delete");
      }
    }

    if (elements.confirmModalCancel) {
      elements.confirmModalCancel.textContent = cancelText;
    }

    const oldOkHandler = elements.confirmModalOk?.onclick;
    const oldCancelHandler = elements.confirmModalCancel?.onclick;
    if (oldOkHandler) elements.confirmModalOk.onclick = null;
    if (oldCancelHandler) elements.confirmModalCancel.onclick = null;

    // Define handlers
    const okHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideConfirmModal();
      cleanup();
      resolve(true);
    };

    const cancelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideConfirmModal();
      cleanup();
      resolve(false);
    };

    const escapeHandler = (e) => {
      if (
        e.key === "Escape" &&
        elements.confirmModal.classList.contains("show")
      ) {
        cancelHandler(e);
      }
    };

    const outsideClickHandler = (e) => {
      if (e.target === elements.confirmModal) {
        cancelHandler(e);
      }
    };

    // Cleanup function
    const cleanup = () => {
      document.removeEventListener("keydown", escapeHandler);
      if (elements.confirmModal) {
        elements.confirmModal.removeEventListener("click", outsideClickHandler);
      }
    };

    // Add event listeners
    if (elements.confirmModalOk) {
      elements.confirmModalOk.onclick = okHandler;
    }

    if (elements.confirmModalCancel) {
      elements.confirmModalCancel.onclick = cancelHandler;
    }

    document.addEventListener("keydown", escapeHandler);
    if (elements.confirmModal) {
      elements.confirmModal.addEventListener("click", outsideClickHandler);
    }

    // Show modal
    elements.confirmModal.classList.add("show");
    document.body.style.overflow = "hidden";
  });
}

/**
 * Hide confirmation modal
 */
function hideConfirmModal() {
  if (elements.confirmModal) {
    elements.confirmModal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

/**
 * Show category modal for adding or editing
 * @param {string} mode - 'add' or 'edit'
 * @param {string} currentName - Current category name (for edit mode)
 * @returns {Promise<string|null>} Promise that resolves to the category name or null if cancelled
 */
function showCategoryModal(mode = 'add', currentName = '') {
  return new Promise((resolve) => {
    if (!elements.categoryModal || !elements.categoryModalInput) {
      resolve(null);
      return;
    }

    // Set modal title and input value
    if (elements.categoryModalTitle) {
      elements.categoryModalTitle.textContent = mode === 'edit' ? 'Edit Category' : 'Add Category';
    }
    if (elements.categoryModalInput) {
      elements.categoryModalInput.value = currentName;
      elements.categoryModalInput.focus();
      elements.categoryModalInput.select();
    }

    // Hide error message
    if (elements.categoryModalError) {
      elements.categoryModalError.style.display = 'none';
      elements.categoryModalError.textContent = '';
    }

    // Show modal
    if (elements.categoryModal) {
      elements.categoryModal.classList.add("show");
      document.body.style.overflow = "hidden";
    }

    // Store resolve function for later use
    elements.categoryModal._resolve = resolve;
  });
}

/**
 * Hide category modal
 */
function hideCategoryModal() {
  if (elements.categoryModal) {
    elements.categoryModal.classList.remove("show");
    document.body.style.overflow = "";
    if (elements.categoryModalInput) {
      elements.categoryModalInput.value = '';
    }
    if (elements.categoryModalError) {
      elements.categoryModalError.style.display = 'none';
      elements.categoryModalError.textContent = '';
    }
    // Resolve with null if modal was closed without saving
    if (elements.categoryModal._resolve) {
      elements.categoryModal._resolve(null);
      delete elements.categoryModal._resolve;
    }
  }
}

/**
 * Show error in category modal
 * @param {string} message - Error message
 */
function showCategoryModalError(message) {
  if (elements.categoryModalError) {
    elements.categoryModalError.textContent = message;
    elements.categoryModalError.style.display = 'block';
  }
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
  if (elements.statsSection) elements.statsSection.style.display = "none";
  if (elements.categoriesSection) elements.categoriesSection.style.display = "none";
  if (elements.pageTitle) elements.pageTitle.textContent = "Menu Items";
  updateActiveNav("menu");

  // Sync search input with state when showing menu section
  if (elements.itemFilter && state.currentFilter) {
    elements.itemFilter.value = state.currentFilter;
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.style.display = "flex";
    }
  }

  // Re-render to ensure search is applied
  renderMenuItems();
}

function showStatsSection() {
  if (elements.menuSection) elements.menuSection.style.display = "none";
  if (elements.categoriesSection) elements.categoriesSection.style.display = "none";
  if (elements.statsSection) {
    elements.statsSection.style.display = "block";
    renderStatistics();
  }
  if (elements.pageTitle) elements.pageTitle.textContent = "Statistics";
  updateActiveNav("stats");
}

async function showCategoriesSection() {
  if (elements.menuSection) elements.menuSection.style.display = "none";
  if (elements.statsSection) elements.statsSection.style.display = "none";
  if (elements.categoriesSection) {
    elements.categoriesSection.style.display = "block";
    // Ensure settings are loaded before rendering
    if (!state.uiSettings) {
      await loadSettings();
    }
    renderCategories();
  }
  if (elements.pageTitle) elements.pageTitle.textContent = "Categories";
  updateActiveNav("categories");
}

async function showItemModal() {
  if (elements.itemModal) {
    // Ensure settings are loaded before populating dropdown (Categories tab is source of truth)
    if (!state.uiSettings) {
      await loadSettings();
    } else {
      await refreshSettings();
    }
    
    // Preserve current category selection if editing
    const currentCategory = state.editingItemId && elements.itemCategory 
      ? elements.itemCategory.value 
      : null;
    
    populateCategoryDropdown(currentCategory); // Ensure categories are up to date from Categories tab
    
    // Set default category to "starters" when opening modal for new items (not editing)
    if (!state.editingItemId && elements.itemCategory) {
      // Find "Starters" (capitalized) option - case-insensitive search
      const startersOption = Array.from(elements.itemCategory.options).find(
        opt => opt.value.toLowerCase() === "starters"
      );
      if (startersOption) {
        elements.itemCategory.value = startersOption.value;
      } else if (elements.itemCategory.options.length > 0) {
        elements.itemCategory.value = elements.itemCategory.options[0].value;
      }
    }
    // Store initial form state for change detection
    storeInitialFormState();
    elements.itemModal.classList.add("show");
    document.body.style.overflow = "hidden";
  }
}

/**
 * Store initial form state for change detection
 */
function storeInitialFormState() {
  state.initialFormState = {
    name: elements.itemName ? elements.itemName.value.trim() : "",
    category: elements.itemCategory ? elements.itemCategory.value : "",
    price: elements.itemPrice ? elements.itemPrice.value.trim() : "",
    description: elements.itemDescription ? elements.itemDescription.value.trim() : "",
    tags: elements.itemTags ? elements.itemTags.value.trim() : "",
    image: state.currentImageBase64 || null,
    editingItemId: state.editingItemId || null
  };
}

/**
 * Check if form has unsaved changes
 * @returns {boolean} True if form has changes, false otherwise
 */
function hasFormChanges() {
  if (!state.initialFormState) {
    return false; // No initial state stored, assume no changes
  }

  const current = {
    name: elements.itemName ? elements.itemName.value.trim() : "",
    category: elements.itemCategory ? elements.itemCategory.value : "",
    price: elements.itemPrice ? elements.itemPrice.value.trim() : "",
    description: elements.itemDescription ? elements.itemDescription.value.trim() : "",
    tags: elements.itemTags ? elements.itemTags.value.trim() : "",
    image: state.currentImageBase64 || null,
    editingItemId: state.editingItemId || null
  };

  const initial = state.initialFormState;

  // Check if any field has changed
  return (
    current.name !== initial.name ||
    current.category !== initial.category ||
    current.price !== initial.price ||
    current.description !== initial.description ||
    current.tags !== initial.tags ||
    current.image !== initial.image ||
    current.editingItemId !== initial.editingItemId
  );
}

/**
 * Attempt to close item modal with confirmation if there are unsaved changes
 * @returns {Promise<boolean>} True if modal should be closed, false if cancelled
 */
async function attemptCloseItemModal() {
  // Check if form has unsaved changes
  if (hasFormChanges()) {
    const confirmed = await showConfirmModal(
      "You have unsaved changes. Are you sure you want to close?",
      "Unsaved Changes",
      "Discard Changes",
      "Cancel",
      "warning"
    );
    
    if (!confirmed) {
      return false; // User cancelled
    }
  }
  
  // No changes or user confirmed discard
  return true;
}

/**
 * Close item modal (with confirmation if needed)
 */
async function closeItemModalWithConfirmation() {
  const shouldClose = await attemptCloseItemModal();
  if (shouldClose) {
    resetForm();
    hideItemModal();
  }
}

function hideItemModal() {
  if (elements.itemModal) {
    elements.itemModal.classList.remove("show");
    document.body.style.overflow = "";
    // Clear initial form state
    state.initialFormState = null;
  }
}

function updateActiveNav(section) {
  if (elements.navItems) {
    elements.navItems.forEach((item) => {
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
    const response = await apiFetch("/api/auth/status", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.isAuthenticated) {
      state.isAuthenticated = true;
      // Store CSRF token if provided
      if (data.csrfToken) {
        state.csrfToken = data.csrfToken;
      }
      showDashboard();
      // Load settings first to get filterCategories (persisted categories)
      await loadSettings();
      await loadMenuItems();
      populateCategoryDropdown(); // Populate after both settings and menu items are loaded
      initializeSortButtons();
      resetFilter();
    } else {
      showLogin();
    }
  } catch (error) {
    // Auth check failed - silently handle
    showLogin();
  }
}

/**
 * Update sort popup label based on current sort
 */
function updateSortPopupLabel() {
  if (!elements.sortPopupLabel) return;

  const sortLabels = {
    default: "Default",
    "id-asc": "ID (Low to High)",
    "id-desc": "ID (High to Low)",
    "name-asc": "Name (A to Z)",
    "name-desc": "Name (Z to A)",
    "price-asc": "Price (Low to High)",
    "price-desc": "Price (High to Low)",
  };

  const label = sortLabels[state.currentSort] || "Default";
  elements.sortPopupLabel.textContent = `Sort by: ${label}`;
}

/**
 * Update sort popup selection indicators
 */
function updateSortPopupSelection() {
  const sortOptions = document.querySelectorAll(".sort-popup-option");
  sortOptions.forEach((option) => {
    const sortType = option.getAttribute("data-sort") || "default";
    const checkIcon = option.querySelector(".sort-check-icon");
    if (sortType === state.currentSort) {
      option.classList.add("active");
      if (checkIcon) checkIcon.style.display = "block";
    } else {
      option.classList.remove("active");
      if (checkIcon) checkIcon.style.display = "none";
    }
  });
}

function initializeSortButtons() {
  updateSortPopupLabel();
  updateSortPopupSelection();
  updateSortButtons();
}

/**
 * Update desktop sort buttons active state
 */
function updateSortButtons() {
  const desktopSortButtons = document.querySelectorAll(".sort-btn");
  desktopSortButtons.forEach((btn) => {
    const sortType = btn.getAttribute("data-sort") || "default";
    if (sortType === state.currentSort) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function resetFilter() {
  if (elements.itemFilter) {
    elements.itemFilter.value = "";
    state.currentFilter = "";
    if (elements.clearSearchBtn) {
      elements.clearSearchBtn.style.display = "none";
    }
    renderMenuItems(); // Re-render to show all items
  }
}

/**
 * Clear search filter and show all items
 */
function clearSearch() {
  resetFilter();
}

/**
 * Initialize authentication event listeners
 */
function initAuth() {
  const loginForm = elements.loginForm || document.getElementById("login-form");
  if (!loginForm) {
    // Will retry in initialize() function
    return;
  }

  const loginHandler = async (e) => {
    e.preventDefault();

    const passwordInput =
      elements.passwordInput || document.getElementById("password-input");
    const loginError =
      elements.loginError || document.getElementById("login-error");
    const password = passwordInput?.value;

    if (!password) {
      if (loginError) {
        loginError.textContent = "Please enter a password";
        loginError.style.display = "block";
      }
      return;
    }

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.success) {
        state.isAuthenticated = true;
        if (passwordInput) passwordInput.value = "";
        if (loginError) loginError.style.display = "none";
        showMessage("Login successful! Welcome back.", "success", 3000);
        showDashboard();
        await loadMenuItems();
        initializeSortButtons();
        resetFilter();
      } else {
        if (loginError) {
          loginError.textContent = data.message || "Incorrect password";
          loginError.style.display = "block";
        }
        showMessage(
          data.message || "Incorrect password. Please try again.",
          "error",
          4000
        );
      }
    } catch (error) {
      const errorMessage =
        error.message && error.message.includes("401")
          ? "Incorrect password. Please try again."
          : "Login failed. Please try again.";
      if (loginError) {
        loginError.textContent = errorMessage;
        loginError.style.display = "block";
      }
      showMessage(errorMessage, "error", 4000);
    }
  };

  try {
    addEventListener(loginForm, "submit", loginHandler);
  } catch (error) {
    loginForm.addEventListener("submit", loginHandler);
  }

  const logoutBtn = elements.logoutBtn || document.querySelector(".logout-nav");
  if (logoutBtn) {
    const logoutHandler = async (e) => {
      e.preventDefault();
      try {
        await apiFetch("/api/auth/logout", { method: "POST" });
        showMessage("Logged out successfully", "success", 2000);
        // Small delay to show toast before redirecting
        setTimeout(() => {
          showLogin();
          state.menuItems = [];
          state.editingItemId = null;
          resetFilter();
        }, 500);
      } catch (error) {
        showMessage("Logout completed", "info", 2000);
        setTimeout(() => {
          showLogin();
          state.menuItems = [];
          state.editingItemId = null;
          resetFilter();
        }, 500);
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
 * Get CSRF token from response headers or state
 * @param {Response} response - Fetch response object
 */
function updateCSRFToken(response) {
  const token = response.headers.get("X-CSRF-Token");
  if (token) {
    state.csrfToken = token;
  }
}

/**
 * Get request headers with CSRF token
 * @returns {Object} Headers object
 */
function getRequestHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  if (state.csrfToken) {
    headers["X-CSRF-Token"] = state.csrfToken;
  }
  return headers;
}

/**
 * Fetch wrapper that ensures credentials are included
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
function apiFetch(url, options = {}) {
  const fetchOptions = {
    ...options,
    credentials: "same-origin", // Always include cookies
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  };
  return fetch(url, fetchOptions);
}

/**
 * Refresh settings from server (helper function)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function refreshSettings() {
  try {
    const response = await apiFetch("/api/settings", {
      cache: "no-store",
    });
    if (response.ok) {
      updateCSRFToken(response);
      state.uiSettings = await response.json();
      if (!Array.isArray(state.uiSettings.filterCategories)) {
        state.uiSettings.filterCategories = [];
      }
      return true;
    }
  } catch (error) {
    // Silently use cached settings on error
  }
  return false;
}

/**
 * Refresh menu items from server (helper function)
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
async function refreshMenuItems() {
  try {
    const response = await apiFetch("/api/menu", {
      cache: "no-store",
    });
    if (response.ok) {
      updateCSRFToken(response);
      state.menuItems = await response.json();
      return true;
    }
  } catch (error) {
    // Silently use cached menu items on error
  }
  return false;
}

/**
 * Load menu items from server
 * @returns {Promise<void>}
 */
async function loadMenuItems() {
  try {
    const response = await apiFetch("/api/menu", {
      cache: "no-store",
    });

    if (!response.ok) {
      // Handle authentication errors specifically
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        showMessage(
          "Session expired or authentication failed. Please log in again.",
          "error",
          5000
        );
        // Clear authentication state and show login
        state.isAuthenticated = false;
        state.csrfToken = null;
        showLogin();
        return;
      }
      const errorText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errorText || "Failed to load menu items"}`);
    }

    updateCSRFToken(response);
    state.menuItems = await response.json();
    // Clear newCategories since categories from saved items will be in getAvailableCategories()
    state.newCategories.clear();
    renderMenuItems();
    populateCategoryDropdown(); // Update category dropdown with new items
    initializeSortButtons();
  } catch (error) {
    // Error loading menu items - handled by showMessage
    showMessage(
      error.message || "Error loading menu items. Please check your connection and try again.",
      "error",
      5000
    );
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
    case "id-asc":
      return sorted.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idA - idB;
      });
    case "id-desc":
      return sorted.sort((a, b) => {
        const idA = parseInt(a.id) || 0;
        const idB = parseInt(b.id) || 0;
        return idB - idA;
      });
    case "default":
    default:
      // Default sort maintains the order from the server
      return sorted;
  }
}

/**
 * Filter menu items by search term (optimized with comprehensive field checking)
 * @param {Array} items - Array of menu items
 * @param {string} filterText - Search term
 * @returns {Array} Filtered array
 */
function filterMenuItems(items, filterText) {
  if (!Array.isArray(items)) return [];
  if (!filterText || typeof filterText !== "string") return items;

  const searchTerm = filterText.toLowerCase().trim();
  if (searchTerm === "") return items;

  const results = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let matches = false;

    if (item.name) {
      const name = String(item.name).toLowerCase();
      if (name.includes(searchTerm)) {
        matches = true;
      }
    }

    // Check category
    if (!matches && item.category) {
      const category = String(item.category).toLowerCase();
      if (category.includes(searchTerm)) {
        matches = true;
      }
    }

    // Check description
    if (!matches && item.description) {
      const description = String(item.description).toLowerCase();
      if (description.includes(searchTerm)) {
        matches = true;
      }
    }

    // Check price (exact match or partial)
    if (!matches && item.price !== undefined && item.price !== null) {
      const price = String(item.price);
      // Check exact price match
      if (price.includes(searchTerm)) {
        matches = true;
      }
      // Check formatted price (e.g., "10.50" matches "10" or "10.5")
      if (!matches) {
        const formattedPrice = parseFloat(item.price).toFixed(2);
        if (formattedPrice.includes(searchTerm)) {
          matches = true;
        }
      }
    }

    // Check ID if search term is numeric
    if (!matches && !isNaN(searchTerm) && !isNaN(parseInt(searchTerm))) {
      const itemId = String(item.id || "");
      if (itemId === searchTerm || itemId.includes(searchTerm)) {
        matches = true;
      }
    }

    // Check tags
    if (!matches && item.tags) {
      const tags = Array.isArray(item.tags)
        ? item.tags
        : item.tags
        ? item.tags.split(",").map((t) => t.trim())
        : [];
      const tagMatch = tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm)
      );
      if (tagMatch) {
        matches = true;
      }
    }

    if (matches) {
      results.push(item);
    }
  }

  return results;
}

/**
 * Render menu items to the DOM
 */
function renderMenuItems() {
  if (!elements.itemsList || !elements.itemCount) return;

  const filteredItems = filterMenuItems(state.menuItems, state.currentFilter);
  const sortedItems = sortMenuItems(filteredItems, state.currentSort);
  const countText = `${sortedItems.length}${
    state.currentFilter ? ` of ${state.menuItems.length}` : ""
  }`;

  elements.itemCount.textContent = countText;

  if (sortedItems.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.style.cssText =
      "color: var(--text-muted); text-align: center; padding: 20px;";
    if (state.menuItems.length === 0) {
      emptyMessage.textContent = "No items yet. Add your first item!";
    } else {
      emptyMessage.textContent =
        "No items match your search. Try a different term.";
    }
    elements.itemsList.innerHTML = "";
    elements.itemsList.appendChild(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  sortedItems.forEach((item) => {
    const id = item.id || "";
    const name = escapeHtml(item.name || "");
    const category = escapeHtml(item.category || "");
    const description = escapeHtml(item.description || "");
    const price = parseFloat(item.price) || 0;
    const tags = Array.isArray(item.tags)
      ? item.tags
      : item.tags
      ? item.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];
    const isSelected = state.selectedItems.has(id);

    const card = document.createElement("div");
    card.className = `item-card ${isSelected ? "selected" : ""}`;
    card.dataset.id = id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "item-card-checkbox";
    checkbox.id = `item-checkbox-${id}`;
    checkbox.checked = isSelected;
    checkbox.addEventListener("change", () =>
      toggleItemSelection(id, checkbox.checked)
    );

    const checkboxLabel = document.createElement("label");
    checkboxLabel.htmlFor = `item-checkbox-${id}`;
    checkboxLabel.setAttribute("aria-label", `Select item ${name}`);

    const itemInfo = document.createElement("div");
    itemInfo.className = "item-info";

    // Item image (if available)
    if (item.image) {
      const imageContainer = document.createElement("div");
      imageContainer.className = "item-image-container";
      const img = document.createElement("img");
      img.className = "item-image";
      img.src = item.image;
      img.alt = name;
      img.loading = "lazy";
      imageContainer.appendChild(img);
      itemInfo.appendChild(imageContainer);
    }

    // Item header container for ID, title, and category
    const itemHeader = document.createElement("div");
    itemHeader.className = "item-info-header";

    const idBadge = document.createElement("span");
    idBadge.className = "item-id-badge";
    idBadge.textContent = `ID: ${id}`;
    idBadge.title = `Item ID: ${id}`;

    const title = document.createElement("h3");
    title.textContent = name;

    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = category;

    // Availability badge
    const isAvailable = item.available !== false; // Default to true if not set
    const availabilityBadge = document.createElement("span");
    availabilityBadge.className = `availability-badge ${isAvailable ? "available" : "unavailable"}`;
    availabilityBadge.textContent = isAvailable ? "Available" : "Unavailable";
    availabilityBadge.title = isAvailable 
      ? "This item is currently available" 
      : (item.unavailableReason || "This item is currently unavailable");

    // Schedule badge (if schedule exists)
    let scheduleBadge = null;
    if (item.schedule && Object.keys(item.schedule).length > 0) {
      scheduleBadge = document.createElement("span");
      scheduleBadge.className = "schedule-badge";
      scheduleBadge.textContent = "Scheduled";
      
      // Build schedule description for tooltip
      const scheduleParts = [];
      if (item.schedule.days && item.schedule.days.length > 0) {
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        scheduleParts.push(dayNames.filter((_, i) => item.schedule.days.includes(i)).join(", "));
      }
      if (item.schedule.timeRange) {
        const timeParts = [];
        if (item.schedule.timeRange.start) timeParts.push(item.schedule.timeRange.start);
        if (item.schedule.timeRange.end) timeParts.push(item.schedule.timeRange.end);
        if (timeParts.length > 0) scheduleParts.push(timeParts.join(" - "));
      }
      if (item.schedule.dateRange) {
        const dateParts = [];
        if (item.schedule.dateRange.start) dateParts.push(item.schedule.dateRange.start);
        if (item.schedule.dateRange.end) dateParts.push(item.schedule.dateRange.end);
        if (dateParts.length > 0) scheduleParts.push(dateParts.join(" to "));
      }
      scheduleBadge.title = scheduleParts.length > 0 ? `Schedule: ${scheduleParts.join(" | ")}` : "Scheduled availability";
    }

    itemHeader.appendChild(idBadge);
    itemHeader.appendChild(title);
    itemHeader.appendChild(badge);
    itemHeader.appendChild(availabilityBadge);
    if (scheduleBadge) {
      itemHeader.appendChild(scheduleBadge);
    }

    const priceEl = document.createElement("p");
    priceEl.className = "item-price";
    priceEl.textContent = `$${price.toFixed(2)}`;

    itemInfo.appendChild(itemHeader);

    // Tags display
    if (tags.length > 0) {
      const tagsContainer = document.createElement("div");
      tagsContainer.className = "item-tags-container";
      tags.forEach((tag) => {
        const tagEl = document.createElement("span");
        tagEl.className = "item-tag";
        tagEl.textContent = escapeHtml(tag);
        tagsContainer.appendChild(tagEl);
      });
      itemInfo.appendChild(tagsContainer);
    }

    if (description) {
      const desc = document.createElement("p");
      desc.className = "item-description";
      desc.textContent = description;
      itemInfo.appendChild(desc);
    }
    itemInfo.appendChild(priceEl);

    const actions = document.createElement("div");
    actions.className = "item-actions";

    // Availability toggle button
    const availabilityBtn = createActionButton(
      isAvailable ? "Mark Unavailable" : "Mark Available",
      isAvailable ? "btn-unavailable" : "btn-available",
      () => toggleItemAvailability(id, !isAvailable),
      isAvailable ? "Mark as unavailable" : "Mark as available"
    );

    const duplicateBtn = createActionButton(
      "Duplicate",
      "btn-duplicate",
      () => duplicateItem(id),
      "Duplicate " + name
    );
    const editBtn = createActionButton(
      "Edit",
      "btn-edit",
      () => editItem(id),
      "Edit " + name
    );
    const deleteBtn = createActionButton(
      "Delete",
      "btn-delete",
      () => deleteItem(id),
      "Delete " + name
    );

    actions.appendChild(availabilityBtn);
    actions.appendChild(duplicateBtn);
    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(checkbox);
    card.appendChild(checkboxLabel);
    card.appendChild(itemInfo);
    card.appendChild(actions);
    fragment.appendChild(card);
  });

  elements.itemsList.innerHTML = "";
  elements.itemsList.appendChild(fragment);

  // Apply current layout
  applyLayout(state.layout);
}

/**
 * Create an action button with icon
 * @param {string} text - Button text
 * @param {string} className - Button class name
 * @param {Function} onClick - Click handler
 * @param {string} ariaLabel - Aria label
 * @returns {HTMLElement} Button element
 */
function createActionButton(text, className, onClick, ariaLabel) {
  const button = document.createElement("button");
  button.className = className;
  button.setAttribute("aria-label", ariaLabel);
  button.addEventListener("click", onClick);

  let svgPath = "";
  if (className === "btn-duplicate") {
    svgPath =
      "M5 3H2a1 1 0 00-1 1v11a1 1 0 001 1h11a1 1 0 001-1v-3M13 1h3v3M9 7h6";
  } else if (className === "btn-edit") {
    svgPath =
      "M11.5 2.5a1.5 1.5 0 010 2.12l-7 7L2 13l1.38-2.5 7-7a1.5 1.5 0 012.12 0z";
  } else if (className === "btn-delete") {
    svgPath =
      "M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4h10zM6 7v4M10 7v4";
  } else if (className === "btn-available") {
    svgPath =
      "M8 14A6 6 0 108 2a6 6 0 000 12zM6 8l2 2 4-4";
  } else if (className === "btn-unavailable") {
    svgPath =
      "M8 14A6 6 0 108 2a6 6 0 000 12zM6 6l4 4M10 6l-4 4";
  }

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "12");
  svg.setAttribute("height", "12");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "none");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", svgPath);
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.5");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);
  button.appendChild(svg);

  const textNode = document.createTextNode(" " + text);
  button.appendChild(textNode);

  return button;
}

/**
 * Initialize form submission handler
 */
/**
 * Convert image file to base64
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 encoded image
 */
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error("Image size must be less than 2MB"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Initialize image preview
 */
function initImagePreview() {
  if (!elements.itemImage) return;

  addEventListener(elements.itemImage, "change", async (e) => {
    const file = e.target.files[0];
    if (!file) {
      hideImagePreview();
      return;
    }

    try {
      const base64 = await imageToBase64(file);
      if (base64 && elements.imagePreview) {
        elements.imagePreview.src = base64;
        if (elements.imagePreviewContainer) {
          elements.imagePreviewContainer.style.display = "block";
        }
      }
    } catch (error) {
      showMessage(error.message || "Failed to load image", "error");
      if (elements.itemImage) {
        elements.itemImage.value = "";
      }
      hideImagePreview();
    }
  });

  if (elements.removeImageBtn) {
    addEventListener(elements.removeImageBtn, "click", () => {
      if (elements.itemImage) {
        elements.itemImage.value = "";
      }
      state.currentImageBase64 = null; // Clear the stored image
      hideImagePreview();
    });
  }
}

/**
 * Show image preview
 * @param {string} imageSrc - Image source (base64 or URL)
 */
function showImagePreview(imageSrc) {
  if (elements.imagePreview && imageSrc) {
    elements.imagePreview.src = imageSrc;
    if (elements.imagePreviewContainer) {
      elements.imagePreviewContainer.style.display = "block";
    }
    // Store the image when showing preview
    state.currentImageBase64 = imageSrc;
  }
}

/**
 * Hide image preview
 */
function hideImagePreview() {
  if (elements.imagePreviewContainer) {
    elements.imagePreviewContainer.style.display = "none";
  }
  if (elements.imagePreview) {
    elements.imagePreview.src = "";
    elements.imagePreview.alt = "";
  }
}

function initItemForm() {
  if (!elements.itemForm) return;

  // Initialize image preview
  initImagePreview();

  // Initialize category management
  initCategoryManagement();
  
  // Populate category dropdown
  populateCategoryDropdown();
  
  // Add listener to category dropdown to refresh dynamically when it changes
  // This ensures the dropdown stays in sync if categories are updated elsewhere
  if (elements.itemCategory) {
    // Store a flag to prevent infinite loops
    let isRefreshing = false;
    
    addEventListener(elements.itemCategory, "focus", async () => {
      // Refresh categories when dropdown is focused (user is about to select)
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await Promise.all([refreshSettings(), refreshMenuItems()]);
          // Preserve current selection when refreshing
          const currentValue = elements.itemCategory.value;
          populateCategoryDropdown(currentValue);
        } catch (error) {
          // Silently use cached categories on error
        } finally {
          isRefreshing = false;
        }
      }
    });
  }

  // Initialize availability checkbox handler
  if (elements.itemAvailable && elements.itemUnavailableReason) {
    addEventListener(elements.itemAvailable, "change", (e) => {
      if (elements.itemUnavailableReason) {
        elements.itemUnavailableReason.style.display = e.target.checked ? "none" : "block";
        if (e.target.checked) {
          elements.itemUnavailableReason.value = "";
        }
      }
    });
  }

  // Initialize schedule checkbox handler
  if (elements.enableSchedule && elements.scheduleOptions) {
    addEventListener(elements.enableSchedule, "change", (e) => {
      if (elements.scheduleOptions) {
        elements.scheduleOptions.style.display = e.target.checked ? "block" : "none";
        if (!e.target.checked) {
          // Clear schedule fields when disabled
          if (elements.scheduleDays) {
            elements.scheduleDays.forEach(cb => cb.checked = false);
          }
          if (elements.scheduleStartTime) elements.scheduleStartTime.value = "";
          if (elements.scheduleEndTime) elements.scheduleEndTime.value = "";
          if (elements.scheduleStartDate) elements.scheduleStartDate.value = "";
          if (elements.scheduleEndDate) elements.scheduleEndDate.value = "";
        }
      }
    });
  }

  addEventListener(elements.itemForm, "submit", async (e) => {
    e.preventDefault();

    // Parse tags from comma-separated string
    const tagsInput = elements.itemTags?.value?.trim() || "";
    const tags = tagsInput
      ? tagsInput
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    // Handle image upload
    let imageBase64 = null;
    const imageFile = elements.itemImage?.files[0];

    if (imageFile) {
      // New image file selected
      try {
        imageBase64 = await imageToBase64(imageFile);
        state.currentImageBase64 = imageBase64; // Store new image
      } catch (error) {
        showMessage(error.message || "Failed to process image", "error");
        return;
      }
    } else {
      imageBase64 = state.currentImageBase64;
    }

    const categoryValue = elements.itemCategory?.value?.trim() || "";
    
    // Build schedule object if enabled
    let schedule = null;
    if (elements.enableSchedule && elements.enableSchedule.checked) {
      schedule = {};
      
      // Get selected days
      if (elements.scheduleDays) {
        const selectedDays = Array.from(elements.scheduleDays)
          .filter(cb => cb.checked)
          .map(cb => parseInt(cb.value));
        if (selectedDays.length > 0) {
          schedule.days = selectedDays;
        }
      }
      
      // Get time range
      if (elements.scheduleStartTime || elements.scheduleEndTime) {
        schedule.timeRange = {};
        if (elements.scheduleStartTime && elements.scheduleStartTime.value) {
          schedule.timeRange.start = elements.scheduleStartTime.value;
        }
        if (elements.scheduleEndTime && elements.scheduleEndTime.value) {
          schedule.timeRange.end = elements.scheduleEndTime.value;
        }
        if (Object.keys(schedule.timeRange).length === 0) {
          delete schedule.timeRange;
        }
      }
      
      // Get date range
      if (elements.scheduleStartDate || elements.scheduleEndDate) {
        schedule.dateRange = {};
        if (elements.scheduleStartDate && elements.scheduleStartDate.value) {
          schedule.dateRange.start = elements.scheduleStartDate.value;
        }
        if (elements.scheduleEndDate && elements.scheduleEndDate.value) {
          schedule.dateRange.end = elements.scheduleEndDate.value;
        }
        if (Object.keys(schedule.dateRange).length === 0) {
          delete schedule.dateRange;
        }
      }
      
      // Only add schedule if it has at least one property
      if (Object.keys(schedule).length === 0) {
        schedule = null;
      }
    }
    
    const itemData = {
      name: elements.itemName?.value?.trim() || "",
      category: categoryValue || "starters", // Default to "starters" if empty
      price: parseFloat(elements.itemPrice?.value) || 0,
      description: elements.itemDescription?.value?.trim() || "",
      tags: tags,
      image: imageBase64,
      available: elements.itemAvailable ? elements.itemAvailable.checked : true,
      unavailableReason: elements.itemUnavailableReason && !elements.itemAvailable?.checked
        ? elements.itemUnavailableReason.value.trim() || null
        : null,
      schedule: schedule,
    };

    if (!itemData.name) {
      showMessage("Item name is required", "error");
      return;
    }
    if (!itemData.category || itemData.category.trim().length === 0) {
      showMessage("Category is required", "error");
      return;
    }
    if (isNaN(itemData.price) || itemData.price < 0 || itemData.price > 500) {
      showMessage("Price must be between 0 and 500", "error");
      return;
    }

    try {
      let response;
      const url = state.editingItemId
        ? `/api/menu/${state.editingItemId}`
        : "/api/menu";
      const method = state.editingItemId ? "PUT" : "POST";

      response = await apiFetch(url, {
        method,
        headers: getRequestHeaders(),
        body: JSON.stringify({
          ...itemData,
          _csrf: state.csrfToken, // Include CSRF token in body as fallback
        }),
      });
      
      // Update CSRF token from response headers
      if (response.ok) {
        updateCSRFToken(response);
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        showMessage(data.message || "Item saved successfully", "success");
        // Clear newCategories since the category is now saved in an item
        state.newCategories.clear();
        // Clear initial form state so no confirmation is shown
        state.initialFormState = null;
        
        // Refresh all data dynamically
        await loadMenuItems(); // Refresh menu items
        await refreshSettings(); // Refresh settings to get latest categories
        populateCategoryDropdown(); // Update category dropdown with latest data
        renderStatistics(); // Refresh statistics to reflect category changes
        
        resetForm();
        hideItemModal();
      } else {
        showMessage(data.message || "Failed to save item", "error");
      }
    } catch (error) {
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
window.editItem = async function (id) {
  const item = state.menuItems.find((i) => i.id === id);
  if (!item) {
    showMessage("Item not found", "error");
    return;
  }

  state.editingItemId = id;

  // Dynamically refresh settings and categories before opening modal
  // This ensures the dropdown always has the latest categories
  if (!state.uiSettings) {
    await loadSettings();
  } else {
    await refreshSettings();
  }

  // Refresh menu items to ensure we have the latest data
  await refreshMenuItems();

  // Populate category dropdown with latest data, preserving the item's current category
  const itemCategory = item.category ? item.category.trim() : "";
  populateCategoryDropdown(itemCategory);

  // Now set form values
  if (elements.itemId) elements.itemId.value = item.id || "";
  if (elements.itemName) elements.itemName.value = item.name || "";
  if (elements.itemCategory && itemCategory) {
    // Find matching option case-insensitively
    const categoryLower = itemCategory.toLowerCase();
    const matchingOption = Array.from(elements.itemCategory.options).find(
      opt => opt.value.toLowerCase() === categoryLower
    );
    if (matchingOption) {
      elements.itemCategory.value = matchingOption.value;
    } else {
      // If no match found, set directly (will be added if needed)
      elements.itemCategory.value = itemCategory;
    }
  }
  if (elements.itemPrice) elements.itemPrice.value = item.price || 0;
  if (elements.itemDescription)
    elements.itemDescription.value = item.description || "";
  if (elements.itemTags) {
    const tags = Array.isArray(item.tags)
      ? item.tags
      : item.tags
      ? item.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];
    elements.itemTags.value = tags.join(", ");
  }

  // Handle image
  if (item.image) {
    state.currentImageBase64 = item.image;
    showImagePreview(item.image);
  } else {
    state.currentImageBase64 = null;
    hideImagePreview();
  }
  if (elements.itemImage) {
    elements.itemImage.value = "";
  }

  // Handle availability
  const isAvailable = item.available !== false; // Default to true
  if (elements.itemAvailable) {
    elements.itemAvailable.checked = isAvailable;
  }
  if (elements.itemUnavailableReason) {
    elements.itemUnavailableReason.value = item.unavailableReason || "";
    elements.itemUnavailableReason.style.display = isAvailable ? "none" : "block";
  }

  // Handle schedule
  if (elements.enableSchedule && elements.scheduleOptions) {
    const hasSchedule = item.schedule && Object.keys(item.schedule).length > 0;
    elements.enableSchedule.checked = hasSchedule;
    elements.scheduleOptions.style.display = hasSchedule ? "block" : "none";
    
    if (hasSchedule) {
      // Set days
      if (elements.scheduleDays && item.schedule.days) {
        elements.scheduleDays.forEach(cb => {
          cb.checked = item.schedule.days.includes(parseInt(cb.value));
        });
      }
      
      // Set time range
      if (elements.scheduleStartTime && item.schedule.timeRange?.start) {
        elements.scheduleStartTime.value = item.schedule.timeRange.start;
      }
      if (elements.scheduleEndTime && item.schedule.timeRange?.end) {
        elements.scheduleEndTime.value = item.schedule.timeRange.end;
      }
      
      // Set date range
      if (elements.scheduleStartDate && item.schedule.dateRange?.start) {
        elements.scheduleStartDate.value = item.schedule.dateRange.start;
      }
      if (elements.scheduleEndDate && item.schedule.dateRange?.end) {
        elements.scheduleEndDate.value = item.schedule.dateRange.end;
      }
    } else {
      // Clear schedule fields
      if (elements.scheduleDays) {
        elements.scheduleDays.forEach(cb => cb.checked = false);
      }
      if (elements.scheduleStartTime) elements.scheduleStartTime.value = "";
      if (elements.scheduleEndTime) elements.scheduleEndTime.value = "";
      if (elements.scheduleStartDate) elements.scheduleStartDate.value = "";
      if (elements.scheduleEndDate) elements.scheduleEndDate.value = "";
    }
  }

  if (elements.formTitle) elements.formTitle.textContent = "Edit Item";
  if (elements.submitBtnText)
    elements.submitBtnText.textContent = "Update Item";
  if (elements.cancelBtn) elements.cancelBtn.style.display = "inline-block";

  showItemModal();
};

/**
 * Delete menu item
 * @param {number} id - Item ID
 */
window.deleteItem = async function (id) {
  try {
    // Convert id to number if it's a string
    const itemId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(itemId)) {
      showMessage("Invalid item ID", "error");
      return;
    }

    const confirmed = await showConfirmModal(
      "Are you sure you want to delete this item? This action cannot be undone.",
      "Delete Item",
      "Delete",
      "Cancel",
      "delete"
    );

    if (!confirmed) {
      return;
    }

    const response = await apiFetch(`/api/menu/${itemId}`, {
      method: "DELETE",
      headers: getRequestHeaders(),
      body: JSON.stringify({ _csrf: state.csrfToken }),
    });
    
    if (response.ok) {
      updateCSRFToken(response);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      showMessage(data.message || "Item deleted successfully", "success");
      state.selectedItems.delete(itemId);
      await loadMenuItems();
      populateCategoryDropdown(); // Update category dropdown
      updateBulkActionsBar();

      if (state.editingItemId === itemId) {
        resetForm();
      }
    } else {
      showMessage(data.message || "Failed to delete item", "error");
    }
  } catch (error) {
    showMessage("Failed to delete item. Please try again.", "error");
  }
};

/**
 * Toggle item availability status
 * @param {number|string} id - Item ID
 * @param {boolean} available - New availability status
 */
window.toggleItemAvailability = async function (id, available) {
  try {
    const itemId = typeof id === "string" ? parseInt(id, 10) : id;

    if (isNaN(itemId)) {
      showMessage("Invalid item ID", "error");
      return;
    }

    const response = await apiFetch(`/api/menu/${itemId}/availability`, {
      method: "PATCH",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        available: available,
        _csrf: state.csrfToken,
      }),
    });

    if (response.ok) {
      updateCSRFToken(response);
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      showMessage(
        data.message || `Item ${available ? "marked as available" : "marked as unavailable"}`,
        "success"
      );
      await loadMenuItems();
      updateBulkActionsBar();
      // Refresh statistics if visible
      if (elements.statsSection && elements.statsSection.style.display !== "none") {
        renderStatistics();
      }
    } else {
      showMessage(data.message || "Failed to update availability", "error");
    }
  } catch (error) {
    showMessage(
      error.message || "Failed to update item availability. Please try again.",
      "error"
    );
  }
};

/**
 * Duplicate menu item
 * @param {number} id - Item ID
 */
window.duplicateItem = async function (id) {
  const item = state.menuItems.find((i) => i.id === id);
  if (!item) {
    showMessage("Item not found", "error");
    return;
  }

  try {
    const duplicateData = {
      name: `${item.name} (Copy)`,
      category: item.category,
      price: item.price,
      description: item.description,
      tags: Array.isArray(item.tags)
        ? item.tags
        : item.tags
        ? item.tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
      image: item.image || null,
    };

    const response = await apiFetch("/api/menu", {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        ...duplicateData,
        _csrf: state.csrfToken,
      }),
    });
    
    if (response.ok) {
      updateCSRFToken(response);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      showMessage("Item duplicated successfully", "success");
      await loadMenuItems();
    } else {
      showMessage(data.message || "Failed to duplicate item", "error");
    }
  } catch (error) {
    showMessage("Failed to duplicate item. Please try again.", "error");
  }
};

/**
 * Toggle item selection for bulk operations
 * @param {number} id - Item ID
 * @param {boolean} selected - Selection state
 */
window.toggleItemSelection = function (id, selected) {
  if (selected) {
    state.selectedItems.add(id);
  } else {
    state.selectedItems.delete(id);
  }
  updateBulkActionsBar();
  renderMenuItems();
};

/**
 * Update bulk actions bar visibility and count
 */
function updateBulkActionsBar() {
  const count = state.selectedItems.size;
  if (elements.bulkActionsBar) {
    elements.bulkActionsBar.style.display = count > 0 ? "flex" : "none";
  }
  if (elements.selectedCount) {
    elements.selectedCount.textContent = `${count} item${
      count !== 1 ? "s" : ""
    } selected`;
  }
}

/**
 * Clear all selections
 */
function clearSelection() {
  state.selectedItems.clear();
  updateBulkActionsBar();
  renderMenuItems();
}

/**
 * Delete selected items in bulk
 */
async function bulkDeleteItems() {
  const selectedIds = Array.from(state.selectedItems);
  if (selectedIds.length === 0) return;

  const count = selectedIds.length;
  const confirmed = await showConfirmModal(
    `Are you sure you want to delete ${count} item${
      count !== 1 ? "s" : ""
    }? This action cannot be undone.`,
    "Delete Multiple Items",
    "Delete",
    "Cancel",
    "delete"
  );
  if (!confirmed) return;

  try {
    let successCount = 0;
    let failCount = 0;

    for (const id of selectedIds) {
      try {
        const response = await apiFetch(`/api/menu/${id}`, {
          method: "DELETE",
          headers: getRequestHeaders(),
          body: JSON.stringify({ _csrf: state.csrfToken }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }
      } catch (error) {
        failCount++;
      }
    }

    state.selectedItems.clear();
    await loadMenuItems();
    updateBulkActionsBar();

    if (failCount === 0) {
      showMessage(
        `Successfully deleted ${successCount} item${
          successCount !== 1 ? "s" : ""
        }`,
        "success"
      );
    } else {
      showMessage(
        `Deleted ${successCount} item${
          successCount !== 1 ? "s" : ""
        }, ${failCount} failed`,
        "error"
      );
    }
  } catch (error) {
    showMessage("Failed to delete items. Please try again.", "error");
  }
}

/**
 * Calculate statistics from menu items (optimized single-pass algorithm)
 * @param {Array} items - Array of menu items
 * @returns {Object} Statistics object
 */
function calculateStatistics(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return {
      totalItems: 0,
      totalValue: 0,
      avgPrice: 0,
      minPrice: 0,
      maxPrice: 0,
      categories: new Set(),
      categoryStats: [],
    };
  }

  // Single-pass calculation for better performance
  let totalValue = 0;
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  const categoryMap = new Map();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const price = parseFloat(item.price) || 0;

    // Update global stats
    totalValue += price;
    if (price < minPrice) minPrice = price;
    if (price > maxPrice) maxPrice = price;

    // Update category stats
    const category = item.category || "Uncategorized";
    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        name: category,
        count: 0,
        totalPrice: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
      });
    }

    const catStat = categoryMap.get(category);
    catStat.count++;
    catStat.totalPrice += price;
    if (price < catStat.minPrice) catStat.minPrice = price;
    if (price > catStat.maxPrice) catStat.maxPrice = price;
  }

  // Convert category map to array and calculate averages
  const categoryStats = Array.from(categoryMap.values())
    .map((cat) => ({
      name: cat.name,
      count: cat.count,
      minPrice: cat.minPrice === Infinity ? 0 : cat.minPrice,
      maxPrice: cat.maxPrice === -Infinity ? 0 : cat.maxPrice,
      avgPrice: cat.count > 0 ? cat.totalPrice / cat.count : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const totalItems = items.length;
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

  return {
    totalItems,
    totalValue,
    avgPrice,
    minPrice: minPrice === Infinity ? 0 : minPrice,
    maxPrice: maxPrice === -Infinity ? 0 : maxPrice,
    categories: new Set(categoryMap.keys()),
    categoryStats,
  };
}

/**
 * Render statistics dashboard (with memoization)
 */
function renderStatistics() {
  if (!elements.statsSection) return;

  const statsGrid = document.getElementById("stats-grid");
  if (!statsGrid) return;

  // Calculate statistics (optimized single-pass)
  const stats = calculateStatistics(state.menuItems);

  // Clear existing content efficiently
  statsGrid.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      description: "Menu items in total",
      icon: ["M2 4h12", "M2 8h12", "M2 12h12"],
    },
    {
      title: "Average Price",
      value: `$${stats.avgPrice.toFixed(2)}`,
      description: "Average item price",
      icon: ["M8 2v12", "M3 7h10"],
    },
    {
      title: "Price Range",
      value: `$${stats.minPrice.toFixed(2)} - $${stats.maxPrice.toFixed(2)}`,
      description: "Lowest to highest price",
      icon: ["M3 4l5 4-5 4", "M13 4l-5 4 5 4"],
    },
    {
      title: "Categories",
      value: stats.categories.size,
      description: "Unique categories",
      icon: ["M3 3h10v10H3z", "M3 8h10", "M8 3v10"],
    },
  ];

  for (let i = 0; i < statCards.length; i++) {
    const stat = statCards[i];
    const card = createStatCard(
      stat.title,
      stat.value,
      stat.description,
      stat.icon
    );
    fragment.appendChild(card);
  }

  // Category breakdown card
  const breakdownCard = document.createElement("div");
  breakdownCard.className = "stat-card";
  breakdownCard.style.gridColumn = "1 / -1";

  const breakdownHeader = document.createElement("div");
  breakdownHeader.className = "stat-card-header";
  const breakdownTitle = document.createElement("span");
  breakdownTitle.className = "stat-card-title";
  breakdownTitle.textContent = "Category Breakdown";
  breakdownHeader.appendChild(breakdownTitle);

  const breakdownContent = document.createElement("div");
  breakdownContent.style.marginTop = "16px";

  // Build category breakdown using DocumentFragment
  const categoryFragment = document.createDocumentFragment();
  for (let i = 0; i < stats.categoryStats.length; i++) {
    const cat = stats.categoryStats[i];
    const catCard = document.createElement("div");
    catCard.className = "category-stat-card";

    const catHeader = document.createElement("div");
    catHeader.className = "category-stat-header";

    const catName = document.createElement("span");
    catName.className = "category-stat-name";
    catName.textContent = cat.name;

    const catCount = document.createElement("span");
    catCount.className = "category-stat-count";
    catCount.textContent = `${cat.count} item${cat.count !== 1 ? "s" : ""}`;

    catHeader.appendChild(catName);
    catHeader.appendChild(catCount);

    const catDetails = document.createElement("div");
    catDetails.className = "category-stat-details";

    const priceRange = document.createElement("div");
    priceRange.className = "category-stat-price-range";
    priceRange.textContent = `Range: $${cat.minPrice.toFixed(
      2
    )} - $${cat.maxPrice.toFixed(2)}`;

    const avg = document.createElement("div");
    avg.textContent = `Avg: $${cat.avgPrice.toFixed(2)}`;

    catDetails.appendChild(priceRange);
    catDetails.appendChild(avg);

    catCard.appendChild(catHeader);
    catCard.appendChild(catDetails);
    categoryFragment.appendChild(catCard);
  }

  breakdownContent.appendChild(categoryFragment);
  breakdownCard.appendChild(breakdownHeader);
  breakdownCard.appendChild(breakdownContent);
  fragment.appendChild(breakdownCard);

  // Append all at once for better performance
  statsGrid.appendChild(fragment);
}

/**
 * Create a stat card element
 * @param {string} title - Card title
 * @param {string|number} value - Card value
 * @param {string} description - Card description
 * @param {string|Array<string>} iconPaths - SVG path(s) for icon
 * @returns {HTMLElement} Stat card element
 */
function createStatCard(title, value, description, iconPaths) {
  const card = document.createElement("div");
  card.className = "stat-card";

  const header = document.createElement("div");
  header.className = "stat-card-header";

  const titleEl = document.createElement("span");
  titleEl.className = "stat-card-title";
  titleEl.textContent = title;

  const icon = document.createElement("div");
  icon.className = "stat-card-icon";
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("fill", "none");

  const paths = Array.isArray(iconPaths) ? iconPaths : [iconPaths];
  paths.forEach((path) => {
    if (path) {
      const pathEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathEl.setAttribute("d", path);
      pathEl.setAttribute("stroke", "currentColor");
      pathEl.setAttribute("stroke-width", "1.5");
      pathEl.setAttribute("stroke-linecap", "round");
      if (path.includes("l") || path.includes("L")) {
        pathEl.setAttribute("stroke-linejoin", "round");
      }
      svg.appendChild(pathEl);
    }
  });

  icon.appendChild(svg);
  header.appendChild(titleEl);
  header.appendChild(icon);

  const valueEl = document.createElement("div");
  valueEl.className = "stat-card-value";
  valueEl.textContent = value;

  const descEl = document.createElement("div");
  descEl.className = "stat-card-description";
  descEl.textContent = description;

  card.appendChild(header);
  card.appendChild(valueEl);
  card.appendChild(descEl);

  return card;
}

/**
 * Export menu data as JSON file
 */
async function exportMenuData() {
  try {
    const response = await apiFetch("/api/menu/export");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || "Export failed");
    }

    const blob = new Blob([JSON.stringify(data.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `menu-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showMessage("Menu data exported successfully", "success");
  } catch (error) {
    showMessage("Failed to export menu data", "error");
  }
}

/**
 * Show import modal
 */
function showImportModal() {
  if (elements.importModal) {
    elements.importModal.classList.add("show");
    document.body.style.overflow = "hidden";
    if (elements.importFileInput) {
      elements.importFileInput.value = "";
    }
    if (elements.importReplaceCheckbox) {
      elements.importReplaceCheckbox.checked = false;
    }
  }
}

/**
 * Hide import modal
 */
function hideImportModal() {
  if (elements.importModal) {
    elements.importModal.classList.remove("show");
    document.body.style.overflow = "";
  }
}

/**
 * Import menu data from JSON file
 */
async function importMenuData() {
  if (
    !elements.importFileInput ||
    !elements.importFileInput.files ||
    elements.importFileInput.files.length === 0
  ) {
    showMessage("Please select a file to import", "error");
    return;
  }

  const file = elements.importFileInput.files[0];
  const replace = elements.importReplaceCheckbox
    ? elements.importReplaceCheckbox.checked
    : false;

  try {
    const fileText = await file.text();
    const importedData = JSON.parse(fileText);

    if (!Array.isArray(importedData)) {
      throw new Error("Invalid file format. Expected an array of menu items.");
    }

    const response = await apiFetch("/api/menu/import", {
      method: "POST",
      headers: getRequestHeaders(),
      body: JSON.stringify({
        data: importedData,
        replace: replace,
        _csrf: state.csrfToken,
      }),
    });
    
    if (response.ok) {
      updateCSRFToken(response);
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      showMessage(
        `Successfully imported ${data.count || importedData.length} item${
          (data.count || importedData.length) !== 1 ? "s" : ""
        }`,
        "success"
      );
      hideImportModal();
      await loadMenuItems();
      populateCategoryDropdown(); // Update category dropdown
      renderStatistics();
    } else {
      showMessage(data.message || "Failed to import menu data", "error");
    }
  } catch (error) {
    showMessage(
      error.message ||
        "Failed to import menu data. Please check the file format.",
      "error"
    );
  }
}

/**
 * Preview public menu in new window
 */
function previewMenu() {
  const url = window.location.origin + "/index.html";
  window.open(url, "_blank");
}

/**
 * Reset form to add mode
 */
function resetForm() {
  state.editingItemId = null;

  if (elements.itemForm) elements.itemForm.reset();
  if (elements.itemId) elements.itemId.value = "";
  if (elements.itemTags) elements.itemTags.value = "";
  if (elements.formTitle) elements.formTitle.textContent = "Add New Item";
  if (elements.submitBtnText) elements.submitBtnText.textContent = "Add Item";
  if (elements.cancelBtn) elements.cancelBtn.style.display = "inline-block";
  
  // Reset availability to default (available)
  if (elements.itemAvailable) {
    elements.itemAvailable.checked = true;
  }
  if (elements.itemUnavailableReason) {
    elements.itemUnavailableReason.value = "";
    elements.itemUnavailableReason.style.display = "none";
  }

  // Reset schedule
  if (elements.enableSchedule) {
    elements.enableSchedule.checked = false;
  }
  if (elements.scheduleOptions) {
    elements.scheduleOptions.style.display = "none";
  }
  if (elements.scheduleDays) {
    elements.scheduleDays.forEach(cb => cb.checked = false);
  }
  if (elements.scheduleStartTime) elements.scheduleStartTime.value = "";
  if (elements.scheduleEndTime) elements.scheduleEndTime.value = "";
  if (elements.scheduleStartDate) elements.scheduleStartDate.value = "";
  if (elements.scheduleEndDate) elements.scheduleEndDate.value = "";
  
  // Set default category to "starters" when creating new items
  if (elements.itemCategory) {
    populateCategoryDropdown(); // Ensure categories are loaded
    // Set to "starters" if available, otherwise first category
    if (elements.itemCategory.querySelector('option[value="starters"]')) {
      elements.itemCategory.value = "starters";
    } else if (elements.itemCategory.options.length > 0) {
      elements.itemCategory.value = elements.itemCategory.options[0].value;
    }
  }
}

// ============================================================================
// FILTERING & SORTING
// ============================================================================

/**
 * Initialize filter and sort functionality
 */
function initFilterAndSort() {
  if (elements.itemFilter) {
    // Update clear button visibility based on input value
    const updateClearButton = () => {
      if (elements.clearSearchBtn) {
        elements.clearSearchBtn.style.display = elements.itemFilter.value.trim()
          ? "flex"
          : "none";
      }
    };

    // Initialize clear button visibility
    updateClearButton();

    // Debounced filter function
    const debouncedFilter = debounce((e) => {
      state.currentFilter = e.target.value;
      updateClearButton();
      renderMenuItems();
    }, 300);

    // Real-time clear button update (not debounced)
    addEventListener(elements.itemFilter, "input", (e) => {
      updateClearButton();
      debouncedFilter(e);
    });

    // Handle Enter key to trigger immediate search
    addEventListener(elements.itemFilter, "keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        state.currentFilter = e.target.value;
        updateClearButton();
        renderMenuItems();
      } else if (e.key === "Escape") {
        e.preventDefault();
        clearSearch();
      }
    });

    // Clear search button
    if (elements.clearSearchBtn) {
      addEventListener(elements.clearSearchBtn, "click", () => {
        clearSearch();
        if (elements.itemFilter) {
          elements.itemFilter.focus();
        }
      });
    }
  }

  // Sort popup functionality (mobile/tablet only)
  if (elements.sortPopupBtn) {
    addEventListener(elements.sortPopupBtn, "click", () => {
      // On mobile/tablet, open modal
      if (elements.sortModal) {
        elements.sortModal.classList.add("show");
        updateSortPopupSelection();
      }
    });
  }

  // Desktop sort buttons
  const desktopSortButtons = document.querySelectorAll(".sort-btn");
  desktopSortButtons.forEach((btn) => {
    addEventListener(btn, "click", () => {
      const sortType = btn.getAttribute("data-sort") || "default";
      state.currentSort = sortType;
      updateSortButtons();
      updateSortPopupSelection(); // Also update modal selection
      renderMenuItems();
    });
  });

  if (elements.closeSortModal) {
    addEventListener(elements.closeSortModal, "click", () => {
      if (elements.sortModal) {
        elements.sortModal.classList.remove("show");
      }
    });
  }

  // Close sort modal when clicking outside or pressing Escape
  if (elements.sortModal) {
    addEventListener(elements.sortModal, "click", (e) => {
      if (e.target === elements.sortModal) {
        elements.sortModal.classList.remove("show");
      }
    });

    // Close on Escape key
    addEventListener(document, "keydown", (e) => {
      if (e.key === "Escape" && elements.sortModal.classList.contains("show")) {
        elements.sortModal.classList.remove("show");
      }
    });
  }

  // Handle sort option selection in modal (mobile/tablet)
  const sortOptions = document.querySelectorAll(".sort-popup-option");
  sortOptions.forEach((option) => {
    addEventListener(option, "click", () => {
      const sortType = option.getAttribute("data-sort") || "default";
      state.currentSort = sortType;
      updateSortPopupLabel();
      updateSortPopupSelection();
      updateSortButtons(); // Also update desktop buttons
      renderMenuItems();
      // Close modal if open
      if (elements.sortModal) {
        elements.sortModal.classList.remove("show");
      }
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
      { category: "dips", label: "Dips", enabled: true },
    ],
  };
}

/**
 * Capitalize category name (Title Case - first letter of each word)
 * @param {string} category - Category name
 * @returns {string} Capitalized category name
 */
function capitalizeCategory(category) {
  if (!category || typeof category !== "string") return category;
  return category
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get available categories from menu items (optimized - uses cached state)
 * @returns {Array<string>} Sorted array of unique categories
 */
function getAvailableCategories() {
  if (!Array.isArray(state.menuItems) || state.menuItems.length === 0) {
    return [];
  }

  const categorySet = new Set();
  for (let i = 0; i < state.menuItems.length; i++) {
    const category = state.menuItems[i].category;
    if (category && typeof category === "string" && category.trim()) {
      categorySet.add(category.trim());
    }
  }

  // Convert to sorted array
  return Array.from(categorySet).sort();
}

/**
 * Populate category dropdown with available categories
 * Priority: filterCategories (from Categories tab) > menu items > default categories
 * @param {string} preserveValue - Optional value to preserve after refresh
 */
function populateCategoryDropdown(preserveValue = null) {
  if (!elements.itemCategory) return;

  // Store current selection if we need to preserve it
  const currentValue = preserveValue !== null ? preserveValue : (elements.itemCategory.value || null);
  const currentValueLower = currentValue ? currentValue.toLowerCase().trim() : null;

  // Map structure: key = lowercase category, value = { display: string, value: string }
  const allCategoriesMap = new Map();
  
  // PRIORITY 1: Get categories from filterCategories in settings (Categories tab - source of truth)
  // This is the primary source since categories are managed in the Categories tab
  if (state.uiSettings && state.uiSettings.filterCategories && Array.isArray(state.uiSettings.filterCategories)) {
    state.uiSettings.filterCategories.forEach((f) => {
      if (f && f.category && f.label) {
        const categoryLower = String(f.category).toLowerCase().trim();
        const displayLabel = String(f.label).trim();
        const capitalized = capitalizeCategory(displayLabel);
        
        // Use the label (capitalized) as both display and value for consistency
        // This ensures menu items save with the same case as defined in Categories tab
        if (categoryLower) {
          allCategoriesMap.set(categoryLower, {
            display: capitalized,
            value: capitalized // Use capitalized label as value
          });
        }
      }
    });
    
  }
  
  // PRIORITY 2: Add categories from existing menu items (only if not already in filterCategories)
  // This catches any categories that exist in menu items but haven't been added to Categories tab yet
  const categories = getAvailableCategories();
  categories.forEach(cat => {
    if (!cat || typeof cat !== 'string') return;
    
    const catLower = cat.toLowerCase().trim();
    const capitalized = capitalizeCategory(cat);
    
    // Only add if not already in map (from filterCategories)
    if (!allCategoriesMap.has(catLower)) {
      allCategoriesMap.set(catLower, {
        display: capitalized,
        value: capitalized // Use capitalized version
      });
    }
  });
  
  // PRIORITY 3: Add default categories (only if not already present)
  // These are fallback categories that should always be available
  const defaultCategories = [
    "starters",
    "lorem ipsum",
    "chicken burgers",
    "fries",
    "dessert",
    "drinks",
    "add ons",
    "dips",
  ];
  
  defaultCategories.forEach(cat => {
    const catLower = cat.toLowerCase();
    const capitalized = capitalizeCategory(cat);
    
    // Only add if not already in map
    if (!allCategoriesMap.has(catLower)) {
      allCategoriesMap.set(catLower, {
        display: capitalized,
        value: capitalized
      });
    }
  });
  

  // Convert to array of category objects, sorted by display name
  const allCategories = Array.from(allCategoriesMap.values())
    .sort((a, b) => a.display.localeCompare(b.display, undefined, { sensitivity: 'base' }));

  // Clear existing options
  elements.itemCategory.innerHTML = '';

  // Add sorted categories
  allCategories.forEach(({ display, value }) => {
    const option = document.createElement("option");
    option.value = value; // Use the actual value (from menu items or filterCategories)
    option.textContent = display; // Use the display label
    elements.itemCategory.appendChild(option);
  });
  
  // Restore previous selection if it still exists, otherwise set default
  if (currentValueLower) {
    // Try to find exact match first
    const exactMatch = allCategories.find(c => c.value.toLowerCase() === currentValueLower);
    if (exactMatch) {
      elements.itemCategory.value = exactMatch.value;
      return; // Successfully restored
    }
    
    // Try case-insensitive match
    const caseInsensitiveMatch = Array.from(elements.itemCategory.options).find(
      opt => opt.value.toLowerCase() === currentValueLower
    );
    if (caseInsensitiveMatch) {
      elements.itemCategory.value = caseInsensitiveMatch.value;
      return; // Successfully restored
    }
  }
  
  // Set default to "starters" if it exists, otherwise set to first category
  const startersOption = allCategories.find(c => c.value.toLowerCase() === "starters");
  if (startersOption) {
    elements.itemCategory.value = startersOption.value;
  } else if (allCategories.length > 0) {
    elements.itemCategory.value = allCategories[0].value;
  }
}


/**
 * Save new category
 */
async function saveNewCategory() {
  const input = document.getElementById("new-category-input");
  if (!input || !elements.itemCategory) return;

  const newCategory = input.value.trim();
  if (!newCategory) {
    showMessage("Please enter a category name", "error");
    return;
  }

  // Check if category already exists (case-insensitive)
  const existingCategories = Array.from(elements.itemCategory.options)
    .map((opt) => opt.value.toLowerCase());
  
  if (existingCategories.includes(newCategory.toLowerCase())) {
    showMessage("This category already exists", "error");
    input.focus();
    return;
  }

  // Capitalize the category for consistency
  const capitalizedCategory = capitalizeCategory(newCategory);
  
  // Add to filter categories in settings FIRST (this saves to JSON)
  const saveSuccess = await addCategoryToFilters(capitalizedCategory);
  
  if (!saveSuccess) {
    showMessage("Failed to save category. Please try again.", "error");
    return;
  }
  
  // Add to state temporarily (will be cleared when item is saved or page reloads)
  state.newCategories.add(capitalizedCategory);
  
  // Repopulate dropdown to include the new category (now loaded from settings)
  populateCategoryDropdown();
  
  // Select the new category (use capitalized version)
  const categoryLower = capitalizedCategory.toLowerCase();
  const matchingOption = Array.from(elements.itemCategory.options).find(
    opt => opt.value.toLowerCase() === categoryLower
  );
  if (matchingOption) {
    elements.itemCategory.value = matchingOption.value;
  }
  
  showMessage(`Category "${capitalizedCategory}" added successfully and saved to menu filters`, "success");
}

/**
 * Add new category to filter categories in settings
 * @param {string} category - Category name to add
 */
async function addCategoryToFilters(category) {
  try {
    // Load current settings if not loaded
    if (!state.uiSettings) {
      await loadSettings();
    }

    // Ensure filterCategories array exists
    if (!state.uiSettings.filterCategories) {
      state.uiSettings.filterCategories = [];
    }

    // Check if category already exists in filters (case-insensitive)
    const categoryLower = category.toLowerCase();
    const exists = state.uiSettings.filterCategories.some(
      (f) => f.category && f.category.toLowerCase() === categoryLower
    );

    if (!exists) {
      // Capitalize the label properly
      const capitalizedLabel = capitalizeCategory(category);
      // Use lowercase for category (server normalizes it anyway)
      // Use capitalized label for display
      const newFilter = {
        category: categoryLower, // Use lowercase to match server normalization
        label: capitalizedLabel,  // Use capitalized for display
        enabled: true,
      };

      state.uiSettings.filterCategories.push(newFilter);

      // Save settings to server
      const response = await apiFetch("/api/settings", {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          ...state.uiSettings,
          _csrf: state.csrfToken,
        }),
      });
      
      if (response.ok) {
        updateCSRFToken(response);
        const responseData = await response.json();
        // Update state with the saved settings (server may have normalized values)
        if (responseData.settings) {
          state.uiSettings = responseData.settings;
        }
        // Update the filter categories display if settings panel is open
        if (elements.filtersList && elements.settingsPanel?.classList.contains("show")) {
          renderFilterCategories(state.uiSettings.filterCategories);
        }
        return true; // Success
      } else {
        return false; // Failed
      }
    }
    return true; // Already exists, consider it success
  } catch (error) {
    return false; // Error occurred
  }
}

/**
 * Render categories list
 */
function renderCategories() {
  if (!elements.categoriesList) {
    return;
  }

  const categories = state.uiSettings?.filterCategories || [];
  
  // Update count
  if (elements.categoryCount) {
    elements.categoryCount.textContent = categories.length;
  }

  // Clear existing list
  elements.categoriesList.innerHTML = '';

  if (categories.length === 0) {
    elements.categoriesList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-muted);">
        <p>No categories found. Click "Add Category" to create one.</p>
      </div>
    `;
    return;
  }

  // Create category cards
  const fragment = document.createDocumentFragment();
  
  categories.forEach((filter, index) => {
    const categoryCard = document.createElement("div");
    categoryCard.className = "category-card";
    
    // Get usage count (how many menu items use this category)
    const categoryLower = filter.category.toLowerCase();
    const usageCount = state.menuItems.filter(
      item => item.category && item.category.toLowerCase() === categoryLower
    ).length;

    categoryCard.innerHTML = `
      <div class="category-card-header">
        <div class="category-card-info">
          <h3 class="category-name">${escapeHtml(filter.label)}</h3>
          <span class="category-value">${escapeHtml(filter.category)}</span>
        </div>
        <div class="category-card-actions">
          <button class="btn-icon btn-secondary btn-edit-category" data-index="${index}" title="Edit Category">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M11.5 2.5a1.5 1.5 0 010 2.12l-7 7L2 13l1.38-2.5 7-7a1.5 1.5 0 012.12 0z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Edit
          </button>
          <button class="btn-icon btn-secondary btn-delete-category" data-index="${index}" title="Delete Category" ${usageCount > 0 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1m2 0v9a1 1 0 01-1 1H4a1 1 0 01-1-1V4h10zM6 7v4M10 7v4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
      <div class="category-card-body">
        <div class="category-meta">
          <span class="category-usage">Used in ${usageCount} item${usageCount !== 1 ? 's' : ''}</span>
          <span class="category-status ${filter.enabled ? 'enabled' : 'disabled'}">
            ${filter.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    `;

    fragment.appendChild(categoryCard);
  });

  elements.categoriesList.appendChild(fragment);

  // Attach event listeners
  attachCategoryEventListeners();
}

/**
 * Attach event listeners to category cards
 */
function attachCategoryEventListeners() {
  // Edit buttons
  const editButtons = elements.categoriesList.querySelectorAll('.btn-edit-category');
  editButtons.forEach(btn => {
    addEventListener(btn, 'click', (e) => {
      const index = parseInt(btn.dataset.index);
      editCategory(index);
    });
  });

  // Delete buttons
  const deleteButtons = elements.categoriesList.querySelectorAll('.btn-delete-category');
  deleteButtons.forEach(btn => {
    addEventListener(btn, 'click', (e) => {
      const index = parseInt(btn.dataset.index);
      deleteCategory(index);
    });
  });
}

/**
 * Show add category modal
 */
async function showAddCategoryModal() {
  const categoryName = await showCategoryModal('add');
  if (!categoryName) {
    return; // User cancelled
  }

  const trimmedName = categoryName.trim();
  if (!trimmedName) {
    return;
  }

  const capitalized = capitalizeCategory(trimmedName);

  // Check if category already exists
  const categories = state.uiSettings?.filterCategories || [];
  const exists = categories.some(
    f => f.category.toLowerCase() === trimmedName.toLowerCase() ||
         f.label.toLowerCase() === trimmedName.toLowerCase()
  );

  if (exists) {
    showMessage("This category already exists", "error");
    return;
  }

  // Add category
  const success = await addCategoryToFilters(capitalized);
  if (success) {
    renderCategories();
    populateCategoryDropdown();
    showMessage(`Category "${capitalized}" added successfully`, "success");
  }
}

/**
 * Edit category
 * @param {number} index - Category index
 */
async function editCategory(index) {
  const categories = state.uiSettings?.filterCategories || [];
  if (index < 0 || index >= categories.length) return;

  const category = categories[index];
  const newName = await showCategoryModal('edit', category.label);
  
  if (!newName || !newName.trim()) {
    return; // User cancelled
  }

  const trimmedName = newName.trim();
  const capitalized = capitalizeCategory(trimmedName);
  const categoryLower = trimmedName.toLowerCase();

  // Check if new name conflicts with existing category
  const allCategories = state.uiSettings?.filterCategories || [];
  const conflict = allCategories.some(
    (f, i) => i !== index && 
    (f.category.toLowerCase() === categoryLower || f.label.toLowerCase() === categoryLower)
  );

  if (conflict) {
    showMessage("A category with this name already exists", "error");
    return;
  }

  // Store old category value before updating
  const oldCategoryLower = category.category.toLowerCase();

  // Update category
  category.category = categoryLower;
  category.label = capitalized;

  // Also update menu items that use this category (update their category field)
  const itemsToUpdate = state.menuItems.filter(
    item => item.category && item.category.toLowerCase() === oldCategoryLower
  );

  if (itemsToUpdate.length > 0) {
    // Update menu items on server
    const updatePromises = itemsToUpdate.map(item => {
      item.category = capitalized; // Update to new capitalized name
      return fetch(`/api/menu/${item.id}`, {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          ...item,
          _csrf: state.csrfToken,
        }),
      });
    });
    await Promise.all(updatePromises);
  }

  // Save settings to server
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: getRequestHeaders(),
    body: JSON.stringify({
      ...state.uiSettings,
      _csrf: state.csrfToken,
    }),
  });
  
  if (response.ok) {
    updateCSRFToken(response);
    const responseData = await response.json();
    if (responseData.settings) {
      state.uiSettings = responseData.settings;
    }
    await loadMenuItems(); // Reload to get updated items
    renderCategories();
    populateCategoryDropdown();
    showMessage(`Category updated to "${capitalized}"`, "success");
  } else {
    showMessage("Failed to update category", "error");
  }
}

/**
 * Delete category
 * @param {number} index - Category index
 */
async function deleteCategory(index) {
  const categories = state.uiSettings?.filterCategories || [];
  if (index < 0 || index >= categories.length) return;

  const category = categories[index];
  const categoryLower = category.category.toLowerCase();

  // Check if category is used in menu items
  const usageCount = state.menuItems.filter(
    item => item.category && item.category.toLowerCase() === categoryLower
  ).length;

  if (usageCount > 0) {
    showMessage(
      `Cannot delete category "${category.label}" - it is used in ${usageCount} menu item${usageCount !== 1 ? 's' : ''}. Please remove it from all items first.`,
      "error"
    );
    return;
  }

  const confirmed = await showConfirmModal(
    `Are you sure you want to delete the category "${category.label}"? This action cannot be undone.`,
    "Delete Category",
    "Delete",
    "Cancel",
    "delete"
  );

  if (!confirmed) {
    return;
  }

  // Remove category
  categories.splice(index, 1);
  state.uiSettings.filterCategories = categories;

  // Save to server
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: getRequestHeaders(),
    body: JSON.stringify({
      ...state.uiSettings,
      _csrf: state.csrfToken,
    }),
  });
  
  if (response.ok) {
    updateCSRFToken(response);
    const responseData = await response.json();
    if (responseData.settings) {
      state.uiSettings = responseData.settings;
    }
    renderCategories();
    populateCategoryDropdown();
    showMessage(`Category "${category.label}" deleted successfully`, "success");
  } else {
    showMessage("Failed to delete category", "error");
  }
}

/**
 * Initialize category management
 */
function initCategoryManagement() {
  // Initialize category management for the categories section
  const addCategoryBtn = document.getElementById("add-category-btn");
  if (addCategoryBtn) {
    addEventListener(addCategoryBtn, "click", () => {
      showAddCategoryModal();
    });
  }

  // Initialize category modal event listeners
  if (elements.categoryModalSave) {
    addEventListener(elements.categoryModalSave, "click", () => {
      handleCategoryModalSave();
    });
  }

  if (elements.categoryModalCancel || elements.closeCategoryModal) {
    const cancelHandler = () => {
      hideCategoryModal();
    };
    if (elements.categoryModalCancel) {
      addEventListener(elements.categoryModalCancel, "click", cancelHandler);
    }
    if (elements.closeCategoryModal) {
      addEventListener(elements.closeCategoryModal, "click", cancelHandler);
    }
  }

  // Close modal when clicking outside
  if (elements.categoryModal) {
    addEventListener(elements.categoryModal, "click", (e) => {
      if (e.target === elements.categoryModal) {
        hideCategoryModal();
      }
    });
  }

  // Handle Enter key in input
  if (elements.categoryModalInput) {
    addEventListener(elements.categoryModalInput, "keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleCategoryModalSave();
      } else if (e.key === "Escape") {
        e.preventDefault();
        hideCategoryModal();
      }
    });
  }
}

/**
 * Handle category modal save
 */
function handleCategoryModalSave() {
  if (!elements.categoryModalInput || !elements.categoryModal._resolve) {
    return;
  }

  const categoryName = elements.categoryModalInput.value.trim();
  
  if (!categoryName) {
    showCategoryModalError("Please enter a category name");
    return;
  }

  // Resolve with the category name
  const resolve = elements.categoryModal._resolve;
  delete elements.categoryModal._resolve;
  hideCategoryModal();
  resolve(categoryName);
}

/**
 * Load settings from server
 * @returns {Promise<Object>}
 */
async function loadSettings() {
  try {
    const response = await apiFetch("/api/settings", {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to load settings");

    updateCSRFToken(response);
    state.uiSettings = await response.json();

    // Ensure filterCategories is an array
    if (!Array.isArray(state.uiSettings.filterCategories)) {
      state.uiSettings.filterCategories = [];
    }

    // If no filter categories exist, try to auto-detect from menu items
    if (state.uiSettings.filterCategories.length === 0) {
      const availableCategories = getAvailableCategories();
      if (availableCategories.length > 0) {
        state.uiSettings.filterCategories = availableCategories.map((cat) => ({
          category: cat.toLowerCase(), // Normalize to lowercase
          label: capitalizeCategory(cat), // Capitalize for display
          enabled: true,
        }));
      } else {
        state.uiSettings.filterCategories =
          getDefaultSettings().filterCategories;
      }
    }

    // Ensure all filterCategories have required fields
    state.uiSettings.filterCategories = state.uiSettings.filterCategories
      .filter(f => f && f.category && f.label)
      .map(f => ({
        category: String(f.category).trim().toLowerCase(),
        label: String(f.label).trim() || capitalizeCategory(f.category),
        enabled: f.enabled !== false
      }));

    populateSettingsForm(state.uiSettings);
  } catch (error) {
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
    const value =
      settings[`${colorType}Color`] ||
      getDefaultSettings()[`${colorType}Color`];

    if (colorInput) colorInput.value = value;
    if (textInput) textInput.value = value;
  });

  const numericInputs = {
    "heading-font-size": "headingFontSize",
    "item-name-size": "itemNameSize",
    "description-size": "descriptionSize",
    "price-size": "priceSize",
    "card-opacity": "cardOpacity",
    "grid-gap": "gridGap",
  };

  Object.entries(numericInputs).forEach(([id, key]) => {
    const input = document.getElementById(id);
    if (input) {
      input.value = settings[key] || getDefaultSettings()[key];
    }
  });

  renderFilterCategories(
    settings.filterCategories || getDefaultSettings().filterCategories
  );
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
 * Render filter categories in settings (optimized with DocumentFragment)
 * @param {Array} filters - Array of filter objects
 */
function renderFilterCategories(filters) {
  if (!elements.filtersList) return;
  if (!Array.isArray(filters)) filters = [];

  // Clear existing filters
  elements.filtersList.innerHTML = "";

  // Use DocumentFragment for better performance
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < filters.length; i++) {
    const filter = filters[i];
    const filterItem = document.createElement("div");
    filterItem.className = "filter-item";
    filterItem.draggable = true;
    filterItem.dataset.index = i;

    const dragHandle = document.createElement("span");
    dragHandle.className = "filter-drag-handle";
    dragHandle.textContent = "☰";
    dragHandle.style.cursor = "move";

    const enabledCheckbox = document.createElement("input");
    enabledCheckbox.type = "checkbox";
    enabledCheckbox.className = "filter-enabled";
    enabledCheckbox.checked = filter.enabled !== false;

    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.className = "filter-category";
    categoryInput.value = filter.category || "";
    categoryInput.placeholder = "Category value";

    const labelInput = document.createElement("input");
    labelInput.type = "text";
    labelInput.className = "filter-label";
    labelInput.value = filter.label || "";
    labelInput.placeholder = "Display label";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "btn-remove-filter";
    removeBtn.textContent = "Remove";
    removeBtn.setAttribute("aria-label", "Remove filter");
    removeBtn.addEventListener("click", () => {
      window.removeFilter(i);
    });

    filterItem.appendChild(dragHandle);
    filterItem.appendChild(enabledCheckbox);
    filterItem.appendChild(categoryInput);
    filterItem.appendChild(labelInput);
    filterItem.appendChild(removeBtn);

    fragment.appendChild(filterItem);
  }

  elements.filtersList.appendChild(fragment);
  enableDragAndDrop();
}

/**
 * Get current filter categories from form
 * @returns {Array<Object>}
 */
function getFilterCategories() {
  const filterItems = document.querySelectorAll(".filter-item");
  return Array.from(filterItems)
    .map((item) => ({
      category: item.querySelector(".filter-category")?.value?.trim() || "",
      label: item.querySelector(".filter-label")?.value?.trim() || "",
      enabled: item.querySelector(".filter-enabled")?.checked || false,
    }))
    .filter((f) => f.category && f.label);
}

/**
 * Remove filter category
 * @param {number} index - Filter index
 */
window.removeFilter = function (index) {
  const filters = getFilterCategories();
  filters.splice(index, 1);
  renderFilterCategories(filters);
};

/**
 * Add new filter category (optimized - synchronous)
 */
function addFilter() {
  const filters = getFilterCategories();
  const availableCategories = getAvailableCategories();

  let newCategory = "";
  let newLabel = "";

  if (availableCategories.length > 0) {
    const existingCategoriesSet = new Set(
      filters.map((f) => f.category.toLowerCase())
    );
    for (let i = 0; i < availableCategories.length; i++) {
      const cat = availableCategories[i];
      if (!existingCategoriesSet.has(cat.toLowerCase())) {
        newCategory = cat;
        newLabel = capitalizeCategory(cat);
        break;
      }
    }
  }

  filters.push({ category: newCategory, label: newLabel, enabled: true });
  renderFilterCategories(filters);
}

/**
 * Enable drag and drop for filters (optimized with event delegation)
 */
function enableDragAndDrop() {
  if (!elements.filtersList) return;

  let draggedElement = null;

  // Use event delegation for better performance
  addEventListener(
    elements.filtersList,
    "dragstart",
    (e) => {
      const item = e.target.closest(".filter-item");
      if (!item) return;

      draggedElement = item;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    },
    true
  );

  addEventListener(
    elements.filtersList,
    "dragend",
    (e) => {
      const item = e.target.closest(".filter-item");
      if (!item) return;

      item.classList.remove("dragging");
      draggedElement = null;
    },
    true
  );

  addEventListener(
    elements.filtersList,
    "dragover",
    (e) => {
      const item = e.target.closest(".filter-item");
      if (!item || !draggedElement) return;

      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const afterElement = getDragAfterElement(elements.filtersList, e.clientY);
      if (afterElement == null) {
        elements.filtersList.appendChild(draggedElement);
      } else {
        elements.filtersList.insertBefore(draggedElement, afterElement);
      }
    },
    true
  );

  const filterItems = elements.filtersList.querySelectorAll(".filter-item");
  for (let i = 0; i < filterItems.length; i++) {
    const item = filterItems[i];
    item.draggable = true;
    const handle = item.querySelector(".filter-drag-handle");
    if (handle) handle.style.cursor = "move";
  }
}

/**
 * Get element after drag position
 * @param {Element} container - Container element
 * @param {number} y - Y coordinate
 * @returns {Element|null}
 */
function getDragAfterElement(container, y) {
  const draggableElements = container.querySelectorAll(
    ".filter-item:not(.dragging)"
  );

  // Optimize: use for loop instead of reduce for better performance
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < draggableElements.length; i++) {
    const child = draggableElements[i];
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = child;
    }
  }

  return closest;
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

  const settingsNavItem = document.querySelector(
    '.nav-item[data-section="settings"]'
  );
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
    if (
      e.key === "Escape" &&
      elements.settingsPanel &&
      elements.settingsPanel.classList.contains("show")
    ) {
      hideSettingsPanel();
    }
  });

  if (elements.settingsForm) {
    addEventListener(elements.settingsForm, "submit", async (e) => {
      e.preventDefault();

      const filterCategories = getFilterCategories();

      const invalidFilters = filterCategories.filter(
        (f) => !f.category || !f.label
      );
      if (invalidFilters.length > 0) {
        showMessage(
          "Please fill in all filter category and label fields",
          "error"
        );
        return;
      }

      const categoryValues = filterCategories.map((f) =>
        f.category.toLowerCase()
      );
      const duplicates = categoryValues.filter(
        (cat, index) => categoryValues.indexOf(cat) !== index
      );
      if (duplicates.length > 0) {
        showMessage(
          "Duplicate category values found. Please use unique categories.",
          "error"
        );
        return;
      }

      const colorRegex = /^#[0-9A-F]{6}$/i;
      const colors = {
        primary: document.getElementById("primary-color")?.value,
        secondary: document.getElementById("secondary-color")?.value,
        text: document.getElementById("text-color")?.value,
        accent: document.getElementById("accent-color")?.value,
      };

      for (const [name, value] of Object.entries(colors)) {
        if (!value || !colorRegex.test(value)) {
          showMessage(
            `Invalid ${name} color format. Please use hex format (e.g., #0d3b2e)`,
            "error"
          );
          return;
        }
      }

      const settings = {
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        textColor: colors.text,
        accentColor: colors.accent,
        headingFontSize: parseFloat(
          document.getElementById("heading-font-size")?.value
        ),
        itemNameSize: parseFloat(
          document.getElementById("item-name-size")?.value
        ),
        descriptionSize: parseFloat(
          document.getElementById("description-size")?.value
        ),
        priceSize: parseFloat(document.getElementById("price-size")?.value),
        cardOpacity: parseFloat(document.getElementById("card-opacity")?.value),
        gridGap: parseFloat(document.getElementById("grid-gap")?.value),
        filterCategories: filterCategories,
      };

      if (
        isNaN(settings.headingFontSize) ||
        settings.headingFontSize < 2 ||
        settings.headingFontSize > 8
      ) {
        showMessage("Heading font size must be between 2 and 8", "error");
        return;
      }

      if (
        isNaN(settings.cardOpacity) ||
        settings.cardOpacity < 0 ||
        settings.cardOpacity > 1
      ) {
        showMessage("Card opacity must be between 0 and 1", "error");
        return;
      }

      try {
        const response = await fetch("/api/settings", {
          method: "PUT",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            ...settings,
            _csrf: state.csrfToken,
          }),
        });
        
        updateCSRFToken(response);

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
        showMessage("Failed to save settings. Please try again.", "error");
      }
    });
  }

  if (elements.resetSettingsBtn) {
    addEventListener(elements.resetSettingsBtn, "click", async () => {
      const confirmed = await showConfirmModal(
        "Are you sure you want to reset all settings to default? This will overwrite your current settings.",
        "Reset Settings",
        "Reset",
        "Cancel"
      );
      if (confirmed) {
        const defaultSettings = getDefaultSettings();
        populateSettingsForm(defaultSettings);
        renderFilterCategories(defaultSettings.filterCategories);
        showMessage("Settings reset to default values", "success");
      }
    });
  }

  if (elements.addFilterBtn) {
    addEventListener(elements.addFilterBtn, "click", addFilter);
  }
}

// ============================================================================
// THEME TOGGLE
// ============================================================================

/**
 * Initialize theme toggle functionality
 */
function initThemeToggle() {
  // Load saved theme preference
  const savedTheme = localStorage.getItem("adminTheme");
  if (savedTheme === "light" || savedTheme === "dark") {
    state.theme = savedTheme;
    applyTheme(state.theme);
  } else {
    // Default to dark
    state.theme = "dark";
    applyTheme("dark");
  }

  if (elements.themeToggleBtn) {
    addEventListener(elements.themeToggleBtn, "click", () => {
      state.theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(state.theme);
      localStorage.setItem("adminTheme", state.theme);
      showMessage(`Switched to ${state.theme} theme`, "success", 2000);
    });
  }
}

/**
 * Apply theme to the page
 * @param {string} theme - Theme name ('dark' or 'light')
 */
function applyTheme(theme) {
  const root = document.documentElement;

  if (theme === "light") {
    root.classList.add("light-theme");
    root.classList.remove("dark-theme");
  } else {
    root.classList.add("dark-theme");
    root.classList.remove("light-theme");
  }

  // Update theme toggle button icon visibility
  if (elements.themeToggleBtn) {
    const sunIcon = elements.themeToggleBtn.querySelector(".theme-icon-sun");
    const moonIcon = elements.themeToggleBtn.querySelector(".theme-icon-moon");
    if (sunIcon && moonIcon) {
      if (theme === "light") {
        sunIcon.style.display = "none";
        moonIcon.style.display = "block";
      } else {
        sunIcon.style.display = "block";
        moonIcon.style.display = "none";
      }
    }
  }
}

// ============================================================================
// PRINT MENU
// ============================================================================

/**
 * Print menu functionality
 */
function initPrintMenu() {
  if (elements.printMenuBtn) {
    addEventListener(elements.printMenuBtn, "click", () => {
      printMenu();
    });
  }
}

// ============================================================================
// LAYOUT TOGGLE
// ============================================================================

/**
 * Initialize layout toggle functionality
 */
function initLayoutToggle() {
  // Load layout preference from localStorage
  const savedLayout = localStorage.getItem("adminLayout");
  if (savedLayout === "list" || savedLayout === "grid") {
    state.layout = savedLayout;
  }

  // Apply initial layout
  applyLayout(state.layout);

  // Set up toggle button
  if (elements.layoutToggleBtn) {
    addEventListener(elements.layoutToggleBtn, "click", () => {
      toggleLayout();
    });
  }
}

/**
 * Toggle between grid and list layout
 */
function toggleLayout() {
  state.layout = state.layout === "grid" ? "list" : "grid";
  applyLayout(state.layout);
  localStorage.setItem("adminLayout", state.layout);
  showMessage(`Switched to ${state.layout} layout`, "success", 2000);
}

/**
 * Apply layout to the items grid
 * @param {string} layout - Layout type ('grid' or 'list')
 */
function applyLayout(layout) {
  if (!elements.itemsList) return;

  const gridIcon = elements.layoutToggleBtn
    ? elements.layoutToggleBtn.querySelector(".layout-icon-grid")
    : null;
  const listIcon = elements.layoutToggleBtn
    ? elements.layoutToggleBtn.querySelector(".layout-icon-list")
    : null;

  if (layout === "list") {
    elements.itemsList.classList.add("list-layout");
    if (elements.layoutToggleBtn) {
      elements.layoutToggleBtn.classList.add("active");
      // In list mode, show grid icon (to switch back to grid)
      if (gridIcon) gridIcon.style.display = "block";
      if (listIcon) listIcon.style.display = "none";
    }
  } else {
    elements.itemsList.classList.remove("list-layout");
    if (elements.layoutToggleBtn) {
      elements.layoutToggleBtn.classList.remove("active");
      // In grid mode, show list icon (to switch to list)
      if (gridIcon) gridIcon.style.display = "none";
      if (listIcon) listIcon.style.display = "block";
    }
  }
}

/**
 * Print the menu
 */
function printMenu() {
  try {
    // Open print window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      showMessage("Please allow pop-ups to print the menu", "error");
      return;
    }

    const items = state.menuItems;
    if (!items || items.length === 0) {
      showMessage("No menu items to print", "warning");
      return;
    }

    // Group items by category
    const itemsByCategory = {};
    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      if (!itemsByCategory[category]) {
        itemsByCategory[category] = [];
      }
      itemsByCategory[category].push(item);
    });

    // Build print HTML
    const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Menu - Print</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 40px;
      color: #1e1e1e;
      background: #fff;
    }
    .print-header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #0d3b2e;
      padding-bottom: 20px;
    }
    .print-header h1 {
      font-size: 36px;
      color: #0d3b2e;
      margin-bottom: 10px;
    }
    .print-header p {
      color: #666;
      font-size: 14px;
    }
    .category-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .category-title {
      font-size: 24px;
      color: #0d3b2e;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1a5c4a;
    }
    .menu-item {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .item-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e1e1e;
    }
    .item-price {
      font-size: 18px;
      font-weight: 600;
      color: #0d3b2e;
    }
    .item-description {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      margin-top: 5px;
    }
    .item-tags {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .item-tag {
      display: inline-block;
      padding: 4px 10px;
      background: #f0f0f0;
      border: 1px solid #ddd;
      border-radius: 12px;
      font-size: 11px;
      color: #666;
    }
    .item-image-print {
      margin-bottom: 12px;
      text-align: center;
    }
    .item-image-print img {
      max-width: 200px;
      max-height: 150px;
      width: auto;
      height: auto;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .item-id {
      font-size: 11px;
      color: #999;
      margin-top: 5px;
    }
    @media print {
      body {
        padding: 20px;
      }
      .category-section {
        page-break-inside: avoid;
      }
      .menu-item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <h1>LOREM IPSUM</h1>
    <p>Menu</p>
  </div>
  
  ${Object.keys(itemsByCategory)
    .map(
      (category) => `
    <div class="category-section">
      <h2 class="category-title">${escapeHtml(category)}</h2>
      ${itemsByCategory[category]
        .map(
          (item) => `
        <div class="menu-item">
          ${
            item.image
              ? `<div class="item-image-print"><img src="${
                  item.image
                }" alt="${escapeHtml(item.name || "")}" /></div>`
              : ""
          }
          <div class="item-header">
            <div>
              <div class="item-name">${escapeHtml(item.name || "")}</div>
              ${
                item.tags && Array.isArray(item.tags) && item.tags.length > 0
                  ? `
                <div class="item-tags">
                  ${item.tags
                    .map(
                      (tag) =>
                        `<span class="item-tag">${escapeHtml(tag)}</span>`
                    )
                    .join("")}
                </div>
              `
                  : ""
              }
            </div>
            <div class="item-price">$${(parseFloat(item.price) || 0).toFixed(
              2
            )}</div>
          </div>
          ${
            item.description
              ? `<div class="item-description">${escapeHtml(
                  item.description
                )}</div>`
              : ""
          }
          <div class="item-id">ID: ${item.id || ""}</div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("")}
  
  <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; color: #999; font-size: 12px;">
    <p>Total Items: ${items.length}</p>
    <p>Printed on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
  </div>
</body>
</html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        showMessage("Print dialog opened", "success", 2000);
      }, 250);
    };
  } catch (error) {
    showMessage("Failed to open print dialog", "error");
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
    elements.navItems.forEach((item) => {
      if (item.dataset.section === "menu") {
        addEventListener(item, "click", (e) => {
          e.preventDefault();
          hideSettingsPanel();
          showMenuSection();
        });
      } else if (item.dataset.section === "stats") {
        addEventListener(item, "click", (e) => {
          e.preventDefault();
          hideSettingsPanel();
          showStatsSection();
        });
      } else if (item.dataset.section === "categories") {
        addEventListener(item, "click", async (e) => {
          e.preventDefault();
          hideSettingsPanel();
          await showCategoriesSection();
        });
      } else if (item.dataset.section === "settings") {
        addEventListener(item, "click", (e) => {
          e.preventDefault();
          showSettingsPanel();
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
    addEventListener(elements.closeItemModal, "click", async () => {
      await closeItemModalWithConfirmation();
    });
  }

  if (elements.itemModal) {
    addEventListener(elements.itemModal, "click", async (e) => {
      if (e.target === elements.itemModal) {
        await closeItemModalWithConfirmation();
      }
    });
  }

  addEventListener(document, "keydown", async (e) => {
    if (
      e.key === "Escape" &&
      elements.itemModal &&
      elements.itemModal.classList.contains("show")
    ) {
      e.preventDefault();
      await closeItemModalWithConfirmation();
    }
  });

  if (elements.cancelBtn) {
    addEventListener(elements.cancelBtn, "click", async () => {
      await closeItemModalWithConfirmation();
    });
  }

  if (elements.refreshBtn) {
    addEventListener(elements.refreshBtn, "click", async () => {
      await loadMenuItems();
      if (
        elements.statsSection &&
        elements.statsSection.style.display !== "none"
      ) {
        renderStatistics();
      }
    });
  }

  // Export/Import functionality
  if (elements.exportBtn) {
    addEventListener(elements.exportBtn, "click", exportMenuData);
  }

  if (elements.importBtn) {
    addEventListener(elements.importBtn, "click", showImportModal);
  }

  if (elements.previewMenuBtn) {
    addEventListener(elements.previewMenuBtn, "click", previewMenu);
  }

  // Bulk operations
  if (elements.bulkDeleteBtn) {
    addEventListener(elements.bulkDeleteBtn, "click", bulkDeleteItems);
  }

  if (elements.clearSelectionBtn) {
    addEventListener(elements.clearSelectionBtn, "click", clearSelection);
  }

  // Import modal
  if (elements.closeImportModal) {
    addEventListener(elements.closeImportModal, "click", hideImportModal);
  }

  if (elements.cancelImportBtn) {
    addEventListener(elements.cancelImportBtn, "click", hideImportModal);
  }

  if (elements.confirmImportBtn) {
    addEventListener(elements.confirmImportBtn, "click", importMenuData);
  }

  if (elements.importModal) {
    addEventListener(elements.importModal, "click", (e) => {
      if (e.target === elements.importModal) {
        hideImportModal();
      }
    });
  }

  addEventListener(document, "keydown", (e) => {
    if (
      e.key === "Escape" &&
      elements.importModal &&
      elements.importModal.classList.contains("show")
    ) {
      hideImportModal();
    }
  });

  // Check if we're on mobile/tablet
  const isMobileOrTablet = () => {
    return window.innerWidth <= 968;
  };

  // Toggle sidebar on mobile/tablet
  const toggleMobileSidebar = () => {
    if (!elements.sidebar) return;
    
    const isOpen = elements.sidebar.classList.contains("open");
    
    if (isOpen) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  };

  // Open sidebar on mobile/tablet
  const openMobileSidebar = () => {
    if (!elements.sidebar) return;
    elements.sidebar.classList.add("open");
    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.classList.add("active");
    }
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = "hidden";
  };

  // Close sidebar on mobile/tablet
  const closeMobileSidebar = () => {
    if (!elements.sidebar) return;
    elements.sidebar.classList.remove("open");
    if (elements.sidebarOverlay) {
      elements.sidebarOverlay.classList.remove("active");
    }
    // Restore body scroll
    document.body.style.overflow = "";
  };

  // Sidebar toggle functionality
  if (elements.sidebar) {
    const mainContent = document.querySelector(".main-content");

    const updateMainContentMargin = () => {
      if (mainContent && !isMobileOrTablet()) {
        if (elements.sidebar.classList.contains("collapsed")) {
          mainContent.style.marginLeft = "70px";
        } else {
          mainContent.style.marginLeft = "";
        }
      }
    };

    // Desktop sidebar toggle (collapse/expand)
    if (elements.sidebarToggle) {
      addEventListener(elements.sidebarToggle, "click", () => {
        if (!isMobileOrTablet()) {
          elements.sidebar.classList.toggle("collapsed");
          updateMainContentMargin();
          // Save state to localStorage
          const isCollapsed = elements.sidebar.classList.contains("collapsed");
          localStorage.setItem("sidebarCollapsed", isCollapsed);
        }
      });
    }

    // Mobile menu button toggle
    if (elements.mobileMenuBtn) {
      addEventListener(elements.mobileMenuBtn, "click", (e) => {
        e.stopPropagation();
        toggleMobileSidebar();
      });
    }

    // Close sidebar when clicking overlay
    if (elements.sidebarOverlay) {
      addEventListener(elements.sidebarOverlay, "click", () => {
        closeMobileSidebar();
      });
    }

    // Close sidebar when clicking a nav item on mobile
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      addEventListener(item, "click", () => {
        if (isMobileOrTablet()) {
          // Small delay to allow navigation to happen first
          setTimeout(() => {
            closeMobileSidebar();
          }, 100);
        }
      });
    });

    // Close sidebar on window resize if switching from mobile to desktop
    let resizeTimer;
    addEventListener(window, "resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!isMobileOrTablet()) {
          // On desktop, remove mobile open state
          closeMobileSidebar();
          // Restore collapsed state if saved
          const savedState = localStorage.getItem("sidebarCollapsed");
          if (savedState === "true" && !elements.sidebar.classList.contains("collapsed")) {
            elements.sidebar.classList.add("collapsed");
          }
          updateMainContentMargin();
        } else {
          // On mobile, ensure sidebar is closed by default
          if (!elements.sidebar.classList.contains("open")) {
            closeMobileSidebar();
          }
        }
      }, 250);
    });

    // Restore sidebar state from localStorage (desktop only)
    if (!isMobileOrTablet()) {
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState === "true") {
        elements.sidebar.classList.add("collapsed");
        updateMainContentMargin();
      }
    } else {
      // On mobile, ensure sidebar starts closed
      closeMobileSidebar();
    }

    // Close sidebar on Escape key
    addEventListener(document, "keydown", (e) => {
      if (e.key === "Escape" && isMobileOrTablet()) {
        closeMobileSidebar();
      }
    });
  }
}

function initialize() {
  try {
    initializeElements();

    if (!elements.loginForm) {
      setTimeout(initialize, 100);
      return;
    }

    initAuth();
    initItemForm();
    initFilterAndSort();
    initSettingsPanel();
    initColorInputs();
    initNavigation();
    initThemeToggle();
    initPrintMenu();
    initLayoutToggle();
    checkAuth();
  } catch (error) {
    showMessage("Failed to initialize. Please refresh the page.", "error");
  }
}

// Initialize when DOM is ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    setTimeout(initialize, 0);
  }
}

// Cleanup on page unload (only if window is available)
if (
  typeof window !== "undefined" &&
  window &&
  typeof window.addEventListener === "function"
) {
  try {
    const beforeUnloadHandler = () => {
      try {
        cleanupEventListeners();
      } catch (error) {
        // Silently fail on cleanup
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
  } catch (error) {
    // Silently handle beforeunload listener errors
  }
}
