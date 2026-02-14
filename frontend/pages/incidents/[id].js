import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import {
  changeIncidentStatus,
  getIncident,
  archiveIncident,
  resetIncident,
} from "../../services/api";

const STATUS_FLOW = {
  OPEN: ["INVESTIGATING"],
  INVESTIGATING: ["RESOLVED"],
  RESOLVED: [],
  ARCHIVED: [],
};

export default function IncidentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setErr("");
      const data = await getIncident(id);
      setItem(data);

      const allowed = STATUS_FLOW[data.status] || [];
      setNextStatus(allowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  const allowedNext = useMemo(() => {
    if (!item) return [];
    return STATUS_FLOW[item.status] || [];
  }, [item]);

  async function onUpdateStatus() {
    if (!item || !nextStatus) return;
    try {
      setUpdating(true);
      setErr("");
      const updated = await changeIncidentStatus(item.id, nextStatus);
      setItem(updated);
      const newAllowed = STATUS_FLOW[updated.status] || [];
      setNextStatus(newAllowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  async function onArchive() {
    if (!item) return;
    try {
      setArchiving(true);
      setErr("");
      const archived = await archiveIncident(item.id);
      setItem(archived);
      setNextStatus("");
    } catch (e) {
      setErr(e.message);
    } finally {
      setArchiving(false);
    }
  }

  async function onReset() {
    if (!item) return;
    try {
      setResetting(true);
      setErr("");
      const reset = await resetIncident(item.id);
      setItem(reset);
      const newAllowed = STATUS_FLOW[reset.status] || [];
      setNextStatus(newAllowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setResetting(false);
    }
  }

  const canArchive =
    item && (item.status === "OPEN" || item.status === "RESOLVED");

  const canReset = item && item.status === "ARCHIVED";

  return (
    <Layout title="Incident Details">
      <ErrorBanner message={err} />

      {loading && <div className="muted">Loading...</div>}

      {!loading && item && (
        <div className="panel">
          <div className="panel-title">{item.title}</div>
          <div className="panel-body">
            {/* Incident Metadata */}
            <div className="meta">
              <div>
                <strong>ID:</strong> <span className="mono">{item.id}</span>
              </div>
              <div>
                <strong>Category:</strong>{" "}
                <span className="tag">{item.category}</span>
              </div>
              <div>
                <strong>Severity:</strong>{" "}
                <span
                  className={`tag ${item.severity === "HIGH" ? "tag-danger" : item.severity === "MEDIUM" ? "tag-warn" : ""}`}
                >
                  {item.severity}
                </span>
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={`tag ${item.status === "ARCHIVED" ? "tag-muted" : ""}`}
                >
                  {item.status}
                </span>
              </div>
              <div>
                <strong>Reported:</strong>{" "}
                <span className="mono">
                  {(item.reportedAt || "").slice(0, 19).replace("T", " ")}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="section">
              <div className="section-title">Description</div>
              <div className="box">{item.description}</div>
            </div>

            {/* Status Update Section (only for non-archived incidents with transitions) */}
            {item.status !== "ARCHIVED" && allowedNext.length > 0 && (
              <div className="section">
                <div className="section-title">Update Status</div>
                <div className="row">
                  <select
                    className="select"
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                  >
                    {allowedNext.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn"
                    onClick={onUpdateStatus}
                    disabled={!nextStatus || updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            )}

            {/* Archive Button (for OPEN and RESOLVED incidents) */}
            {canArchive && (
              <div className="section">
                <div className="section-title">Archive Incident</div>
                <button
                  className="btn btn-secondary"
                  onClick={onArchive}
                  disabled={archiving}
                >
                  {archiving ? "Archiving..." : "Archive"}
                </button>
              </div>
            )}

            {/* Reset Button (for ARCHIVED incidents) */}
            {canReset && (
              <div className="section">
                <div className="section-title">Reset to Open</div>
                <p className="muted">
                  This will restore the incident back to OPEN status.
                </p>
                <button className="btn" onClick={onReset} disabled={resetting}>
                  {resetting ? "Resetting..." : "Reset to Open"}
                </button>
              </div>
            )}

            {/* No Actions Available Message */}
            {!canArchive && !canReset && allowedNext.length === 0 && (
              <div className="muted">
                No further actions available for this incident.
              </div>
            )}

            {/* Back Button */}
            <div className="row" style={{ marginTop: "1rem" }}>
              <button
                className="btn btn-secondary"
                onClick={() => router.push("/incidents")}
              >
                Back to list
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && !item && !err && (
        <div className="muted">No incident selected.</div>
      )}
    </Layout>
  );
}
