import { config } from "../../config.js";

export const categories = config.incidents.categories;
export const severities = config.incidents.severities;

/**
 * Validates incident creation data
 * @param {Object} body - The request body containing incident data
 * @returns {Object} Validation result with ok, errors, and value properties
 *
 * Purpose: Ensures that incident data meets all validation requirements before creation
 * Usage: Called before creating a new incident in the routes
 *
 * The function validates:
 * - Title: must exist and meet minimum/maximum length requirements
 * - Description: must exist and meet minimum/maximum length requirements
 * - Category: must be one of the allowed categories from config
 * - Severity: must be one of the allowed severities from config
 *
 * Returns an object with:
 * - ok: boolean indicating if validation passed
 * - errors: array of error messages (empty if ok is true)
 * - value: sanitized/validated data object
 */
export function validateCreateIncident(body) {
  const errors = [];

  if (!body.title || typeof body.title !== "string") {
    errors.push("Title is required");
  } else if (body.title.length < config.validation.title.minLength) {
    errors.push(
      `Title must be at least ${config.validation.title.minLength} characters`,
    );
  } else if (body.title.length > config.validation.title.maxLength) {
    errors.push(
      `Title must not exceed ${config.validation.title.maxLength} characters`,
    );
  }

  if (!body.description || typeof body.description !== "string") {
    errors.push("Description is required");
  } else if (
    body.description.length < config.validation.description.minLength
  ) {
    errors.push(
      `Description must be at least ${config.validation.description.minLength} characters`,
    );
  } else if (
    body.description.length > config.validation.description.maxLength
  ) {
    errors.push(
      `Description must not exceed ${config.validation.description.maxLength} characters`,
    );
  }

  if (!categories.includes(body.category)) {
    errors.push(`Invalid category. Must be one of: ${categories.join(", ")}`);
  }

  if (!severities.includes(body.severity)) {
    errors.push(`Invalid severity. Must be one of: ${severities.join(", ")}`);
  }

  return {
    ok: errors.length === 0,
    errors,
    value: {
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity,
    },
  };
}

/**
 * Validates a status transition
 * @param {string} current - The current status of the incident
 * @param {string} next - The requested new status
 * @returns {Object} Validation result with ok, error, and next properties
 *
 * Purpose: Ensures status changes follow the allowed workflow transitions
 * Usage: Called before updating an incident's status
 *
 * The function:
 * 1. Looks up allowed transitions for the current status in config
 * 2. Checks if the requested next status is allowed
 * 3. Returns validation result
 *
 * Status transition rules (from config):
 * - OPEN → INVESTIGATING, ARCHIVED
 * - INVESTIGATING → RESOLVED
 * - RESOLVED → ARCHIVED
 * - ARCHIVED → OPEN
 */
export function validateStatusChange(current, next) {
  const transitions = config.incidents.statusTransitions;

  // Check if current status exists in transitions
  if (!transitions[current]) {
    return { ok: false, error: `Invalid current status: ${current}` };
  }

  // Check if next status is allowed from current status
  if (!transitions[current].includes(next)) {
    return {
      ok: false,
      error: `Invalid status transition from ${current} to ${next}. Allowed: ${transitions[current].join(", ")}`,
    };
  }

  return { ok: true, next };
}

/**
 * Validates if an incident can be archived
 * @param {string} currentStatus - The current status of the incident
 * @returns {Object} Validation result with ok and error properties
 *
 * Purpose: Ensures only OPEN or RESOLVED incidents can be archived
 * Usage: Called before archiving an incident
 */
export function validateArchive(currentStatus) {
  if (currentStatus !== "OPEN" && currentStatus !== "RESOLVED") {
    return {
      ok: false,
      error: "Only incidents in OPEN or RESOLVED status can be archived",
    };
  }
  return { ok: true };
}

/**
 * Validates if an archived incident can be reset
 * @param {string} currentStatus - The current status of the incident
 * @returns {Object} Validation result with ok and error properties
 *
 * Purpose: Ensures only ARCHIVED incidents can be reset to OPEN
 * Usage: Called before resetting an incident
 */
export function validateReset(currentStatus) {
  if (currentStatus !== "ARCHIVED") {
    return {
      ok: false,
      error: "Only archived incidents can be reset to OPEN status",
    };
  }
  return { ok: true };
}
