import { Star, Clock, ChevronRight } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const CUISINES = ["All", "North Indian", "South Indian", "Chinese", "Italian", "Biryani", "Pizza", "Desserts"];
const FEATURED = [
  { id: 1, name: "Spice Garden", cuisine: "North Indian", rating: 4.5, time: "25-30 min", initial: "S", color: "#DC2626" },
  { id: 2, name: "Dragon Palace", cuisine: "Chinese", rating: 4.3, time: "30-35 min", initial: "D", color: "#7C3AED" },
  { id: 3, name: "Pizza Paradise", cuisine: "Italian", rating: 4.7, time: "20-25 min", initial: "P", color: "#059669" },
  { id: 4, name: "Biryani House", cuisine: "Biryani", rating: 4.6, time: "35-40 min", initial: "B", color: "#D97706" },
];

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div style={{ animation: "fade-up 0.4s ease-out" }}>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: 6 }}>
          Good {greeting},{" "}
          <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--color-brand-600)" }}>
            {user?.name?.split(" ")[0] || "there"}
          </span>
        </h1>
        <p style={{ color: "var(--color-stone-light)", fontSize: "0.95rem" }}>What are you craving today?</p>
      </div>

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 36, scrollbarWidth: "none" }}>
        {CUISINES.map((c, i) => (
          <button key={c} style={{
            padding: "8px 18px", borderRadius: 99, whiteSpace: "nowrap",
            border: i === 0 ? "none" : "1.5px solid var(--color-sand)",
            background: i === 0 ? "var(--color-charcoal)" : "#fff",
            color: i === 0 ? "#fff" : "var(--color-stone)",
            fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>

      <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700 }}>Popular near you</h2>
        <button style={{
          display: "flex", alignItems: "center", gap: 4, background: "none", border: "none",
          cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem", fontWeight: 600, color: "var(--color-brand-600)",
        }}>View all <ChevronRight size={16} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
        {FEATURED.map((r, i) => (
          <div key={r.id} style={{
            background: "#fff", borderRadius: 14, border: "1px solid var(--color-sand-light)",
            overflow: "hidden", cursor: "pointer", transition: "all 0.25s ease",
            animation: "fade-up 0.4s ease-out " + (i * 0.08) + "s both",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <div style={{
              height: 140, background: "linear-gradient(135deg, " + r.color + "22, " + r.color + "08)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                width: 60, height: 60, borderRadius: 14,
                background: "linear-gradient(135deg, " + r.color + ", " + r.color + "CC)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "1.4rem", fontWeight: 700, fontFamily: "var(--font-display)",
              }}>{r.initial}</span>
            </div>
            <div style={{ padding: "14px 18px 18px" }}>
              <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: 4 }}>{r.name}</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--color-stone-lighter)", marginBottom: 10 }}>{r.cuisine}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span style={{
                  display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600,
                  color: "var(--color-success)", background: "var(--color-success-bg)", padding: "3px 8px", borderRadius: 6,
                }}><Star size={12} fill="currentColor" /> {r.rating}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", color: "var(--color-stone-lighter)" }}>
                  <Clock size={12} /> {r.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p style={{
        textAlign: "center", marginTop: 48, padding: "24px", color: "var(--color-stone-lighter)",
        fontSize: "0.85rem", borderTop: "1px solid var(--color-sand-light)",
      }}>
        Restaurant data will load from your API in Phase 2
      </p>
    </div>
  );
}
