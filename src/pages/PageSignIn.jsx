import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Lock, User } from "lucide-react";
import CryptoJS from "crypto-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function PageSignIn({ onSignInSuccess, onSignUpClick }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const passwordHash = CryptoJS.SHA256(password).toString();

      const { data: users, error: queryError } = await supabase
        .from("users")
        .select("*")
        .or(
          `username.eq.${identifier},email.eq.${identifier},mobile_number.eq.${identifier}`
        )
        .eq("password_hash", passwordHash)
        .maybeSingle();

      if (queryError) {
        throw queryError;
      }

      if (!users) {
        setError("Invalid credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("userData", JSON.stringify(users));
      onSignInSuccess(users);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username / Email / Mobile Number</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter your username, email or mobile"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Log In"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{" "}
            <button
              type="button"
              className="auth-link"
              onClick={onSignUpClick}
              disabled={loading}
            >
              Create new account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
