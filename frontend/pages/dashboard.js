import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import ErrorBanner from "../components/ErrorBanner";
import { listIncidents } from "../services/api";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  /**
   * Loads incidents from the API
   * Uses showArchived state to determine whether to include archived incidents
   */
  async function loadIncidents() {
    try {
      setErr("");
      const data = await listIncidents(showArchived);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    }
  }

  // Load incidents on mount and when showArchived changes
  useEffect(() => {
    loadIncidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  /**
   * Calculates statistics from incident data
   * Memoized to avoid recalculation on every render
   */
  const stats = useMemo(() => {
    const total = items.length;
    const open = items.filter((x) => x.status === "OPEN").length;
    const investigating = items.filter(
      (x) => x.status === "INVESTIGATING",
    ).length;
    const resolved = items.filter((x) => x.status === "RESOLVED").length;
    const archived = items.filter((x) => x.status === "ARCHIVED").length;
    const high = items.filter((x) => x.severity === "HIGH").length;
    return { total, open, investigating, resolved, archived, high };
  }, [items]);

  return (
    <Layout title="Dashboard">
      <ErrorBanner message={err} />

      {/* Archive Filter Checkbox */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
          />
          <span>Show Archived Incidents</span>
        </label>
      </div>

      {/* KPI Cards */}
      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Total</div>
          <div className="kpi-value">{stats.total}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open</div>
          <div className="kpi-value">{stats.open}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Investigating</div>
          <div className="kpi-value">{stats.investigating}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Resolved</div>
          <div className="kpi-value">{stats.resolved}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Archived</div>
          <div className="kpi-value">{stats.archived}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">High Severity</div>
          <div className="kpi-value">{stats.high}</div>
        </div>
      </div>

      {/* Status Columns */}
      <div className="grid3">
        <StatusColumn
          title="OPEN"
          items={items.filter((x) => x.status === "OPEN")}
        />
        <StatusColumn
          title="INVESTIGATING"
          items={items.filter((x) => x.status === "INVESTIGATING")}
        />
        <StatusColumn
          title="RESOLVED"
          items={items.filter((x) => x.status === "RESOLVED")}
        />
      </div>

      {/* Archived Column (only shown when showArchived is true) */}
      {showArchived && (
        <div style={{ marginTop: "1rem" }}>
          <StatusColumn
            title="ARCHIVED"
            items={items.filter((x) => x.status === "ARCHIVED")}
          />
        </div>
      )}
    </Layout>
  );
}

/**
 * StatusColumn Component
 *
 * Purpose: Displays a panel with incidents of a specific status
 * @param {string} title - The status name for the column header
 * @param {Array} items - The incidents to display in this column
 *
 * Shows:
 * - Column header with status name and count
 * - List of incident cards with title, tags, and link to details
 * - "No incidents" message if empty
 */
function StatusColumn({ title, items }) {
  return (
    <div className="panel">
      <div className="panel-title">
        {title} ({items.length})
      </div>
      <div className="panel-body">
        {items.length === 0 ? (
          <div className="muted">No incidents</div>
        ) : (
          items.map((x) => (
            <div key={x.id} className="card">
              <div className="card-title">{x.title}</div>
              <div className="card-meta">
                <span className="tag">{x.category}</span>
                <span
                  className={`tag ${x.severity === "HIGH" ? "tag-danger" : x.severity === "MEDIUM" ? "tag-warn" : ""}`}
                >
                  {x.severity}
                </span>
              </div>
              <a className="link" href={`/incidents/${x.id}`}>
                Open
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
