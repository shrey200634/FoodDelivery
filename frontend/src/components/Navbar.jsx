import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, LogOut, MapPin, ChevronDown, Search } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(254,252,249,0.85)",
      backdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid var(--color-sand-light)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        height: 68, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 3, textDecoration: "none" }}>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--color-brand-600)", fontStyle: "italic" }}>Food</span>
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", color: "var(--color-charcoal)" }}>Rush</span>
        </Link>

        <div style={{ flex: 1, maxWidth: 420, margin: "0 40px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--color-stone-lighter)" }} />
          <input type="text" placeholder="Search for restaurants or dishes..."
            style={{
              width: "100%", padding: "10px 16px 10px 42px", borderRadius: "var(--radius-full)",
              border: "1.5px solid var(--color-sand)", background: "var(--color-sand-light)",
              fontSize: "0.875rem", fontFamily: "var(--font-sans)", color: "var(--color-charcoal)", outline: "none", transition: "all 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-brand-300)"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(249,107,22,0.08)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-sand)"; e.target.style.background = "var(--color-sand-light)"; e.target.style.boxShadow = "none"; }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
            borderRadius: "var(--radius-full)", border: "none", background: "var(--color-brand-50)",
            color: "var(--color-brand-700)", cursor: "pointer", fontFamily: "var(--font-sans)",
            fontSize: "0.875rem", fontWeight: 600, transition: "all 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-brand-100)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-brand-50)")}
          >
            <ShoppingBag size={18} /> Cart
          </button>

          <div ref={menuRef} style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px",
              borderRadius: "var(--radius-full)", border: "1.5px solid var(--color-sand)",
              background: "#fff", cursor: "pointer", fontFamily: "var(--font-sans)", transition: "all 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-brand-300)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-sand)")}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: "0.8rem", fontWeight: 700,
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--color-charcoal)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name?.split(" ")[0] || "User"}
              </span>
              <ChevronDown size={14} style={{ color: "var(--color-stone-light)", transition: "transform 0.2s", transform: menuOpen ? "rotate(180deg)" : "rotate(0)" }} />
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 8px)", width: 220,
                background: "#fff", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-sand)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.1)", padding: 6, animation: "scale-in 0.15s ease-out",
              }}>
                {[
                  { to: "/profile", icon: User, label: "My Profile" },
                  { to: "/addresses", icon: MapPin, label: "Addresses" },
                ].map((item) => (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                    borderRadius: "var(--radius-md)", textDecoration: "none", color: "var(--color-charcoal)",
                    fontSize: "0.875rem", fontWeight: 500, transition: "background 0.15s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-sand-light)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <item.icon size={16} style={{ color: "var(--color-stone-light)" }} /> {item.label}
                  </Link>
                ))}
                <div style={{ height: 1, background: "var(--color-sand-light)", margin: "4px 0" }} />
                <button onClick={handleLogout} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: "var(--radius-md)", width: "100%", border: "none", background: "transparent",
                  color: "var(--color-error)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                  fontFamily: "var(--font-sans)", transition: "background 0.15s",
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-error-bg)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
