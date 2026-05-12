import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { authService } from '@/services/api/auth.service'
import { ShieldAlert, Mail, Lock, Loader2, ArrowRight, AlertCircle, Phone, User as UserIcon } from 'lucide-react'

export function RegisterPage() {
  const { isLoading, setLoading } = useAuthStore()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await authService.signUp({
        email,
        password,
        fullName,
        phone,
      })
      
      setSuccess(true)
      setLoading(false)
      
      // Optionally auto-login or redirect to login
      // Since Supabase might require email verification, we'll show a success message
    } catch (err: any) {
      setError(err.message || 'Registration failed')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
        <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
            <Mail className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            We've sent a verification link to <span className="font-semibold text-zinc-900 dark:text-zinc-100">{email}</span>. Please verify your account to continue.
          </p>
          <div className="pt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Back to Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <ShieldAlert className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Join the SUSU Management System
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/30">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full Name
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <UserIcon className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Phone Number (optional)
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Phone className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                  placeholder="+233..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-zinc-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-4 text-zinc-900 placeholder-zinc-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:bg-zinc-900"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group flex w-full justify-center items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-zinc-900 mt-6"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
