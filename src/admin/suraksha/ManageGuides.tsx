import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { BookOpen, Plus, Pencil, Trash2, X } from "lucide-react";
import { isAdminLoggedIn, loadGuides, saveGuides } from "../../utils/storage";
import { Guide } from "../../data/guides";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";

const EMPTY_FORM = {
  type: "Flood" as DisasterType,
  title: "",
  before: "",
  during: "",
  after: "",
};

export default function ManageGuides() {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [editing, setEditing] = useState<Guide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setGuides(loadGuides());
  }, [navigate]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;

    const guide: Guide = {
      id: editing?.id || `guide-${Date.now()}`,
      type: form.type,
      title: form.title,
      before: form.before
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      during: form.during
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      after: form.after
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    let updated: Guide[];
    if (editing) {
      updated = guides.map((g) => (g.id === editing.id ? guide : g));
    } else {
      updated = [...guides, guide];
    }
    saveGuides(updated);
    setGuides(updated);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string) {
    const updated = guides.filter((g) => g.id !== id);
    saveGuides(updated);
    setGuides(updated);
  }

  function handleEdit(guide: Guide) {
    setEditing(guide);
    setForm({
      type: guide.type,
      title: guide.title,
      before: (guide.before || []).join("\n"),
      during: (guide.during || []).join("\n"),
      after: (guide.after || []).join("\n"),
    });
    setShowForm(true);
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neutral-600" />
            Manage Guides
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {guides.length} guides total
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
          Add Guide
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900">
                {editing ? "Edit Guide" : "Add Guide"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="p-1 rounded hover:bg-neutral-100"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Disaster Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as DisasterType })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  >
                    {DISASTER_TYPES.map((dt) => (
                      <option key={dt} value={dt}>
                        {DISASTER_META[dt].icon} {dt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Guide Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                    required
                  />
                </div>
              </div>

              {(["before", "during", "after"] as const).map((phase) => (
                <div key={phase}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1 capitalize">
                    {phase} (one instruction per line)
                  </label>
                  <textarea
                    value={form[phase]}
                    onChange={(e) =>
                      setForm({ ...form, [phase]: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10 resize-none"
                    placeholder={`Enter ${phase} instructions, one per line`}
                  />
                </div>
              ))}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  {editing ? "Update" : "Add"} Guide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guides list */}
      <div className="space-y-2">
        {guides.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-sm">No guides yet. Add one to get started.</p>
          </div>
        ) : (
          guides.map((guide) => {
            const meta = DISASTER_META[guide.type];
            return (
              <div
                key={`guide-${guide.id}`}
                className="bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ backgroundColor: meta.color + "10", color: meta.color }}
                    >
                      {meta.icon} {guide.type}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-900">
                    {guide.title}
                  </p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {(guide.before || []).length} before ·{" "}
                    {(guide.during || []).length} during ·{" "}
                    {(guide.after || []).length} after
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(guide)}
                    className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(guide.id)}
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
