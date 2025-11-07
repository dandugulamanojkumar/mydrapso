import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Lock, User } from "lucide-react";
import CryptoJS from "crypto-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function PageSignIn({ onSignInSuccess, onSignUpClick }) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!emailOrUsername.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      let loginEmail = emailOrUsername.trim();

      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("email")
          .eq("username", emailOrUsername.trim())
          .maybeSingle();

        if (userError || !userData) {
          setError("Invalid email/username or password");
          setLoading(false);
          return;
        }

        loginEmail = userData.email;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: password,
      });

      if (authError) {
        setError("Invalid email/username or password");
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Invalid email/username or password");
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      if (userError || !userData) {
        throw userError || new Error("User data not found");
      }

      localStorage.setItem("userData", JSON.stringify(userData));
      onSignInSuccess(userData);
    } catch (err) {
      console.error("Sign in error:", err);
      setError("Invalid email/username or password");
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
            <label className="form-label">Email or Username</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                placeholder="Enter your email or username"
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
