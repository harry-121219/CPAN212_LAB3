const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function handleJson(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) ||
      `Request failed with status ${res.status}`;
    const details = body && body.details ? body.details : null;
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }

  return body;
}

export async function health() {
  const res = await fetch(`${BASE}/health`);
  return handleJson(res);
}

/*
  Lists all incidents
  GET /api/incidents?includeArchived=true/false
  
  Purpose: Retrieves all incidents, optionally including archived ones
  @param {boolean} includeArchived - Whether to include archived incidents
  @returns {Array} Array of incident objects
 */
export async function listIncidents(includeArchived = false) {
  const url = `${BASE}/api/incidents?includeArchived=${includeArchived}`;
  const res = await fetch(url);
  return handleJson(res);
}

export async function getIncident(id) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}`);
  return handleJson(res);
}

export async function createIncident(payload) {
  const res = await fetch(`${BASE}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleJson(res);
}

export async function changeIncidentStatus(id, status) {
  const res = await fetch(
    `${BASE}/api/incidents/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return handleJson(res);
}

export async function bulkUploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/api/incidents/bulk-upload`, {
    method: "POST",
    body: fd,
  });

  return handleJson(res);
}
/*
  Archives an incident
  POST /api/incidents/:id/archive
  
  Purpose: Moves an incident to archived status
  @param {string} id - The incident UUID
  @returns {Object} Archived incident object
 */
export async function archiveIncident(id) {
  const res = await fetch(
    `${BASE}/api/incidents/${encodeURIComponent(id)}/archive`,
    {
      method: "POST",
    },
  );
  return handleJson(res);
}

/*
  Resets an archived incident to OPEN
  POST /api/incidents/:id/reset
  
  Purpose: Restores an archived incident back to active status
  @param {string} id - The incident UUID
  @returns {Object} Reset incident object
 */
export async function resetIncident(id) {
  const res = await fetch(
    `${BASE}/api/incidents/${encodeURIComponent(id)}/reset`,
    {
      method: "POST",
    },
  );
  return handleJson(res);
}
