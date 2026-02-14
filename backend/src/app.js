import express from "express";
import cors from "cors";

import incidentsRouter from "./routes/incidents.routes.js";
import { config } from "../config.js";

const app = express();

app.use(
  cors({
    origin: config.server.corsOrigin,
  }),
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/incidents", incidentsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
