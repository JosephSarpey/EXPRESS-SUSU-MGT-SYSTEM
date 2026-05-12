import { useEffect, useState } from 'react'
import {
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowDownLeft
} from 'lucide-react'
import { CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminService } from '@/services/api/admin.service'
import { format } from 'date-fns'
import { TransactionDetailsModal } from '@/components/features/transactions/transaction-details-modal'

export function WorkerCollectionsTab() {
  const [collections, setCollections] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  useEffect(() => {
    fetchCollections()
  }, [page, limit, search])

  const fetchCollections = async () => {
    try {
      setIsLoading(true)
      const res = await adminService.getWorkerCollections({ page, limit })
      setCollections(res.data || [])
      setTotal(res.meta?.total || 0)
    } catch (err) {
      console.error('Error fetching worker collections:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search by ID or customer..."
              className="pl-10 h-10 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-bold">Transaction</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Worker</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Date & Time</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : collections.length > 0 ? (
                collections.map((tx) => (
                  <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center">
                          <ArrowDownLeft className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-zinc-100">{tx.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.paymentMethod.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {tx.user?.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{tx.user?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center font-bold text-xs">
                          {tx.worker?.fullName?.charAt(0) || 'W'}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">{tx.worker?.fullName || 'Unknown'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{tx.worker?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
                        + GH₵ {Number(tx.amount || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">{format(new Date(tx.createdAt), 'MMM dd, yyyy')}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{format(new Date(tx.createdAt), 'hh:mm a')}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <History className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 dark:text-zinc-400">No collections found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              Page <span className="text-zinc-900 dark:text-zinc-100 font-bold">{page}</span> of <span className="text-zinc-900 dark:text-zinc-100 font-bold">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </>
  )
}
