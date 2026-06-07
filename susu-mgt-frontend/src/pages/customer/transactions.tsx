import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNavbar } from "./mobileNavbar";
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
import { Transaction, transactionsService } from "@/services/api/transactions.service";
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
  const [isExporting, setIsExporting] = useState(false);

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

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await transactionsService.getMyTransactions({
        limit: 1000,
        search: debouncedSearch || undefined,
        status: status || undefined,
        type: type || undefined,
      });

      const dataToExport = response.data;
      if (!dataToExport || dataToExport.length === 0) return;

      const headers = ['Transaction ID', 'Type', 'Status', 'Payment Method', 'Amount (GHC)', 'Date', 'Time'];
      const csvRows = [headers.join(',')];

      dataToExport.forEach((tx) => {
        const date = format(new Date(tx.createdAt), 'MMM dd yyyy');
        const time = format(new Date(tx.createdAt), 'hh:mm a');
        const amount = Number(tx.amount || 0).toFixed(2);
        const row = [
          tx.id,
          tx.type,
          tx.status,
          tx.paymentMethod?.replace(/_/g, ' '),
          amount,
          date,
          time
        ].map(value => `"${value}"`); // escape fields properly
        csvRows.push(row.join(','));
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `statement_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export statement', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header View */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent truncate leading-normal">
               Transaction History
             </h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">
              Detailed log of all your wallet activities.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExport}
          disabled={isExporting || total === 0}
          className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white text-xs sm:text-sm font-bold transition-colors duration-300 h-11 px-4 sm:px-5 w-full sm:w-auto shrink-0 flex items-center justify-center gap-2"
        >
          {isExporting ? (
            <svg className="animate-spin h-4 w-4 text-emerald-400 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : (
            <Download className="h-4 w-4 text-emerald-400 shrink-0" />
          )}
          <span>{isExporting ? 'Exporting...' : 'Export Statement'}</span>
        </Button>
      </div>

      {/* Main Base Container */}
      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="p-4 sm:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search reference or description..."
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto sm:flex items-center">
              <div className="relative w-full">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full sm:w-auto h-11 pl-4 pr-10 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer sm:min-w-[120px]"
                >
                  <option value="">All Types</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              <div className="relative w-full">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full sm:w-auto h-11 pl-4 pr-10 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-bold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer sm:min-w-[130px]"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="SUCCESS">Completed</option>
                  <option value="FAILED">Failed</option>
                  <option value="REVERSED">Reversed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-500">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 mb-5">
          
          {/* Desktop Table Layout View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-5 font-bold">Transaction</th>
                  <th className="px-6 py-5 font-bold">Date & Time</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={4} className="px-6 py-7">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-6 py-7">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl border transition-all duration-300 shrink-0",
                              tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40"
                                : "bg-blue-500/10 text-blue-400 border-blue-500/20 group-hover:border-blue-500/40",
                            )}
                          >
                            {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? (
                              <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors text-sm truncate">
                              {tx.type}
                            </p>
                            <p className="text-xs text-zinc-500 font-semibold mt-0.5 truncate">
                              via {tx.paymentMethod?.replace("_", " ")}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-7">
                        <p className="font-bold text-zinc-200 text-xs">
                          {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                        </p>
                        <p className="text-xs text-zinc-500 font-semibold mt-0.5">
                          {format(new Date(tx.createdAt), "hh:mm a")}
                        </p>
                      </td>
                      <td className="px-6 py-7">
                        <Badge 
                          variant={getTransactionStatusVariant(tx.status)} 
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full shrink-0",
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
                      <td className="px-6 py-7 text-right">
                        <div className="flex items-center justify-end gap-4">
                          <div className="text-right min-w-0">
                            <p
                              className={cn(
                                "font-black text-base tracking-tight leading-none",
                                tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                                  ? "text-emerald-400"
                                  : "text-blue-400",
                              )}
                            >
                              {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? "+" : "-"} GH₵{" "}
                              {Number(tx.amount || 0).toLocaleString(
                                undefined,
                                { minimumFractionDigits: 2 },
                              )}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-mono tracking-wider mt-1 uppercase truncate">
                              #{tx.id.substring(0, 8)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8.5 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 text-xs font-bold px-3 transition-all duration-300 shrink-0"
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
                    <td colSpan={4} className="px-6 py-24 text-center bg-[#0f1630]">
                      <History className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No transactions found</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Structured Card Feed Layout View */}
          <div className="block md:hidden divide-y divide-white/5 px-4 bg-[#0f1630]">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="py-4 animate-pulse">
                  <div className="h-14 bg-[#162045] rounded-xl" />
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between py-4.5 cursor-pointer active:bg-[#131c3d]/60 transition-all duration-150 gap-3"
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border shrink-0 transition-colors",
                        tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      )}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? (
                        <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="font-bold text-sm text-zinc-200 flex items-center gap-2 flex-wrap">
                        <span className="truncate leading-none">{tx.type}</span>
                        <Badge 
                          variant={getTransactionStatusVariant(tx.status)} 
                          className={cn(
                            "text-[8px] sm:text-[9px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
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
                      <p className="text-[11px] font-semibold text-zinc-500 leading-none">
                        {format(new Date(tx.createdAt), "MMM dd • hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end">
                    <p
                      className={cn(
                        "font-black text-sm tracking-tight leading-none",
                        tx.type === "DEPOSIT" || tx.type === "COLLECTION"
                          ? "text-emerald-400"
                          : "text-blue-400",
                      )}
                    >
                      {tx.type === "DEPOSIT" || tx.type === "COLLECTION" ? "+" : "-"} GH₵ {Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-1 tracking-wider leading-none uppercase">
                      #{tx.id.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-[#0f1630]">
                <History className="h-10 w-10 text-zinc-700 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No transactions found</h3>
              </div>
            )}
          </div>

          {/* Dynamic Footer / Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-[#0b1026]/40 gap-4 w-full">
              <p className="text-xs text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                Showing{" "}
                <span className="text-emerald-400 font-black">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="text-white font-black">
                  {Math.min(page * limit, total)}
                </span>{" "}
                of{" "}
                <span className="text-white font-black">
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
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
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
                        "w-9 h-9 rounded-xl font-extrabold text-xs transition-all",
                        page === i + 1 
                          ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-500" 
                          : "text-zinc-400 hover:text-white hover:bg-white/5",
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
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        < MobileNavbar />
      </Card>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}