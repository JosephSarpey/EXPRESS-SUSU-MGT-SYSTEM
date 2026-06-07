import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MobileNavbar } from "./mobileNavbar";
import {
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Banknote,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  transactionsService,
  PaymentMethod,
} from "@/services/api/transactions.service";
import { cn } from "@/lib/utils";

export function WithdrawPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("MTN_MOMO");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [minWithdrawalAmount] = useState(() => {
    const val = localStorage.getItem("susu_min_withdrawal_amount");
    return val ? Number(val) : 50.0;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredAmount = Number(amount);
    if (!amount || isNaN(enteredAmount) || enteredAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (enteredAmount < minWithdrawalAmount) {
      setError(
        `The minimum allowed withdrawal is GH₵ ${minWithdrawalAmount.toFixed(2)}`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await transactionsService.createWithdrawal({
        amount: enteredAmount,
        method,
      });

      setSuccess(true);
    } catch (err: any) {
      console.error("Error requesting withdrawal:", err);
      setError(
        err.response?.data?.message ||
          "Failed to request withdrawal. Ensure you have sufficient balance.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[#070c1e] min-h-screen text-white font-sans flex items-center justify-center p-4">
        <div className="bg-[#0f1630] border border-white/5 text-white p-8 md:p-10 rounded-2xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-emerald-500/10 inline-block p-5 rounded-full mb-6 ring-8 ring-emerald-500/5">
            <CheckCircle2 className="h-14 w-14 text-emerald-400 stroke-[2]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Request Submitted!
          </h1>
          <p className="text-sm text-zinc-400 mb-8 leading-relaxed font-medium">
            Your withdrawal request for{" "}
            <span className="font-extrabold text-emerald-400">
              GH₵{" "}
              {Number(amount).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>{" "}
            has been received and is pending approval.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <Button
              variant="outline"
              className="rounded-xl font-bold h-11 border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-xs text-zinc-300 hover:text-white transition-all duration-200"
              onClick={() => navigate("/customer/transactions")}
            >
              View Status
            </Button>
            <Button
              className="rounded-xl font-black h-11 bg-blue-600 hover:bg-blue-700 text-white text-xs shadow-lg transition-all duration-200"
              onClick={() => navigate("/customer/dashboard")}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const methods: {
    id: PaymentMethod;
    name: string;
    description: string;
    icon: any;
  }[] = [
    {
      id: "MTN_MOMO",
      name: "MTN MoMo",
      description: "MTN Mobile Money withdrawal payout channel",
      icon: Smartphone,
    },
    {
      id: "TELECEL_CASH",
      name: "Telecel Cash",
      description: "Telecel Cash secondary mobile wallet channel",
      icon: Smartphone,
    },
    {
      id: "AIRTELTIGO_MONEY",
      name: "AirtelTigo Money",
      description: "AirtelTigo Money network transfer system",
      icon: Smartphone,
    },
    {
      id: "BANK_TRANSFER",
      name: "Bank Transfer",
      description: "Clear direct transfer routes to any local clearing bank",
      icon: Banknote,
    },
    {
      id: "CASH",
      name: "Worker Cash",
      description: "Receive physical cash via match ledger agents",
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-[#070c1e] min-h-screen text-white font-sans w-full flex flex-col justify-between pb-12 md:pb-6 relative selection:bg-emerald-500/30">
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between border-b border-white/5 relative">
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
            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
              Withdraw Funds
            </h1>
            <p className="text-xs text-zinc-400 hidden sm:block mt-0.5">
              Debit matching parameters securely from your automated wallet
              balance.
            </p>
          </div>
        </div>
      </header>

      {/* Main Base Flex Layout Container */}
      <main className="w-full max-w-4xl mx-auto px-4 md:px-8 mt-8 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start mb-8">
          {/* Main Request Form Component Box */}
          <div className="md:col-span-3">
            <Card className="border border-white/5 bg-[#0f1630] shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
              <CardHeader className="border-b border-white/5 pb-5 pt-6 px-6 bg-[#0b1026]">
                <CardTitle className="flex items-center gap-2.5 text-base font-bold text-white tracking-tight">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ArrowUpRight className="h-4.5 w-4.5 stroke-[2.5]" />
                  </div>
                  Withdrawal Details
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1 font-medium">
                  Specify payout units and assign clear balance route targets
                  safely.
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-6 px-6 bg-[#0f1630]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Amount Value Entry Node */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                      Amount (GH₵)
                    </label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-500 text-lg transition-colors group-hover:text-emerald-400">
                        GH₵
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-16 h-14 text-xl font-bold tracking-tight bg-[#141d3d] border border-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300"
                        step="0.01"
                        min={minWithdrawalAmount}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-[10px] leading-normal font-medium text-zinc-500 pt-0.5 ml-0.5">
                      The current threshold platform withdrawal parameter limits
                      require a minimum of{" "}
                      <span className="font-bold text-emerald-400">
                        GH₵ {minWithdrawalAmount.toFixed(2)}
                      </span>
                      .
                    </p>
                  </div>

                  {/* Channel Choice Segment list Selection Grid */}
                  <div className="space-y-2.5">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                      Select Payout Channel Method
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {methods.map((m) => {
                        const isSelected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setMethod(m.id)}
                            className={cn(
                              "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-250 relative overflow-hidden group/item",
                              isSelected
                                ? "border-[#10b981]/30 bg-[#10b981]/5 shadow-sm"
                                : "border-white/5 bg-[#0b1026]/40 hover:bg-[#141d3d]/50 hover:border-white/10",
                            )}
                          >
                            <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                              <div
                                className={cn(
                                  "p-2.5 rounded-xl border transition-all duration-300 shrink-0 group-hover/item:scale-105",
                                  isSelected
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                    : "bg-[#141d3d] text-zinc-500 border-white/5",
                                )}
                              >
                                <m.icon className="h-4.5 w-4.5 stroke-[2.2]" />
                              </div>
                              <div className="min-w-0">
                                <p
                                  className={cn(
                                    "font-bold text-xs tracking-tight transition-colors duration-200",
                                    isSelected
                                      ? "text-emerald-400"
                                      : "text-zinc-200 group-hover/item:text-white",
                                  )}
                                >
                                  {m.name}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium mt-0.5 truncate pr-4">
                                  {m.description}
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <div className="h-4 w-4 rounded-full bg-emerald-400 flex items-center justify-center shrink-0 relative z-10 shadow-sm shadow-emerald-500/20">
                                <div className="h-1.5 w-1.5 rounded-full bg-[#0f1630]" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
                      <p className="text-xs font-semibold leading-relaxed">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Withdrawal Request...
                      </>
                    ) : (
                      "Request Withdrawal Payout"
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="bg-[#0b1026]/40 border-t border-white/5 flex justify-center py-4 px-6 text-center">
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  Approved withdrawals are processed within 2 to 4 business
                  hours.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Right Sidebar Information Area Context Box */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-[#0f1630] border border-white/5 text-white shadow-md relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-200">
              <div className="flex items-start gap-4">
                <div className="bg-white/5 p-3 rounded-xl shrink-0 text-blue-400 group-hover:scale-105 transition-transform duration-200">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-tight">
                    Withdrawal Information
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    Withdrawals are processed directly from your available
                    balance. Ensure the receiving address and network are
                    correct to guarantee a successful transfer.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-400 font-bold flex items-center justify-center gap-2 bg-[#0f1630] border border-white/5 rounded-xl py-3 w-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>System status: Ready</span>
            </div>
          </div>
        </div>
        <MobileNavbar />
      </main>
    </div>
  );
}
