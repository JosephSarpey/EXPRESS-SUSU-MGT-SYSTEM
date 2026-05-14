import { useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export function WithdrawalRequestPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const { data, isLoading } = useWorkerWithdrawals({ page, limit });
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
              Manage and confirm payouts to customers.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl">
          <CardHeader className="p-6 border-b dark:border-zinc-800">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by ID or customer..."
                  className="pl-10 h-11 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" className="rounded-2xl gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-500 dark:text-zinc-400 uppercase bg-zinc-50/50 dark:bg-zinc-900/50 border-b dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-bold">Request</th>
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
                          <div className="h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
                        </td>
                      </tr>
                    ))
                  ) : withdrawals.length > 0 ? (
                    withdrawals.map((req: any) => (
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
                                User: {req.userId.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-zinc-700 dark:text-zinc-300">
                            {formatPaymentMethod(req.paymentMethod)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-zinc-900 dark:text-zinc-100 text-base">
                            GH₵ {Number(req.amount || 0).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={getTransactionStatusVariant(req.status)}
                            className="rounded-full px-3 py-0.5"
                          >
                            {req.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-zinc-900 dark:text-zinc-100">
                            {format(new Date(req.createdAt), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {format(new Date(req.createdAt), "hh:mm a")}
                          </p>
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
                            {req.status === TRANSACTION_STATUS.APPROVED && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-xl text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                onClick={() => handleConfirmPayment(req.id)}
                                disabled={confirmMutation.isPending}
                                title="Confirm Payout"
                              >
                                {confirmMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            {req.status === TRANSACTION_STATUS.PENDING && (
                              <div className="px-2 text-[10px] font-medium text-zinc-400 italic">
                                Awaiting Admin
                              </div>
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
                          There are no pending or processed withdrawal requests.
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
      </div>

      <TransactionDetailsModal
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
