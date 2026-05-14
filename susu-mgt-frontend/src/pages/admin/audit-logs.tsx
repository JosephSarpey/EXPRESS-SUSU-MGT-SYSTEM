import { useState } from "react";
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

export function AuditLogsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data, isLoading } = useAuditLogs({ page, limit });

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
        <p className="text-sm font-semibold text-zinc-500">Data Changes</p>
        <div className="rounded-xl border dark:border-zinc-800 overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b dark:border-zinc-800">
              <tr>
                <th className="px-3 py-2 font-bold text-zinc-500">Field</th>
                <th className="px-3 py-2 font-bold text-zinc-500">
                  Value / Change
                </th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800">
              {allKeys.map((key) => {
                const oldVal = oldData?.[key];
                const newVal = newData?.[key];

                // Skip if both are same
                if (JSON.stringify(oldVal) === JSON.stringify(newVal))
                  return null;

                return (
                  <tr
                    key={key}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                      {key}
                    </td>
                    <td className="px-3 py-2 text-blue-600 dark:text-blue-400 font-medium">
                      {newVal === null || newVal === undefined ? (
                        <span className="text-zinc-300 italic">none</span>
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
    <div className="space-y-8 pb-12">
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
              Audit Logs
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              System activity and administrative actions.
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6 border-b dark:border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search logs..."
                className="pl-10 h-10 rounded-full"
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
                  <th className="px-6 py-4 font-bold">Action</th>
                  <th className="px-6 py-4 font-bold">Resource</th>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                  <th className="px-6 py-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800">
                {isLoading ? (
                  [1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                      </td>
                    </tr>
                  ))
                ) : logs.length > 0 ? (
                  logs.map((log: any) => (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <ShieldAlert className="h-4 w-4 text-zinc-500" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900 dark:text-zinc-100">
                              {formatAction(log.action)}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {log.details || `ID: ${log.id.slice(0, 8)}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="font-bold uppercase text-[10px]"
                        >
                          {log.entityType || "SYSTEM"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {log.user?.fullName || log.userId || "System"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">
                        {log.createdAt
                          ? format(
                              new Date(log.createdAt),
                              "MMM dd, yyyy HH:mm:ss",
                            )
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <InfoIcon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-24 text-center">
                      <History className="h-12 w-12 text-zinc-200 dark:text-zinc-800 mx-auto mb-4" />
                      <p className="text-zinc-500 dark:text-zinc-400">
                        No audit logs found.
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

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between border-b dark:border-zinc-800 p-4 sticky top-0 bg-white dark:bg-zinc-950 z-10">
              <h3 className="font-bold text-lg">Audit Log Details</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
                className="rounded-full h-8 w-8"
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
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-zinc-500">Action</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-bold">
                    {formatAction(selectedLog.action)}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Resource (Entity Type)
                  </p>
                  <p className="font-medium">
                    {selectedLog.entityType || "SYSTEM"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Target ID
                  </p>
                  <p className="font-medium break-all">
                    {selectedLog.targetId || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-500">User</p>
                <p className="font-medium">
                  {selectedLog.user?.fullName ||
                    selectedLog.actorId ||
                    "System"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    IP Address
                  </p>
                  <p className="font-medium">
                    {selectedLog.ipAddress || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-500">
                    Timestamp
                  </p>
                  <p className="font-medium">
                    {selectedLog.createdAt
                      ? format(new Date(selectedLog.createdAt), "PPpp")
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-500">
                  User Agent
                </p>
                <p className="font-medium text-xs break-all bg-zinc-50 dark:bg-zinc-900 p-2 rounded">
                  {selectedLog.userAgent || "Unknown"}
                </p>
              </div>

              {selectedLog.action.includes("WITHDRAWAL") && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase mb-1">
                    Financial Context
                  </p>
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    This action involves a fund withdrawal request or payout.
                  </p>
                </div>
              )}

              {renderDataChanges(selectedLog.oldValues, selectedLog.newValues)}

              {!selectedLog.oldValues && !selectedLog.newValues && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-dashed dark:border-zinc-800 text-center">
                  <p className="text-xs text-zinc-500 italic">
                    No detailed property changes recorded for this action.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
