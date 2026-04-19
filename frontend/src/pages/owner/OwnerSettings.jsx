import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, MapPin, Navigation } from "lucide-react";
import { useOwnerStore } from "../../store/ownerStore";

const TC_SOFT = "#DE6A40";
const TC      = "#C0401E";
const SAFFRON = "#D4882A";

// Reverse-geocode with Nominatim to get coords from address
async function geocodeAddress(address) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

export default function OwnerSettings() {
  const { currentRestaurant, updateRestaurant, createRestaurant, fetchMyRestaurants } = useOwnerStore();
  const isNew = !currentRestaurant;

  const [form, setForm] = useState({
    name: "", description: "", cuisineType: "", address: "",
    phone: "", minOrderAmount: "", imageUrl: "",
    latitude: "", longitude: "",
  });
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (currentRestaurant) {
      setForm({
        name: currentRestaurant.name || "",
        description: currentRestaurant.description || "",
        cuisineType: currentRestaurant.cuisineType || "",
        address: currentRestaurant.address || "",
        phone: currentRestaurant.phone || "",
        minOrderAmount: currentRestaurant.minOrderAmount || "",
        imageUrl: currentRestaurant.imageUrl || "",
        latitude: currentRestaurant.latitude || "",
        longitude: currentRestaurant.longitude || "",
      });
    }
  }, [currentRestaurant?.restaurantId]);

  // Auto-geocode when address changes
  useEffect(() => {
    if (!form.address || form.address.length < 10) return;
    if (form.latitude && form.longitude) return; // already have coords
    const timer = setTimeout(async () => {
      setGeocoding(true);
      const coords = await geocodeAddress(form.address);
      setGeocoding(false);
      if (coords) {
        setForm(p => ({ ...p, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
        toast.success("Location auto-detected from address ✓");
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [form.address]);

  // Get current GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(p => ({
          ...p,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
        setLocating(false);
        toast.success("Location detected! ✓");
      },
      () => { setLocating(false); toast.error("Could not get location"); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error("Restaurant name is required");
    if (!form.cuisineType?.trim()) return toast.error("Cuisine type is required");
    if (!form.address?.trim()) return toast.error("Address is required");

    // Auto-geocode if missing coords
    if (!form.latitude || !form.longitude) {
      toast("Detecting location...", { icon: "📍" });
      const coords = await geocodeAddress(form.address);
      if (coords) {
        form.latitude = coords.lat.toString();
        form.longitude = coords.lng.toString();
      } else {
        return toast.error("Could not find coordinates. Please use 'Detect Location' or enter manually.");
      }
    }

    setSaving(true);
    try {
      if (isNew) {
        await createRestaurant(form);
        await fetchMyRestaurants();
        toast.success("Restaurant created successfully! 🎉");
      } else {
        await updateRestaurant(currentRestaurant.restaurantId, form);
        toast.success("Settings saved!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "Failed to save. Check all required fields.");
    }
    setSaving(false);
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    background: "rgba(255,255,255,0.06)", borderRadius: 10,
    border: "1px solid rgba(255,245,230,0.1)", fontSize: "0.9rem",
    color: "#FFF5E6", fontFamily: "var(--font-sans)", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const Field = ({ label, name, type = "text", placeholder, required }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.1em", color: "rgba(255,245,230,0.4)", marginBottom: 7 }}>
        {label}{required && <span style={{ color: TC_SOFT }}> *</span>}
      </label>
      <input type={type} value={form[name] || ""} onChange={set(name)} placeholder={placeholder}
        style={inputStyle}
        onFocus={e => e.target.style.borderColor = TC_SOFT}
        onBlur={e => e.target.style.borderColor = "rgba(255,245,230,0.1)"} />
    </div>
  );

  const hasCoords = form.latitude && form.longitude;

  return (
    <div style={{ color: "#FFF5E6", animation: "fade-up 0.4s ease-out", maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 500 }}>
          {isNew ? "Register Your Restaurant" : "Restaurant Settings"}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "rgba(255,245,230,0.38)", marginTop: 4 }}>
          {isNew ? "Fill in your restaurant details to get started" : "Update your restaurant details"}
        </p>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Restaurant Name" name="name" placeholder="e.g. Sharma's Kitchen" required />
        <Field label="Description" name="description" placeholder="A short description of your restaurant" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Cuisine Type" name="cuisineType" placeholder="e.g. North Indian" required />
          <Field label="Phone Number" name="phone" placeholder="+91 98765 43210" />
        </div>
        <Field label="Restaurant Image URL" name="imageUrl" placeholder="https://example.com/image.jpg" />
      </Section>

      {/* Location - REQUIRED */}
      <Section title="Location (Required)">
        <Field label="Full Address" name="address" placeholder="Street, City, State, PIN" required />

        {/* Detect location button */}
        <button type="button" onClick={handleDetectLocation} disabled={locating}
          style={{ width: "100%", padding: "11px", borderRadius: 10, marginBottom: 18,
            border: `1.5px dashed ${TC_SOFT}`, background: `${TC}12`, color: TC_SOFT,
            fontSize: "0.88rem", fontWeight: 600, fontFamily: "var(--font-sans)",
            cursor: locating ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {locating
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Detecting...</>
            : <><Navigation size={14} /> Use My Current Location</>}
        </button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "rgba(255,245,230,0.4)", marginBottom: 7 }}>
              Latitude <span style={{ color: TC_SOFT }}>*</span>
            </label>
            <input value={form.latitude || ""} onChange={set("latitude")} placeholder="e.g. 28.6139" type="number" step="any"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = TC_SOFT}
              onBlur={e => e.target.style.borderColor = "rgba(255,245,230,0.1)"} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "rgba(255,245,230,0.4)", marginBottom: 7 }}>
              Longitude <span style={{ color: TC_SOFT }}>*</span>
            </label>
            <input value={form.longitude || ""} onChange={set("longitude")} placeholder="e.g. 77.2090" type="number" step="any"
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = TC_SOFT}
              onBlur={e => e.target.style.borderColor = "rgba(255,245,230,0.1)"} />
          </div>
        </div>

        {/* Status indicator */}
        <div style={{ padding: "10px 14px", borderRadius: 10, marginBottom: 4,
          background: hasCoords ? "rgba(21,128,61,0.12)" : "rgba(212,136,42,0.12)",
          border: `1px solid ${hasCoords ? "rgba(21,128,61,0.3)" : "rgba(212,136,42,0.3)"}`,
          display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem" }}>
          <MapPin size={14} style={{ color: hasCoords ? "#34D399" : SAFFRON, flexShrink: 0 }} />
          <span style={{ color: hasCoords ? "#34D399" : SAFFRON }}>
            {geocoding ? "Auto-detecting from address..." :
             hasCoords ? `Location set: ${parseFloat(form.latitude).toFixed(4)}, ${parseFloat(form.longitude).toFixed(4)}` :
             "Enter address above — coordinates will auto-detect, or use the button above"}
          </span>
        </div>
      </Section>

      {/* Delivery settings */}
      <Section title="Order Settings">
        <div>
          <label style={{ display: "block", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.1em", color: "rgba(255,245,230,0.4)", marginBottom: 7 }}>
            Minimum Order Amount (₹)
          </label>
          <input value={form.minOrderAmount || ""} onChange={set("minOrderAmount")} placeholder="0 = no minimum"
            type="number" style={inputStyle}
            onFocus={e => e.target.style.borderColor = TC_SOFT}
            onBlur={e => e.target.style.borderColor = "rgba(255,245,230,0.1)"} />
        </div>
        <p style={{ fontSize: "0.74rem", color: "rgba(255,245,230,0.3)", marginTop: 8 }}>
          Note: Delivery fee and delivery time are set automatically by the system.
        </p>
      </Section>

      <button onClick={handleSave} disabled={saving} style={{
        padding: "14px 36px", borderRadius: 12, border: "none",
        background: `linear-gradient(135deg, ${TC_SOFT}, ${TC})`, color: "#FFF5E6",
        fontWeight: 700, fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer",
        fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", gap: 10,
        boxShadow: `0 4px 20px ${TC}50`, opacity: saving ? 0.7 : 1 }}>
        {saving ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
        {isNew ? "Create Restaurant" : "Save Changes"}
      </button>

      <style>{`
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "24px 28px",
      border: "1px solid rgba(255,245,230,0.08)", marginBottom: 20 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", marginBottom: 20,
        color: "rgba(255,245,230,0.75)", fontWeight: 500 }}>{title}</h2>
      {children}
    </div>
  );
}
