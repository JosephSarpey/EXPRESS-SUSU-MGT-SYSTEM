import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/api/auth.service'
import { Mail, CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')

  const email = searchParams.get('email')
  const token = searchParams.get('token')
  const type = (searchParams.get('type') as any) || 'signup'

  useEffect(() => {
    // If we have token and email in URL, attempt automatic verification
    if (email && token) {
      handleVerify(email, token, type)
    }
  }, [email, token, type])

  const handleVerify = async (email: string, token: string, type: string) => {
    setIsLoading(true)
    try {
      await authService.verifyEmail({ email, token, type })
      setStatus('success')
      setMessage('Your email has been successfully verified.')
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Verification failed. The link may have expired.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-xl dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-center">
        
        {status === 'pending' && !email && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-900/30">
              <Mail className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Verify your email
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Please check your inbox for a verification link.
            </p>
          </>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="text-sm text-zinc-500">Verifying your email...</p>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Email Verified!
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {message} Redirecting you to login...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <XCircle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              {message}
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
          </>
        )}
      </div>
    </div>
  )
}
