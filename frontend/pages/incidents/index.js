import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { listIncidents } from "../../services/api";

export default function IncidentsList() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const data = await listIncidents();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout title="Incidents">
      <ErrorBanner message={err} />

      <div className="row">
        <button className="btn" onClick={load}>Refresh</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Reported</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="7" className="muted">No incidents found</td></tr>
            ) : (
              items.map(i => (
                <tr key={i.id}>
                  <td className="mono">{i.id.slice ? i.id.slice(0, 8) : i.id}</td>
                  <td>{i.title}</td>
                  <td><span className="tag">{i.category}</span></td>
                  <td>
                    <span className={`tag ${i.severity === "HIGH" ? "tag-danger" : i.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                      {i.severity}
                    </span>
                  </td>
                  <td><span className="tag">{i.status}</span></td>
                  <td className="mono">{(i.reportedAt || "").slice(0, 19).replace("T", " ")}</td>
                  <td><a className="link" href={`/incidents/${i.id}`}>View</a></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
