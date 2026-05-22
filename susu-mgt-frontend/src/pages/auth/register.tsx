import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth-store";
import { authService } from "@/services/api/auth.service";
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  AlertCircle,
  Phone,
  User as UserIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import logo from "../../assets/logo2.png";

export function RegisterPage() {
  const { isLoading, setLoading } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Separate visibility states for better control
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Strictly numbers only, max length 10
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (phone.length !== 10) {
      setError("Phone number must be exactly 10 digits");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.signUp({ email, password, fullName, phone });
      setSuccess(true);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setLoading(false);
    }
  };

  const inputClasses =
    "block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 py-2.5 pl-10 pr-10 text-sm text-zinc-100 placeholder-zinc-500 transition-all focus:border-emerald-500 focus:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/10";
  const labelClasses = "block text-xs font-medium text-emerald-500 mb-1 ml-1";

  if (success) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="w-full h-full sm:h-auto sm:max-w-md bg-[#1a1a1a] p-8 flex flex-col justify-center items-center text-center">
          <Mail className="h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-zinc-400 mt-2">
            Verification link sent to{" "}
            <span className="text-emerald-400">{email}</span>
          </p>
          <Link
            to="/login"
            className="mt-8 text-emerald-500 font-bold flex items-center gap-2"
          >
            Back to Sign in <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 overflow-hidden touch-none">
      <div className="w-full h-full sm:h-auto sm:max-w-md sm:max-h-[95vh] flex flex-col bg-[#1a1a1a] sm:rounded-3xl border-zinc-800 sm:border shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 shrink-0 text-center">
          <img
            className=" h-10   mx-auto object-contain mb-2"
            src={logo}
            alt="Logo"
          />
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            EXPRESS <span className="text-green-400">CAPITAL</span>
          </p>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Create Account
          </h2>
          
        </div>

        {/* Scroll-Disabled Content */}
        <div className="flex-1 px-6 pb-6 overflow-y-auto no-scrollbar">
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-900/20 p-2 text-[10px] text-red-400 border border-red-900/30">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className={labelClasses}>Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClasses}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
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
              <label className={labelClasses}>Phone Number (10 digits)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={inputClasses}
                  placeholder="024XXXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Password */}
              <div>
                <label className={labelClasses}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className={labelClasses}>Confirm</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-emerald-500 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={14} />
                    ) : (
                      <Eye size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group w-full flex justify-center items-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 active:scale-[0.98] transition-all mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-zinc-500 pt-1">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-emerald-500 hover:text-emerald-400"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
