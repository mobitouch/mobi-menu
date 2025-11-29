/**
 * @fileoverview Express server for menu management API with authentication
 * @author MobiTouch.online
 * @version 2.0.0
 */

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set("trust proxy", 1);

// Security headers middleware
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Prevent MIME type sniffing and XSS
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  express.static(__dirname, {
    maxAge: process.env.NODE_ENV === "production" ? "1d" : "0",
    etag: true,
    lastModified: true,
  })
);

const SESSION_SECRET = process.env.SESSION_SECRET;
if (process.env.NODE_ENV === "production" && !SESSION_SECRET) {
  console.error("⚠️  ERROR: SESSION_SECRET is required in production!");
  console.error("⚠️  Please set SESSION_SECRET in your .env file");
  process.exit(1);
}

app.use(
  session({
    secret:
      SESSION_SECRET ||
      "lorem-ipsum-secret-key-2025-change-in-production",
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
    rolling: true,
  })
);

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error("⚠️  WARNING: ADMIN_PASSWORD is not set in .env file!");
  console.error(
    "⚠️  Please create a .env file with ADMIN_PASSWORD=your_password"
  );
  process.exit(1);
}

// CSRF token generation and validation
const crypto = require("crypto");

/**
 * Generate CSRF token
 * @returns {string} CSRF token
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @param {Object} session - Session object
 * @returns {boolean} True if valid
 */
function validateCSRFToken(token, session) {
  if (!token || !session.csrfToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(session.csrfToken)
  );
}

/**
 * CSRF protection middleware for state-changing operations
 */
function csrfProtection(req, res, next) {
  // Skip CSRF for GET requests and public endpoints
  if (req.method === "GET" || req.path.startsWith("/data.json") || req.path.startsWith("/api/settings") && req.method === "GET") {
    return next();
  }

  // Generate token if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }

  // Check token for POST/PUT/DELETE requests
  const token = req.headers["x-csrf-token"] || req.body._csrf;
  if (!validateCSRFToken(token, req.session)) {
    return res.status(403).json({
      success: false,
      error: "Invalid CSRF token",
    });
  }

  next();
}

const DATA_FILE = path.join(__dirname, "data.json");
const SETTINGS_FILE = path.join(__dirname, "settings.json");

const cache = {
  menuData: null,
  settings: null,
  menuDataTimestamp: 0,
  settingsTimestamp: 0,
  CACHE_TTL: process.env.NODE_ENV === "production" ? 10000 : 5000, // Longer cache in production
  maxId: null, // Cache max ID to avoid recalculating
  maxIdTimestamp: 0,
};

/**
 * Get default filter categories
 * @returns {Array<Object>} Array of default filter category objects
 */
function getDefaultFilterCategories() {
  return [
    { category: "starters", label: "Starters", enabled: true },
    { category: "lorem ipsum", label: "Lorem Ipsum", enabled: true },
    { category: "chicken burgers", label: "Chicken Burgers", enabled: true },
    { category: "fries", label: "Fries", enabled: true },
    { category: "dessert", label: "Dessert", enabled: true },
    { category: "drinks", label: "Drinks", enabled: true },
    { category: "add ons", label: "Add Ons", enabled: true },
    { category: "dips", label: "Dips", enabled: true },
  ];
}

/**
 * Read menu data from file with caching
 * @returns {Promise<Array>} Promise resolving to array of menu items
 */
async function readMenuData() {
  const now = Date.now();

  // Return cached data if still valid
  if (cache.menuData && now - cache.menuDataTimestamp < cache.CACHE_TTL) {
    return cache.menuData;
  }

  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(data);

    if (!Array.isArray(parsed)) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Invalid menu data format, returning empty array");
      }
      return [];
    }

    cache.menuData = parsed;
    cache.menuDataTimestamp = now;
    cache.maxId = getMaxId(parsed);
    cache.maxIdTimestamp = now;

    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") {
      await writeMenuData([]);
      return [];
    }
    if (process.env.NODE_ENV !== "production") {
      console.error("Error reading menu data:", error);
    }
    return cache.menuData || [];
  }
}

/**
 * Get maximum ID from menu data (optimized - avoids Math.max with spread)
 * @param {Array} data - Array of menu items
 * @returns {number} Maximum ID
 */
function getMaxId(data) {
  if (!Array.isArray(data) || data.length === 0) return 0;

  let maxId = 0;
  for (let i = 0; i < data.length; i++) {
    const id = parseInt(data[i].id) || 0;
    if (id > maxId) maxId = id;
  }
  return maxId;
}

