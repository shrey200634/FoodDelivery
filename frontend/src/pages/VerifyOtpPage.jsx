import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const email = useLocation().state?.email || "";
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp]; next[i] = val.slice(-1); setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => { if (e.key === "Backspace" && !otp[i] && i > 0) refs.current[i - 1]?.focus(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return toast.error("Enter the full 6-digit code");
    setLoading(true);
    try { await verifyOtp(email, code); toast.success("Email verified! Welcome to FoodRush!"); navigate("/"); }
    catch (err) { toast.error(err.response?.data?.message || "Invalid OTP"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-cream)", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center", animation: "fade-up 0.4s ease-out" }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: "linear-gradient(135deg, var(--color-brand-50), var(--color-brand-100))",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px",
        }}>
          <ShieldCheck size={28} style={{ color: "var(--color-brand-600)" }} />
        </div>

        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: 8 }}>Verify your email</h2>
        <p style={{ color: "var(--color-stone-light)", fontSize: "0.9rem", marginBottom: 36 }}>
          We sent a 6-digit code to <span style={{ fontWeight: 600, color: "var(--color-charcoal)" }}>{email || "your email"}</span>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 32 }}>
            {otp.map((d, i) => (
              <input key={i} ref={(el) => (refs.current[i] = el)} type="text" inputMode="numeric" maxLength={1}
                value={d} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)}
                style={{
                  width: 52, height: 58, textAlign: "center", fontSize: "1.4rem", fontWeight: 700,
                  fontFamily: "var(--font-sans)", borderRadius: "var(--radius-md)",
                  border: "2px solid " + (d ? "var(--color-brand-400)" : "var(--color-sand)"),
                  background: d ? "var(--color-brand-50)" : "#fff", color: "var(--color-charcoal)",
                  outline: "none", transition: "all 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = "var(--color-brand-500)"; e.target.style.boxShadow = "0 0 0 3px rgba(249,107,22,0.12)"; }}
                onBlur={(e) => { e.target.style.borderColor = d ? "var(--color-brand-400)" : "var(--color-sand)"; e.target.style.boxShadow = "none"; }}
              />
            ))}
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: "var(--radius-md)", border: "none",
            background: loading ? "var(--color-stone-lighter)" : "linear-gradient(135deg, var(--color-brand-500), var(--color-brand-600))",
            color: "#fff", fontSize: "0.95rem", fontWeight: 600, fontFamily: "var(--font-sans)",
            cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: loading ? "none" : "0 4px 14px rgba(249,107,22,0.3)",
          }}>
            {loading ? <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> : "Verify & continue"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: "0.85rem", color: "var(--color-stone-lighter)" }}>
          Didn't get the code?{" "}
          <button style={{ background: "none", border: "none", color: "var(--color-brand-600)", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "0.85rem" }}>Resend</button>
        </p>
      </div>
    </div>
  );
}
