




import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaystackPayment } from 'react-paystack'
import { 
  CreditCard, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  User,
  Bell
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
        accessCode: initData.accessCode, 
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample',
      }

      setPaystackConfig(config)
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
  }

  if (success) {
    return (
      <div className="bg-[#003366] min-h-screen text-white font-sans flex items-center justify-center p-4">
        <div className="bg-white text-[#003366] p-8 md:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-emerald-50 inline-block p-5 rounded-full mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 stroke-[2]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-[#002244]">Deposit Successful!</h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Your wallet has been credited with <span className="font-bold text-[#003366]">GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold h-11 border-zinc-200 text-xs text-[#003366] hover:bg-zinc-50"
              onClick={() => {
                setAmount('')
                setPaystackConfig(null)
                setSuccess(false)
              }}
            >
              Deposit More
            </Button>
            <Button 
              className="rounded-xl font-bold h-11 bg-[#003366] hover:bg-[#002244] text-white text-xs shadow-md"
              onClick={() => navigate('/customer/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#003366] min-h-screen text-white font-sans w-full flex flex-col justify-between pb-12 md:pb-6">
      
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full text-white hover:bg-white/10 hover:text-[#FFCC00] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Deposit Funds</h1>
            <p className="text-xs text-blue-200 hidden sm:block mt-0.5">Add money to your wallet securely using modern payment gateways.</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-2 border-2 border-[#FFCC00] rounded-full cursor-pointer hidden md:block">
            <User className="h-5 w-5 text-[#FFCC00]" />
          </div>
          <div className="relative cursor-pointer p-2 hidden md:block">
            <Bell className="h-6 w-6 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#FFCC00] rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 mt-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Main Transaction Form Container */}
          <div className="md:col-span-3">
            <Card className="border-none bg-white text-[#003366] shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-100 pb-5 pt-6 px-6">
                <CardTitle className="flex items-center gap-2.5 text-base font-black text-[#002244]">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#003366]">
                    <CreditCard className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  Online Top-up
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">
                  Pay securely via Paystack using Mobile Money transactions or debit cards.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 px-6">
                <form onSubmit={handleInitialize} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                      Amount (GH₵)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400 text-lg">GH₵</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-16 h-14 text-xl font-black tracking-tight border-zinc-200 bg-zinc-50/50 focus-visible:ring-[#003366] rounded-xl text-[#002244]"
                        step="0.01"
                        min="1"
                        required
                        disabled={isInitializing || paystackConfig}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-2.5 text-red-600 animate-in fade-in duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-xs font-semibold leading-relaxed">{error}</p>
                    </div>
                  )}

                  {!paystackConfig ? (
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-xs font-bold rounded-xl bg-[#003366] hover:bg-[#002244] text-white shadow-md transition-colors"
                      disabled={isInitializing}
                    >
                      {isInitializing ? (
                        <>
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                          Initializing Gateway Connection...
                        </>
                      ) : (
                        'Initialize Payment'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4 className= animate-in fade-in duration-200">
                      <div className="bg-blue-50/60 border border-blue-100/50 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest">Amount Authorized</p>
                          <p className="text-2xl font-black text-[#002244] mt-0.5">
                            <span className="text-sm font-medium opacity-60 mr-0.5">GH₵</span>
                            {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="text-xs font-bold text-zinc-500 hover:bg-zinc-200/50 rounded-lg h-8"
                          onClick={() => setPaystackConfig(null)}
                        >
                          Modify
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        className="w-full h-12 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg transition-all duration-200"
                        onClick={() => {
                          // @ts-ignore
                          initializePayment(onSuccess, onClose)
                        }}
                      >
                        Complete Secure Checkout
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
              
              <CardFooter className="bg-zinc-50/50 border-t border-zinc-100 flex justify-center py-4 px-6">
                <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                  Encrypted structural architecture platform
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Secondary Context Sidebar Panel */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white shadow-md relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-xl shrink-0 text-[#FFCC00]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-tight">Alternative Processing</h3>
                  <p className="text-xs text-blue-200 mt-1.5 leading-relaxed">
                    Prefer direct transactions? You can hold your balance and interface directly with verified field agents to securely handle matching platform collections.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-blue-200 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 w-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Gateway Engine Connectivity Active</span>
            </div>
          </div>

        </div>
      </main>

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
      strokeWidth="2.5" 
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