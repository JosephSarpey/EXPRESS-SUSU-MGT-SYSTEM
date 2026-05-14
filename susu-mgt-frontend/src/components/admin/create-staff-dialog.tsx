import { useState } from 'react'
import { X, User, Mail, Phone, Lock, ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminService } from '@/services/api/admin.service'

interface CreateStaffDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateStaffDialog({ isOpen, onClose, onSuccess }: CreateStaffDialogProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'WORKER'>('WORKER')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await adminService.createStaff({
        fullName,
        email,
        phone,
        password,
        role
      })
      onSuccess()
      onClose()
      // Reset form
      setFullName('')
      setEmail('')
      setPhone('')
      setPassword('')
      setRole('WORKER')
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create staff account')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClasses = "pl-10 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none"
  const labelClasses = "block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 ml-1"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Create Staff Account</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelClasses}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
                placeholder="Enter full name"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="staff@example.com"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClasses}
                placeholder="024XXXXXXX"
              />
            </div>
          </div>

          <div>
            <label className={labelClasses}>Initial Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClasses}>System Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('WORKER')}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  role === 'WORKER'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600'
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500'
                }`}
              >
                Worker
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                  role === 'ADMIN'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 text-blue-600'
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition-all font-bold"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
