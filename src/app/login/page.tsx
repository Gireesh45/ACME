"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@acme.com");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg-glow" />
      <div className="login-bg-glow-2" />

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">💼</div>
          <div>
            <div className="login-logo-name">ACME Salary</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>
              Manager
            </div>
          </div>
        </div>

        <h1 className="login-title">Welcome back</h1>
        <p className="login-subtitle">
          Sign in to manage employee compensation data
        </p>

        <form className="login-form" onSubmit={handleSubmit} id="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@acme.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              style={{
                background: "var(--danger-bg)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 13,
                color: "var(--danger)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            id="login-submit"
            style={{ justifyContent: "center", padding: "12px 18px" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            padding: "14px 16px",
            background: "var(--bg-secondary)",
            borderRadius: 10,
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: 8,
            }}
          >
            Demo credentials
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
            📧 admin@acme.com
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
            🔑 admin
          </div>
        </div>
      </div>
    </div>
  );
}
