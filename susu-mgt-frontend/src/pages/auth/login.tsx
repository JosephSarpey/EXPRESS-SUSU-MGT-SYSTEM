import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/api/auth.service";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import logo from "../../assets/logo2.png";

export function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, isLoading, setLoading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = async () => {
    try {
      const profile = await authService.getMe();
      setAuth(profile);

      if (profile.role === "ADMIN")
        navigate("/admin/dashboard", { replace: true });
      else if (profile.role === "WORKER")
        navigate("/worker/dashboard", { replace: true });
      else navigate("/customer/dashboard", { replace: true });
    } catch (err: any) {
      setError("Failed to fetch user profile. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await authService.signIn({ email, password });
      await handleLoginSuccess();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password",
      );
      setLoading(false);
    }
  };

  const inputClasses =
    "block w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 py-3 pl-11 pr-11 text-zinc-100 placeholder-zinc-500 transition-all focus:border-emerald-500 focus:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";
  const labelClasses = "block text-sm font-medium text-emerald-500 mb-1.5 ml-1";

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950 p-4 overflow-hidden font-sans">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-3xl bg-[#1a1a1a] shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 shrink-0 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/20">
            <img
              className="h-10 mx-auto object-contain mb-2"
              src={logo}
              alt="Logo"
            />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-zinc-500">
            Sign in to your SUSU Management account
          </p>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-hide"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-900/20 p-3 text-xs text-red-400 border border-red-900/30">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className={labelClasses}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-emerald-600 focus:ring-emerald-500/20"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-xs font-medium text-zinc-400"
                >
                  Remember me
                </label>
              </div>
              <div className="text-right">
                <Link
                  to="/auth/forgot-password"
                  className="block text-xs font-bold text-emerald-500 hover:text-emerald-400"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-zinc-500 pt-2">
              Need an account?{" "}
              <Link
                to="/register"
                className="font-bold text-emerald-500 hover:text-emerald-400"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
