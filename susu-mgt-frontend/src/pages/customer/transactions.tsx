
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/services/api/transactions.service";
import { TransactionDetailsModal } from "@/components/features/transactions/transaction-details-modal";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMyTransactions } from "@/hooks/use-transactions";
import { getTransactionStatusVariant } from "@/store";
import { useDebounce } from "@/hooks/use-debounce";

export function TransactionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset page to 1 on search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, type]);

  const { data, isLoading } = useMyTransactions({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  const transactions = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto p-4 md:p-6">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl h-10 w-10 shrink-0 border-zinc-200 dark:border-zinc-800 shadow-sm text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              Transaction History
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Detailed log of all your wallet activities.
            </p>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl font-bold text-xs h-10 w-full sm:w-auto border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800">
          <Download className="mr-2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[2.2]" />
          Export Statement
        </Button>
      </div>

      {/* Main Base Container */}
      <Card className="border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-sm rounded-2xl overflow-hidden backdrop-blur-md">
        <CardHeader className="p-4 md:p-5 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-zinc-950/10">
          <div className="flex flex-col lg:flex-row gap-3.5 justify-between items-center">
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 stroke-[2.5]" />
              <Input
                placeholder="Search reference or description..."
                className="pl-10 h-11 text-sm border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 rounded-xl shadow-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5 w-full lg:w-auto sm:flex items-center">
              <div className="relative">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full sm:w-auto h-11 pl-3.5 pr-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer min-w-[120px] shadow-sm"
                >
                  <option value="">All Types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400 dark:text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-auto h-11 pl-3.5 pr-8 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer min-w-[130px] shadow-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUCCESS">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REVERSED">Reversed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-zinc-400 dark:text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-white dark:bg-transparent">
          
          {/* Desktop Table Layout View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-100 dark:border-zinc-800/60">
                <tr>
                  <th className="px-6 py-4 font-bold">Transaction</th>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-5">
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/20 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl border transition-colors",
                              tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                                ? "bg-emerald-50/60 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 group-hover:bg-emerald-50"
                                : "bg-amber-50/60 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 group-hover:bg-amber-50",
                            )}
                          >
                            {tx.type === "DEPOSIT" ||
                            tx.type === "COLLECTION" ? (
                              <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {tx.type}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-medium">
                              via {tx.paymentMethod?.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {format(new Date(tx.createdAt), "hh:mm a")}
                        </p>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge variant={getTransactionStatusVariant(tx.status)} className="rounded-md font-bold text-[10px] shadow-none px-2.5 py-0.5 tracking-wider uppercase border-none">
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="text-right">
                            <p
                              className={cn(
                                "font-black text-base tracking-tight",
                                tx.type === "DEPOSIT" ||
                                  tx.type === "COLLECTION"
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                                ? "+"
                                : "-"}{" "}
                              GH₵{" "}
                              {Number(tx.amount || 0).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 },
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider mt-0.5 uppercase">
                              #{tx.id.substring(0, 8)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-950/30 px-3 h-8 border border-transparent hover:border-blue-100 dark:hover:border-blue-900/30 transition-all"
                            onClick={() => setSelectedTransaction(tx)}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr />
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Structured Card Feed Layout View */}
          <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800/40 px-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="py-4 animate-pulse">
                  <div className="h-14 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl" />
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between py-4 cursor-pointer active:bg-zinc-50/80 dark:active:bg-zinc-900/30 transition-colors"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border shrink-0",
                        tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100/70 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                          : "bg-amber-50 text-amber-600 border-amber-100/70 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
                      )}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? (
                        <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        {tx.type}
                        <Badge variant={getTransactionStatusVariant(tx.status)} className="text-[9px] font-bold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide">
                          {tx.status}
                        </Badge>
                      </p>
                      <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                        {format(new Date(tx.createdAt), "MMM dd • hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-black text-sm tracking-tight",
                        tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400",
                      )}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? "+" : "-"} GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-0.5 tracking-wider">
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            ) : null}
          </div>

          {/* Empty State Fallback Screen */}
          {!isLoading && transactions.length === 0 && (
            <div className="text-center py-20 px-4">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950 w-fit rounded-full mx-auto mb-3.5 border border-zinc-100 dark:border-zinc-800">
                <History className="h-6 w-6 text-zinc-400 dark:text-zinc-600" />
              </div>
              <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                No verified transaction history logs found.
              </p>
            </div>
          )}

          {/* Dynamic Footer / Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 border-t border-zinc-100 dark:border-zinc-800/60 gap-4 bg-zinc-50/20 dark:bg-zinc-950/10">
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-bold order-2 sm:order-1 tracking-wide uppercase">
                Showing{" "}
                <span className="text-zinc-800 dark:text-zinc-200">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="text-zinc-800 dark:text-zinc-200">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of{" "}
                <span className="text-zinc-800 dark:text-zinc-200">
                  {total}
                </span>{" "}
                records
              </p>
              <div className="flex items-center gap-2 justify-between w-full sm:w-auto order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl h-9 text-xs font-bold px-3 border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-0.5" />
                  Prev
                </Button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <Button
                      key={i}
                      variant={page === i + 1 ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPage(i + 1)}
                      className={cn(
                        "w-9 h-9 rounded-xl font-bold text-xs transition-all",
                        page === i + 1 
                          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700" 
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl h-9 text-xs font-bold px-3 border-zinc-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
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




















