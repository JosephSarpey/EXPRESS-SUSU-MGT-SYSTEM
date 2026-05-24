
import { useState, useEffect } from 'react'
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
import { useDebounce } from '@/hooks/use-debounce'

export function CashDepositPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [foundUser, setFoundUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setSearchResults([])
        return
      }

      try {
        setIsSearching(true)
        setError(null)
        const res = await usersService.getAllUsers({
          search: debouncedSearch,
          role: 'CUSTOMER',
          limit: 10,
        })
        setSearchResults(res.data)
      } catch (err: any) {
        console.error('Error fetching customers:', err)
        setError('Failed to search customers.')
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedSearch])

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
      <div className="bg-[#070c1e] min-h-screen text-white font-sans flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-300 relative selection:bg-emerald-500/30">
        <div className="bg-[#0f1630] border border-white/5 text-white p-8 md:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="bg-emerald-500/10 inline-block p-5 rounded-full mb-6 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-14 w-14 text-emerald-400 stroke-[2]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Deposit Recorded!</h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-medium">
            Successfully collected <span className="font-extrabold text-emerald-400">GH₵ {Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span> from {foundUser.fullName}.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button 
              variant="outline" 
              className="rounded-xl font-bold h-11 border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-xs text-zinc-300 hover:text-white transition-all duration-200"
              onClick={() => {
                setSuccess(false)
                setAmount('')
                setFoundUser(null)
                setSearchQuery('')
                setSearchResults([])
                setDescription('')
              }}
            >
              Record Another
            </Button>
            <Button 
              className="rounded-xl font-black h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-lg transition-all duration-200"
              onClick={() => navigate('/worker/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#070c1e] min-h-screen text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 animate-in fade-in duration-500">
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        
        {/* Header Row */}
        <div className="flex items-center gap-4 pb-6 border-b border-white/5">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Record Collection</h1>
            <p className="text-xs text-zinc-400 mt-1">Manually record cash received from a customer.</p>
          </div>
        </div>

        <div className="grid gap-8">
          
          {/* Step 1: Find User */}
          <Card className={cn("border border-white/5 bg-[#0f1630] text-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-300", foundUser && "opacity-40")}>
            <CardHeader className="bg-[#0b1026] p-4 md:p-6 border-b border-white/5">
              <CardTitle className="text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl">
                  <Search className="h-4 w-4 stroke-[2.5]" />
                </div>
                1. Find Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-[#0f1630]">
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-blue-500 transition-colors duration-200" />
                  <Input 
                    placeholder="Search customer by name, email, or UUID..." 
                    className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching || !!foundUser}
                  />
                </div>
                {isSearching && (
                  <div className="flex items-center px-3 shrink-0">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  </div>
                )}
              </form>

              {searchResults.length > 0 && !foundUser && (
                <div className="mt-4 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 bg-[#0f1630] shadow-2xl max-h-60 overflow-y-auto animate-in slide-in-from-top-2 duration-200 ring-1 ring-black/5">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setFoundUser(user)
                        setSearchQuery('')
                        setSearchResults([])
                        setDescription('')
                      }}
                      className="w-full text-left px-4 py-3.5 hover:bg-[#131c3d]/60 flex items-center justify-between transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-200 group-hover:text-blue-400 transition-colors duration-200 text-sm tracking-tight">
                            {user.fullName}
                          </p>
                          <p className="text-xs text-zinc-500 font-medium">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono tracking-wider bg-[#141d3d] px-1.5 py-0.5 rounded border border-white/5 uppercase">
                        #{user.id.slice(0, 8)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              
              {searchQuery && !isSearching && searchResults.length === 0 && !foundUser && (
                <div className="mt-4 p-6 text-center text-xs font-semibold text-zinc-500 bg-[#0b1026]/40 rounded-xl border border-dashed border-white/5 tracking-tight">
                  No customers found matching "{searchQuery}"
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Record Amount */}
          <Card className={cn("border border-white/5 bg-[#0f1630] text-white rounded-2xl overflow-hidden shadow-2xl transition-all duration-500", !foundUser ? "opacity-30 pointer-events-none translate-y-4" : "translate-y-0")}>
            <CardHeader className="bg-[#0b1026] p-4 md:p-6 border-b border-white/5">
              <CardTitle className="text-sm md:text-base font-bold tracking-tight text-white flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
                  <Wallet className="h-4 w-4 stroke-[2.5]" />
                </div>
                2. Deposit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 bg-[#0f1630]">
              {foundUser && (
                <div className="mb-6 p-4 rounded-xl bg-blue-500/5 flex items-center gap-4 border border-blue-500/10 shadow-2xs animate-in fade-in duration-200">
                  <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/10">
                    {foundUser.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-white tracking-tight truncate">{foundUser.fullName}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5">{foundUser.email}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFoundUser(null)} 
                    className="text-xs font-bold text-blue-400 hover:bg-white/5 rounded-xl h-8 px-2.5"
                  >
                    Change
                  </Button>
                </div>
              )}

              <form onSubmit={handleDeposit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                    Amount Collected (GH₵)
                  </label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-500 text-lg transition-colors group-hover:text-emerald-400">GH₵</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-16 h-14 text-xl font-bold tracking-tight bg-[#141d3d] border border-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                      step="0.01"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                    Description / Remarks
                  </label>
                  <Input
                    placeholder="e.g., Weekly contribution"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-12 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
                    <p className="text-xs font-semibold leading-relaxed">{error}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                  disabled={isSubmitting || !foundUser}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Collection'
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-[#0b1026]/40 border-t border-white/5 flex justify-center py-4">
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                <Scan className="h-4 w-4 text-blue-400" />
                Verify ID before proceeding
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Verification Alert Footer Panel */}
        <div className="p-5 rounded-2xl bg-[#0f1630] border border-white/10 text-white shadow-md relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-200">
          <div className="flex items-start gap-4">
            <div className="bg-white/5 p-3 rounded-xl shrink-0 text-blue-400 group-hover:scale-105 transition-transform duration-200">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white uppercase tracking-tight">Need to verify?</h3>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                Call the customer to confirm their identity if unsure. Always cross-reference destination parameters with active ledger matching criteria.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}