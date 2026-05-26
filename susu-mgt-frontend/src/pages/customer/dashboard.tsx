import { Link } from "react-router-dom";
import logo from "../../assets/logo2.png";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  User,
  MapPin,
  EyeOff,
  Send,
  Gift,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyWallet, useWalletStats } from "@/hooks/use-customer";
import { useMyTransactions } from "@/hooks/use-transactions";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";

export function CustomerDashboard() {
  useAuthStore();

  const {
    data: wallet,
    isLoading: isWalletLoading,
    error: walletError,
  } = useMyWallet();
  const { data: stats, isLoading: isStatsLoading } = useWalletStats();
  const { data: transactionsData, isLoading: isTxLoading } = useMyTransactions({
    limit: 5,
  });

  const recentTransactions = transactionsData?.data || [];
  const isLoading = isWalletLoading || isStatsLoading || isTxLoading;
  const error = walletError
    ? "Failed to load dashboard data. Please try again later."
    : null;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-4 max-w-6xl mx-auto bg-[#070c1e] min-h-screen">
        <div className="flex justify-between items-center pt-4">
          <div className="h-10 w-10 bg-[#141d3d] rounded-full" />
          <div className="h-10 w-24 bg-[#141d3d] rounded-xl" />
          <div className="h-10 w-10 bg-[#141d3d] rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-[#141d3d]/80 rounded-2xl md:col-span-2" />
          <div className="h-44 bg-[#141d3d]/80 rounded-2xl" />
        </div>
        <div className="h-64 bg-[#141d3d]/40 rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#070c1e] text-center px-6 text-white">
        <div className="p-4 bg-red-500/10 rounded-full mb-4 border border-red-500/20">
          <AlertCircle className="h-10 w-10 text-red-400" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
          Something went wrong
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6 leading-relaxed max-w-sm">
          {error}
        </p>
        <Button
          onClick={() => window.location.reload()}
          size="sm"
          className="rounded-xl px-5 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-lg transition-colors duration-250"
        >
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-[#070c1e] min-h-screen text-white font-sans w-full flex flex-col justify-between pb-24 md:pb-6 relative selection:bg-emerald-500/30">
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between md:justify-center border-b border-white/5 relative">
        {/* Styled App Brand Identity Element */}
        <div className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black transform -rotate-3 flex items-center justify-center shadow-xl transition-transform duration-300 hover:rotate-0 cursor-default">
          <span className="text-lg sm:text-xl tracking-tighter uppercase text-center">
            My Wallet
          </span>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-6 flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left / Top Stack Section: Core Balance & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main App Wallet Balance Container */}
            <Card className="border border-white/5 bg-[#0f1630] text-white shadow-2xl rounded-2xl overflow-hidden relative">
              <CardHeader className="pb-1 pt-6 px-4 sm:px-6 flex flex-col items-center relative text-center">
                <Badge className="absolute top-0 left-0 bg-blue-600 text-white font-bold rounded-tl-2xl rounded-br-2xl rounded-tr-none rounded-bl-none px-4 sm:px-5 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider shadow-sm">
                  Wallet
                </Badge>
                <span className="text-xs sm:text-sm font-semibold text-zinc-500 tracking-wide mt-2 truncate max-w-full px-2">
                  Account Number: {wallet?.id || "0550817954"}
                </span>
                <div className="flex items-center justify-center gap-2.5 sm:gap-3 mt-2 w-full px-2">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white text-center flex-1 min-w-0 pl-5 sm:pl-6 break-words">
                    <span className="text-base sm:text-lg font-bold mr-1 sm:mr-1.5 text-emerald-400">
                      GH₵
                    </span>
                    {(wallet?.balance || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-500 cursor-pointer shrink-0 transition-colors duration-200 hover:text-emerald-400" />
                </div>
              </CardHeader>

              {/* Quick Wallet Action Links */}
              <CardContent className="grid grid-cols-3 border-t border-white/5 p-0 mt-6 text-center divide-x divide-white/5 bg-[#0b1026]/40">
                <Link
                  to="/customer/deposit"
                  className="py-4 flex flex-col items-center justify-center hover:bg-[#131c3d]/40 transition-all duration-200 group"
                >
                  <ArrowDownLeft className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-all duration-200 mb-1 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors duration-200 truncate max-w-full px-1">
                    Deposit
                  </span>
                </Link>
                <Link
                  to="/customer/withdraw"
                  className="py-4 flex flex-col items-center justify-center hover:bg-[#131c3d]/40 transition-all duration-200 group"
                >
                  <ArrowUpRight className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-all duration-200 mb-1 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors duration-200 truncate max-w-full px-1">
                    Withdraw
                  </span>
                </Link>
                <Link
                  to="/customer/transactions"
                  className="py-4 flex flex-col items-center justify-center hover:bg-[#131c3d]/40 transition-all duration-200 group"
                >
                  <History className="h-5 w-5 text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-200 mb-1 shrink-0" />
                  <span className="text-[11px] sm:text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors duration-200 truncate max-w-full px-1">
                    Statements
                  </span>
                </Link>
              </CardContent>
            </Card>

            {/* Split Information Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/customer/transactions"
                className="border border-white/5 bg-[#0f1630] text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md hover:border-emerald-500/20 hover:bg-[#131c3d]/30 transition-all duration-250 group"
              >
                <Send className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 group-hover:translate-x-1 transition-all duration-200 mb-2 shrink-0" />
                <span className="text-xs sm:text-sm font-bold tracking-tight group-hover:text-white transition-colors duration-200">
                  View Transactions
                </span>
              </Link>

              <div className="border border-white/5 bg-[#0f1630] text-white p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-colors duration-200">
                <TrendingUp className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-400 mb-2 shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider leading-normal">
                  Total Cumulative Savings
                </span>
                <span className="text-base sm:text-lg font-bold text-white mt-0.5 tracking-tight">
                  GH₵{" "}
                  {(stats?.totalDeposited || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Compact Recent Activity Transactions Feed */}
            <Card className="border border-white/5 bg-[#0f1630] text-white rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3.5 pt-4.5 px-4 sm:px-5 border-b border-white/5 bg-[#0b1026] gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-1.5 h-4 bg-blue-600 rounded-full shrink-0" />
                  <CardTitle className="text-xs sm:text-sm md:text-base font-bold tracking-tight text-white truncate">
                    Recent Logs
                  </CardTitle>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-[11px] sm:text-xs font-bold text-blue-400 hover:bg-white/5 px-2 sm:px-2.5 rounded-xl h-7.5 transition-all duration-250 shrink-0 group/btn"
                >
                  <Link
                    to="/customer/transactions"
                    className="flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="ml-0.5 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 bg-[#0f1630]">
                <div className="space-y-3">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((tx) => {
                      const isCredit =
                        tx.type === "DEPOSIT" || tx.type === "COLLECTION";
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between bg-[#141d3d] p-3 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-200 gap-3"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <div
                              className={cn(
                                "p-2 sm:p-2.5 rounded-lg shrink-0 transition-transform duration-200",
                                isCredit
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-blue-500/10 text-blue-400",
                              )}
                            >
                              {isCredit ? (
                                <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-xs sm:text-sm text-zinc-100 truncate leading-snug">
                                {tx.type}{" "}
                                <span className="font-medium text-zinc-400 text-[10px] sm:text-xs">
                                  via
                                </span>{" "}
                                <span className="text-zinc-300 text-[11px] sm:text-xs font-semibold">
                                  {tx.paymentMethod?.replace("_", " ")}
                                </span>
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 truncate font-medium">
                                {format(
                                  new Date(tx.createdAt),
                                  "MMM dd, yyyy • hh:mm a",
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1 shrink-0">
                            <p
                              className={cn(
                                "font-black text-xs sm:text-sm tracking-tight leading-none",
                                isCredit ? "text-emerald-400" : "text-blue-400",
                              )}
                            >
                              {isCredit ? "+" : "-"} GH₵{tx.amount || 0}
                            </p>
                            <span className="text-[9px] font-bold bg-[#0b1026] text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 uppercase tracking-wide">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-xs sm:text-sm font-medium">
                      No account transaction logs found.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Section Panel */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <Card className="border border-white/5 bg-[#0f1630] text-white rounded-2xl shadow-md">
                <CardContent className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
                      Total Saved
                    </p>
                    <p className="text-lg sm:text-xl font-bold mt-1 tracking-tight truncate">
                      <span className="text-xs text-emerald-400 font-medium mr-0.5">
                        GH₵
                      </span>
                      {(stats?.totalDeposited || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl shrink-0">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-white/5 bg-[#0f1630] text-white rounded-2xl shadow-md">
                <CardContent className="p-4 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider truncate">
                      Withdrawn
                    </p>
                    <p className="text-lg sm:text-xl font-bold mt-1 tracking-tight truncate">
                      <span className="text-xs text-blue-400 font-medium mr-0.5">
                        GH₵
                      </span>
                      {(stats?.totalWithdrawn || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="bg-blue-500/10 p-2.5 rounded-xl shrink-0">
                    <TrendingDown className="h-5 w-5 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Rewards Banner Container */}
            <div className="bg-gradient-to-br from-[#0f1630] via-[#131c3d] to-blue-950 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col justify-between border border-white/5 h-44 group hover:border-emerald-500/20 transition-all">
              <div className="space-y-1 relative z-10">
                <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight uppercase">
                  Streak Bonus Active 🔥
                </h4>
                <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed pt-1 font-medium">
                  Save consistently every week to unlock premium interest rates
                  and milestone badges. Consistency builds wealth!
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 relative z-10 w-full gap-2">
                <div className="text-[11px] sm:text-xs font-bold text-blue-400 flex items-center gap-1 cursor-pointer hover:underline group-hover:text-white transition-colors duration-200 shrink-0">
                  <span>Click to earn points</span>
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
                <Gift className="h-6 w-6 sm:h-7 sm:w-7 text-blue-400 group-hover:scale-110 transition-transform duration-250 shrink-0" />
              </div>
            </div>

            {/* Hub Operations Short Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Link
                to="/customer/addresses"
                className="flex items-center justify-between p-4 rounded-xl bg-[#0f1630] border border-white/5 hover:border-blue-500/20 transition-all duration-200 group w-full gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MapPin className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-bold text-xs text-white truncate">
                      Addresses
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                      Manage drop zones
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
              <Link
                to="/customer/profile"
                className="flex items-center justify-between p-4 rounded-xl bg-[#0f1630] border border-white/5 hover:border-blue-500/20 transition-all duration-200 group w-full gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <User className="h-5 w-5 text-blue-400 group-hover:scale-110 transition-transform duration-200 shrink-0" />
                  <div className="text-left min-w-0">
                    <p className="font-bold text-xs text-white truncate">
                      Security
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-medium">
                      Manage profile parameters
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Bottom Active Indicator Row */}
            <div className="text-[10px] sm:text-[11px] text-zinc-400 font-bold flex items-center justify-center gap-2 bg-[#0f1630] border border-white/5 rounded-xl py-2.5 px-3 text-center w-full">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="truncate">
                Wallet Active Status:{" "}
                <span className="font-black text-emerald-400 uppercase">
                  {wallet?.status || "ACTIVE"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Sticky Tab Navigation Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0f1630] border-t border-white/5 grid grid-cols-5 items-center justify-center py-2 px-1 text-center shadow-2xl rounded-t-2xl z-50">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-emerald-400 font-bold"
        >
          <Wallet className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            Home
          </span>
        </Link>
        <Link
          to="/customer/transactions"
          className="flex flex-col items-center justify-center text-zinc-500 hover:text-white transition-colors duration-200"
        >
          <Send className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            Transactions
          </span>
        </Link>

        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full shadow-lg border-white hover:scale-105 transition-transform duration-250 cursor-pointer bg-blue-600 flex items-center justify-center p-0.5 shrink-0">
            <img className="h-12 w-12 sm:h-14 sm:w-14" src={logo} alt="Logo" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:text-white transition-colors duration-200">
          <Gift className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            Offers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:text-white transition-colors duration-200">
          <MoreHorizontal className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            More
          </span>
        </div>
      </div>
    </div>
  );
}
