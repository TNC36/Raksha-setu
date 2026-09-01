import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Phone, Plus, Pencil, Trash2, X } from "lucide-react";
import { isAdminLoggedIn, loadHelplines, saveHelplines } from "../../utils/storage";
import { Helpline } from "../../data/helplines";

const EMPTY_FORM = { name: "", phone: "" };

export default function ManageHelplines() {
  const navigate = useNavigate();
  const [helplines, setHelplines] = useState<Helpline[]>([]);
  const [editing, setEditing] = useState<Helpline | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setHelplines(loadHelplines());
  }, [navigate]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    let updated: Helpline[];
    if (editing) {
      updated = helplines.map((h) =>
        h.id === editing.id ? { ...h, name: form.name, phone: form.phone } : h
      );
    } else {
      updated = [
        ...helplines,
        { id: `hl-${Date.now()}`, name: form.name, phone: form.phone },
      ];
    }
    saveHelplines(updated);
    setHelplines(updated);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string) {
    const updated = helplines.filter((h) => h.id !== id);
    saveHelplines(updated);
    setHelplines(updated);
  }

  function handleEdit(hl: Helpline) {
    setEditing(hl);
    setForm({ name: hl.name, phone: hl.phone });
    setShowForm(true);
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-neutral-600" />
            Manage Helplines
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {helplines.length} helplines total
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
          Add Helpline
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900">
                {editing ? "Edit Helpline" : "Add Helpline"}
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
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  required
                />
              </div>

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
                  {editing ? "Update" : "Add"} Helpline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Helplines list */}
      <div className="space-y-2">
        {helplines.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-sm">
              No helplines yet. Add one to get started.
            </p>
          </div>
        ) : (
          helplines.map((hl) => (
            <div
              key={`hl-${hl.id}`}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-neutral-500" strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {hl.name}
                </p>
                <p className="text-lg font-semibold text-neutral-700">
                  {hl.phone}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEdit(hl)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(hl.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-neutral-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