// File operation lock to prevent race conditions
const fileLocks = {
  menuData: false,
  settings: false,
};

/**
 * Acquire file lock
 * @param {string} fileType - Type of file ('menuData' or 'settings')
 * @returns {Promise<boolean>} True if lock acquired, false if already locked
 */
async function acquireLock(fileType) {
  if (fileLocks[fileType]) {
    return false;
  }
  fileLocks[fileType] = true;
  return true;
}

/**
 * Release file lock
 * @param {string} fileType - Type of file ('menuData' or 'settings')
 */
function releaseLock(fileType) {
  fileLocks[fileType] = false;
}

/**
 * Write menu data to file and invalidate cache
 * @param {Array} data - Array of menu items to write
 * @returns {Promise<boolean>} Promise resolving to success status
 */
async function writeMenuData(data) {
  const maxRetries = 5;
  const retryDelay = 100; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (!(await acquireLock("menuData"))) {
      // Wait and retry if file is locked
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      continue;
    }

    try {
      if (!Array.isArray(data)) {
        throw new Error("Menu data must be an array");
      }

      const tempFile = `${DATA_FILE}.tmp`;
      await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
      await fs.rename(tempFile, DATA_FILE);

      // Invalidate cache and update max ID
      cache.menuData = null;
      cache.menuDataTimestamp = 0;
      cache.maxId = getMaxId(data);
      cache.maxIdTimestamp = Date.now();

      releaseLock("menuData");
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error writing menu data:", error);
      }
      try {
        await fs.unlink(`${DATA_FILE}.tmp`);
      } catch (unlinkError) {
        // Silent cleanup failure
      }
      releaseLock("menuData");

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      return false;
    }
  }
  return false;
}

/**
 * Get default settings object
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
    filterCategories: getDefaultFilterCategories(),
  };
}

/**
 * Read settings from file with caching
 * @returns {Promise<Object>} Promise resolving to settings object
 */
async function readSettings() {
  const now = Date.now();

  // Return cached settings if still valid
  if (cache.settings && now - cache.settingsTimestamp < cache.CACHE_TTL) {
    return cache.settings;
  }

  try {
    if (fsSync.existsSync(SETTINGS_FILE)) {
      const data = await fs.readFile(SETTINGS_FILE, "utf8");
      const settings = JSON.parse(data);

      if (
        !settings.filterCategories ||
        !Array.isArray(settings.filterCategories)
      ) {
        settings.filterCategories = getDefaultFilterCategories();
      }

      cache.settings = settings;
      cache.settingsTimestamp = now;

      return settings;
    }

    const defaultSettings = getDefaultSettings();
    cache.settings = defaultSettings;
    cache.settingsTimestamp = now;
    return defaultSettings;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Error reading settings:", error);
    }
    // Return cached settings if available, otherwise defaults
    return cache.settings || getDefaultSettings();
  }
}

/**
 * Write settings to file and invalidate cache
 * @param {Object} data - Settings object to write
 * @returns {Promise<boolean>} Promise resolving to success status
 */
async function writeSettings(data) {
  const maxRetries = 5;
  const retryDelay = 100; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (!(await acquireLock("settings"))) {
      // Wait and retry if file is locked
      await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
      continue;
    }

    try {
      if (!data || typeof data !== "object") {
        throw new Error("Settings must be an object");
      }

      const tempFile = `${SETTINGS_FILE}.tmp`;
      await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
      await fs.rename(tempFile, SETTINGS_FILE);

      cache.settings = null;
      cache.settingsTimestamp = 0;

      releaseLock("settings");
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "production") {
        console.error("Error writing settings:", error);
      }
      try {
        await fs.unlink(`${SETTINGS_FILE}.tmp`);
      } catch (unlinkError) {
        // Ignore cleanup errors
      }
      releaseLock("settings");
      
      // If it's a locking issue, retry; otherwise fail
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      return false;
    }
  }
  return false;
}

