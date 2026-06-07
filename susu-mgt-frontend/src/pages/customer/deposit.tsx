import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePaystackPayment } from 'react-paystack'
import { MobileNavbar } from './mobileNavbar'
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
      <div className="bg-[#070c1e] min-h-screen text-white font-sans flex items-center justify-center p-4">
        <div className="bg-[#0f1630] border border-white/5 text-white p-6 sm:p-8 md:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-emerald-500/10 inline-block p-4 sm:p-5 rounded-full mb-6 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-400 stroke-[2]" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent leading-tight">Deposit Successful!</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mb-8 leading-relaxed font-medium px-1">
            Your wallet has been credited with <span className="font-extrabold text-emerald-400 tracking-tight">GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold h-11 border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-xs text-zinc-300 hover:text-white transition-all duration-200 w-full"
              onClick={() => {
                setAmount('')
                setPaystackConfig(null)
                setSuccess(false)
              }}
            >
              Deposit More
            </Button>
            <Button 
              className="rounded-xl font-black h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-lg transition-all duration-200 w-full"
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
    <div className="bg-[#070c1e] min-h-screen text-white font-sans w-full flex flex-col justify-between pb-12 md:pb-6 relative selection:bg-emerald-500/30">
      
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between border-b border-white/5 relative">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white  bg-clip-text text-transparent truncate leading-normal to-zinc-400">Deposit Funds</h1>
            <p className="text-[11px] sm:text-xs text-zinc-400 hidden sm:block mt-0.5 truncate font-medium">Add money to your wallet securely using modern payment gateways.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="p-2 border border-white/5 bg-[#0f1630] rounded-full cursor-pointer hidden md:block hover:bg-[#141d3d] text-zinc-400 hover:text-emerald-400 transition-all duration-200">
            <User className="h-5 w-5" />
          </div>
          <div className="relative cursor-pointer p-2 hidden md:block opacity-90 hover:opacity-100 transition-all duration-200 rounded-full hover:bg-white/5">
            <Bell className="h-6 w-6 text-zinc-400 hover:text-white transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          </div>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 mt-6 sm:mt-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start mb-7">
          
          {/* Main Transaction Form Container */}
          <div className="md:col-span-3">
            <Card className="border border-white/5 bg-[#0f1630] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
              <CardHeader className="border-b border-white/5 pb-5 pt-6 px-4 sm:px-6 bg-[#0b1026]">
                <CardTitle className="flex items-center gap-2.5 text-sm sm:text-base font-bold text-white tracking-tight">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    <CreditCard className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                  Online Top-up
                </CardTitle>
                <CardDescription className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-normal font-medium">
                  Pay securely via Paystack using Mobile Money transactions or debit cards.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 px-4 sm:px-6 bg-[#0f1630]">
                <form onSubmit={handleInitialize} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                      Amount (GH₵)
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-500 text-base sm:text-lg transition-colors group-hover:text-emerald-400">GH₵</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-16 h-14 text-lg sm:text-xl font-bold tracking-tight bg-[#141d3d] border border-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
                        step="0.01"
                        min="1"
                        required
                        disabled={isInitializing || paystackConfig}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-xs font-semibold leading-relaxed">{error}</p>
                    </div>
                  )}

                  {!paystackConfig ? (
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                      disabled={isInitializing}
                    >
                      {isInitializing ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wider">
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          <span>Initializing Gateway Connection...</span>
                        </div>
                      ) : (
                        'Initialize Payment'
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-200">
                      <div className="bg-[#141d3d] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-2xs gap-3">
                        <div className="min-w-0">
                          <p className="text-[9px] sm:text-[10px] text-blue-400 font-bold uppercase tracking-widest truncate">Amount Authorized</p>
                          <p className="text-xl sm:text-2xl font-bold text-white mt-0.5 tracking-tight truncate">
                            <span className="text-xs sm:text-sm font-bold opacity-60 mr-0.5 text-emerald-400">GH₵</span>
                            {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="sm" 
                          className="text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl h-8.5 transition-colors shrink-0"
                          onClick={() => setPaystackConfig(null)}
                        >
                          Modify
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
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
              
              <CardFooter className="bg-[#0b1026]/40 border-t border-white/5 flex justify-center py-4 px-4 sm:px-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[10px] sm:text-[11px] font-bold tracking-tight">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400 stroke-[2.5] shrink-0" />
                  <span>Encrypted structural architecture platform</span>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Right Secondary Context Sidebar Panel */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1630] border border-white/5 text-white shadow-md relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-200">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="bg-white/5 p-3 rounded-xl shrink-0 text-blue-400 group-hover:scale-105 transition-transform duration-200">
                  <Wallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-white uppercase tracking-tight">Alternative Processing</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    Prefer direct transactions? You can hold your balance and interface directly with verified field agents to securely handle matching platform collections.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold flex items-center justify-center gap-2 bg-[#0f1630] border border-white/5 rounded-xl py-3 px-3 text-center w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span></span>
            </div>
          </div>

        </div>
        < MobileNavbar />
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