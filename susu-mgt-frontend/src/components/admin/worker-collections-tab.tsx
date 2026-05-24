

import { useState } from 'react'
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
import { format } from 'date-fns'
import { TransactionDetailsModal } from '@/components/features/transactions/transaction-details-modal'
import { useDebounce } from '@/hooks/use-debounce'

import { useAdminUIStore } from '@/store/admin-ui-store'
import { useWorkerCollections } from '@/hooks/use-admin'

export function WorkerCollectionsTab() {
  const { search, setSearch, page, setPage } = useAdminUIStore(state => state.workerCollections)
  const [limit] = useState(10)
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useWorkerCollections({
    page,
    limit,
    search: debouncedSearch || undefined
  })

  const collections = data?.data || []
  const total = data?.meta?.total || 0
  const totalPages = Math.ceil(total / limit)

  return (
    <>
      <CardHeader className="p-3 sm:p-4 border-b border-white/5 bg-[#0b1026]">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center w-full">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search by ID or customer..."
              className="pl-9 h-9 rounded-lg bg-[#141d3d] border border-white/5 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 bg-[#0f1630]">
        
        {/* Desktop & Tablet Table Layout View (Condensed gaps and text metrics to avoid swipe actions) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full border-collapse table-auto">
            <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-[#0b1026]/60 border-b border-white/5">
              <tr>
                <th className="px-3 py-3 font-bold text-left w-[15%]">Transaction</th>
                <th className="px-3 py-3 font-bold text-left w-[25%]">Customer</th>
                <th className="px-3 py-3 font-bold text-left w-[25%]">Worker</th>
                <th className="px-3 py-3 font-bold text-left w-[15%]">Amount</th>
                <th className="px-3 py-3 font-bold text-left w-[15%]">Date & Time</th>
                <th className="px-3 py-3 font-bold text-right w-[5%]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse bg-[#0f1630]">
                    <td colSpan={6} className="px-3 py-4">
                      <div className="h-8 bg-[#162045] rounded-md" />
                    </td>
                  </tr>
                ))
              ) : collections.length > 0 ? (
                collections.map((tx: any) => (
                  <tr key={tx.id} className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg border border-white/5 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                            {tx.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-semibold truncate capitalize mt-0.5">
                            {tx.paymentMethod ? tx.paymentMethod.replace(/_/g, ' ').toLowerCase() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6.5 w-6.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/10 flex items-center justify-center font-black text-[10px] shrink-0">
                          {tx.user?.fullName?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 truncate">{tx.user?.fullName || 'Unknown'}</p>
                          <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{tx.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-6.5 w-6.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center font-black text-[10px] shrink-0">
                          {tx.worker?.fullName?.charAt(0).toUpperCase() || 'W'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 truncate">{tx.worker?.fullName || 'Unknown'}</p>
                          <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{tx.worker?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <p className="font-black text-emerald-400 tracking-tight text-xs sm:text-sm">
                        + GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    </td>
                    <td className="px-3 py-3 font-semibold text-zinc-400 whitespace-nowrap leading-tight">
                      <p className="text-zinc-200">{format(new Date(tx.createdAt), "MMM dd, yyyy")}</p>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{format(new Date(tx.createdAt), "hh:mm a")}</p>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300 shrink-0"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 py-16 text-center bg-[#0f1630]">
                    <History className="h-10 w-10 text-zinc-500 mx-auto mb-3 animate-pulse" />
                    <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No collections found</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Structured Card Feed Layout View */}
        <div className="block md:hidden divide-y divide-white/5 px-3 bg-[#0f1630]">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="py-3 animate-pulse">
                <div className="h-20 bg-[#162045] rounded-lg" />
              </div>
            ))
          ) : collections.length > 0 ? (
            collections.map((tx: any) => (
              <div key={tx.id} className="py-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8.5 w-8.5 rounded-lg border border-white/5 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                      <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-zinc-200 text-xs truncate leading-none">
                        Ref: {tx.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold mt-1 truncate capitalize leading-none">
                        {tx.paymentMethod ? tx.paymentMethod.replace(/_/g, ' ').toLowerCase() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-emerald-400 text-xs tracking-tight leading-none">
                      + GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div className="flex items-center gap-2 min-w-0 bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <div className="h-5.5 w-5.5 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-[9px] shrink-0">
                      {tx.user?.fullName?.charAt(0).toUpperCase() || 'C'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide leading-none">Customer</p>
                      <p className="text-[11px] font-bold text-zinc-200 mt-1 truncate leading-none">{tx.user?.fullName || 'Unknown'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 min-w-0 bg-white/5 p-1.5 rounded-lg border border-white/5">
                    <div className="h-5.5 w-5.5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black text-[9px] shrink-0">
                      {tx.worker?.fullName?.charAt(0).toUpperCase() || 'W'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-wide leading-none">Worker</p>
                      <p className="text-[11px] font-bold text-zinc-200 mt-1 truncate leading-none">{tx.worker?.fullName || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-dashed border-white/5 bg-[#0f1630]">
                  <span className="text-[9px] text-zinc-500 font-semibold leading-none">
                    {format(new Date(tx.createdAt), "MMM dd, yyyy · hh:mm a")}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957] shrink-0"
                    onClick={() => setSelectedTransaction(tx)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-[#0f1630]">
              <History className="h-9 w-9 text-zinc-500 mx-auto mb-2 animate-pulse" />
              <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No collections found</h3>
            </div>
          )}
        </div>

        {/* Dynamic Pagination Controls Panel */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-white/5 bg-[#0b1026]/40 gap-3 w-full">
            <p className="text-[11px] text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
              Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
            </p>
            <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto order-1 sm:order-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
              >
                <ChevronRight className="h-3.5 w-3.5" />
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