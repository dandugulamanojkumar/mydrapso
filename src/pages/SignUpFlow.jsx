import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Calendar,
  User as UserIcon,
  AtSign,
} from "lucide-react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function SignUpFlow({ onSignUpComplete, onBackToSignIn }) {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
    fullName: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    const checkUsername = async () => {
      if (signupData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setUsernameChecking(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("username", signupData.username)
          .maybeSingle();

        setUsernameAvailable(!data);
      } catch (err) {
        console.error("Username check error:", err);
      } finally {
        setUsernameChecking(false);
      }
    };

    const debounce = setTimeout(() => {
      if (signupData.username) {
        checkUsername();
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [signupData.username]);

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength) => {
    if (strength <= 1) return { label: "Weak", color: "#ef4444" };
    if (strength <= 2) return { label: "Fair", color: "#f59e0b" };
    if (strength <= 3) return { label: "Good", color: "#3b82f6" };
    if (strength <= 4) return { label: "Strong", color: "#10b981" };
    return { label: "Very Strong", color: "#059669" };
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!signupData.email.trim() || !signupData.email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!signupData.password || signupData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (signupData.password !== signupData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!signupData.dateOfBirth) {
        setError("Please enter your date of birth");
        return;
      }
      const age = calculateAge(signupData.dateOfBirth);
      if (age < 13) {
        setError("You must be at least 13 years old to sign up");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (signupData.fullName.trim().length < 2) {
        setError("Please enter your full name");
        return;
      }
      setStep(5);
    }
  };

  const handleFinish = async () => {
    setError("");

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(signupData.username)) {
      setError("Username must be 3-20 characters (letters, numbers, underscores only)");
      return;
    }

    if (!usernameAvailable) {
      setError("Username is already taken");
      return;
    }

    setLoading(true);

    try {
      const avatarSeed = signupData.username || "default";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            username: signupData.username,
            full_name: signupData.fullName,
            date_of_birth: signupData.dateOfBirth,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user || !authData.session) {
        throw new Error("User creation failed - no session established");
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            id: authData.user.id,
            username: signupData.username,
            email: signupData.email,
            full_name: signupData.fullName,
            date_of_birth: signupData.dateOfBirth,
            signup_method: "email",
            is_verified: true,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`,
          },
        ])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      localStorage.setItem("userData", JSON.stringify(data));
      onSignUpComplete(data);
    } catch (err) {
      console.error("Sign up error:", err);
      if (err.code === "23505") {
        if (err.message.includes("username")) {
          setError("Username already exists");
        } else if (err.message.includes("email")) {
          setError("Email already registered");
        }
      } else if (err.message.includes("User already registered")) {
        setError("Email already registered");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 1) {
      onBackToSignIn();
    } else {
      setStep(step - 1);
    }
  };

  const progress = (step / 5) * 100;
  const passwordStrength = calculatePasswordStrength(signupData.password);
  const strengthInfo = getStrengthLabel(passwordStrength);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">
            Step {step} of 5
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <div className="signup-step">
            <h2 className="step-title">Enter your email address</h2>
            <p className="step-description">We'll use this for your account</p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={signupData.email}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    email: e.target.value,
                  })
                }
                placeholder="you@example.com"
                autoFocus
              />
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="signup-step">
            <h2 className="step-title">Create a password</h2>
            <p className="step-description">Make it strong and unique</p>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  placeholder="At least 8 characters"
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {signupData.password && (
                <div className="password-strength">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: strengthInfo.color,
                    }}
                  ></div>
                  <span style={{ color: strengthInfo.color }}>
                    {strengthInfo.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-input"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="signup-step">
            <h2 className="step-title">Enter your date of birth</h2>
            <p className="step-description">You must be at least 13 years old</p>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={signupData.dateOfBirth}
                onChange={(e) =>
                  setSignupData({ ...signupData, dateOfBirth: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                autoFocus
              />
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="signup-step">
            <h2 className="step-title">What's your name?</h2>
            <p className="step-description">Enter your full name</p>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={signupData.fullName}
                onChange={(e) =>
                  setSignupData({ ...signupData, fullName: e.target.value })
                }
                placeholder="John Doe"
                autoFocus
              />
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="signup-step">
            <h2 className="step-title">Choose a username</h2>
            <p className="step-description">
              This is how others will see you
            </p>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                value={signupData.username}
                onChange={(e) =>
                  setSignupData({ ...signupData, username: e.target.value })
                }
                placeholder="johndoe"
                autoFocus
              />
              {usernameChecking && (
                <p className="username-status checking">Checking...</p>
              )}
              {!usernameChecking && usernameAvailable === true && (
                <p className="username-status available">Username available</p>
              )}
              {!usernameChecking && usernameAvailable === false && (
                <p className="username-status taken">Username taken</p>
              )}
            </div>

            <div className="step-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleBack}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFinish}
                disabled={loading || !usernameAvailable}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
