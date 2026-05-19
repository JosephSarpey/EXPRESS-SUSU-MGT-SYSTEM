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
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4 animate-in fade-in zoom-in duration-300">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 p-6 rounded-full mb-6">
          <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Request Submitted!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
          Your withdrawal request for GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} has been received and is pending approval.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate('/customer/transactions')}>View Status</Button>
          <Button onClick={() => navigate('/customer/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const methods: { id: PaymentMethod; name: string; description: string; icon: any }[] = [
    { 
      id: 'MTN_MOMO', 
      name: 'MTN MoMo', 
      description: 'MTN Mobile Money withdrawal', 
      icon: Smartphone 
    },
    { 
      id: 'TELECEL_CASH', 
      name: 'Telecel Cash', 
      description: 'Telecel (Vodafone) Cash withdrawal', 
      icon: Smartphone 
    },
    { 
      id: 'AIRTELTIGO_MONEY', 
      name: 'AirtelTigo Money', 
      description: 'AirtelTigo Money withdrawal', 
      icon: Smartphone 
    },
    { 
      id: 'BANK_TRANSFER', 
      name: 'Bank Transfer', 
      description: 'Transfer to any local bank', 
      icon: Banknote 
    },
    { 
      id: 'CASH', 
      name: 'Worker Cash', 
      description: 'Receive cash from our field agent', 
      icon: Wallet 
    },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Withdraw Funds</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Request a payout from your susu wallet.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpRight className="h-6 w-6 text-amber-600" />
            Withdrawal Details
          </CardTitle>
          <CardDescription>
            Enter the amount and select your preferred payment method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
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
                  min={minWithdrawalAmount}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-1">
                The minimum withdrawal amount is GH₵ {minWithdrawalAmount.toFixed(2)}. Funds will be deducted from your available balance.
              </p>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                Select Payout Method
              </label>
              <div className="grid gap-3">
                {methods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border text-left transition-all",
                      method === m.id
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-600"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl",
                        method === m.id ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      )}>
                        <m.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{m.name}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{m.description}</p>
                      </div>
                    </div>
                    {method === m.id && (
                      <div className="h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Request Withdrawal'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex justify-center py-4">
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
            Approvals typically take 2-4 business hours
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
