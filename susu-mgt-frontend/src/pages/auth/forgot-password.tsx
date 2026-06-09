import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authService } from '@/services/api/auth.service'
import { KeyRound, Mail, Loader2, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'
import logo from '../../assets/logo2.png'
import './auth-page.css'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await authService.resetPassword({ 
        email,
        redirectTo: `${window.location.origin}/auth/reset-password`
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
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
          {/* Brand header */}
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
            <CheckCircle2 className="h-8 w-8" style={{ color: '#10b981' }} />
          </div>

          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Check your email
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#d4d4d8',
            lineHeight: 1.6,
            margin: '0 0 28px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            We've sent a password reset link to <span style={{ color: '#ffffff', fontWeight: 600 }}>{email}</span>.
          </p>

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
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            <span>Back to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    )
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
        }}
      >
        {/* Brand header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <img src={logo} alt="Unique Capital Logo" style={{ height: '48px', objectFit: 'contain', marginBottom: '8px' }} />
          <p style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            UNIQUE <span style={{ color: '#10b981', fontWeight: 600 }}>CAPITAL</span>
          </p>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
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
            <KeyRound className="h-7 w-7" style={{ color: '#10b981' }} />
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '8px',
            fontFamily: 'Poppins, sans-serif'
          }}>
            Forgot Password?
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#a1a1aa',
            lineHeight: 1.6,
            margin: 0,
            fontFamily: 'Poppins, sans-serif'
          }}>
            No worries, we'll send you reset instructions.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            padding: '12px 16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#fca5a5',
          }}>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <div
            className="field-wrapper"
            style={{
              position: 'relative',
              width: '100%',
              height: '48px',
              marginBottom: '28px',
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              style={{
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.02)',
                border: 'none',
                borderBottom: `2px solid ${email ? '#10b981' : '#3f3f46'}`,
                borderRadius: '8px 8px 0 0',
                outline: 'none',
                fontSize: '14px',
                color: '#ffffff',
                fontWeight: 500,
                paddingLeft: '32px',
                paddingRight: '36px',
                transition: 'all 0.3s ease',
                fontFamily: 'Poppins, sans-serif',
              }}
              onFocus={(e) => {
                e.target.style.background = 'rgba(16, 185, 129, 0.04)'
                e.target.style.borderBottomColor = '#10b981'
              }}
              onBlur={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.02)'
                if (!email) e.target.style.borderBottomColor = '#3f3f46'
              }}
            />
            <label
              style={{
                position: 'absolute',
                top: email ? '-6px' : '50%',
                left: email ? '0px' : '32px',
                transform: email ? 'none' : 'translateY(-50%)',
                fontSize: email ? '11px' : '14px',
                fontWeight: email ? 600 : 400,
                color: email ? '#10b981' : '#a1a1aa',
                pointerEvents: 'none',
                transition: 'all 0.3s ease',
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              Email Address
            </label>
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '8px',
                transform: 'translateY(-50%)',
                color: email ? '#10b981' : '#a1a1aa',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.3s ease',
              }}
            >
              <Mail className="h-4 w-4" />
            </span>
          </div>

          {/* Submit button — uses auth-page.css .submit-button class */}
          <button
            className="submit-button"
            type="submit"
            disabled={isLoading}
            style={{
              position: 'relative',
              width: '100%',
              height: '45px',
              background: 'transparent',
              borderRadius: '40px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              color: '#ffffff',
              border: '2px solid #10b981',
              overflow: 'hidden',
              zIndex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              fontFamily: 'Poppins, sans-serif'
            }}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to sign in */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#a1a1aa',
          marginTop: '24px',
          fontFamily: 'Poppins, sans-serif'
        }}>
          Remembered your password?{' '}
          <Link
            to="/login"
            style={{
              color: '#10b981',
              fontWeight: 600,
              textDecoration: 'none',
              transition: '0.3s',
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
