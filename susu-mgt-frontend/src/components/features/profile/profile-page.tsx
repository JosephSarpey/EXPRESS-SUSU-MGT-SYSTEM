import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/store/auth-store";
import { usersService } from "@/services/api/users.service";
import {
  User,
  Mail,
  Phone,
  Shield,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      phone: user?.phone || "",
    },
  });

  const showSuccessFeedback = (msg: string) => {
    setSuccess(msg);
    setError(null);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorFeedback = (msg: string) => {
    setError(msg);
    setSuccess(null);
    setTimeout(() => setError(null), 3000);
  };

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsUpdating(true);
      const updatedUser = await usersService.updateProfile({
        fullName: data.fullName,
        phone: data.phone,
      });
      updateUser(updatedUser);
      showSuccessFeedback("Profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating profile:", err);
      showErrorFeedback(
        err.response?.data?.message || "Failed to update profile",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          My Profile
        </h1>
        <p className="text-sm md:text-base text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <CardContent className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-center -mt-12 mb-4 relative z-10 group">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white dark:bg-zinc-950 p-1 shadow-lg">
                    <div className="h-full w-full rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {user.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Avatar Upload Placeholder */}
                  <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {user.fullName}
                </h2>
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  <Shield className="h-3.5 w-3.5" />
                  <span>{user.role}</span>
                </div>
                <div className="pt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader className="pb-4 border-b dark:border-zinc-800">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Personal Details
              </CardTitle>
              <CardDescription>
                Update your name and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      {...register("fullName")}
                      className={`pl-9 bg-zinc-50 dark:bg-zinc-900/50 ${
                        errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex justify-between">
                    <span>Email Address</span>
                    <span className="text-xs text-zinc-400 font-normal">
                      (Read-only)
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      value={user.email}
                      disabled
                      className="pl-9 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 cursor-not-allowed opacity-100"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      {...register("phone")}
                      className={`pl-9 bg-zinc-50 dark:bg-zinc-900/50 ${
                        errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""
                      }`}
                      placeholder="e.g. +233 24 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-500 font-medium">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={!isDirty || isUpdating}
                    className="w-full md:w-auto px-8 rounded-full shadow-md transition-all active:scale-95"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving changes...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {success && (
        <div className="fixed bottom-8 right-8 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-8 right-8 z-50 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom md:slide-in-from-right duration-300">
          <AlertCircle className="h-5 w-5" />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
