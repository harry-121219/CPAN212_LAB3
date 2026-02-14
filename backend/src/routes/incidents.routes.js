import express from "express";
import multer from "multer";

import {
  listAll,
  findById,
  createIncident,
  updateStatus,
  archiveIncident,
  resetArchivedIncident,
} from "../store/incidents.store.js";
import { parseCsvBuffer } from "../utils/csv.js";
import {
  validateCreateIncident,
  validateStatusChange,
  validateArchive,
  validateReset,
} from "../utils/validate.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get("/", (req, res) => {
  const includeArchived = req.query.includeArchived === "true";
  res.json(listAll(includeArchived));
});

router.get("/:id", (req, res) => {
  const incident = findById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json(incident);
});

router.post("/", async (req, res) => {
  try {
    const result = validateCreateIncident(req.body);
    if (!result.ok) {
      return res.status(400).json({ error: result.errors });
    }

    const incident = await createIncident(result.value);
    res.status(201).json(incident);
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: "Failed to create incident" });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const incident = findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    const check = validateStatusChange(incident.status, req.body.status);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const updated = await updateStatus(incident.id, check.next);
    res.json(updated);
  } catch (error) {
    console.error("Error updating incident status:", error);
    res.status(500).json({ error: "Failed to update incident status" });
  }
});

router.post("/:id/archive", async (req, res) => {
  try {
    const incident = findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    const check = validateArchive(incident.status);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const archived = await archiveIncident(incident.id);
    if (!archived) {
      return res.status(400).json({ error: "Failed to archive incident" });
    }

    res.json(archived);
  } catch (error) {
    console.error("Error archiving incident:", error);
    res.status(500).json({ error: "Failed to archive incident" });
  }
});

router.post("/:id/reset", async (req, res) => {
  try {
    const incident = findById(req.params.id);
    if (!incident) return res.status(404).json({ error: "Incident not found" });

    const check = validateReset(incident.status);
    if (!check.ok) return res.status(400).json({ error: check.error });

    const reset = await resetArchivedIncident(incident.id);
    if (!reset) {
      return res.status(400).json({ error: "Failed to reset incident" });
    }

    res.json(reset);
  } catch (error) {
    console.error("Error resetting incident:", error);
    res.status(500).json({ error: "Failed to reset incident" });
  }
});

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const records = await parseCsvBuffer(req.file.buffer);

    let created = 0;
    let skipped = 0;

    for (const row of records) {
      const result = validateCreateIncident(row);
      if (!result.ok) {
        skipped++;
        continue;
      }
      await createIncident(result.value);
      created++;
    }

    res.json({
      totalRows: records.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("Error during bulk upload:", error);
    res.status(500).json({ error: "Failed to process bulk upload" });
  }
});

export default router;
