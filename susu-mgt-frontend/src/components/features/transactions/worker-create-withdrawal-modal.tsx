import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Wallet,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkerCreateWithdrawal } from "@/hooks/use-transactions";
import { usersService } from "@/services/api/users.service";
import { useDebounce } from "@/hooks/use-debounce";

interface WorkerCreateWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WorkerCreateWithdrawalModal({
  isOpen,
  onClose,
}: WorkerCreateWithdrawalModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [description, setDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);
  const createMutation = useWorkerCreateWithdrawal();

  useEffect(() => {
    if (!isOpen) {
      // Reset state on close
      setSearchQuery("");
      setSearchResults([]);
      setAmount("");
      setMethod("CASH");
      setDescription("");
      setFoundUser(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearch) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearching(true);
        setError(null);
        const res = await usersService.getAllUsers({
          search: debouncedSearch,
          role: "CUSTOMER",
          limit: 10,
        });
        setSearchResults(res.data);
      } catch (err: any) {
        console.error("Error fetching customers:", err);
        setError("Failed to search customers.");
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser || !amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return;

    try {
      setError(null);
      await createMutation.mutateAsync({
        userId: foundUser.id,
        amount: Number(amount),
        method: method as any,
        description: description || "Worker created withdrawal request",
      });
      onClose();
    } catch (err: any) {
      console.error("Error creating withdrawal:", err);
      setError(
        err.response?.data?.message ||
          "Failed to create withdrawal request. Ensure the user has sufficient balance."
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f1630] border border-white/5 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/5 bg-[#0b1026]">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Wallet className="h-4 w-4" />
            </div>
            Create Withdrawal Request
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar space-y-6">
          {/* Step 1: Find User */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              1. Select Customer
            </h3>
            
            {!foundUser ? (
              <div className="space-y-2">
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-blue-500 transition-colors duration-200" />
                  <Input
                    placeholder="Search customer by name, email, or ID..."
                    className="pl-11 h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/50 transition-all duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isSearching}
                  />
                  {isSearching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5 bg-[#141d3d] shadow-2xl max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setFoundUser(user);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-[#1c2957]/80 flex items-center justify-between transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shadow-sm">
                            {user.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-blue-400 transition-colors duration-200 text-sm">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="p-4 text-center text-xs font-semibold text-zinc-500 bg-[#0b1026]/40 rounded-xl border border-dashed border-white/5">
                    No customers found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-500/5 flex items-center justify-between border border-blue-500/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {foundUser.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white">{foundUser.fullName}</p>
                    <p className="text-xs text-zinc-400">{foundUser.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFoundUser(null)}
                  className="text-xs font-bold text-blue-400 hover:bg-white/5 h-8"
                >
                  Change
                </Button>
              </div>
            )}
          </div>

          {/* Step 2: Request Details */}
          <div className={`space-y-4 transition-all duration-300 ${!foundUser ? 'opacity-30 pointer-events-none' : ''}`}>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
              2. Withdrawal Details
            </h3>

            <form id="create-withdrawal-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 ml-0.5">
                  Amount (GH₵)
                </label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-500 transition-colors group-hover:text-emerald-400">GH₵</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-14 h-12 text-lg font-bold tracking-tight bg-[#141d3d] border border-white/5 text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                    step="0.01"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 ml-0.5">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full h-12 px-3 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white focus-visible:ring-1 focus-visible:ring-emerald-500/50 focus-visible:outline-none"
                  required
                >
                  <option value="CASH">Cash</option>
                  <option value="MTN_MOMO">MTN Mobile Money</option>
                  <option value="TELECEL_CASH">Telecel Cash</option>
                  <option value="AIRTELTIGO_MONEY">AirtelTigo Money</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 ml-0.5">
                  Description / Remarks (Optional)
                </label>
                <Input
                  placeholder="e.g., Requested by customer via call"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-11 rounded-xl bg-[#141d3d] border border-white/5 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-emerald-500/50"
                />
              </div>
            </form>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#0b1026] flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="rounded-xl h-11 px-5 text-zinc-300 hover:text-white bg-[#141d3d] hover:bg-[#1c2957] font-bold transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-withdrawal-form"
            disabled={!foundUser || createMutation.isPending}
            className="rounded-xl h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-lg disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
