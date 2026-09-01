import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { MapPin, Plus, Pencil, Trash2, X } from "lucide-react";
import { isAdminLoggedIn, loadZones, saveZones } from "../../utils/storage";
import { SafeZone, ZoneStatus } from "../../data/zones";
import { DISASTER_TYPES, DISASTER_META, DisasterType } from "../../data/disasters";

const STATUSES: ZoneStatus[] = ["Available", "Limited", "Full", "Closed"];

const EMPTY_FORM = {
  name: "",
  location: "",
  latitude: 22.3072,
  longitude: 73.1812,
  disasterTypes: ["Flood"] as DisasterType[],
  capacity: 100,
  status: "Available" as ZoneStatus,
};

export default function ManageZones() {
  const navigate = useNavigate();
  const [zones, setZones] = useState<SafeZone[]>([]);
  const [editing, setEditing] = useState<SafeZone | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      navigate("/admin/login", { replace: true });
      return;
    }
    setZones(loadZones());
  }, [navigate]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    const derivedType = DISASTER_META[form.disasterTypes[0]]?.safeZoneLabel || "Shelter";

    let updated: SafeZone[];
    if (editing) {
      updated = zones.map((z) =>
        z.id === editing.id
          ? { ...z, ...form, type: derivedType }
          : z
      );
    } else {
      const newZone: SafeZone = {
        ...form,
        id: `zone-${Date.now()}`,
        type: derivedType,
      };
      updated = [...zones, newZone];
    }
    saveZones(updated);
    setZones(updated);
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string) {
    const updated = zones.filter((z) => z.id !== id);
    saveZones(updated);
    setZones(updated);
  }

  function handleEdit(zone: SafeZone) {
    setEditing(zone);
    setForm({
      name: zone.name,
      location: zone.location,
      latitude: zone.latitude,
      longitude: zone.longitude,
      disasterTypes: zone.disasterTypes,
      capacity: zone.capacity,
      status: zone.status,
    });
    setShowForm(true);
  }

  function toggleDisasterType(dt: DisasterType) {
    setForm((prev) => {
      const has = prev.disasterTypes.includes(dt);
      return {
        ...prev,
        disasterTypes: has
          ? prev.disasterTypes.filter((d) => d !== dt)
          : [...prev.disasterTypes, dt],
      };
    });
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neutral-600" />
            Manage Safe Zones
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {zones.length} zones total
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
          Add Zone
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-neutral-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100">
              <h2 className="text-sm font-semibold text-neutral-900">
                {editing ? "Edit Safe Zone" : "Add Safe Zone"}
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
                  Zone Name *
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
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.latitude}
                    onChange={(e) =>
                      setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={form.longitude}
                    onChange={(e) =>
                      setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Disaster Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {DISASTER_TYPES.map((dt) => {
                    const meta = DISASTER_META[dt];
                    const selected = form.disasterTypes.includes(dt);
                    return (
                      <button
                        key={dt}
                        type="button"
                        onClick={() => toggleDisasterType(dt)}
                        className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                          selected
                            ? "text-white border-transparent"
                            : "bg-white text-neutral-600 border-neutral-200"
                        }`}
                        style={
                          selected
                            ? { backgroundColor: meta.color, borderColor: meta.color }
                            : undefined
                        }
                      >
                        {meta.icon} {dt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm({ ...form, capacity: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value as ZoneStatus })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {editing ? "Update" : "Add"} Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zones list */}
      <div className="space-y-2">
        {zones.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <p className="text-sm">No safe zones yet. Add one to get started.</p>
          </div>
        ) : (
          zones.map((zone) => (
            <div
              key={`zone-${zone.id}`}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex items-start gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  {zone.disasterTypes.map((dt) => (
                    <span
                      key={`${zone.id}-${dt}`}
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: DISASTER_META[dt].color + "10",
                        color: DISASTER_META[dt].color,
                      }}
                    >
                      {DISASTER_META[dt].icon} {dt}
                    </span>
                  ))}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      zone.status === "Available"
                        ? "bg-green-50 text-green-700"
                        : zone.status === "Limited"
                        ? "bg-amber-50 text-amber-700"
                        : zone.status === "Full"
                        ? "bg-red-50 text-red-700"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-neutral-900">
                  {zone.name}
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {zone.type} · {zone.location} · Capacity: {zone.capacity}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleEdit(zone)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(zone.id)}
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
