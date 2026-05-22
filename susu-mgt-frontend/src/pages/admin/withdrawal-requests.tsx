




















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
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Withdrawal Requests
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Manage and process customer withdrawal requests.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search by ID or details..."
                className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-[11px] text-zinc-400 uppercase tracking-widest bg-[#0b1026]/60 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold">Request Details</th>
                  <th className="px-6 py-4 font-bold">Method</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630]">
                      <td colSpan={6} className="px-6 py-5">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((req: any) => (
                    <tr
                      key={req.id}
                      className="group hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">
                              {req.user?.fullName ||
                                req.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium">
                              {req.user?.email ||
                                `User ID: ${req.userId.slice(0, 8)}...`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-zinc-300 font-medium text-xs">
                        {formatPaymentMethod(req.paymentMethod)}
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="font-black text-white text-base">
                          GH₵ {Number(req.amount || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4.5">
                        <Badge
                          variant={getTransactionStatusVariant(req.status)}
                          className={cn(
                            req.status === TRANSACTION_STATUS.APPROVED &&
                              "bg-blue-50 text-blue-700 border-blue-200",
                          )}
                        >
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4.5 text-xs text-zinc-400">
                        {format(new Date(req.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                            onClick={() => setSelectedTransaction(req)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === TRANSACTION_STATUS.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                                onClick={() => handleApprove(req.id)}
                                disabled={approveMutation.isPending}
                                title="Approve Request"
                              >
                                {approveMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                                onClick={() => handleReject(req.id)}
                                disabled={rejectMutation.isPending}
                                title="Reject Request"
                              >
                                {rejectMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                          {req.status === TRANSACTION_STATUS.APPROVED && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                              onClick={() => handleConfirmPayment(req.id)}
                              disabled={isProcessingLocal === req.id}
                              title="Confirm Payment"
                            >
                              {isProcessingLocal === req.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CreditCard className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-24 text-center bg-[#0f1630]">
                      <Wallet className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-300">
                        No requests found
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        No withdrawal requests found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4.5 border-t border-white/5 bg-[#0b1026]/40">
              <p className="text-xs text-zinc-400 font-medium">
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