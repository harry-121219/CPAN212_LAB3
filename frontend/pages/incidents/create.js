import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { createIncident } from "../../services/api";

const CATEGORIES = ["IT", "SAFETY", "FACILITIES", "OTHER"];
const SEVERITIES = ["LOW", "MEDIUM", "HIGH"];

export default function CreateIncident() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("IT");
  const [severity, setSeverity] = useState("LOW");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const validation = useMemo(() => {
    const errors = [];
    if (title.trim().length < 5) errors.push("Title must be at least 5 characters");
    if (description.trim().length < 10) errors.push("Description must be at least 10 characters");
    if (!CATEGORIES.includes(category)) errors.push("Invalid category");
    if (!SEVERITIES.includes(severity)) errors.push("Invalid severity");
    return { ok: errors.length === 0, errors };
  }, [title, description, category, severity]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!validation.ok) return;

    try {
      setSaving(true);
      setErr("");
      const created = await createIncident({
        title: title.trim(),
        description: description.trim(),
        category,
        severity
      });
      router.push(`/incidents/${created.id}`);
    } catch (e2) {
      setErr(e2.details ? `${e2.message}: ${e2.details.join(", ")}` : e2.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Create Incident">
      <ErrorBanner message={err} />

      {!validation.ok && (
        <div className="warn-box">
          <div className="warn-title">Fix these issues before saving:</div>
          <ul>
            {validation.errors.map((x, idx) => <li key={idx}>{x}</li>)}
          </ul>
        </div>
      )}

      <form className="form" onSubmit={onSubmit}>
        <label className="label">
          Title
          <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label className="label">
          Description
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <div className="grid2">
          <label className="label">
            Category
            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>

          <label className="label">
            Severity
            <select className="select" value={severity} onChange={(e) => setSeverity(e.target.value)}>
              {SEVERITIES.map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </label>
        </div>

        <div className="row">
          <button className="btn" type="submit" disabled={!validation.ok || saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push("/incidents")}>
            Cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
