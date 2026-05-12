import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Wallet, 
  Search, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Scan,
  Smartphone
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { workersService } from '@/services/api/workers.service'
import { usersService } from '@/services/api/users.service'
import { cn } from '@/lib/utils'

export function CashDepositPage() {
  const navigate = useNavigate()
  const [userId, setUserId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [foundUser, setFoundUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      setIsSearching(true)
      setError(null)
      setFoundUser(null)
      
      const user = await usersService.getUserById(userId)
      if (user.role !== 'CUSTOMER') {
        throw new Error('User found is not a customer.')
      }
      setFoundUser(user)
    } catch (err: any) {
      console.error('Error searching user:', err)
      setError(err.response?.status === 404 ? 'User not found. Please verify the ID.' : (err.message || 'Failed to search user.'))
    } finally {
      setIsSearching(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foundUser || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return

    try {
      setIsSubmitting(true)
      setError(null)
      
      await workersService.createCashDeposit({
        userId: foundUser.id,
        amount: Number(amount),
        description: description || 'Cash collection'
      })
      
      setSuccess(true)
    } catch (err: any) {
      console.error('Error creating cash deposit:', err)
      setError(err.response?.data?.message || 'Failed to record deposit. Ensure your session is active.')
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
        <h1 className="text-3xl font-extrabold mb-2">Deposit Recorded!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
          Successfully collected GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} from {foundUser.fullName}.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => {
            setSuccess(false)
            setAmount('')
            setFoundUser(null)
            setUserId('')
            setDescription('')
          }}>Record Another</Button>
          <Button onClick={() => navigate('/worker/dashboard')}>Go to Dashboard</Button>
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
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Record Collection</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Manually record cash received from a customer.</p>
        </div>
      </div>

      <div className="grid gap-8">
        {/* Step 1: Find User */}
        <Card className={cn(foundUser && "opacity-50")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              1. Find Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearchUser} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input 
                  placeholder="Enter Customer UUID..." 
                  className="pl-10 h-11"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={isSearching || !!foundUser}
                  required
                />
              </div>
              <Button type="submit" disabled={isSearching || !!foundUser} className="h-11 px-6">
                {isSearching ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Step 2: Record Amount */}
        <Card className={cn("transition-all duration-500", !foundUser ? "opacity-30 pointer-events-none translate-y-4" : "translate-y-0")}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-600" />
              2. Deposit Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {foundUser && (
              <div className="mb-8 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center gap-4 border border-blue-100 dark:border-blue-900/30">
                <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {foundUser.fullName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-extrabold text-blue-900 dark:text-blue-100">{foundUser.fullName}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">{foundUser.email}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setFoundUser(null)} className="text-blue-600">Change</Button>
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Amount Collected (GH₵)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">GH₵</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-14 h-12 text-lg font-bold"
                    step="0.01"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">
                  Description / Remarks
                </label>
                <Input
                  placeholder="e.g., Weekly contribution"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-12"
                />
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                disabled={isSubmitting || !foundUser}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Confirm Collection'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-zinc-50 dark:bg-zinc-900/50 flex justify-center py-4">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-xs font-medium uppercase tracking-widest">
              <Scan className="h-4 w-4 text-blue-600" />
              Verify ID before proceeding
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="p-6 rounded-3xl bg-zinc-900 text-white flex items-center justify-between">
        <div>
          <h4 className="font-bold">Need to verify?</h4>
          <p className="text-sm text-zinc-400">Call the customer to confirm their identity if unsure.</p>
        </div>
        <div className="p-3 bg-white/10 rounded-2xl">
          <Smartphone className="h-6 w-6 text-blue-400" />
        </div>
      </div>
    </div>
  )
}