/**
 * Centralized error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
/**
 * Centralized error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  // Log error with context
  const errorInfo = {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection?.remoteAddress,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV !== "production") {
    console.error("Error Details:", errorInfo);
  } else {
    console.error(`Error [${errorInfo.method} ${errorInfo.url}]: ${errorInfo.message}`);
  }

  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

/**
 * Authentication middleware - protects admin routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requireAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

/**
 * Sanitize string input to prevent XSS and control characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  // Remove control characters except newlines, tabs, and carriage returns
  return str.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "").trim();
}

/**
 * Validate menu item data
 * @param {Object} item - Menu item object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateMenuItem(item) {
  // Validate name
  if (
    !item.name ||
    typeof item.name !== "string" ||
    item.name.trim().length === 0
  ) {
    return {
      valid: false,
      error: "Item name is required and must be a non-empty string",
    };
  }
  const sanitizedName = sanitizeString(item.name);
  if (sanitizedName.length === 0) {
    return {
      valid: false,
      error: "Item name contains invalid characters",
    };
  }
  if (sanitizedName.length > 200) {
    return { valid: false, error: "Item name must be 200 characters or less" };
  }

  // Validate category
  if (
    !item.category ||
    typeof item.category !== "string" ||
    item.category.trim().length === 0
  ) {
    return {
      valid: false,
      error: "Category is required and must be a non-empty string",
    };
  }
  const sanitizedCategory = sanitizeString(item.category);
  if (sanitizedCategory.length === 0) {
    return {
      valid: false,
      error: "Category contains invalid characters",
    };
  }
  if (sanitizedCategory.length > 100) {
    return { valid: false, error: "Category must be 100 characters or less" };
  }

  // Validate price
  if (
    typeof item.price !== "number" ||
    isNaN(item.price) ||
    !isFinite(item.price) ||
    item.price < 0 ||
    item.price > 500
  ) {
    return { valid: false, error: "Price must be a number between 0 and 500" };
  }

  // Validate description
  if (item.description) {
    if (typeof item.description !== "string") {
      return {
        valid: false,
        error: "Description must be a string",
      };
    }
    const sanitizedDesc = sanitizeString(item.description);
    if (sanitizedDesc.length > 1000) {
      return {
        valid: false,
        error: "Description must be 1000 characters or less",
      };
    }
  }

  // Validate tags
  if (item.tags) {
    if (!Array.isArray(item.tags)) {
      return {
        valid: false,
        error: "Tags must be an array",
      };
    }
    for (const tag of item.tags) {
      if (typeof tag !== "string" || sanitizeString(tag).length === 0) {
        return {
          valid: false,
          error: "All tags must be non-empty strings",
        };
      }
      if (sanitizeString(tag).length > 50) {
        return {
          valid: false,
          error: "Each tag must be 50 characters or less",
        };
      }
    }
  }

  // Validate image (base64)
  if (item.image && typeof item.image === "string") {
    const imageStr = item.image.trim();
    // Check if it's a valid base64 data URL or plain base64
    if (
      !imageStr.startsWith("data:image/") &&
      !imageStr.match(/^[A-Za-z0-9+/=\s]+$/)
    ) {
      return {
        valid: false,
        error: "Invalid image format",
      };
    }
    // Limit image size (rough check - 5MB max)
    if (imageStr.length > 5 * 1024 * 1024) {
      return {
        valid: false,
        error: "Image size exceeds 5MB limit",
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Rate limiting for login attempts (simple in-memory store)
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Rate limiting middleware for login
 */
