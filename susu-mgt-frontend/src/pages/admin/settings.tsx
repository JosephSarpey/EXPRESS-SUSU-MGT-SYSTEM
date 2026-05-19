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
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
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
            System Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Configure global parameters and platform behavior.
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              General Configuration
            </CardTitle>
            <CardDescription>
              Main platform settings and branding.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <div className="flex-1">
                <p className="font-bold text-sm">Platform Name</p>
                <p className="text-xs text-zinc-500">
                  The public name of the platform displayed in the dashboard
                  header and sidebars.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  value={platformNameInput}
                  onChange={(e) => setPlatformNameInput(e.target.value)}
                  className="h-10 w-full md:w-64"
                />
                <Button
                  size="sm"
                  disabled={isUpdating === "platformName"}
                  onClick={handleUpdatePlatformName}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-600" />
              Transaction Limits
            </CardTitle>
            <CardDescription>
              Configure rules and thresholds for customer transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <div className="flex-1">
                <p className="font-bold text-sm">Minimum Withdrawal Amount</p>
                <p className="text-xs text-zinc-500">
                  The minimum amount a customer is allowed to request when
                  withdrawing funds.
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input
                  type="number"
                  value={minWithdrawalInput}
                  onChange={(e) => setMinWithdrawalInput(e.target.value)}
                  className="h-10 w-full md:w-64"
                />
                <Button
                  size="sm"
                  disabled={isUpdating === "minWithdrawalAmount"}
                  onClick={handleUpdateMinWithdrawal}
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
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <AlertCircle className="h-5 w-5" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
