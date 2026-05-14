import { useState } from "react";
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

  const { data, isLoading } = useAdminWithdrawalRequests({ page, limit });
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
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Withdrawal Requests
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage and process customer withdrawal requests.
            </p>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search by ID or details..."
                className="pl-10 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none"
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
                  <th className="px-6 py-4 font-bold">Request Details</th>
                  <th className="px-6 py-4 font-bold">Method</th>
                  <th className="px-6 py-4 font-bold">Amount</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : requests.length > 0 ? (
                  requests.map((req: any) => (
                    <tr
                      key={req.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all duration-300"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Wallet className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {req.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              User ID: {req.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-700 dark:text-zinc-300 font-medium">
                        {formatPaymentMethod(req.paymentMethod)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-zinc-900 dark:text-zinc-100">
                          GH₵ {Number(req.amount || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {format(new Date(req.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => setSelectedTransaction(req)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {req.status === TRANSACTION_STATUS.PENDING && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
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
                                className="rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
                              className="rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                    <td colSpan={6} className="px-6 py-24 text-center">
                      <Wallet className="h-16 w-16 text-zinc-200 dark:text-zinc-800 mx-auto mb-6" />
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        No requests found
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        No withdrawal requests found.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t dark:border-zinc-800">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                Page{" "}
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {page}
                </span>{" "}
                of{" "}
                <span className="text-zinc-900 dark:text-zinc-100 font-bold">
                  {totalPages}
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl"
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
