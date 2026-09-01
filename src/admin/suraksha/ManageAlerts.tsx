import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { AlertTriangle, Plus, Pencil, Trash2, X } from "lucide-react";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";

type AlertSeverity = "Low" | "Medium" | "High" | "Critical";

const SEVERITIES: AlertSeverity[] = ["Low", "Medium", "High", "Critical"];

const EMPTY_FORM = {
  type: "Flood" as DisasterType,
  severity: "Medium" as AlertSeverity,
  title: "",
  description: "",
  location: "",
  latitude: 22.3072,
  longitude: 73.1812,
};

export default function ManageAlerts() {
  const navigate = useNavigate();
  const isAdmin = useQuery(api.admin.checkAdmin);
  const alerts = useQuery(api.alerts.listAll);
  const createAlert = useMutation(api.alerts.create);
  const updateAlert = useMutation(api.alerts.update);
  const deleteAlert = useMutation(api.alerts.remove);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editing, setEditing] = useState<{ _id: string; type: string; severity: string; title: string; description: string; location: string; latitude: number; longitude: number } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/admin/login", { replace: true });
    }
  }, [isAdmin, navigate]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.location.trim()) return;

    if (editing) {
      await updateAlert({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: editing._id as any,
        title: form.title,
        description: form.description,
        severity: form.severity,
      });
    } else {
      await createAlert({
        type: form.type,
        severity: form.severity,
        title: form.title,
        description: form.description,
        location: form.location,
        latitude: form.latitude,
        longitude: form.longitude,
        source: "Admin",
        mode: "demo",
      });
    }
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function handleDelete(id: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteAlert({ id: id as any });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleEdit(alert: any) {
    setEditing(alert);
    setForm({
      type: alert.type,
      severity: alert.severity,
      title: alert.title,
      description: alert.description || "",
      location: alert.location,
      latitude: alert.latitude,
      longitude: alert.longitude,
    });
    setShowForm(true);
  }

  if (isAdmin === undefined || alerts === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-neutral-400">Loading…</div>
      </div>
    );
  }

  if (isAdmin === false) return null;

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-neutral-600" />
            Manage Alerts
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {alerts.length} alerts total · Stored in Convex database
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(EMPTY_FORM);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Alert
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900">
                {editing ? "Edit Alert" : "Add Alert"}
              </h2>
              <button
                onClick={() => { setShowForm(false); setEditing(null); }}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Disaster Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as DisasterType })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    disabled={!!editing}
                  >
                    {DISASTER_TYPES.map((dt) => (
                      <option key={dt} value={dt}>{DISASTER_META[dt].icon} {dt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value as AlertSeverity })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Alert Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditing(null); }}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  {editing ? "Update" : "Add"} Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-sm">No alerts yet. Add one to get started.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const meta = DISASTER_META[alert.type as DisasterType] || DISASTER_META.Flood;
            return (
              <div
                key={`alert-${alert._id}`}
                className="bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: meta.color + "10", color: meta.color }}
                    >
                      {meta.icon} {alert.type}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        alert.severity === "Critical"
                          ? "bg-red-50 text-red-700"
                          : alert.severity === "High"
                          ? "bg-orange-50 text-orange-700"
                          : alert.severity === "Medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      alert.mode === "live" ? "bg-green-50 text-green-600 border border-green-200" : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}>
                      {alert.mode === "live" ? "LIVE" : "DEMO"}
                    </span>
                    {alert.status !== "active" && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-medium bg-neutral-100 text-neutral-500">
                        {alert.status}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-900">{alert.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{alert.location}</p>
                  {alert.description && (
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-2">{alert.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-400">
                    <span>Source: {alert.source}</span>
                    {alert.issuedAt && (
                      <span>Issued: {new Date(alert.issuedAt).toLocaleDateString("en-IN")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(alert)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(alert._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
