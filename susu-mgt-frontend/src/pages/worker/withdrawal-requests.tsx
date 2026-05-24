















import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Wallet,
  Eye,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useWorkerWithdrawals,
  useConfirmWithdrawal,
} from "@/hooks/use-transactions";
import {
  TRANSACTION_STATUS,
  getTransactionStatusVariant,
  formatPaymentMethod,
} from "@/store";
import { format } from "date-fns";
import { TransactionDetailsModal } from "@/components/features/transactions/transaction-details-modal";
import { Transaction } from "@/services/api/transactions.service";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function WithdrawalRequestPage() {
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

  const { data, isLoading } = useWorkerWithdrawals({ 
    page, 
    limit, 
    search: debouncedSearch || undefined 
  });
  const confirmMutation = useConfirmWithdrawal();

  const handleConfirmPayment = async (id: string) => {
    if (!confirm("Are you sure you have paid this customer?")) return;

    try {
      await confirmMutation.mutateAsync({
        id,
        remarks: "Confirmed by worker",
      });
    } catch (err) {
      console.error("Error confirming payment:", err);
    }
  };

  const withdrawals = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="bg-[#070c1e] min-h-screen text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Header Bar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-4 sm:mb-8">
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
              Withdrawal Requests
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">
              Manage and confirm payouts to customers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
          <CardHeader className="p-4 sm:p-6 border-b border-white/5 bg-[#0b1026]">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center w-full">
              <div className="relative w-full md:w-96 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                <Input
                  placeholder="Search by ID or customer..."
                  className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white text-xs sm:text-sm font-bold transition-colors duration-300 h-11 px-5 gap-2 w-full md:w-auto justify-center shrink-0">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 bg-[#0f1630]">
            
            {/* Desktop & Tablet Table Layout (Auto-scaling layout fits columns safely) */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="w-full text-sm text-left border-collapse table-auto">
                <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-emerald-50/40 border-b border-white/5">
                  <tr>
                    <th className="px-4 lg:px-6 py-5 font-bold min-w-[200px]">Request</th>
                    <th className="px-4 lg:px-6 py-5 font-bold min-w-[120px]">Method</th>
                    <th className="px-4 lg:px-6 py-5 font-bold min-w-[120px]">Amount</th>
                    <th className="px-4 lg:px-6 py-5 font-bold min-w-[100px]">Status</th>
                    <th className="px-4 lg:px-6 py-5 font-bold min-w-[130px]">Date</th>
                    <th className="px-4 lg:px-6 py-5 font-bold text-right min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    [1, 2, 3, 4, 5].map((i) => (
                      <tr key={i} className="animate-pulse bg-[#0f1630]">
                        <td colSpan={6} className="px-4 lg:px-6 py-6">
                          <div className="h-10 bg-[#162045] rounded-xl" />
                        </td>
                      </tr>
                    ))
                  ) : withdrawals.length > 0 ? (
                    withdrawals.map((req: any) => (
                      <tr
                        key={req.id}
                        className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                      >
                        <td className="px-4 lg:px-6 py-4.5">
                          <div className="flex items-center gap-2.5 sm:gap-3.5">
                            <div className="p-2.5 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                              <Wallet className="h-4.5 w-4.5 stroke-[2.2]" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors text-sm truncate">
                                {req.user?.fullName || req.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p className="text-xs text-zinc-500 font-semibold mt-0.5 truncate">
                                {req.user?.email || `User ID: ${req.userId.slice(0, 8)}`}
                              </p>
                              {req.user?.addresses && req.user.addresses.length > 0 && (
                                <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1 mt-1.5 min-w-0">
                                  <MapPin className="h-3 w-3 shrink-0" />
                                  <span className="truncate max-w-[150px] lg:max-w-none font-medium">
                                    {(() => {
                                      const primary = req.user.addresses.find((addr: any) => addr.isPrimary);
                                      const addr = primary || req.user.addresses[0];
                                      return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                                    })()}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4.5 text-zinc-300 font-bold text-xs whitespace-nowrap">
                          {formatPaymentMethod(req.paymentMethod)}
                        </td>
                        <td className="px-4 lg:px-6 py-4.5 whitespace-nowrap">
                          <p className="font-black text-emerald-400 text-sm sm:text-base tracking-tight">
                            GH₵ {Number(req.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </p>
                        </td>
                        <td className="px-4 lg:px-6 py-4.5 whitespace-nowrap">
                          <Badge
                            variant={getTransactionStatusVariant(req.status)}
                            className={cn(
                              "text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full border-none shadow-sm",
                              req.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                              req.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                              req.status === 'APPROVED' && "bg-blue-500/10 text-blue-400",
                              req.status === 'FAILED' && "bg-red-500/10 text-red-400",
                              req.status === 'REVERSED' && "bg-zinc-700 text-zinc-300"
                            )}
                          >
                            {req.status}
                          </Badge>
                        </td>
                        <td className="px-4 lg:px-6 py-4.5 font-semibold text-zinc-400 text-xs whitespace-nowrap">
                          <p className="text-zinc-200">{format(new Date(req.createdAt), "MMM dd, yyyy")}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">{format(new Date(req.createdAt), "hh:mm a")}</p>
                        </td>
                        <td className="px-4 lg:px-6 py-4.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8.5 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 text-xs font-bold px-2.5 sm:px-3 transition-all duration-300 shrink-0"
                              onClick={() => setSelectedTransaction(req)}
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              View
                            </Button>
                            {req.status === TRANSACTION_STATUS.APPROVED && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-xs font-extrabold px-2.5 sm:px-3 transition-all duration-300 shrink-0"
                                onClick={() => handleConfirmPayment(req.id)}
                                disabled={confirmMutation.isPending}
                                title="Confirm Payout"
                              >
                                {confirmMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1.5" />
                                    Confirm Paid
                                  </>
                                )}
                              </Button>
                            )}
                            {req.status === TRANSACTION_STATUS.PENDING && (
                              <div className="px-2 text-[10px] font-bold text-zinc-500 italic tracking-tight uppercase">
                                Awaiting Admin
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 lg:px-6 py-24 text-center bg-[#0f1630]">
                        <Wallet className="h-12 w-12 text-zinc-500 mx-auto mb-4 animate-pulse" />
                        <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No requests found</h3>
                        <p className="text-xs text-zinc-500 font-medium mt-1">
                          There are no pending or processed withdrawal requests.
                        </p>
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
                    <div className="h-20 bg-[#162045] rounded-xl" />
                  </div>
                ))
              ) : withdrawals.length > 0 ? (
                withdrawals.map((req: any) => (
                  <div key={req.id} className="py-4.5 space-y-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center justify-center shrink-0">
                          <Wallet className="h-5 w-5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-200 text-sm truncate leading-none">
                            {req.user?.fullName || req.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-zinc-500 truncate mt-1.5 font-semibold leading-none">
                            {req.user?.email || `ID: ${req.userId.slice(0, 8)}...`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end">
                        <p className="font-black text-emerald-400 text-sm tracking-tight leading-none">
                          GH₵ {Number(req.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-none">
                          {formatPaymentMethod(req.paymentMethod)}
                        </p>
                      </div>
                    </div>

                    {req.user?.addresses && req.user.addresses.length > 0 && (
                      <div className="text-[11px] text-amber-400 font-bold flex items-center gap-1 px-1.5 py-1 bg-white/5 rounded-lg min-w-0">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate font-medium text-zinc-300">
                          {(() => {
                            const primary = req.user.addresses.find((addr: any) => addr.isPrimary);
                            const addr = primary || req.user.addresses[0];
                            return [addr.street, addr.city, addr.state].filter(Boolean).join(', ');
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-dashed border-white/5 bg-[#0f1630]">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <span className="text-[10px] text-zinc-500 font-semibold leading-none">
                          {format(new Date(req.createdAt), "MMM dd, yyyy · hh:mm a")}
                        </span>
                        <div className="w-fit">
                          <Badge
                            variant={getTransactionStatusVariant(req.status)}
                            className={cn(
                              "text-[8px] sm:text-[9px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
                              req.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                              req.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                              req.status === 'APPROVED' && "bg-blue-500/10 text-blue-400",
                              req.status === 'FAILED' && "bg-red-500/10 text-red-400",
                              req.status === 'REVERSED' && "bg-zinc-700 text-zinc-300"
                            )}
                          >
                            {req.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                          onClick={() => setSelectedTransaction(req)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {req.status === TRANSACTION_STATUS.APPROVED && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-emerald-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957]"
                            onClick={() => handleConfirmPayment(req.id)}
                            disabled={confirmMutation.isPending}
                          >
                            {confirmMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                        {req.status === TRANSACTION_STATUS.PENDING && (
                          <span className="text-[9px] font-bold text-zinc-500 tracking-wide uppercase px-2 py-1 bg-white/5 rounded border border-white/5">
                            Pending Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-[#0f1630]">
                  <Wallet className="h-10 w-10 text-zinc-500 mx-auto mb-3 animate-pulse" />
                  <h3 className="text-sm font-bold text-zinc-400 tracking-tight">No requests found</h3>
                </div>
              )}
            </div>

            {/* Pagination Segment */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-[#0b1026]/40 gap-4 w-full">
                <p className="text-xs text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                  Page{" "}
                  <span className="text-blue-400 font-black">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="text-white font-black">
                    {totalPages}
                  </span>
                </p>
                <div className="flex items-center gap-2 justify-between w-full sm:w-auto order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-white text-xs font-bold disabled:opacity-40 transition-colors duration-300 flex-1 sm:flex-initial justify-center"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
















