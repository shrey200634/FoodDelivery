import { useState, useEffect } from "react";
import { MapPin, Plus, Pencil, Trash2, X, Loader2, Home, Briefcase, Navigation } from "lucide-react";
import toast from "react-hot-toast";
import { useAddressStore } from "../store/addressStore";

const LABELS = [
  { value: "HOME", label: "Home", icon: Home },
  { value: "WORK", label: "Work", icon: Briefcase },
  { value: "OTHER", label: "Other", icon: Navigation },
];
const empty = { label: "HOME", street: "", city: "", state: "", pincode: "", latitude: 0, longitude: 0 };

export default function AddressesPage() {
  const { addresses, loading, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => { setForm(empty); setEditingId(null); setShowModal(true); };
  const openEdit = (a) => {
    setForm({ label: a.label || "HOME", street: a.street || "", city: a.city || "", state: a.state || "", pincode: a.pincode || "", latitude: a.latitude || 0, longitude: a.longitude || 0 });
    setEditingId(a.addressId); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.street || !form.city) return toast.error("Street and city are required");
    setSaving(true);
    try {
      if (editingId) { await updateAddress(editingId, form); toast.success("Address updated"); }
      else { await addAddress(form); toast.success("Address added"); }
      setShowModal(false);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this address?")) return;
    try { await deleteAddress(id); toast.success("Address deleted"); } catch { toast.error("Failed to delete"); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--color-sand)", background: "#fff", fontSize: "0.9rem",
    fontFamily: "var(--font-sans)", color: "var(--color-charcoal)", outline: "none",
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", animation: "fade-up 0.4s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>My Addresses</h1>
        <button onClick={openAdd} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 99, border: "none",
          background: "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
          color: "#fff", fontSize: "0.85rem", fontWeight: 600, fontFamily: "var(--font-sans)", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(249,107,22,0.25)",
        }}><Plus size={16} /> Add address</button>
      </div>

      {loading && !addresses.length ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--color-stone-lighter)" }}>
          <Loader2 size={28} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px", display: "block" }} />
          Loading addresses...
        </div>
      ) : addresses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "#fff", borderRadius: 14, border: "1.5px dashed var(--color-sand)" }}>
          <MapPin size={36} style={{ color: "var(--color-stone-lighter)", margin: "0 auto 12px", display: "block" }} />
          <p style={{ fontWeight: 600, marginBottom: 4 }}>No saved addresses</p>
          <p style={{ fontSize: "0.85rem", color: "var(--color-stone-lighter)" }}>Add a delivery address to get started</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {addresses.map((addr, i) => {
            const info = LABELS.find((l) => l.value === addr.label) || LABELS[2];
            const Icon = info.icon;
            return (
              <div key={addr.addressId || i} style={{
                background: "#fff", borderRadius: 14, border: "1px solid var(--color-sand-light)",
                padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 14,
                animation: "fade-up 0.3s ease-out " + (i * 0.05) + "s both",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, background: "var(--color-brand-50)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}><Icon size={18} style={{ color: "var(--color-brand-600)" }} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 4 }}>{info.label}</div>
                  <p style={{ fontSize: "0.85rem", color: "var(--color-stone-light)", lineHeight: 1.5 }}>
                    {[addr.street, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => openEdit(addr)} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid var(--color-sand)",
                    background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Pencil size={14} style={{ color: "var(--color-stone-light)" }} /></button>
                  <button onClick={() => handleDelete(addr.addressId)} style={{
                    width: 34, height: 34, borderRadius: 8, border: "1px solid var(--color-sand)",
                    background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  }}><Trash2 size={14} style={{ color: "var(--color-error)" }} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24, animation: "fade-in 0.2s ease-out",
        }} onClick={() => setShowModal(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, padding: 28,
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)", animation: "scale-in 0.2s ease-out",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{editingId ? "Edit address" : "Add new address"}</h3>
              <button onClick={() => setShowModal(false)} style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: "var(--color-sand-light)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}><X size={16} style={{ color: "var(--color-stone)" }} /></button>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {LABELS.map((l) => (
                <button key={l.value} onClick={() => setForm({ ...form, label: l.value })} style={{
                  flex: 1, padding: "8px", borderRadius: "var(--radius-md)",
                  border: "1.5px solid " + (form.label === l.value ? "var(--color-brand-500)" : "var(--color-sand)"),
                  background: form.label === l.value ? "var(--color-brand-50)" : "#fff",
                  cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.8rem", fontWeight: 600,
                  color: form.label === l.value ? "var(--color-brand-700)" : "var(--color-stone)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}><l.icon size={14} /> {l.label}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input value={form.street} onChange={set("street")} placeholder="Street address" style={inputStyle} />
              <div style={{ display: "flex", gap: 12 }}>
                <input value={form.city} onChange={set("city")} placeholder="City" style={inputStyle} />
                <input value={form.state} onChange={set("state")} placeholder="State" style={inputStyle} />
              </div>
              <input value={form.pincode} onChange={set("pincode")} placeholder="Pincode" style={inputStyle} />
            </div>

            <button onClick={handleSave} disabled={saving} style={{
              width: "100%", padding: "12px", marginTop: 24, borderRadius: "var(--radius-md)", border: "none",
              background: saving ? "var(--color-stone-lighter)" : "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
              color: "#fff", fontSize: "0.9rem", fontWeight: 600, fontFamily: "var(--font-sans)",
              cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : (editingId ? "Update address" : "Save address")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
