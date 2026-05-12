import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaystackPayment } from 'react-paystack'
import { 
  CreditCard, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { paymentsService } from '@/services/api/payments.service'
import { useAuthStore } from '@/store'

export function DepositPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Paystack Config
  const [paystackConfig, setPaystackConfig] = useState<any>(null)
  const initializePayment = usePaystackPayment(paystackConfig || {})

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setIsInitializing(true)
      setError(null)
      
      const initData = await paymentsService.initializePaystack(Number(amount))
      
      const config = {
        reference: initData.referenceId,
        email: user?.email,
        amount: Number(amount) * 100,
        currency: initData.currency,
        accessCode: initData.accessCode, // Pass the access code from backend
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample',
      }

      setPaystackConfig(config)
      
      // We need to wait for state to update before calling initializePayment
      // but usePaystackPayment returns a function we call.
      // Since we are setting config dynamically, we might need a better approach or just use the hook with the config.
      // For now, let's assume the user will click "Pay Now" button which appears after init.
    } catch (err: any) {
      console.error('Error initializing payment:', err)
      setError(err.response?.data?.message || 'Failed to initialize payment')
    } finally {
      setIsInitializing(false)
    }
  }

  const onSuccess = async (reference: any) => {
    try {
      await paymentsService.verifyPaystackTransaction(reference.reference)
      setSuccess(true)
    } catch (err: any) {
      setError('Payment verification failed. Please contact support if your money was deducted.')
    }
  }

  const onClose = () => {
    console.log('Payment closed')
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Deposit Successful!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
          Your wallet has been credited with GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}.
        </p>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setAmount('')
              setPaystackConfig(null)
              setSuccess(false)
            }}
          >
            Deposit More
          </Button>
          <Button onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Deposit Funds</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Add money to your smart susu wallet securely.</p>
        </div>
      </div>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Online Payment
            </CardTitle>
            <CardDescription>
              Pay securely via Paystack using Mobile Money or Card.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInitialize} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Amount (GH₵)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">GH₵</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-14 text-lg font-bold"
                    step="0.01"
                    min="1"
                    required
                    disabled={isInitializing || paystackConfig}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {!paystackConfig ? (
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold"
                  disabled={isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    'Initialize Payment'
                  )}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Ready to Pay</p>
                      <p className="text-xl font-extrabold text-blue-900 dark:text-blue-100">GH₵ {Number(amount).toLocaleString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setPaystackConfig(null)}>Change</Button>
                  </div>
                  <Button 
                    type="button"
                    className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                    onClick={() => {
                      // @ts-ignore
                      initializePayment(onSuccess, onClose)
                    }}
                  >
                    Pay Now
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
          <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex justify-center py-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secured by industry-standard encryption
            </div>
          </CardFooter>
        </Card>

        {/* Other Options */}
        <div className="p-6 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-800 flex items-center justify-between overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="font-bold text-lg mb-1">Cash Deposit?</h3>
            <p className="text-sm text-zinc-400">Wait for our verified field worker to visit you.</p>
          </div>
          <div className="bg-white/10 p-3 rounded-full relative z-10">
            <Wallet className="h-8 w-8 text-blue-400" />
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  )
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  )
}
