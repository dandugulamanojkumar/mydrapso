import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Mail,
  Smartphone,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Calendar,
  User as UserIcon,
  AtSign,
} from "lucide-react";
import CryptoJS from "crypto-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function SignUpFlow({ onSignUpComplete, onBackToSignIn }) {
  const [step, setStep] = useState(1);
  const [signupData, setSignupData] = useState({
    method: "",
    email: "",
    mobileNumber: "",
    verificationCode: "",
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
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);

  useEffect(() => {
    if (step === 3 && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  useEffect(() => {
    if (step === 7 && signupData.username.length >= 3) {
      const checkUsername = setTimeout(async () => {
        setUsernameChecking(true);
        setUsernameAvailable(null);

        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("username", signupData.username)
          .maybeSingle();

        setUsernameChecking(false);
        setUsernameAvailable(!data);
      }, 500);

      return () => clearTimeout(checkUsername);
    } else {
      setUsernameAvailable(null);
    }
  }, [signupData.username, step]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const calculatePasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.length >= 12) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    return strength;
  };

  const getStrengthLabel = (strength) => {
    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const colors = ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#10b981"];
    return { label: labels[strength] || "", color: colors[strength] || "#e0e0e0" };
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleNext = () => {
    setError("");

    if (step === 1) {
      if (!signupData.method) {
        setError("Please select a signup method");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (signupData.method === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(signupData.email)) {
          setError("Please enter a valid email address");
          return;
        }
      } else {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(signupData.mobileNumber)) {
          setError("Please enter a valid 10-digit mobile number");
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      if (signupData.verificationCode !== "123456") {
        setError("Invalid verification code");
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (signupData.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }
      if (signupData.password !== signupData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setStep(5);
    } else if (step === 5) {
      if (!signupData.dateOfBirth) {
        setError("Please enter your date of birth");
        return;
      }
      const age = calculateAge(signupData.dateOfBirth);
      if (age < 13) {
        setError("You must be at least 13 years old to sign up");
        return;
      }
      setStep(6);
    } else if (step === 6) {
      if (signupData.fullName.trim().length < 2) {
        setError("Please enter your full name");
        return;
      }
      setStep(7);
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
      const passwordHash = CryptoJS.SHA256(signupData.password).toString();
      const avatarSeed = signupData.username || "default";

      const { data, error: insertError } = await supabase
        .from("users")
        .insert([
          {
            username: signupData.username,
            email: signupData.method === "email" ? signupData.email : null,
            mobile_number:
              signupData.method === "mobile" ? signupData.mobileNumber : null,
            password_hash: passwordHash,
            full_name: signupData.fullName,
            date_of_birth: signupData.dateOfBirth,
            signup_method: signupData.method,
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
        } else if (err.message.includes("mobile")) {
          setError("Mobile number already registered");
        }
      } else {
        setError("An error occurred. Please try again.");
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

  const handleResendCode = () => {
    setTimer(300);
    setCanResend(false);
  };

  const progress = (step / 7) * 100;
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
            Step {step} of 7
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {step === 1 && (
          <div className="signup-step">
            <h2 className="step-title">How do you want to sign up?</h2>
            <p className="step-description">Choose your preferred signup method</p>

            <div className="method-selection">
              <div
                className={`method-box ${
                  signupData.method === "mobile" ? "selected" : ""
                }`}
                onClick={() =>
                  setSignupData({ ...signupData, method: "mobile" })
                }
              >
                <Smartphone />
                <h3>Mobile Number</h3>
                <p>Sign up with phone</p>
              </div>

              <div
                className={`method-box ${
                  signupData.method === "email" ? "selected" : ""
                }`}
                onClick={() =>
                  setSignupData({ ...signupData, method: "email" })
                }
              >
                <Mail />
                <h3>Email Address</h3>
                <p>Sign up with email</p>
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
                disabled={!signupData.method}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="signup-step">
            <h2 className="step-title">
              {signupData.method === "email"
                ? "Enter your email address"
                : "Enter your mobile number"}
            </h2>
            <p className="step-description">
              We'll send a verification code to confirm
            </p>

            <div className="form-group">
              <label className="form-label">
                {signupData.method === "email" ? "Email Address" : "Mobile Number"}
              </label>
              <input
                type={signupData.method === "email" ? "email" : "tel"}
                className="form-input"
                value={
                  signupData.method === "email"
                    ? signupData.email
                    : signupData.mobileNumber
                }
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    [signupData.method === "email" ? "email" : "mobileNumber"]:
                      e.target.value,
                  })
                }
                placeholder={
                  signupData.method === "email"
                    ? "you@example.com"
                    : "1234567890"
                }
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

        {step === 3 && (
          <div className="signup-step">
            <h2 className="step-title">Enter verification code</h2>
            <p className="step-description">
              Code sent to{" "}
              {signupData.method === "email"
                ? signupData.email
                : signupData.mobileNumber}
            </p>

            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input"
                value={signupData.verificationCode}
                onChange={(e) =>
                  setSignupData({
                    ...signupData,
                    verificationCode: e.target.value,
                  })
                }
                placeholder="Enter 6-digit code (use 123456)"
                maxLength={6}
                autoFocus
              />
            </div>

            <div className="verification-timer">
              {timer > 0 ? (
                <p className="timer-text">Time remaining: {formatTime(timer)}</p>
              ) : (
                <button
                  type="button"
                  className="resend-btn"
                  onClick={handleResendCode}
                  disabled={!canResend}
                >
                  Resend Code
                </button>
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
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="signup-step">
            <h2 className="step-title">Create a password</h2>
            <p className="step-description">Must be at least 8 characters</p>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  placeholder="Create password"
                  autoFocus
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {signupData.password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{
                          backgroundColor:
                            i < passwordStrength ? strengthInfo.color : "#e0e0e0",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="strength-text"
                    style={{ color: strengthInfo.color }}
                  >
                    {strengthInfo.label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
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
                  placeholder="Confirm password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
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

        {step === 5 && (
          <div className="signup-step">
            <h2 className="step-title">When's your birthday?</h2>
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

            {signupData.dateOfBirth && (
              <div className="age-display">
                <p>Your age: {calculateAge(signupData.dateOfBirth)} years old</p>
              </div>
            )}

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

        {step === 6 && (
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
                maxLength={100}
                autoFocus
              />
              <p className="char-count">
                {signupData.fullName.length} / 100 characters
              </p>
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

        {step === 7 && (
          <div className="signup-step">
            <h2 className="step-title">Choose a username</h2>
            <p className="step-description">
              3-20 characters, letters, numbers and underscores only
            </p>

            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="username-input-wrapper">
                <input
                  type="text"
                  className={`form-input ${
                    usernameAvailable === true
                      ? "success"
                      : usernameAvailable === false
                      ? "error"
                      : ""
                  }`}
                  value={signupData.username}
                  onChange={(e) =>
                    setSignupData({ ...signupData, username: e.target.value })
                  }
                  placeholder="johndoe"
                  maxLength={20}
                  autoFocus
                />
                {usernameChecking && (
                  <div className="username-checking">
                    <div className="spinner-small"></div>
                  </div>
                )}
                {!usernameChecking && usernameAvailable === true && (
                  <div className="username-available">
                    <Check />
                  </div>
                )}
              </div>
              {usernameAvailable === false && (
                <p className="form-error">Username already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="form-success">Username available</p>
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
                {loading ? "Creating Account..." : "Finish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
