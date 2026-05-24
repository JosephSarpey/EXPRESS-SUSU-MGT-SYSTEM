import { useState } from 'react'
import {
  ArrowLeft,
  Search,
  Wallet,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import { useAdminUIStore } from '@/store/admin-ui-store'
import { useWallets, useLockWallet, useUnlockWallet } from '@/hooks/use-admin'

export function WalletsPage() {
  const navigate = useNavigate()
  const { search, setSearch, page, setPage } = useAdminUIStore(state => state.wallets)
  const [limit] = useState(10)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useWallets({
    page,
    limit,
    search: debouncedSearch || undefined
  })

  const wallets = data?.data || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / limit)

  const lockWallet = useLockWallet()
  const unlockWallet = useUnlockWallet()

  const handleLock = (userId: string) => {
    if (!confirm('Are you sure you want to lock this wallet?')) return
    lockWallet.mutate(userId)
  }

  const handleUnlock = (userId: string) => {
    if (!confirm('Are you sure you want to unlock this wallet?')) return
    unlockWallet.mutate(userId)
  }

  const isProcessing = lockWallet.isPending ? lockWallet.variables : (unlockWallet.isPending ? unlockWallet.variables : null)

  return (
    <div className="min-h-screen bg-[#070c1e] text-white md: font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Wallets</h1>
            <p className="text-xs text-zinc-400 mt-1">View and manage user wallets.</p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search by user email or name..."
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-bold">User</th>
                  <th className="px-6 py-5 font-bold">Wallet ID</th>
                  <th className="px-6 py-5 font-bold">Balance</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold">Created</th>
                  <th className="px-6 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={6} className="px-6 py-6">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : wallets.length > 0 ? (
                  wallets.map((wallet) => (
                    <tr key={wallet.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                      <td className="px-6 py-5.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                            {wallet.user?.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{wallet.user?.fullName || 'Unknown'}</p>
                            <p className="text-xs text-zinc-500 font-medium">{wallet.user?.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5.5">
                        <p className="font-semibold text-zinc-300 tracking-wider text-xs">{wallet.id.slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-5.5">
                        <p className="font-black text-white text-base">
                          {wallet.currency} {Number(wallet.balance || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-5.5">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={wallet.isLocked ? 'destructive' : 'success'}
                            className={cn(
                              "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                              wallet.isLocked ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                            )}
                          >
                            {wallet.isLocked ? 'Locked' : 'Active'}
                          </Badge>
                          {wallet.user?.role && (
                            <Badge variant="outline" className="font-extrabold uppercase text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-400 px-2 py-0.5 rounded-full">
                              {wallet.user.role}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-7 text-xs text-zinc-400">
                        {format(new Date(wallet.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-5.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                            onClick={() => navigate(`/admin/wallets/${wallet.userId}`)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {wallet.isLocked ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                              onClick={() => handleUnlock(wallet.userId)}
                              disabled={isProcessing === wallet.userId}
                              title="Unlock Wallet"
                            >
                              {isProcessing === wallet.userId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all duration-300"
                              onClick={() => handleLock(wallet.userId)}
                              disabled={isProcessing === wallet.userId}
                              title="Lock Wallet"
                            >
                              {isProcessing === wallet.userId ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center bg-[#0f1630]">
                      <Wallet className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-300">No wallets found</h3>
                      <p className="text-xs text-zinc-500 mt-0.5">No registered account wallets match your dynamic filter constraints.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4.5 border-t border-white/5 bg-[#0b1026]/40">
              <p className="text-xs text-zinc-400 font-medium">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white disabled:opacity-40 transition-colors duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white disabled:opacity-40 transition-colors duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

