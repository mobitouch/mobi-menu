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

app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "lorem-ipsum-secret-key-2025-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
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
      console.error("Invalid menu data format, returning empty array");
      return [];
    }

    cache.menuData = parsed;
    cache.menuDataTimestamp = now;
    // Update max ID cache
    cache.maxId = getMaxId(parsed);
    cache.maxIdTimestamp = now;

    return parsed;
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, return empty array and create file
      await writeMenuData([]);
      return [];
    }
    console.error("Error reading menu data:", error);
    // Return cached data if available, otherwise empty array
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

/**
 * Write menu data to file and invalidate cache
 * @param {Array} data - Array of menu items to write
 * @returns {Promise<boolean>} Promise resolving to success status
 */
async function writeMenuData(data) {
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

    return true;
  } catch (error) {
    console.error("Error writing menu data:", error);
    try {
      await fs.unlink(`${DATA_FILE}.tmp`);
    } catch (unlinkError) {
      // Ignore cleanup errors
    }
    return false;
  }
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
    console.error("Error reading settings:", error);
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
  try {
    if (!data || typeof data !== "object") {
      throw new Error("Settings must be an object");
    }

    const tempFile = `${SETTINGS_FILE}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tempFile, SETTINGS_FILE);

    cache.settings = null;
    cache.settingsTimestamp = 0;

    return true;
  } catch (error) {
    console.error("Error writing settings:", error);
    try {
      await fs.unlink(`${SETTINGS_FILE}.tmp`);
    } catch (unlinkError) {
      // Ignore cleanup errors
    }
    return false;
  }
}

/**
 * Centralized error handler middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  console.error("Error:", err);

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
 * Validate menu item data
 * @param {Object} item - Menu item object to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
function validateMenuItem(item) {
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
  if (item.name.length > 200) {
    return { valid: false, error: "Item name must be 200 characters or less" };
  }
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
  if (item.category.length > 100) {
    return { valid: false, error: "Category must be 100 characters or less" };
  }
  if (
    typeof item.price !== "number" ||
    isNaN(item.price) ||
    item.price < 0 ||
    item.price > 500
  ) {
    return { valid: false, error: "Price must be a number between 0 and 500" };
  }
  if (
    item.description &&
    (typeof item.description !== "string" || item.description.length > 1000)
  ) {
    return {
      valid: false,
      error: "Description must be a string with 1000 characters or less",
    };
  }
  return { valid: true };
}

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

/**
 * POST /api/auth/login
 * Authenticate admin user with password
 */
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    if (password === ADMIN_PASSWORD) {
      req.session.isAuthenticated = true;
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, message: "Incorrect password" });
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
  res.json({ isAuthenticated: !!req.session.isAuthenticated });
});

// ============================================================================
// MENU CRUD ROUTES (Protected)
// ============================================================================

/**
 * GET /api/menu
 * Get all menu items (admin only)
 */
app.get("/api/menu", requireAuth, async (req, res, next) => {
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
app.post("/api/menu", requireAuth, async (req, res, next) => {
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
      name: String(name || "").trim(),
      category: String(category || "").trim(),
      price: parseFloat(price),
      description: String(description || "").trim(),
      tags: tagsArray,
      image: image || null, // Store base64 image or null
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
app.put("/api/menu/:id", requireAuth, async (req, res, next) => {
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
      name: String(name || "").trim(),
      category: String(category || "").trim(),
      price: parseFloat(price),
      description: String(description || "").trim(),
      tags: tagsArray,
      image: image !== undefined ? image : existingItem?.image || null, // Keep existing image if not provided
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
app.delete("/api/menu/:id", requireAuth, async (req, res, next) => {
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
app.post("/api/menu/import", requireAuth, async (req, res, next) => {
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
          name: String(item.name || "").trim(),
          category: String(item.category || "").trim(),
          price: parseFloat(item.price) || 0,
          description: String(item.description || "").trim(),
        };

        // Preserve tags if present
        if (item.tags) {
          if (Array.isArray(item.tags)) {
            validItem.tags = item.tags
              .filter((tag) => tag && String(tag).trim().length > 0)
              .map((tag) => String(tag).trim());
          } else if (typeof item.tags === "string") {
            validItem.tags = item.tags
              .split(",")
              .map((tag) => tag.trim())
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
app.put("/api/settings", requireAuth, async (req, res, next) => {
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
