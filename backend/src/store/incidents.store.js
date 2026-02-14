/**
 * Incidents Store Module
 * Manages all CRUD operations for incident records with JSON file persistence.
 * This module handles reading from and writing to a JSON file for data storage.
 */

import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";
import { config } from "../../config.js";

// In-memory cache of incidents for performance
let incidents = [];
let isInitialized = false;

/**
 * Ensures the data directory exists
 * Creates the directory if it doesn't exist
 */
async function ensureDataDirectory() {
  const dir = path.dirname(config.storage.incidentsFilePath);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

/**
 * Initializes the store by loading data from the JSON file
 * If the file doesn't exist, it creates an empty incidents array
 * This function must be called before any other store operations
 */
export async function initializeStore() {
  if (isInitialized) return;

  await ensureDataDirectory();

  try {
    const data = await fs.readFile(config.storage.incidentsFilePath, "utf-8");
    incidents = JSON.parse(data);
    console.log(`Loaded ${incidents.length} incidents from file`);
  } catch (error) {
    if (error.code === "ENOENT") {
      // File doesn't exist, start with empty array
      incidents = [];
      await saveToFile();
      console.log("Created new incidents data file");
    } else {
      console.error("Error reading incidents file:", error);
      incidents = [];
    }
  }

  isInitialized = true;
}

/**
 * Saves the current incidents array to the JSON file
 * Uses pretty-printing (2 space indent) for readability
 * Throws error if save fails
 */
async function saveToFile() {
  try {
    await ensureDataDirectory();
    const data = JSON.stringify(incidents, null, 2);
    await fs.writeFile(config.storage.incidentsFilePath, data, "utf-8");
  } catch (error) {
    console.error("Error saving incidents to file:", error);
    throw new Error("Failed to save incidents data");
  }
}

/**
 * Lists all incidents
 * @param {boolean} includeArchived - Whether to include archived incidents in the results
 * @returns {Array} Array of incident objects
 *
 * Purpose: Retrieves all incidents, with optional filtering of archived incidents
 * Usage: Called by the GET /api/incidents endpoint
 */
export function listAll(includeArchived = false) {
  if (includeArchived) {
    return incidents;
  }
  // Filter out archived incidents unless explicitly requested
  return incidents.filter((i) => i.status !== "ARCHIVED");
}

/**
 * Finds a specific incident by ID
 * @param {string} id - The UUID of the incident
 * @returns {Object|undefined} The incident object or undefined if not found
 *
 * Purpose: Retrieves a single incident by its unique identifier
 * Usage: Called by GET /api/incidents/:id and other functions that need to access a specific incident
 */
export function findById(id) {
  return incidents.find((i) => i.id === id);
}

/**
 * Creates a new incident
 * @param {Object} data - The incident data (title, description, category, severity)
 * @returns {Object} The created incident with generated id, status, and timestamp
 *
 * Purpose: Creates a new incident record with auto-generated ID and metadata
 * Usage: Called by POST /api/incidents endpoint
 *
 * The function:
 * 1. Generates a unique UUID for the incident
 * 2. Sets the initial status to "OPEN"
 * 3. Records the current timestamp
 * 4. Adds the incident to the in-memory array
 * 5. Saves to file if auto-save is enabled
 */
export async function createIncident(data) {
  const incident = {
    id: randomUUID(),
    ...data,
    status: "OPEN",
    reportedAt: new Date().toISOString(),
  };

  incidents.push(incident);

  if (config.storage.autoSave) {
    await saveToFile();
  }

  return incident;
}

/**
 * Updates the status of an incident
 * @param {string} id - The UUID of the incident
 * @param {string} status - The new status value
 * @returns {Object|null} The updated incident or null if not found
 *
 * Purpose: Changes the status of an existing incident
 * Usage: Called by PATCH /api/incidents/:id/status endpoint
 *
 * The function:
 * 1. Finds the incident by ID
 * 2. Updates its status property
 * 3. Saves to file if auto-save is enabled
 * 4. Returns the updated incident
 */
export async function updateStatus(id, status) {
  const incident = findById(id);
  if (!incident) return null;

  incident.status = status;

  if (config.storage.autoSave) {
    await saveToFile();
  }

  return incident;
}

/**
 * Archives an incident (changes status to ARCHIVED)
 * @param {string} id - The UUID of the incident
 * @returns {Object|null} The archived incident or null if not found/invalid
 *
 * Purpose: Archives an incident that is in OPEN or RESOLVED status
 * Usage: Called by POST /api/incidents/:id/archive endpoint
 *
 * The function:
 * 1. Finds the incident by ID
 * 2. Validates that current status is OPEN or RESOLVED
 * 3. Changes status to ARCHIVED
 * 4. Saves to file
 * 5. Returns the updated incident
 */
export async function archiveIncident(id) {
  const incident = findById(id);
  if (!incident) return null;

  // Can only archive incidents in OPEN or RESOLVED status
  if (incident.status !== "OPEN" && incident.status !== "RESOLVED") {
    return null;
  }

  incident.status = "ARCHIVED";

  if (config.storage.autoSave) {
    await saveToFile();
  }

  return incident;
}

/**
 * Resets an archived incident back to OPEN status
 * @param {string} id - The UUID of the incident
 * @returns {Object|null} The reset incident or null if not found/invalid
 *
 * Purpose: Restores an archived incident back to active status (OPEN)
 * Usage: Called by POST /api/incidents/:id/reset endpoint
 *
 * The function:
 * 1. Finds the incident by ID
 * 2. Validates that current status is ARCHIVED
 * 3. Changes status back to OPEN
 * 4. Saves to file
 * 5. Returns the updated incident
 */
export async function resetArchivedIncident(id) {
  const incident = findById(id);
  if (!incident) return null;

  if (incident.status !== "ARCHIVED") {
    return null;
  }

  incident.status = "OPEN";

  if (config.storage.autoSave) {
    await saveToFile();
  }

  return incident;
}

/**
 * Manually triggers a save to file
 * @returns {Promise<void>}
 *
 * Purpose: Allows manual triggering of file save operation
 * Usage: Can be called when auto-save is disabled or for manual backup
 */
export async function save() {
  await saveToFile();
}
