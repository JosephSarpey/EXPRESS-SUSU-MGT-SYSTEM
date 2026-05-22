
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Coins,
  Settings,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/api/admin.service";
import { cn } from "@/lib/utils";

export function SettingsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [platformNameInput, setPlatformNameInput] =
    useState("SUSU MGT. SYSTEM");
  const [minWithdrawalInput, setMinWithdrawalInput] = useState("50.00");

  useEffect(() => {
    fetchSettings();
  }, []);

  const showSuccessFeedback = (msg: string) => {
    setSuccess(msg);
    setError(null);
    const timer = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(timer);
  };

  const showErrorFeedback = (msg: string) => {
    setError(msg);
    setSuccess(null);
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getSettings();

      if (Array.isArray(data)) {
        const nameS = data.find(
          (item: any) => item.settingKey === "platformName",
        );
        if (nameS) {
          setPlatformNameInput(nameS.settingValue);
          localStorage.setItem("susu_platform_name", nameS.settingValue);
        }

        const minW = data.find(
          (item: any) => item.settingKey === "minWithdrawalAmount",
        );
        if (minW) {
          setMinWithdrawalInput(minW.settingValue);
          localStorage.setItem("susu_min_withdrawal_amount", minW.settingValue);
        }
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
      showErrorFeedback("Failed to fetch system settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlatformName = async () => {
    const value = platformNameInput.trim();
    if (!value) {
      showErrorFeedback("Platform Name cannot be empty.");
      return;
    }
    try {
      setIsUpdating("platformName");
      await adminService.updateSetting({
        settingKey: "platformName",
        settingValue: value,
        description: "The public name of the platform.",
      });
      localStorage.setItem("susu_platform_name", value);
      window.dispatchEvent(new Event("platformNameChanged"));
      showSuccessFeedback("Successfully updated Platform Name!");
    } catch (err) {
      console.error("Error updating Platform Name:", err);
      showErrorFeedback("Failed to update Platform Name. Please try again.");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleUpdateMinWithdrawal = async () => {
    const value = minWithdrawalInput.trim();
    if (!value || isNaN(Number(value)) || Number(value) < 0) {
      showErrorFeedback("Please enter a valid minimum withdrawal amount.");
      return;
    }
    try {
      setIsUpdating("minWithdrawalAmount");
      await adminService.updateSetting({
        settingKey: "minWithdrawalAmount",
        settingValue: value,
        description: "The minimum amount allowed for a withdrawal request.",
      });
      localStorage.setItem("susu_min_withdrawal_amount", value);
      window.dispatchEvent(new Event("minWithdrawalAmountChanged"));
      showSuccessFeedback("Successfully updated Minimum Withdrawal Amount!");
    } catch (err) {
      console.error("Error updating Minimum Withdrawal Amount:", err);
      showErrorFeedback(
        "Failed to update Minimum Withdrawal Amount. Please try again.",
      );
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#070c1e]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 pb-6 border-b border-white/5 mb-8">
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
            System Settings
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Configure global parameters and platform behavior.
          </p>
        </div>
      </div>

      <div className="grid gap-6 mt-4">
        {/* General Settings */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Settings className="h-4 w-4 text-blue-400" />
              General Configuration
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Main platform settings and branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#141d3d] border border-white/5 transition-all duration-300 hover:border-blue-500/20">
              <div className="flex-1">
                <p className="font-bold text-sm text-zinc-200">Platform Name</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  The public name of the platform displayed in the dashboard
                  header and sidebars.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto items-center">
                <Input
                  value={platformNameInput}
                  onChange={(e) => setPlatformNameInput(e.target.value)}
                  className="h-11 rounded-xl bg-[#0b1026] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all duration-300 w-full md:w-64"
                />
                <Button
                  size="sm"
                  disabled={isUpdating === "platformName"}
                  onClick={handleUpdatePlatformName}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl h-11 px-5 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.2)] hover:shadow-[0_0_25px_rgba(59,130,246,0.4)]"
                >
                  {isUpdating === "platformName" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Settings */}
        <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <CardHeader className="bg-[#0b1026] border-b border-white/5 p-4 md:p-6">
            <CardTitle className="text-base font-bold flex items-center gap-2 text-white">
              <Coins className="h-4 w-4 text-emerald-400" />
              Transaction Limits
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400 mt-1">
              Configure rules and thresholds for customer transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#141d3d] border border-white/5 transition-all duration-300 hover:border-emerald-500/20">
              <div className="flex-1">
                <p className="font-bold text-sm text-zinc-200">Minimum Withdrawal Amount</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  The minimum amount a customer is allowed to request when
                  withdrawing funds.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto items-center">
                <Input
                  type="number"
                  value={minWithdrawalInput}
                  onChange={(e) => setMinWithdrawalInput(e.target.value)}
                  className="h-11 rounded-xl bg-[#0b1026] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full md:w-64"
                />
                <Button
                  size="sm"
                  disabled={isUpdating === "minWithdrawalAmount"}
                  onClick={handleUpdateMinWithdrawal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl h-11 px-5 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                >
                  {isUpdating === "minWithdrawalAmount" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {success && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-in slide-in-from-right duration-300 z-50">
          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-red-500 animate-in slide-in-from-right duration-300 z-50">
          <AlertCircle className="h-5 w-5 text-red-200" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
