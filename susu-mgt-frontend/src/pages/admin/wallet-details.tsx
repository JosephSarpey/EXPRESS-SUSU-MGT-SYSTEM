
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  Lock,
  Unlock,
  Eye,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useWalletDetails, useWalletTransactions, useLockWallet, useUnlockWallet } from '@/hooks/use-admin'

export function WalletDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()

  const { data: wallet, isLoading: isWalletLoading, refetch: fetchWalletDetails } = useWalletDetails(userId!)
  const { data: txData, isLoading: isTxLoading, refetch: fetchWalletTransactions } = useWalletTransactions(userId!)
  
  const transactions = txData?.data || []
  const isLoading = isWalletLoading || isTxLoading

  const lockWallet = useLockWallet()
  const unlockWallet = useUnlockWallet()

  const handleLock = () => {
    if (!confirm('Are you sure you want to lock this wallet?')) return
    lockWallet.mutate(userId!)
  }

  const handleUnlock = () => {
    if (!confirm('Are you sure you want to unlock this wallet?')) return
    unlockWallet.mutate(userId!)
  }

  const isProcessing = lockWallet.isPending || unlockWallet.isPending

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <TrendingUp className="h-4 w-4 text-emerald-400" />
      case 'WITHDRAWAL': return <TrendingDown className="h-4 w-4 text-amber-400" />
      case 'TRANSFER': return <ArrowLeftRight className="h-4 w-4 text-blue-400" />
      default: return <Eye className="h-4 w-4" />
    }
  }

  const getTransactionVariant = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'success'
      case 'WITHDRAWAL': return 'destructive'
      case 'TRANSFER': return 'default'
      default: return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 pb-12 p-8 bg-[#0b1329] min-h-screen animate-pulse">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full border border-white/5 bg-[#0f1630]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-[#162045] rounded-lg" />
        </div>
        <div className="grid gap-6">
          <Card className="border border-white/5 bg-[#0f1630] h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Wallet Not Found</h1>
            <p className="text-xs text-zinc-400 mt-1">The requested wallet could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Wallet Details</h1>
            <p className="text-xs text-zinc-400 mt-1">View wallet information and transaction history.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wallet.isLocked ? (
            <Button
              variant="outline"
              className="rounded-xl border border-transparent bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all duration-300 h-10 px-4 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              onClick={handleUnlock}
              disabled={isProcessing}
            >
              <Unlock className="h-4 w-4 mr-2" />
              {isProcessing ? 'Unlocking...' : 'Unlock Wallet'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-xl border border-transparent bg-amber-600 hover:bg-amber-500 text-white font-semibold transition-all duration-300 h-10 px-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              onClick={handleLock}
              disabled={isProcessing}
            >
              <Lock className="h-4 w-4 mr-2" />
              {isProcessing ? 'Locking...' : 'Lock Wallet'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Wallet Information</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Basic wallet details</p>
              </div>
              <Wallet className="h-4 w-4 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Wallet ID</span>
              <span className="font-mono text-zinc-200 text-xs tracking-wider">{wallet.id.slice(0, 16).toUpperCase()}...</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Currency</span>
              <span className="font-bold text-white">{wallet.currency}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Status</span>
              <Badge className={cn(
                "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                wallet.isLocked ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
              )}>
                {wallet.isLocked ? 'Locked' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400 font-medium">Created</span>
              <span className="font-semibold text-zinc-300 text-xs">
                {format(new Date(wallet.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">User Information</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Wallet owner details</p>
              </div>
              <div className="h-8 w-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-xs">
                {wallet.user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-6 text-sm">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Name</span>
              <span className="font-bold text-zinc-200">{wallet.user?.fullName || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Email</span>
              <span className="font-medium text-zinc-300 text-xs">{wallet.user?.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-zinc-400 font-medium">Role</span>
              <Badge variant="outline" className="font-extrabold uppercase text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-2 py-0.5 rounded-full">{wallet.user?.role || 'Unknown'}</Badge>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-zinc-400 font-medium">Account Status</span>
              <Badge className={cn(
                "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                wallet.user?.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                {wallet.user?.status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
        <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Current Balance</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Available funds in wallet</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchWalletDetails()}
              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-6 relative overflow-hidden bg-gradient-to-br from-[#161f3d] to-[#0c1229] border border-white/5 rounded-xl group">
            <p className="text-4xl font-black tracking-tight text-white relative z-10">
              {wallet.currency} {Number(wallet.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-zinc-400 font-medium mt-2 relative z-10">
              {wallet.isLocked ? 'Wallet is locked • transaction processing paused' : 'System pipeline operational • ready for active flows'}
            </p>
            <div className="absolute -right-12 -bottom-12 h-24 w-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-xl rounded-full transition-colors duration-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-zinc-400 mt-0.5">Latest wallet activity</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchWalletTransactions()}
              className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-bold">Transaction</th>
                  <th className="px-6 py-5 font-bold">Type</th>
                  <th className="px-6 py-5 font-bold">Amount</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <tr key={tx.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                      <td className="px-6 py-5.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-9 w-9 rounded-xl bg-zinc-500/10 border border-white/5 flex items-center justify-center transition-all duration-300 group-hover:border-white/10">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">{tx.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">{tx.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5.5">
                        <Badge 
                          variant={getTransactionVariant(tx.type)}
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                            tx.type === 'DEPOSIT' && "bg-emerald-500/10 text-emerald-400",
                            tx.type === 'WITHDRAWAL' && "bg-amber-500/10 text-amber-400",
                            tx.type === 'TRANSFER' && "bg-blue-500/10 text-blue-400"
                          )}
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-5.5">
                        <p className={cn(
                          "font-black text-sm tracking-tight",
                          tx.type === 'DEPOSIT' ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {tx.type === 'DEPOSIT' ? '+' : '-'} {wallet.currency} {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-5.5">
                        <Badge 
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                            tx.status === 'COMPLETED' || tx.status === 'SUCCESS' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                          )}
                          variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5.5 text-xs text-zinc-400">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center bg-[#0f1630]">
                      <Eye className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-300">No transactions found</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}