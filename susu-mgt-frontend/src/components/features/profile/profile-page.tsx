import { MobileNavbar } from "@/pages/customer/mobileNavbar";
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
   
    <div>
         <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10 font-sans text-white space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500 mb-7">
      {/* Top Header Text Column */}
      <div className="min-w-0 border-b border-white/5 pb-5">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent truncate leading-normal">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-normal font-medium">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
        {/* Left Column: Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6 w-full">
          <Card className="overflow-hidden border border-white/5 bg-[#0f1630] rounded-2xl shadow-2xl relative">
            <div className="h-20 sm:h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950"></div>
            <CardContent className="px-4 sm:px-6 pb-6 pt-0 relative flex flex-col items-center">
              <div className="flex justify-center -mt-10 sm:mt-[-48px] mb-4 relative z-10 group">
                <div className="relative">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-[#0f1630] p-1 shadow-xl border border-white/5">
                    <div className="h-full w-full rounded-xl bg-[#141d3d] border border-white/5 flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-3xl font-black text-blue-400">
                          {user.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Avatar Upload Placeholder Button */}
                  <button className="absolute bottom-0 right-0 p-1.5 bg-zinc-950/80 backdrop-blur-xs border border-white/10 text-white rounded-xl shadow-md opacity-100 group-hover:bg-blue-600 transition-all duration-200 cursor-pointer">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-center space-y-1.5 w-full min-w-0 px-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {user.fullName}
                </h2>
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-400">
                  <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                  <span className="uppercase tracking-wider text-[10px]">{user.role}</span>
                </div>
                <div className="pt-1.5">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border shadow-2xs ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/10"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Profile Fields Card Form */}
        <div className="md:col-span-2 space-y-6 w-full min-w-0">
          <Card className="border border-white/5 bg-[#0f1630] rounded-2xl shadow-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b border-white/5 bg-[#0b1026]">
              <CardTitle className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
                  <User className="h-4 w-4 stroke-[2.5]" />
                </div>
                <span>Personal Details</span>
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400 mt-1 leading-normal font-medium">
                Update your name and phone information parameters.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 bg-[#0f1630]">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                    Full Name
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    <Input
                      {...register("fullName")}
                      className={`pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full ${
                        errors.fullName ? "border-red-500/40 focus-visible:ring-red-500/50 text-red-400" : ""
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-xs text-red-400 font-semibold ml-0.5 animate-in fade-in duration-200">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-0.5 flex justify-between gap-2">
                    <span>Email Address</span>
                    <span className="text-[9px] text-zinc-500 font-bold lowercase tracking-normal italic normal-case">
                      (Read-only)
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                      value={user.email}
                      disabled
                      className="pl-11 h-11 rounded-xl bg-[#0b1026] border border-white/5 text-sm text-zinc-500 cursor-not-allowed opacity-100 font-medium w-full"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
                    Phone Number
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                    <Input
                      {...register("phone")}
                      className={`pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50 transition-all duration-300 w-full ${
                        errors.phone ? "border-red-500/40 focus-visible:ring-red-500/50 text-red-400" : ""
                      }`}
                      placeholder="e.g. +233 24 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-red-400 font-semibold ml-0.5 animate-in fade-in duration-200">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="pt-3 flex justify-end w-full">
                  <Button
                    type="submit"
                    disabled={!isDirty || isUpdating}
                    className="w-full sm:w-auto px-8 h-11 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isUpdating ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        <span>Saving changes...</span>
                      </div>
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

      {/* Floating Dynamic Feedback Alerts */}
      {success && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-50 bg-emerald-600 border border-emerald-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 max-w-sm sm:max-w-md">
          <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
          <p className="font-bold text-xs sm:text-sm leading-tight">{success}</p>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-8 sm:right-8 z-50 bg-red-600 border border-red-500 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom sm:slide-in-from-right duration-300 max-w-sm sm:max-w-md">
          <AlertCircle className="h-5 w-5 text-white shrink-0" />
          <p className="font-bold text-xs sm:text-sm leading-tight">{error}</p>
        </div>
      )}

    
    </div>
       <MobileNavbar />
    </div>
 
  );
   
}