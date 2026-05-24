import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  Monitor,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRecentTransactions } from "@/hooks/use-transactions";
import {
  TRANSACTION_TYPE,
  getTransactionStatusVariant,
  formatPaymentMethod,
} from "@/store";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TransactionDetailsModal } from "@/components/features/transactions/transaction-details-modal";
import { Transaction } from "@/services/api/transactions.service";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function TransactionMonitoringPage() {
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

  const { data, isLoading } = useRecentTransactions({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: status || undefined,
    type: type || undefined,
  });

  const transactions = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case TRANSACTION_TYPE.DEPOSIT:
      case TRANSACTION_TYPE.COLLECTION:
        return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
      case TRANSACTION_TYPE.WITHDRAWAL:
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />;
      default:
        return <Monitor className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 pb-12 bg-[#070c1e] text-white min-h-screen font-sans selection:bg-emerald-500/30 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Transaction Monitoring
            </h1>
            <p className="text-zinc-400 mt-1 text-xs">
              Real-time view of all system transactions.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center w-full">
            <div className="relative w-full lg:w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search by ID or Reference..."
                className="w-full pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-11 flex-1 lg:flex-none px-4 py-2 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors appearance-none cursor-pointer min-w-[120px]"
              >
                <option value="">All Types</option>
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </select>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 flex-1 lg:flex-none px-4 py-2 bg-[#141d3d] border border-white/5 rounded-xl text-xs font-semibold text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors appearance-none cursor-pointer min-w-[130px]"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          
          {/* Desktop Layout (Hidden on Mobile/Tablet layouts) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold">Transaction Info</th>
                  <th className="px-6 py-4 font-bold">Type</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#0f1630]">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : transactions.length > 0 ? (
                  transactions.map((tx: any) => (
                    <tr
                      key={tx.id}
                      className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={cn(
                            "h-10 w-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-all duration-300 shrink-0",
                            tx.type === "WITHDRAWAL"
                              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          )}>
                            {getTypeIcon(tx.type)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors truncate">
                              {tx.user?.fullName || tx.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium truncate">
                              {formatPaymentMethod(tx.paymentMethod)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="font-extrabold uppercase text-[10px] rounded-md border-white/5 bg-[#141d3d] text-zinc-300 px-2.5 py-0.5 tracking-wider whitespace-nowrap"
                        >
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={cn(
                          "font-black text-base tracking-tight",
                          tx.type === "WITHDRAWAL" ? "text-blue-400" : "text-emerald-400"
                        )}>
                          {tx.type === "WITHDRAWAL" ? "-" : "+"} GH₵ {Number(tx.amount || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={getTransactionStatusVariant(tx.status)}
                          className={cn(
                            "text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full",
                            tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400" : "",
                            tx.status === 'PENDING' ? "bg-amber-500/10 text-amber-400" : "",
                            tx.status === 'APPROVED' ? "bg-blue-500/10 text-blue-400" : "",
                            tx.status === 'FAILED' || tx.status === 'REJECTED' ? "bg-red-500/10 text-red-400" : ""
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-medium text-xs tracking-tight whitespace-nowrap">
                        <p>{format(new Date(tx.createdAt), "MMM dd, yyyy")}</p>
                        <p className="text-[10px] text-zinc-500 font-normal mt-0.5">{format(new Date(tx.createdAt), "HH:mm")}</p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8.5 w-8.5 rounded-xl text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-350"
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
                      <Monitor className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-400 tracking-tight">
                        No transactions found
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        There are no transactions to display.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Structured Mobile/Tablet View (Hides on Desktop Screen Breakpoints) */}
          <div className="block lg:hidden divide-y divide-white/5 px-4 bg-[#0f1630]">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="py-5 animate-pulse">
                  <div className="h-20 bg-[#141d3d] rounded-xl" />
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx: any) => (
                <div key={tx.id} className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "h-10 w-10 rounded-xl border flex items-center justify-center shrink-0",
                        tx.type === "WITHDRAWAL"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      )}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 text-sm truncate">
                          {tx.user?.fullName || tx.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          {formatPaymentMethod(tx.paymentMethod)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "font-black text-sm md:text-base tracking-tight",
                        tx.type === "WITHDRAWAL" ? "text-blue-400" : "text-emerald-400"
                      )}>
                        {tx.type === "WITHDRAWAL" ? "-" : "+"} GH₵ {Number(tx.amount || 0).toFixed(2)}
                      </p>
                      <span className="text-[10px] text-zinc-500 font-mono tracking-wider block mt-0.5">
                        #{tx.id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="font-extrabold uppercase text-[9px] rounded-md border-white/5 bg-[#141d3d] text-zinc-300 px-2 py-0.5 tracking-wider"
                      >
                        {tx.type}
                      </Badge>
                      <Badge
                        variant={getTransactionStatusVariant(tx.status)}
                        className={cn(
                          "text-[9px] uppercase tracking-wider font-extrabold border-none px-2 py-0.5 rounded-md",
                          tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-400" : "",
                          tx.status === 'PENDING' ? "bg-amber-500/10 text-amber-400" : "",
                          tx.status === 'APPROVED' ? "bg-blue-500/10 text-blue-400" : "",
                          tx.status === 'FAILED' || tx.status === 'REJECTED' ? "bg-red-500/10 text-red-400" : ""
                        )}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {format(new Date(tx.createdAt), "MMM dd • HH:mm")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                        onClick={() => setSelectedTransaction(tx)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <Monitor className="h-11 w-11 text-zinc-700 mx-auto mb-3 animate-pulse" />
                <h3 className="text-sm font-bold text-zinc-300">No transactions found</h3>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4.5 border-t border-white/5 bg-[#0b1026]/40">
              <p className="text-xs text-zinc-400 font-medium tracking-tight">
                Page{" "}
                <span className="text-emerald-400 font-black">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-white font-black">
                  {totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white disabled:opacity-40 transition-colors duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}

