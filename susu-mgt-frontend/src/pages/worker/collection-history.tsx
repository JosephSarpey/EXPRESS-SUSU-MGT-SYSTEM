import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  History,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowDownLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkerCollections } from "@/hooks/use-transactions";
import { getTransactionStatusVariant } from "@/store";
import { format } from "date-fns";
import { TransactionDetailsModal } from "@/components/features/transactions/transaction-details-modal";
import { Transaction } from "@/services/api/transactions.service";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function CollectionHistoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useWorkerCollections({ 
    page, 
    limit, 
    search: debouncedSearch || undefined 
  });

  const collections = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="bg-[#070c1e] min-h-screen text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header Toolbar Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-2 sm:mb-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#102a24] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent truncate leading-normal">
              Collection History
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">
              Review all your processed customer deposits.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-2">
        <CardHeader className="p-3 sm:p-4 border-b border-white/5 bg-[#0b1026]">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search by ID or customer..."
              className="pl-11 h-9 rounded-lg bg-[#141d3d] border border-white/5 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#0f1630]">
          
          {/* Desktop & Tablet Table View Layout (Condensed spaces to hold architecture elements comfortably) */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full border-collapse table-auto">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-bold text-left w-[35%]">Transaction</th>
                  <th className="px-3 py-3 font-bold text-left w-[20%]">Amount</th>
                  <th className="px-3 py-3 font-bold text-left w-[15%]">Status</th>
                  <th className="px-3 py-3 font-bold text-left w-[20%]">Date & Time</th>
                  <th className="px-3 py-3 font-bold text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={5} className="px-3 py-4">
                        <div className="h-8 bg-[#162045] rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : collections.length > 0 ? (
                  collections.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-7 w-7 rounded-lg border border-white/5 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                            <ArrowDownLeft className="h-3.5 w-3.5 stroke-[2.5]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                              {tx.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">
                              Customer: {tx.user?.fullName || tx.userId.slice(0, 8)}
                            </p>
                            {tx.user?.email && (
                              <p className="text-[9px] text-zinc-600 font-mono tracking-wide truncate mt-0.5 uppercase">
                                {tx.user.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-black text-emerald-400 tracking-tight text-xs sm:text-sm">
                          + GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge
                          variant={getTransactionStatusVariant(tx.status)}
                          className={cn(
                            "text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border-none shadow-xs",
                            tx.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                            tx.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                            tx.status === 'APPROVED' && "bg-blue-500/10 text-blue-400",
                            tx.status === 'FAILED' && "bg-red-500/10 text-red-400",
                            tx.status === 'REVERSED' && "bg-zinc-700 text-zinc-300"
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-semibold text-zinc-400 whitespace-nowrap leading-tight">
                        <p className="text-zinc-200">{format(new Date(tx.createdAt), "MMM dd, yyyy")}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{format(new Date(tx.createdAt), "hh:mm a")}</p>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 rounded-md text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 text-[11px] font-bold px-2 transition-all duration-250 shrink-0"
                          onClick={() => setSelectedTransaction(tx)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-16 text-center bg-[#0f1630]">
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
              [1, 2, 3].map((i) => (
                <div key={i} className="py-3 animate-pulse">
                  <div className="h-20 bg-[#162045] rounded-lg" />
                </div>
              ))
            ) : collections.length > 0 ? (
              collections.map((tx: any) => (
                <div key={tx.id} className="py-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8.5 w-8.5 rounded-xl border border-white/5 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 text-xs truncate leading-none">
                          Ref: {tx.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1 truncate leading-none">
                          Customer: {tx.user?.fullName || tx.userId.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={getTransactionStatusVariant(tx.status)}
                      className={cn(
                        "text-[8px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
                        tx.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                        tx.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                        tx.status === 'APPROVED' && "bg-blue-500/10 text-blue-400",
                        tx.status === 'FAILED' && "bg-red-500/10 text-red-400",
                        tx.status === 'REVERSED' && "bg-zinc-700 text-zinc-300"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </div>

                  {tx.user?.email && (
                    <p className="text-[9px] text-zinc-500 font-mono tracking-wide truncate break-all pl-11 leading-none">
                      {tx.user.email}
                    </p>
                  )}

                  <div className="flex items-center justify-between pl-11 gap-2 pt-1.5 border-t border-dashed border-white/5 bg-[#0f1630]">
                    <div>
                      <p className="font-black text-emerald-400 text-xs tracking-tight leading-none">
                        + GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-semibold mt-1 leading-none">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy · hh:mm a")}
                      </p>
                    </div>
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

          {/* Pagination Controls Segment Footer Panel */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-white/5 bg-[#0b1026]/40 gap-3 w-full">
              <p className="text-[11px] text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>{" "}
                <span className="text-zinc-500 font-medium">({total} total)</span>
              </p>
              <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-[11px] font-bold h-8 disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
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
  );
}