function rateLimitLogin(req, res, next) {
  // Get client IP (respects trust proxy setting)
  const clientIp = req.ip || 
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
    req.connection?.remoteAddress || 
    "unknown";
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp);

  if (attempts) {
    // Check if lockout period has passed
    if (attempts.lockedUntil && now < attempts.lockedUntil) {
      const remainingMinutes = Math.ceil((attempts.lockedUntil - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`,
      });
    }

    // Reset if lockout expired
    if (attempts.lockedUntil && now >= attempts.lockedUntil) {
      loginAttempts.delete(clientIp);
    }
  }

  next();
}

/**
 * Record failed login attempt
 */
function recordFailedLogin(clientIp) {
  const now = Date.now();
  const attempts = loginAttempts.get(clientIp) || { count: 0, lastAttempt: 0 };

  attempts.count += 1;
  attempts.lastAttempt = now;

  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = now + LOGIN_LOCKOUT_TIME;
    attempts.count = 0; // Reset counter after lockout
  }

  loginAttempts.set(clientIp, attempts);

  // Clean up old entries (older than 1 hour)
  setTimeout(() => {
    const entry = loginAttempts.get(clientIp);
    if (entry && now - entry.lastAttempt > 60 * 60 * 1000) {
      loginAttempts.delete(clientIp);
    }
  }, 60 * 60 * 1000);
}

/**
 * Clear login attempts on successful login
 */
function clearLoginAttempts(clientIp) {
  loginAttempts.delete(clientIp);
}

/**
 * POST /api/auth/login
 * Authenticate admin user with password
 */
app.post("/api/auth/login", rateLimitLogin, async (req, res, next) => {
  try {
    const { password } = req.body;
    // Get client IP (respects trust proxy setting)
    const clientIp = req.ip || 
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
      req.connection?.remoteAddress || 
      "unknown";

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Constant-time comparison to prevent timing attacks
    if (password.length !== ADMIN_PASSWORD.length) {
      recordFailedLogin(clientIp);
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    let isValid = true;
    for (let i = 0; i < password.length; i++) {
      if (password[i] !== ADMIN_PASSWORD[i]) {
        isValid = false;
      }
    }

    if (isValid) {
      clearLoginAttempts(clientIp);
      req.session.isAuthenticated = true;
      res.json({ success: true, message: "Login successful" });
    } else {
      recordFailedLogin(clientIp);
      // Use generic error message to prevent user enumeration
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Destroy user session
 */
app.post("/api/auth/logout", async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/status
 * Check current authentication status
 */
app.get("/api/auth/status", (req, res) => {
  // Generate CSRF token if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  res.json({ 
    isAuthenticated: !!req.session.isAuthenticated,
    csrfToken: req.session.csrfToken 
  });
});

// ============================================================================
// MENU CRUD ROUTES (Protected)
// ============================================================================

/**
 * GET /api/menu
 * Get all menu items (admin only)
 */
app.get("/api/menu", requireAuth, async (req, res, next) => {
  // Generate CSRF token if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  res.setHeader("X-CSRF-Token", req.session.csrfToken);
  try {
    const menuData = await readMenuData();
    res.json(menuData);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/menu
 * Create a new menu item
 */
app.post("/api/menu", requireAuth, csrfProtection, async (req, res, next) => {
  try {
    const { name, category, price, description, tags, image } = req.body;

    // Handle tags - can be array or comma-separated string
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags.map((t) => String(t).trim()).filter((t) => t);
      } else if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      }
    }

    const newItem = {
      name: sanitizeString(String(name || "")),
      category: sanitizeString(String(category || "")),
      price: parseFloat(price),
      description: sanitizeString(String(description || "")),
      tags: tagsArray.map(tag => sanitizeString(tag)),
      image: image ? String(image).trim() : null, // Store base64 image or null
    };

    const validation = validateMenuItem(newItem);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const menuData = await readMenuData();
    // Use cached max ID if available and recent, otherwise calculate
    const now = Date.now();
    let maxId = cache.maxId;
    if (maxId === null || now - cache.maxIdTimestamp > cache.CACHE_TTL) {
      maxId = getMaxId(menuData);
      cache.maxId = maxId;
      cache.maxIdTimestamp = now;
    }
    const newId = maxId + 1;

    newItem.id = newId;
    menuData.push(newItem);

    const success = await writeMenuData(menuData);
    if (success) {
      res.json({
        success: true,
        item: newItem,
        message: "Item added successfully",
      });
    } else {
      res.status(500).json({ success: false, message: "Failed to save item" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/menu/:id
 * Update an existing menu item
 */
app.put("/api/menu/:id", requireAuth, csrfProtection, async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const { name, category, price, description, tags, image } = req.body;

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    // Handle tags - can be array or comma-separated string
    let tagsArray = [];
    if (tags) {
      if (Array.isArray(tags)) {
        tagsArray = tags.map((t) => String(t).trim()).filter((t) => t);
      } else if (typeof tags === "string") {
        tagsArray = tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t);
      }
    }

    const menuData = await readMenuData();
    const existingItem = menuData.find((item) => item.id === itemId);

    const updatedItem = {
      name: sanitizeString(String(name || "")),
      category: sanitizeString(String(category || "")),
      price: parseFloat(price),
      description: sanitizeString(String(description || "")),
      tags: tagsArray.map(tag => sanitizeString(tag)),
      image: image !== undefined ? (image ? String(image).trim() : null) : existingItem?.image || null, // Keep existing image if not provided
    };

    const validation = validateMenuItem(updatedItem);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const itemIndex = menuData.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    updatedItem.id = itemId;
    menuData[itemIndex] = updatedItem;

    const success = await writeMenuData(menuData);
    if (success) {
      res.json({
        success: true,
        item: updatedItem,
        message: "Item updated successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update item",
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/menu/:id
 * Delete a menu item
 */
app.delete("/api/menu/:id", requireAuth, csrfProtection, async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);

    if (isNaN(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    const menuData = await readMenuData();
    const initialLength = menuData.length;
    const filteredData = menuData.filter((item) => item.id !== itemId);

    if (filteredData.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    const success = await writeMenuData(filteredData);
    if (success) {
      res.json({ success: true, message: "Item deleted successfully" });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete item",
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/menu/export
 * Export all menu data as JSON
 */
app.get("/api/menu/export", requireAuth, async (req, res, next) => {
  try {
    const menuData = await readMenuData();
    res.json({
      success: true,
      data: menuData,
      count: menuData.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/menu/import
 * Import menu data from JSON
 */
app.post("/api/menu/import", requireAuth, csrfProtection, async (req, res, next) => {
  try {
    let data, replace;

    // Handle both JSON and form-data
    if (req.body.data) {
      data = req.body.data;
      replace = req.body.replace === true || req.body.replace === "true";
    } else if (req.body) {
      // If body is directly the JSON array
      data = req.body;
      replace = false;
    } else {
      return res.status(400).json({
        success: false,
        message: "No data provided",
      });
    }

    let importedItems;
    try {
      importedItems = typeof data === "string" ? JSON.parse(data) : data;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format: " + parseError.message,
      });
    }

    if (!Array.isArray(importedItems)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array of menu items",
      });
    }

    // Validate imported items
    const validItems = [];
    for (const item of importedItems) {
      const validation = validateMenuItem(item);
      if (validation.valid) {
        const validItem = {
          name: sanitizeString(String(item.name || "")),
          category: sanitizeString(String(item.category || "")),
          price: parseFloat(item.price) || 0,
          description: sanitizeString(String(item.description || "")),
        };

        // Preserve tags if present
        if (item.tags) {
          if (Array.isArray(item.tags)) {
            validItem.tags = item.tags
              .filter((tag) => tag && String(tag).trim().length > 0)
              .map((tag) => sanitizeString(String(tag)));
          } else if (typeof item.tags === "string") {
            validItem.tags = item.tags
              .split(",")
              .map((tag) => sanitizeString(tag.trim()))
              .filter((tag) => tag.length > 0);
          }
        }

        // Preserve image if present (Base64 string)
        if (item.image && typeof item.image === "string") {
          const trimmedImage = item.image.trim();
          if (trimmedImage.length > 0) {
            // Validate it's a Base64 data URL (data:image/...) or plain Base64 string
            if (
              trimmedImage.startsWith("data:image/") ||
              trimmedImage.match(/^[A-Za-z0-9+/=]+$/)
            ) {
              validItem.image = trimmedImage;
            }
          }
        }

        // Preserve ID if present and valid (for replace mode)
        if (
          item.id &&
          (typeof item.id === "number" || !isNaN(parseInt(item.id)))
        ) {
          const itemId = parseInt(item.id);
          if (itemId > 0) {
            validItem.id = itemId;
          }
        }

        validItems.push(validItem);
      }
    }

    if (validItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid items found in import data",
      });
    }

    let finalData;
    let existingData = null;

    if (replace === true || replace === "true") {
      // Replace all existing items
      finalData = validItems;
    } else {
      // Merge with existing items
      existingData = await readMenuData();
      finalData = [...existingData, ...validItems];
    }

    // Assign new IDs to imported items that don't have one (optimized)
    // First, get max ID from existing data if not replacing
    let maxId = 0;
    if (replace === true || replace === "true") {
      maxId = getMaxId(validItems);
    } else {
      const existingMaxId = getMaxId(existingData);
      const importedMaxId = getMaxId(validItems);
      maxId = Math.max(existingMaxId, importedMaxId);
    }

    let nextId = maxId + 1;

    // Only assign IDs to items that don't have one
    for (let i = 0; i < finalData.length; i++) {
      if (!finalData[i].id || finalData[i].id <= 0) {
        finalData[i].id = nextId++;
      }
    }

    // Ensure all IDs are unique (handle conflicts)
    const idSet = new Set();
    for (let i = 0; i < finalData.length; i++) {
      if (idSet.has(finalData[i].id)) {
        finalData[i].id = nextId++;
      }
      idSet.add(finalData[i].id);
    }

    const success = await writeMenuData(finalData);
    if (success) {
      res.json({
        success: true,
        message: `Successfully imported ${validItems.length} item${
          validItems.length !== 1 ? "s" : ""
        }`,
        count: validItems.length,
        total: finalData.length,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save imported data",
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// PUBLIC ROUTES
// ============================================================================

/**
 * GET /data.json
 * Public endpoint to get menu data (no auth required)
 */
app.get("/data.json", async (req, res, next) => {
  try {
    const menuData = await readMenuData();
    res.set("Cache-Control", "public, max-age=300");
    res.json(menuData);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// SETTINGS ROUTES
// ============================================================================

/**
 * GET /api/settings
 * Get UI settings (public - for menu display)
 */
app.get("/api/settings", async (req, res, next) => {
  try {
    const settings = await readSettings();
    if (settings) {
      res.set("Cache-Control", "public, max-age=300");
      res.json(settings);
    } else {
      res.status(500).json({ error: "Failed to load settings" });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/settings
 * Update UI settings (protected)
 */
app.put("/api/settings", requireAuth, csrfProtection, async (req, res, next) => {
  try {
    const settings = req.body;

    let filterCategories = getDefaultFilterCategories();
    if (settings.filterCategories && Array.isArray(settings.filterCategories)) {
      filterCategories = settings.filterCategories
        .filter((f) => f && f.category && f.label)
        .map((f) => ({
          category: String(f.category).trim().toLowerCase(),
          label: String(f.label).trim(),
          enabled: Boolean(f.enabled),
        }))
        .filter(
          (f) =>
            f.category &&
            f.label &&
            f.category.length <= 100 &&
            f.label.length <= 100
        );
    }

    const colorRegex = /^#[0-9A-F]{6}$/i;
    const validateColor = (color, defaultColor) => {
      if (!color || typeof color !== "string") return defaultColor;
      return colorRegex.test(color) ? color : defaultColor;
    };

    const clamp = (value, min, max, defaultValue) => {
      const num = parseFloat(value);
      if (isNaN(num)) return defaultValue;
      return Math.max(min, Math.min(max, num));
    };

    const validSettings = {
      primaryColor: validateColor(settings.primaryColor, "#0d3b2e"),
      secondaryColor: validateColor(settings.secondaryColor, "#1a5c4a"),
      textColor: validateColor(settings.textColor, "#ffffff"),
      accentColor: validateColor(settings.accentColor, "#ffd700"),
      headingFontSize: clamp(settings.headingFontSize, 2, 8, 4),
      itemNameSize: clamp(settings.itemNameSize, 1, 3, 1.8),
      descriptionSize: clamp(settings.descriptionSize, 0.7, 1.5, 0.95),
      priceSize: clamp(settings.priceSize, 1, 3, 1.5),
      cardOpacity: clamp(settings.cardOpacity, 0, 1, 0.05),
      gridGap: clamp(settings.gridGap, 0.5, 5, 2),
      filterCategories: filterCategories,
    };

    const success = await writeSettings(validSettings);
    if (success) {
      res.json({
        success: true,
        message: "Settings updated successfully",
        settings: validSettings,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to save settings",
      });
    }
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Health check endpoint
 * GET /health
 * Returns server health status
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "2.0.0",
  });
});

app.use(errorHandler);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// ============================================================================
// SERVER INITIALIZATION
// ============================================================================

/**
 * Start the Express server with error handling
 */
const server = app.listen(PORT, () => {
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
    // Development logging
    console.log("=".repeat(50));
    console.log("🚀 Lorem Ipsum Admin Server Started");
    console.log("=".repeat(50));
    console.log(`📊 Admin panel: http://localhost:${PORT}/loginadminonly.html`);
    console.log(`🏠 Main website: http://localhost:${PORT}/index.html`);
    console.log(`🔐 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`✅ Environment variables loaded successfully`);
    console.log(`⚡ Compression: Enabled`);
    console.log(`💾 Caching: Enabled (${cache.CACHE_TTL}ms TTL)`);
    console.log("=".repeat(50));
  } else {
    // Production logging (minimal)
    console.log(`Server started on port ${PORT}`);
    console.log(`Environment: production`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  }
});

// Handle server errors (e.g., port already in use)
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("=".repeat(50));
    console.error("❌ ERROR: Port " + PORT + " is already in use!");
    console.error("=".repeat(50));
    console.error("Please either:");
    console.error("  1. Stop the process using port " + PORT);
    console.error(
      "  2. Use a different port by setting PORT environment variable"
    );
    console.error("");
    console.error("To find and kill the process on Windows:");
    console.error(`  netstat -ano | findstr :${PORT}`);
    console.error(`  taskkill /PID <PID> /F`);
    console.error("=".repeat(50));
    process.exit(1);
  } else {
    console.error("Server error:", error);
    process.exit(1);
  }
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("\nSIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});
