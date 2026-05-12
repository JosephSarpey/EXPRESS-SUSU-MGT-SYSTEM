import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Plus,
  ArrowRight,
  User,
  MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { walletsService, Wallet as WalletType } from '@/services/api/wallets.service'
import { transactionsService, Transaction } from '@/services/api/transactions.service'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function CustomerDashboard() {
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const [walletData, transactionsData] = await Promise.all([
          walletsService.getMyWallet(),
          transactionsService.getMyTransactions({ limit: 5 })
        ])
        setWallet(walletData)
        setRecentTransactions(transactionsData.data)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success'
      case 'PENDING': return 'warning'
      case 'FAILED': return 'destructive'
      case 'REJECTED': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">My Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Overview of your savings and recent activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link to="/customer/withdraw">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Link>
          </Button>
          <Button asChild>
            <Link to="/customer/deposit">
              <Plus className="mr-2 h-4 w-4" />
              Deposit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Balance Card */}
        <Card className="bg-blue-600 text-white border-none shadow-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-blue-100 uppercase tracking-wider">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">GH₵ {(wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
              <Badge variant="secondary" className="bg-blue-500/50 text-white border-none text-[10px] px-1.5 py-0">
                {wallet?.status}
              </Badge>
              Wallet status is active
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats - Deposits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Deposits</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵ {(wallet?.balance || 0).toLocaleString()}</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Your cumulative savings to date
            </p>
          </CardContent>
        </Card>

        {/* Quick Stats - Withdrawals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Withdrawn</CardTitle>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">GH₵ 0.00</div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Total funds withdrawn from wallet
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Transactions */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your most recent activity across all payment methods.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/customer/transactions">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-xl",
                        tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                      )}>
                        {tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100">{tx.type} via {tx.paymentMethod?.replace('_', ' ')}</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{format(new Date(tx.createdAt), 'MMM dd, yyyy • hh:mm a')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-extrabold",
                        tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      )}>
                        {tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? '+' : '-'} GH₵ {(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <Badge variant={getStatusVariant(tx.status)} className="mt-1 text-[10px] h-4">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400">No transactions found yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Commonly accessed pages and helpful tips.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link 
              to="/customer/addresses"
              className="flex items-center justify-between p-4 rounded-2xl border hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Manage Addresses</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your pickup locations</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              to="/customer/profile"
              className="flex items-center justify-between p-4 rounded-2xl border hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 rounded-lg">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-sm">Account Settings</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Personal information and security</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="mt-6 p-6 rounded-2xl bg-zinc-900 text-white dark:bg-blue-600">
              <h4 className="font-bold mb-2">Saving Tip 💡</h4>
              <p className="text-sm text-zinc-400 dark:text-blue-100 leading-relaxed">
                Regular deposits, even small amounts, help you build your financial cushion faster. Consistency is key!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
