import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowUpRight, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Banknote,
  Smartphone,
  Wallet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { transactionsService, PaymentMethod } from '@/services/api/transactions.service'
import { cn } from '@/lib/utils'

export function WithdrawPage() {
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState<PaymentMethod>('MTN_MOMO')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [minWithdrawalAmount] = useState(() => {
    const val = localStorage.getItem("susu_min_withdrawal_amount")
    return val ? Number(val) : 50.00
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const enteredAmount = Number(amount)
    if (!amount || isNaN(enteredAmount) || enteredAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (enteredAmount < minWithdrawalAmount) {
      setError(`The minimum allowed withdrawal is GH₵ ${minWithdrawalAmount.toFixed(2)}`)
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      
      await transactionsService.createWithdrawal({
        amount: enteredAmount,
        method
      })
      
      setSuccess(true)
    } catch (err: any) {
      console.error('Error requesting withdrawal:', err)
      setError(err.response?.data?.message || 'Failed to request withdrawal. Ensure you have sufficient balance.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#003366] min-h-screen text-white font-sans flex items-center justify-center p-4">
        <div className="bg-white text-[#003366] p-8 md:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-emerald-50 inline-block p-5 rounded-full mb-6 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-14 w-14 text-emerald-600 stroke-[2]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2 text-[#002244]">Request Submitted!</h1>
          <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
            Your withdrawal request for <span className="font-bold text-[#003366]">GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> has been received and is pending approval.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold h-11 border-zinc-200 text-xs text-[#003366] hover:bg-zinc-50"
              onClick={() => navigate('/customer/transactions')}
            >
              View Status
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

  const methods: { id: PaymentMethod; name: string; description: string; icon: any }[] = [
    { 
      id: 'MTN_MOMO', 
      name: 'MTN MoMo', 
      description: 'MTN Mobile Money withdrawal payout channel', 
      icon: Smartphone 
    },
    { 
      id: 'TELECEL_CASH', 
      name: 'Telecel Cash', 
      description: 'Telecel Cash secondary mobile wallet channel', 
      icon: Smartphone 
    },
    { 
      id: 'AIRTELTIGO_MONEY', 
      name: 'AirtelTigo Money', 
      description: 'AirtelTigo Money network transfer system', 
      icon: Smartphone 
    },
    { 
      id: 'BANK_TRANSFER', 
      name: 'Bank Transfer', 
      description: 'Clear direct transfer routes to any local clearing bank', 
      icon: Banknote 
    },
    { 
      id: 'CASH', 
      name: 'Worker Cash', 
      description: 'Receive physical cash via match ledger agents', 
      icon: Wallet 
    },
  ]

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
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">Withdraw Funds</h1>
            <p className="text-xs text-blue-200 hidden sm:block mt-0.5">Debit matching parameters securely from your automated wallet balance.</p>
          </div>
        </div>
      </header>

      {/* Main Base Flex Layout Container */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 mt-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
          
          {/* Main Request Form Component Box */}
          <div className="md:col-span-3">
            <Card className="border-none bg-white text-[#003366] shadow-2xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-zinc-100 pb-5 pt-6 px-6">
                <CardTitle className="flex items-center gap-2.5 text-base font-black text-[#002244]">
                  <div className="p-2 bg-blue-50 rounded-xl text-[#003366]">
                    <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  Withdrawal Details
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">
                  Specify payout units and assign clear balance route targets safely.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6 px-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Amount Value Entry Node */}
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
                        min={minWithdrawalAmount}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-[10px] leading-normal font-medium text-zinc-400 pt-0.5 ml-0.5">
                      The current threshold platform withdrawal parameter limits require a minimum of <span className="font-bold text-[#003366]">GH₵ {minWithdrawalAmount.toFixed(2)}</span>.
                    </p>
                  </div>

                  {/* Channel Choice Segment list Selection Grid */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                      Select Payout Channel Method
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {methods.map((m) => {
                        const isSelected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMethod(m.id)}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 relative overflow-hidden",
                              isSelected
                                ? "border-[#003366] bg-[#003366]/5 ring-1 ring-[#003366]"
                                : "border-zinc-100 hover:bg-zinc-50"
                            )}
                          >
                            <div className="flex items-center gap-3 relative z-10">
                              <div className={cn(
                                "p-2 rounded-xl transition-colors",
                                isSelected 
                                  ? "bg-[#003366] text-white" 
                                  : "bg-zinc-50 text-zinc-400"
                              )}>
                                <m.icon className="h-4 w-4 stroke-[2.2]" />
                              </div>
                              <div>
                                <p className="font-bold text-xs text-[#002244]">{m.name}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">{m.description}</p>
                              </div>
                            </div>
                            
                            {isSelected && (
                              <div className="h-4 w-4 rounded-full bg-[#003366] flex items-center justify-center shrink-0 relative z-10">
                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-2.5 text-red-600 animate-in fade-in duration-200">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-xs font-semibold leading-relaxed">{error}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-12 text-xs font-bold rounded-xl bg-[#003366] hover:bg-[#002244] text-white shadow-md transition-colors"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Transmitting Ledger Request parameters...
                      </>
                    ) : (
                      'Request Withdrawal Payout'
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="bg-zinc-50/50 border-t border-zinc-100 flex justify-center py-4 px-6 text-center">
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">
                  Authorized processing queues resolve inside 2-4 corporate hours
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right Sidebar Information Area Context Box */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-white shadow-md relative overflow-hidden">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-xl shrink-0 text-[#FFCC00]">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white uppercase tracking-tight">Ledger Operations</h3>
                  <p className="text-xs text-blue-200 mt-1.5 leading-relaxed">
                    Withdrawals are debited directly from clear unencumbered wallet assets. Ensure destination parameters mirror registration profiles to prevent network routing exceptions.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-blue-200 flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 w-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Withdrawal Node Engine Verification Sync Active</span>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}