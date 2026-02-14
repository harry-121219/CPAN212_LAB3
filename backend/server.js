import app from "./src/app.js";
import { initializeStore } from "./src/store/incidents.store.js";
import { config } from "./config.js";

async function startServer() {
  try {
    console.log("Initializing incidents store...");
    await initializeStore();
    console.log("Store initialized successfully");

    const PORT = process.env.PORT || config.server.port;
    app.listen(PORT, () => {
      console.log(
        `IncidentTracker API running on http://${config.server.host}:${PORT}`,
      );
      console.log(`Data file: ${config.storage.incidentsFilePath}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
