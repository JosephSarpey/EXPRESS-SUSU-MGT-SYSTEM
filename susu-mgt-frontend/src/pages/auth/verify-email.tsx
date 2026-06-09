import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authService } from '@/services/api/auth.service'
import { Mail, XCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import logo from '../../assets/logo2.png'
import './auth-page.css'

/**
 * Supabase email verification redirect page.
 *
 * When the user clicks the confirmation link in their email, Supabase:
 *   1. Verifies the email on its side (sets email_confirmed_at).
 *   2. Redirects to this page with tokens in the **URL hash fragment** (#).
 *
 * Hash params on success: access_token, refresh_token, token_type, expires_in, type
 * Hash params on error:   error, error_code, error_description
 *
 * This page parses the hash, and on success calls the backend to sync the
 * local database's emailVerified flag.
 */
export function VerifyEmailPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [message, setMessage] = useState('')

  useEffect(() => {
    handleHashRedirect()
  }, [])

  const handleHashRedirect = async () => {
    const hash = window.location.hash.substring(1)

    if (!hash) {
      setIsLoading(false)
      setStatus('pending')
      return
    }

    const params = new URLSearchParams(hash)

    const error = params.get('error')
    const errorDescription = params.get('error_description')

    if (error) {
      setIsLoading(false)
      setStatus('error')
      setMessage(
        errorDescription?.replace(/\+/g, ' ') ||
        'Verification failed. The link may have expired.'
      )
      return
    }

    const accessToken = params.get('access_token')
    const type = params.get('type')

    if (accessToken) {
      try {
        await authService.confirmEmailVerification(accessToken, type || 'signup')
        setStatus('success')
        setMessage('Your email has been successfully verified.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } catch (err: any) {
        setStatus('error')
        setMessage(
          err.message ||
          'Email was verified but we could not update your account. Please try logging in.'
        )
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
      setStatus('pending')
    }
  }

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
          position: 'relative',
          zIndex: 2,
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(24, 24, 27, 0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7), 0 0 30px rgba(16,185,129,0.08)',
          borderRadius: '24px',
          padding: '48px 36px',
          textAlign: 'center',
        }}
      >
        {/* Pending — no hash, just arrived from "check your email" flow */}
        {status === 'pending' && !isLoading && (
          <>
            {/* Brand header */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <img src={logo} alt="Unique Capital Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
              <p style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                UNIQUE <span style={{ color: '#10b981', fontWeight: 600 }}>CAPITAL</span>
              </p>
            </div>

            {/* Icon */}
            <div style={{
              margin: '0 auto 20px',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Mail className="h-7 w-7" style={{ color: '#10b981' }} />
            </div>

            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
            }}>
              Verify your email
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#a1a1aa',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}>
              We've sent a verification link to your email. Please check your inbox and click the link to verify your account.
            </p>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#10b981',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.3s',
              }}
            >
              Back to Sign in
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}

        {/* Loading state */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
            {/* Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
              <img src={logo} alt="Unique Capital Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
              <p style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                UNIQUE <span style={{ color: '#10b981', fontWeight: 600 }}>CAPITAL</span>
              </p>
            </div>

            {/* Spinner ring */}
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <div style={{
                position: 'absolute',
                inset: 0,
                border: '3px solid transparent',
                borderTopColor: '#10b981',
                borderRightColor: '#10b981',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}></div>
              <div style={{
                position: 'absolute',
                inset: '8px',
                border: '3px solid transparent',
                borderBottomColor: '#34d399',
                borderRadius: '50%',
                animation: 'spin 1.5s linear infinite reverse',
              }}></div>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  background: '#10b981',
                  borderRadius: '50%',
                  animation: 'pulse 2s ease-in-out infinite',
                }}></div>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#a1a1aa', fontWeight: 500 }}>
              Verifying your email...
            </p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <img src={logo} alt="Unique Capital Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
              <p style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                UNIQUE <span style={{ color: '#10b981', fontWeight: 600 }}>CAPITAL</span>
              </p>
            </div>

            {/* Success icon with glow */}
            <div style={{
              margin: '0 auto 20px',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
            }}>
              <ShieldCheck className="h-8 w-8" style={{ color: '#10b981' }} />
            </div>

            <h2 style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
            }}>
              Email Verified!
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#d4d4d8',
              lineHeight: 1.6,
              margin: '0 0 8px',
            }}>
              {message}
            </p>
            <p style={{
              fontSize: '13px',
              color: '#71717a',
              marginBottom: '28px',
            }}>
              Redirecting you to login...
            </p>

            {/* Progress bar animation */}
            <div style={{
              width: '100%',
              height: '3px',
              background: 'rgba(16, 185, 129, 0.15)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                borderRadius: '99px',
                animation: 'progressBar 3s ease-in-out forwards',
              }}></div>
            </div>
          </>
        )}

        {/* Error */}
        {status === 'error' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
              <img src={logo} alt="Unique Capital Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
              <p style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
                UNIQUE <span style={{ color: '#10b981', fontWeight: 600 }}>CAPITAL</span>
              </p>
            </div>

            {/* Error icon */}
            <div style={{
              margin: '0 auto 20px',
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <XCircle className="h-8 w-8" style={{ color: '#ef4444' }} />
            </div>

            <h2 style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#ffffff',
              marginBottom: '8px',
            }}>
              Verification Failed
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#a1a1aa',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}>
              {message}
            </p>

            {/* Error alert */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(220, 38, 38, 0.15)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '28px',
              fontSize: '12px',
              color: '#fca5a5',
              textAlign: 'left',
            }}>
              <XCircle className="h-4 w-4 shrink-0" />
              <span>The verification link may have expired. Please request a new one.</span>
            </div>

            <Link
              to="/login"
              className="submit-button"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                height: '45px',
                background: 'transparent',
                borderRadius: '40px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                color: '#ffffff',
                border: '2px solid #10b981',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <span>Back to Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </>
        )}
      </div>

      {/* Inline keyframe styles for animations */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}
