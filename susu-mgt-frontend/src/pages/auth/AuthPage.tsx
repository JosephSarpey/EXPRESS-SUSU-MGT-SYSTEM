import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/api/auth.service";
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import logo from "../../assets/logo2.png";
import "./auth-page.css";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, isLoading, setLoading } = useAuthStore();

  // Route-based tab activation
  const isToggled = location.pathname === "/register";

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register Form States
  const [registerFullName, setRegisterFullName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Clear errors when toggling tabs
  useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
  }, [location.pathname]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Strictly numbers only, max length 10
    if (/^\d*$/.test(value) && value.length <= 10) {
      setRegisterPhone(value);
    }
  };

  const handleLoginSuccess = async () => {
    try {
      const profile = await authService.getMe();
      setAuth(profile);

      if (profile.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (profile.role === "WORKER") {
        navigate("/worker/dashboard", { replace: true });
      } else {
        navigate("/customer/dashboard", { replace: true });
      }
    } catch (err: any) {
      setLoginError("Failed to fetch user profile. Please try again.");
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      await authService.signIn({ email: loginEmail, password: loginPassword });
      await handleLoginSuccess();
    } catch (err: any) {
      setLoginError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password",
      );
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (registerPhone.length !== 10) {
      setRegisterError("Phone number must be exactly 10 digits");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.signUp({
        email: registerEmail,
        password: registerPassword,
        fullName: registerFullName,
        phone: registerPhone,
      });
      setRegisterSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setRegisterError(
        err.response?.data?.message || err.message || "Registration failed",
      );
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <Link to="/" className="back-to-website">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Website</span>
      </Link>
      <div className="glow-blob one"></div>
      <div className="glow-blob two"></div>
      <div className={`auth-wrapper ${isToggled ? "toggled" : ""}`}>
        <div className="background-shape"></div>
        <div className="secondary-shape"></div>

        {/* LOGIN PANEL */}
        <div className="credentials-panel signin">
          <div className="brand-header slide-element">
            <img className="brand-logo" src={logo} alt="Express Capital Logo" />
            <p className="brand-subtitle">
              UNIQUE <span>CAPITAL</span>
            </p>
          </div>

          <h2 className="slide-element">Login</h2>

          {loginError && (
            <div className="error-alert slide-element">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="field-wrapper slide-element">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder=" "
              />
              <label>Email Address</label>
              <span className="input-icon">
                <Mail className="h-4.5 w-4.5" />
              </span>
            </div>

            <div className="field-wrapper slide-element">
              <input
                type={showLoginPassword ? "text" : "password"}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder=" "
              />
              <label>Password</label>
              <span className="input-icon">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="login-options slide-element">
              <label className="remember-me-container">
                <input id="remember-me-checkbox" type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/auth/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>

            <div className="field-wrapper slide-element">
              <button
                className="submit-button"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="switch-link slide-element">
              <p>
                Don't have an account? <br />
                <Link to="/register" className="register-trigger">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Welcome section shown next to login */}
        <div className="welcome-section signin">
          <h2 className="slide-element">Welcome Back!</h2>
          <p className="slide-element">
            To keep connected with us, please log in with your personal
            credentials.
          </p>
        </div>

        {/* ================= REGISTER PANEL ================= */}
        <div className="credentials-panel signup">
          {registerSuccess ? (
            <div className="success-card slide-element">
              <CheckCircle2 className="h-12 w-12 success-icon" />
              <h3>Check your email</h3>
              <p>
                Verification link sent to <br />
                <span style={{ color: "#10b981", fontWeight: 600 }}>
                  {registerEmail}
                </span>
              </p>
              <Link
                to="/login"
                className="submit-button"
                style={{ textDecoration: "none" }}
              >
                <span>Back to Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="brand-header slide-element">
                <img
                  className="brand-logo"
                  src={logo}
                  alt="Express Capital Logo"
                />
                <p className="brand-subtitle">
                  UNIQUE <span>CAPITAL</span>
                </p>
              </div>

              <h2 className="slide-element">Register</h2>

              {registerError && (
                <div className="error-alert slide-element">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{registerError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit}>
                <div className="field-wrapper slide-element">
                  <input
                    type="text"
                    required
                    value={registerFullName}
                    onChange={(e) => setRegisterFullName(e.target.value)}
                    placeholder=" "
                  />
                  <label>Full Name</label>
                  <span className="input-icon">
                    <UserIcon className="h-4.5 w-4.5" />
                  </span>
                </div>

                <div className="field-wrapper slide-element">
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder=" "
                  />
                  <label>Email Address</label>
                  <span className="input-icon">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                </div>

                <div className="field-wrapper slide-element">
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    value={registerPhone}
                    onChange={handlePhoneChange}
                    placeholder=" "
                  />
                  <label>Phone Number (10 digits)</label>
                  <span className="input-icon">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                </div>

                <div className="form-grid">
                  <div className="field-wrapper slide-element">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder=" "
                    />
                    <label>Password</label>
                    <span className="input-icon">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowRegisterPassword(!showRegisterPassword)
                      }
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="field-wrapper slide-element">
                    <input
                      type={showRegisterConfirmPassword ? "text" : "password"}
                      required
                      value={registerConfirmPassword}
                      onChange={(e) =>
                        setRegisterConfirmPassword(e.target.value)
                      }
                      placeholder=" "
                    />
                    <label>Confirm</label>
                    <span className="input-icon">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() =>
                        setShowRegisterConfirmPassword(
                          !showRegisterConfirmPassword,
                        )
                      }
                    >
                      {showRegisterConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="field-wrapper slide-element">
                  <button
                    className="submit-button"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="switch-link slide-element">
                  <p>
                    Already have an account? <br />
                    <Link to="/login" className="login-trigger">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Welcome section shown next to register */}
        <div className="welcome-section signup">
          <h2 className="slide-element">Welcome!</h2>
          <p className="slide-element">
            Enter your personal details to open an account and start your
            journey with us.
          </p>
        </div>
      </div>
    </div>
  );
}
