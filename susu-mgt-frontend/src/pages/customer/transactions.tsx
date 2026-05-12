import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Download,
  History
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { transactionsService, Transaction } from '@/services/api/transactions.service'
import { TransactionDetailsModal } from '@/components/features/transactions/transaction-details-modal'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function TransactionsPage() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [total, setTotal] = useState(0)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true)
        const data = await transactionsService.getMyTransactions({ page, limit })
        setTransactions(data.data)
        setTotal(data.total)
      } catch (err) {
        console.error('Error fetching transactions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [page, limit])

  const totalPages = Math.ceil(total / limit)

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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Transaction History</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Detailed log of all your wallet activities.</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Statement
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input placeholder="Search reference or description..." className="pl-10 h-10 rounded-full" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="rounded-full flex-1 md:flex-none">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Transaction</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg",
                            tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' 
                              ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                          )}>
                            {tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">{tx.type}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Via {tx.paymentMethod?.replace('_', ' ')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(tx.createdAt), 'hh:mm a')}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusVariant(tx.status)}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="text-right">
                            <p className={cn(
                              "font-extrabold text-base",
                              tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                            )}>
                              {tx.type === 'DEPOSIT' || tx.type === 'COLLECTION' ? '+' : '-'} GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono">{tx.id.substring(0, 8).toUpperCase()}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-24 text-center">
                      <History className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">No transactions found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Showing <span className="text-zinc-900 dark:text-zinc-100 font-bold">{(page - 1) * limit + 1}</span> to <span className="text-zinc-900 dark:text-zinc-100 font-bold">{Math.min(page * limit, total)}</span> of <span className="text-zinc-900 dark:text-zinc-100 font-bold">{total}</span> transactions
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl h-9 px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={cn("w-9 h-9 rounded-xl font-bold", page !== i + 1 && "text-zinc-500")}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl h-9 px-3"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailsModal 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
      />
    </div>
  )
}
