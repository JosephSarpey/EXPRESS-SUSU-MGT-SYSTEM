import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/services/api/auth.service";
import {
  Lock,
  Loader2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import logo from "../../assets/logo2.png";
import "./auth-page.css";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Extract token once on mount and clear it from the URL to prevent reuse
  const tokenRef = useRef<string>("");
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
      const params = new URLSearchParams(hash.substring(1));
      tokenRef.current = params.get("access_token") || "";
      // Clear the token from the URL so it can't be reused via page reload
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tokenRef.current) {
      setError(
        "Reset link has expired or already been used. Please request a new one.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await authService.updatePassword(password, tokenRef.current);
      // Invalidate the token locally so it can't be reused
      tokenRef.current = "";
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update password. Your session may have expired.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Back button */}
      <Link to="/" className="back-to-website">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Website</span>
      </Link>

      {/* Glow blobs */}
      <div className="glow-blob one"></div>
      <div className="glow-blob two"></div>

      {/* Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "460px",
          background: "rgba(24, 24, 27, 0.75)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(16, 185, 129, 0.25)",
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.7), 0 0 30px rgba(16,185,129,0.08)",
          borderRadius: "24px",
          padding: "48px 36px",
        }}
      >
        {/* Brand header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <img
            src={logo}
            alt="Unique Capital Logo"
            style={{
              height: "48px",
              objectFit: "contain",
              marginBottom: "8px",
            }}
          />
          <p
            style={{
              fontSize: "10px",
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: "2px",
              margin: 0,
            }}
          >
            UNIQUE{" "}
            <span style={{ color: "#10b981", fontWeight: 600 }}>CAPITAL</span>
          </p>
        </div>

        {/* Success state */}
        {success ? (
          <div style={{ textAlign: "center" }}>
            {/* Success icon */}
            <div
              style={{
                margin: "0 auto 20px",
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.12)",
                border: "2px solid rgba(16, 185, 129, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(16, 185, 129, 0.2)",
              }}
            >
              <ShieldCheck className="h-8 w-8" style={{ color: "#10b981" }} />
            </div>

            <h2
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "8px",
              }}
            >
              Password Updated!
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#d4d4d8",
                lineHeight: 1.6,
                margin: "0 0 8px",
              }}
            >
              Your password has been updated successfully.
            </p>
            <p
              style={{
                fontSize: "13px",
                color: "#71717a",
                marginBottom: "28px",
              }}
            >
              Redirecting you to login...
            </p>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: "3px",
                background: "rgba(16, 185, 129, 0.15)",
                borderRadius: "99px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: "linear-gradient(90deg, #10b981, #34d399)",
                  borderRadius: "99px",
                  animation: "progressBar 3s ease-in-out forwards",
                }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <div
                style={{
                  margin: "0 auto 20px",
                  width: "64px",
                  height: "64px",
                  borderRadius: "18px",
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock className="h-7 w-7" style={{ color: "#10b981" }} />
              </div>

              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: "8px",
                }}
              >
                Reset Password
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#a1a1aa",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Set your new secure password below.
              </p>
            </div>

            {/* Error alert */}
            {error && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(220, 38, 38, 0.15)",
                  border: "1px solid rgba(220, 38, 38, 0.3)",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  color: "#fca5a5",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {/* New Password field */}
              <div
                className="field-wrapper"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "48px",
                  marginBottom: "18px",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "none",
                    borderBottom: `2px solid ${password ? "#10b981" : "#3f3f46"}`,
                    borderRadius: "8px 8px 0 0",
                    outline: "none",
                    fontSize: "14px",
                    color: "#ffffff",
                    fontWeight: 500,
                    paddingLeft: "32px",
                    paddingRight: "36px",
                    transition: "all 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(16, 185, 129, 0.04)";
                    e.target.style.borderBottomColor = "#10b981";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.02)";
                    if (!password) e.target.style.borderBottomColor = "#3f3f46";
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    top: password ? "-6px" : "50%",
                    left: password ? "0px" : "32px",
                    transform: password ? "none" : "translateY(-50%)",
                    fontSize: password ? "11px" : "14px",
                    fontWeight: password ? 600 : 400,
                    color: password ? "#10b981" : "#a1a1aa",
                    pointerEvents: "none",
                    transition: "all 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  New Password
                </label>
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "8px",
                    transform: "translateY(-50%)",
                    color: password ? "#10b981" : "#a1a1aa",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Lock className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "8px",
                    transform: "translateY(-50%)",
                    color: "#a1a1aa",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px",
                    transition: "0.3s",
                  }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password field */}
              <div
                className="field-wrapper"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "48px",
                  marginBottom: "28px",
                }}
              >
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder=" "
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "none",
                    borderBottom: `2px solid ${confirmPassword ? "#10b981" : "#3f3f46"}`,
                    borderRadius: "8px 8px 0 0",
                    outline: "none",
                    fontSize: "14px",
                    color: "#ffffff",
                    fontWeight: 500,
                    paddingLeft: "32px",
                    paddingRight: "36px",
                    transition: "all 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(16, 185, 129, 0.04)";
                    e.target.style.borderBottomColor = "#10b981";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.02)";
                    if (!confirmPassword)
                      e.target.style.borderBottomColor = "#3f3f46";
                  }}
                />
                <label
                  style={{
                    position: "absolute",
                    top: confirmPassword ? "-6px" : "50%",
                    left: confirmPassword ? "0px" : "32px",
                    transform: confirmPassword ? "none" : "translateY(-50%)",
                    fontSize: confirmPassword ? "11px" : "14px",
                    fontWeight: confirmPassword ? 600 : 400,
                    color: confirmPassword ? "#10b981" : "#a1a1aa",
                    pointerEvents: "none",
                    transition: "all 0.3s ease",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  Confirm Password
                </label>
                <span
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "8px",
                    transform: "translateY(-50%)",
                    color: confirmPassword ? "#10b981" : "#a1a1aa",
                    display: "flex",
                    alignItems: "center",
                    transition: "all 0.3s ease",
                  }}
                >
                  <Lock className="h-4 w-4" />
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "8px",
                    transform: "translateY(-50%)",
                    color: "#a1a1aa",
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    outline: "none",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px",
                    transition: "0.3s",
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Submit button — uses auth-page.css .submit-button class */}
              <button
                className="submit-button"
                type="submit"
                disabled={isLoading}
                style={{
                  position: "relative",
                  width: "100%",
                  height: "45px",
                  background: "transparent",
                  borderRadius: "40px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#ffffff",
                  border: "2px solid #10b981",
                  overflow: "hidden",
                  zIndex: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <span>Update Password</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back to sign in */}
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#a1a1aa",
                marginTop: "24px",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Back to{" "}
              <Link
                to="/login"
                style={{
                  color: "#10b981",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "0.3s",
                }}
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
