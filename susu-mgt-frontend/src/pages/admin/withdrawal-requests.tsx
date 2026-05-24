


import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Eye,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  useAdminWithdrawalRequests,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from "@/hooks/use-transactions";
import {
  TRANSACTION_STATUS,
  getTransactionStatusVariant,
  formatPaymentMethod,
} from "@/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TransactionDetailsModal } from "@/components/features/transactions/transaction-details-modal";
import {
  Transaction,
  transactionsService,
} from "@/services/api/transactions.service";
import { useQueryClient } from "@tanstack/react-query";
import { transactionKeys } from "@/hooks/use-transactions";
import { useDebounce } from "@/hooks/use-debounce";

export function WithdrawalRequestsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isProcessingLocal, setIsProcessingLocal] = useState<string | null>(
    null,
  );

  const debouncedSearch = useDebounce(search, 300);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useAdminWithdrawalRequests({ 
    page, 
    limit, 
    search: debouncedSearch || undefined 
  });
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync({ id, remarks: "Approved by admin" });
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id, remarks: "Rejected by admin" });
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const handleConfirmPayment = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to confirm that payment has been made? This will deduct the amount from the user's wallet.",
      )
    )
      return;
    try {
      setIsProcessingLocal(id);
      await transactionsService.confirmWithdrawalPayment(id, {
        remarks: "Payment confirmed by admin",
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    } catch (err) {
      console.error("Error confirming payment:", err);
    } finally {
      setIsProcessingLocal(null);
    }
  };

  const requests = data?.data || [];
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-4 sm:p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-5 sm:space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Header Segment Node Layout */}
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
              Withdrawal Requests
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 truncate font-medium">
              Manage and process customer withdrawal requests.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-2">
        <CardHeader className="p-3 sm:p-4 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center w-full">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search by ID or details..."
                className="w-full pl-9 h-9 rounded-lg bg-[#141d3d] border border-white/5 text-xs text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 bg-[#0f1630]">
          
          {/* Desktop & Tablet Table Layout (Condensed gaps and text metrics to avoid swipe actions) */}
          <div className="hidden md:block overflow-x-auto w-full">
            <table className="w-full border-collapse table-auto">
              <thead className="text-[10px] text-zinc-400 uppercase tracking-wider bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-3 py-3 font-bold text-left w-[25%]">Request Details</th>
                  <th className="px-3 py-3 font-bold text-left w-[15%]">Method</th>
                  <th className="px-3 py-3 font-bold text-left w-[15%]">Amount</th>
                  <th className="px-3 py-3 font-bold text-left w-[12%]">Status</th>
                  <th className="px-3 py-3 font-bold text-left w-[18%]">Date</th>
                  <th className="px-3 py-3 font-bold text-right w-[15%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] sm:text-xs">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={6} className="px-3 py-4">
                        <div className="h-8 bg-[#162045] rounded-md" />
                      </td>
                    </tr>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((req: any) => (
                    <tr
                      key={req.id}
                      className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-lg border border-white/5 bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                            <Wallet className="h-3.5 w-3.5 stroke-[2.2]" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                              {req.user?.fullName || req.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">
                              {req.user?.email || `User ID: ${req.userId.slice(0, 8)}...`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-zinc-300 font-bold whitespace-nowrap">
                        {formatPaymentMethod(req.paymentMethod)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <p className="font-black text-emerald-400 tracking-tight text-xs sm:text-sm">
                          GH₵ {Number(req.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <Badge
                          variant={getTransactionStatusVariant(req.status)}
                          className={cn(
                            "text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md border-none shadow-xs",
                            req.status === TRANSACTION_STATUS.APPROVED && "bg-blue-500/10 text-blue-400",
                            req.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                            req.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
                            req.status === 'FAILED' && "bg-red-500/10 text-red-400",
                            req.status === 'REVERSED' && "bg-zinc-700 text-zinc-300"
                          )}
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-semibold text-zinc-400 whitespace-nowrap leading-tight">
                        <p className="text-zinc-200">{format(new Date(req.createdAt), "MMM dd, yyyy")}</p>
                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{format(new Date(req.createdAt), "hh:mm a")}</p>
                      </td>
                      <td className="px-3 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 rounded-md text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 text-[11px] font-bold px-2 transition-all duration-250 shrink-0"
                            onClick={() => setSelectedTransaction(req)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View
                          </Button>
                          {req.status === TRANSACTION_STATUS.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-md text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-[11px] font-bold px-2 transition-all duration-250 shrink-0"
                                onClick={() => handleApprove(req.id)}
                                disabled={approveMutation.isPending}
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-md text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 text-[11px] font-bold px-2 transition-all duration-250 shrink-0"
                                onClick={() => handleReject(req.id)}
                                disabled={rejectMutation.isPending}
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                Reject
                              </Button>
                            </>
                          )}
                          {req.status === TRANSACTION_STATUS.APPROVED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 rounded-md text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 text-[11px] font-bold px-2 transition-all duration-250 shrink-0"
                              onClick={() => handleConfirmPayment(req.id)}
                              disabled={isProcessingLocal === req.id}
                            >
                              {isProcessingLocal === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <CreditCard className="h-3 w-3 mr-1" />
                              )}
                              Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-3 py-16 text-center bg-[#0f1630]">
                      <Wallet className="h-10 w-10 text-zinc-500 mx-auto mb-3 animate-pulse" />
                      <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No requests found</h3>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Structured Card Feed Layout (Hidden on desktop/tablet platforms) */}
          <div className="block md:hidden divide-y divide-white/5 px-3 bg-[#0f1630]">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="py-3 animate-pulse">
                  <div className="h-20 bg-[#162045] rounded-lg" />
                </div>
              ))
            ) : requests.length > 0 ? (
              requests.map((req: any) => (
                <div key={req.id} className="py-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8.5 w-8.5 rounded-xl border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet className="h-4.5 w-4.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 text-xs truncate leading-none">
                          {req.user?.fullName || req.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1 leading-none truncate">
                          {req.user?.email || `ID: ${req.userId.slice(0, 8)}...`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end">
                      <p className="font-black text-emerald-400 text-xs tracking-tight leading-none">
                        GH₵ {Number(req.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-bold mt-1 leading-none">
                        {formatPaymentMethod(req.paymentMethod)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-dashed border-white/5 bg-[#0f1630]">
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[9px] text-zinc-500 font-semibold leading-none">
                        {format(new Date(req.createdAt), "MMM dd, yyyy · hh:mm a")}
                      </span>
                      <div className="w-fit">
                        <Badge
                          variant={getTransactionStatusVariant(req.status)}
                          className={cn(
                            "text-[8px] font-extrabold h-4 px-1.5 rounded shadow-none border-none uppercase tracking-wide shrink-0",
                            req.status === TRANSACTION_STATUS.APPROVED && "bg-blue-500/10 text-blue-400",
                            req.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400",
                            req.status === 'PENDING' && "bg-amber-500/10 text-amber-400",
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
                        className="h-7 w-7 rounded-lg text-blue-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957] shrink-0"
                        onClick={() => setSelectedTransaction(req)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      {req.status === TRANSACTION_STATUS.PENDING && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-emerald-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957] shrink-0"
                            onClick={() => handleApprove(req.id)}
                            disabled={approveMutation.isPending}
                          >
                            {approveMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-lg text-red-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957] shrink-0"
                            onClick={() => handleReject(req.id)}
                            disabled={rejectMutation.isPending}
                          >
                            {rejectMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                      {req.status === TRANSACTION_STATUS.APPROVED && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg text-emerald-400 bg-[#141d3d] border border-white/5 active:bg-[#1c2957] shrink-0"
                          onClick={() => handleConfirmPayment(req.id)}
                          disabled={isProcessingLocal === req.id}
                        >
                          {isProcessingLocal === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-[#0f1630]">
                <Wallet className="h-9 w-9 text-zinc-500 mx-auto mb-2 animate-pulse" />
                <h3 className="text-xs font-bold text-zinc-400 tracking-tight">No requests found</h3>
              </div>
            )}
          </div>

          {/* Dynamic Pagination Controls Panel Footer */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-t border-white/5 bg-[#0b1026]/40 gap-3 w-full">
              <p className="text-[11px] text-zinc-400 font-bold order-2 sm:order-1 text-center sm:text-left">
                Page <span className="text-emerald-400 font-black">{page}</span> of <span className="text-white font-black">{totalPages}</span>
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






