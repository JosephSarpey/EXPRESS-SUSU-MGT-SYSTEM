import { useEffect, useState } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import { authService } from "@/services/api/auth.service";

interface AuthGuardProps {
  children?: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, setAuth, logout } = useAuthStore();
  const location = useLocation();

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      // No persisted session — resolve immediately, guard will redirect to /login.
      setIsInitialized(true);
      return;
    }

    const initSession = async () => {
      try {
        // Try getMe with the existing sb-access-token cookie.
        // On a fresh page load this succeeds as long as the cookie hasn't expired.
        const user = await authService.getMe();
        setAuth(user);
      } catch {
        // Access token expired — attempt a silent refresh using the
        // httpOnly sb-refresh-token cookie (never readable by JS).
        try {
          await authService.refresh();
          const user = await authService.getMe();
          setAuth(user);
        } catch {
          // Refresh token is also expired/invalid — the session is truly over.
          await logout();
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-800 to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 border-r-emerald-400 rounded-full animate-spin" />
            <div
              className="absolute inset-2 border-4 border-transparent border-b-emerald-300 rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-emerald-600 font-medium text-sm animate-pulse">
            Loading A Unique Experience
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
