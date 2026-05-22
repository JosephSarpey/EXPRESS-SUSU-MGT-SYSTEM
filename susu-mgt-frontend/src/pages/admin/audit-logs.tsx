

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Search,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  History,
  InfoIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuditLogs } from "@/hooks/use-transactions";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export function AuditLogsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { data, isLoading } = useAuditLogs({ 
    page, 
    limit, 
    search: debouncedSearch || undefined 
  });

  const logs = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = data?.meta?.totalPages || 0;

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const renderDataChanges = (oldData: any, newData: any) => {
    const allKeys = Array.from(
      new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]),
    );

    if (allKeys.length === 0) return null;

    return (
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Data Changes</p>
        <div className="rounded-xl border border-white/5 bg-[#0b1026] overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#070c1e] border-b border-white/5">
              <tr>
                <th className="px-6 py-6 font-bold text-zinc-400">Field</th>
                <th className="px-4 py-3 font-bold text-zinc-400">Value / Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allKeys.map((key) => {
                const oldVal = oldData?.[key];
                const newVal = newData?.[key];

                // Skip if both are same
                if (JSON.stringify(oldVal) === JSON.stringify(newVal))
                  return null;

                return (
                  <tr
                    key={key}
                    className="hover:bg-[#131c3d]/40 transition-colors"
                  >
                    <td className=" px-6 py-6 font-medium text-zinc-300">
                      {key}
                    </td>
                    <td className=" px-6 py-6 text-blue-400 font-semibold break-all">
                      {newVal === null || newVal === undefined ? (
                        <span className="text-zinc-600 italic">none</span>
                      ) : (
                        String(newVal)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070c1e] text-white p-6 md:p-10 font-sans selection:bg-emerald-500/30 space-y-8 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-8">
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
              Audit Logs
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              System activity and administrative actions.
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-white/5 bg-[#0f1630] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] mt-4">
        <CardHeader className="p-4 md:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              <Input
                placeholder="Search logs..."
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
                  <th className="px-6 py-5 font-bold">Action</th>
                  <th className="px-6 py-5 font-bold">Resource</th>
                  <th className="px-6 py-5 font-bold">User</th>
                  <th className="px-6 py-5 font-bold">Timestamp</th>
                  <th className="px-6 py-5 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse bg-[#0f1630] ">
                      <td colSpan={5} className="px-6py-6">
                        <div className="h-10 bg-[#162045] rounded-xl" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr
                      key={log.id}
                      className="group  hover:bg-[#131c3d]/60 transition-all duration-300 ease-out"
                    >
                      <td className="px-6 py-7">
                        <div className="flex items-center gap-3.5">
                          <div className="h-9 w-9 rounded-xl bg-zinc-500/10 border border-white/5 text-zinc-400 flex items-center justify-center group-hover:scale-105 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-all duration-300">
                            <ShieldAlert className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-200 group-hover:text-white transition-colors">
                              {formatAction(log.action)}
                            </p>
                            <p className="text-xs text-zinc-500 font-medium max-w-xs truncate mt-0.5" title={log.details}>
                              {log.details || `ID: ${log.id.slice(0, 8).toUpperCase()}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5.5">
                        <Badge
                          variant="outline"
                          className="font-extrabold uppercase text-[9px] tracking-wider border-white/10 bg-white/5 text-zinc-300 px-2.5 py-0.5 rounded-full"
                        >
                          {log.entityType || "SYSTEM"}
                        </Badge>
                      </td>
                      <td className="px-6 py-5.5">
                        <p className="font-semibold text-zinc-200 text-xs">
                          {log.user?.fullName || log.userId || "System"}
                        </p>
                      </td>
                      <td className="px-6 py-5.5 text-xs text-zinc-400">
                        {log.createdAt
                          ? format(
                              new Date(log.createdAt),
                              "MMM dd, yyyy HH:mm:ss",
                            )
                          : "N/A"}
                      </td>
                      <td className="px-6 py-5.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                          onClick={() => setSelectedLog(log)}
                        >
                          <InfoIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center bg-[#0f1630]">
                      <History className="h-12 w-12 text-zinc-700 mx-auto mb-4 animate-pulse" />
                      <h3 className="text-base font-bold text-zinc-300">No audit logs found</h3>
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
                </span>{" "}
                (<span className="font-bold text-zinc-300">{total}</span> total)
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

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10 bg-[#0f1630] text-white rounded-2xl shadow-2xl shadow-black/80">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-[#0b1026] p-4.5 sticky top-0 z-10">
              <h3 className="font-bold text-base text-zinc-200 tracking-wide">Audit Log Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
                className="rounded-full h-8 w-8 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="sr-only">Close</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className="text-[10px] uppercase tracking-wider font-extrabold border-none px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                    {formatAction(selectedLog.action)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-4">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">
                    Resource Type
                  </p>
                  <p className="font-bold text-zinc-200">
                    {selectedLog.entityType || "SYSTEM"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">
                    Target ID
                  </p>
                  <p className="font-mono text-zinc-300 break-all bg-white/5 p-1 rounded text-[10px]">
                    {selectedLog.targetId || "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs border-t border-white/5 pt-4">
                <p className="font-semibold text-zinc-500 uppercase tracking-wider">Actor User</p>
                <p className="font-bold text-zinc-200">
                  {selectedLog.user?.fullName || selectedLog.actorId || "System"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs border-t border-white/5 pt-4">
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">
                    IP Address
                  </p>
                  <p className="font-bold text-zinc-200">
                    {selectedLog.ipAddress || "Unknown"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-zinc-500 uppercase tracking-wider">
                    Timestamp
                  </p>
                  <p className="font-bold text-zinc-200">
                    {selectedLog.createdAt
                      ? format(new Date(selectedLog.createdAt), "PPpp")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="space-y-1 text-xs border-t border-white/5 pt-4">
                <p className="font-semibold text-zinc-500 uppercase tracking-wider">
                  User Agent
                </p>
                <p className="font-medium text-[11px] text-zinc-400 break-all bg-[#0b1026] p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  {selectedLog.userAgent || "Unknown"}
                </p>
              </div>

              {selectedLog.action.includes("WITHDRAWAL") && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-1">
                    Financial Context
                  </p>
                  <p className="text-xs text-amber-200 leading-relaxed">
                    This action involves a fund withdrawal request or payout process.
                  </p>
                </div>
              )}

              {renderDataChanges(selectedLog.oldValues, selectedLog.newValues)}

              {!selectedLog.oldValues && !selectedLog.newValues && (
                <div className="p-4 rounded-xl border border-dashed border-white/10 text-center bg-[#0b1026]/50">
                  <p className="text-xs text-zinc-500 italic">
                    No detailed property changes recorded for this action.
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-white/5">
                <Button className="w-full rounded-xl border border-white/5 bg-[#141d3d] hover:bg-[#1c2957] text-zinc-300 hover:text-white transition-colors duration-300" variant="outline" onClick={() => setSelectedLog(null)}>
                  Close Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}