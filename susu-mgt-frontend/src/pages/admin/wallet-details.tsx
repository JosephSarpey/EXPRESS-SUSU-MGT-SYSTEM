import { useEffect, useState } from 'react'
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
import { adminService } from '@/services/api/admin.service'
import { format } from 'date-fns'

export function WalletDetailsPage() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchWalletDetails()
      fetchWalletTransactions()
    }
  }, [userId])

  const fetchWalletDetails = async () => {
    try {
      setIsLoading(true)
      const res = await adminService.getWalletByUserId(userId!)
      setWallet(res)
    } catch (err) {
      console.error('Error fetching wallet details:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchWalletTransactions = async () => {
    try {
      const res = await adminService.getTransactions({ userId })
      setTransactions(res.data || [])
    } catch (err) {
      console.error('Error fetching wallet transactions:', err)
    }
  }

  const handleLock = async () => {
    if (!confirm('Are you sure you want to lock this wallet?')) return
    try {
      setIsProcessing(true)
      await adminService.lockWallet(userId!)
      await fetchWalletDetails()
    } catch (err) {
      console.error('Error locking wallet:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnlock = async () => {
    if (!confirm('Are you sure you want to unlock this wallet?')) return
    try {
      setIsProcessing(true)
      await adminService.unlockWallet(userId!)
      await fetchWalletDetails()
    } catch (err) {
      console.error('Error unlocking wallet:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'WITHDRAWAL': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'TRANSFER': return <ArrowLeftRight className="h-4 w-4 text-blue-600" />
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
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid gap-6">
          <Card className="animate-pulse">
            <CardHeader className="h-32 bg-zinc-100 dark:bg-zinc-900" />
          </Card>
        </div>
      </div>
    )
  }

  if (!wallet) {
    return (
      <div className="space-y-8 pb-12">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Wallet Not Found</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">The requested wallet could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Wallet Details</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">View wallet information and transaction history.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wallet.isLocked ? (
            <Button
              variant="outline"
              className="rounded-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
              onClick={handleUnlock}
              disabled={isProcessing}
            >
              <Unlock className="h-4 w-4 mr-2" />
              {isProcessing ? 'Unlocking...' : 'Unlock Wallet'}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="rounded-full border-amber-600 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Wallet Information</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Basic wallet details</p>
              </div>
              <Wallet className="h-5 w-5 text-zinc-400" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Wallet ID</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{wallet.id.slice(0, 16).toUpperCase()}...</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Currency</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{wallet.currency}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Status</span>
              <Badge variant={wallet.isLocked ? 'destructive' : 'success'}>
                {wallet.isLocked ? 'Locked' : 'Active'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Created</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {format(new Date(wallet.createdAt), 'MMM dd, yyyy')}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">User Information</h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Wallet owner details</p>
              </div>
              <div className="h-5 w-5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                {wallet.user?.fullName?.charAt(0) || 'U'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Name</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{wallet.user?.fullName || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Email</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{wallet.user?.email || 'No email'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Role</span>
              <Badge variant="outline">{wallet.user?.role || 'Unknown'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">Account Status</span>
              <Badge variant={wallet.user?.status === 'ACTIVE' ? 'success' : 'destructive'}>
                {wallet.user?.status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Current Balance</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Available funds in wallet</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchWalletDetails}
              className="rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-4xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {wallet.currency} {Number(wallet.balance || 0).toFixed(2)}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              {wallet.isLocked ? 'Wallet is locked - transactions paused' : 'Ready for transactions'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Recent Transactions</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Latest wallet activity</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchWalletTransactions}
              className="rounded-lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Transaction</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-900/20 flex items-center justify-center">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">{tx.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.paymentMethod?.replace(/_/g, ' ') || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getTransactionVariant(tx.type)}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">
                          {tx.type === 'DEPOSIT' ? '+' : '-'} {wallet.currency} {Number(tx.amount || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={tx.status === 'COMPLETED' ? 'success' : 'warning'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <Eye className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">No transactions found.</p>
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
