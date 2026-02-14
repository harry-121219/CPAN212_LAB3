export const config = {
  server: {
    port: 3001,
    host: "localhost",
    corsOrigin: "http://localhost:3000",
  },

  storage: {
    incidentsFilePath: "./data/incidents.json",

    autoSave: true,

    enableBackup: false,
    backupInterval: 3600000,
  },

  incidents: {
    statuses: ["OPEN", "INVESTIGATING", "RESOLVED", "ARCHIVED"],

    statusTransitions: {
      OPEN: ["INVESTIGATING", "ARCHIVED"],
      INVESTIGATING: ["RESOLVED"],
      RESOLVED: ["ARCHIVED"],
      ARCHIVED: ["OPEN"],
    },

    categories: ["IT", "SAFETY", "FACILITIES", "OTHER"],

    severities: ["LOW", "MEDIUM", "HIGH"],
  },

  validation: {
    title: {
      minLength: 5,
      maxLength: 200,
    },
    description: {
      minLength: 10,
      maxLength: 2000,
    },
  },

  bulkUpload: {
    maxFileSize: 5242880,
    allowedMimeTypes: ["text/csv", "application/vnd.ms-excel"],
  },

  dashboard: {
    showArchivedByDefault: false,
  },
};
