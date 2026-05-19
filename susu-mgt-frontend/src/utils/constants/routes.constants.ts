export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Customer routes
  CUSTOMER_DASHBOARD: "/customer/dashboard",
  CUSTOMER_DEPOSIT: "/customer/deposit",
  CUSTOMER_WITHDRAW: "/customer/withdraw",
  CUSTOMER_TRANSACTIONS: "/customer/transactions",
  CUSTOMER_PROFILE: "/customer/profile",

  // Worker routes
  WORKER_DASHBOARD: "/worker/dashboard",
  WORKER_CLOCK_IN_OUT: "/worker/clock-in-out",
  WORKER_CASH_DEPOSIT: "/worker/cash-deposit",
  WORKER_COLLECTION_HISTORY: "/worker/collection-history",
  WORKER_WITHDRAWAL_REQUEST: "/worker/withdrawal-requests",
  WORKER_PROFILE: "/worker/profile",

  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USER_MANAGEMENT: "/admin/user-management",
  ADMIN_USER_APPROVAL: "/admin/user-approval",
  ADMIN_TRANSACTION_MONITORING: "/admin/transaction-monitoring",
  ADMIN_WORKER_MANAGEMENT: "/admin/worker-management",
  ADMIN_WALLET_MANAGEMENT: "/admin/wallet-management",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_PROFILE: "/admin/profile",

  // Error routes
  NOT_FOUND: "/404",
  UNAUTHORIZED: "/unauthorized",

  // Default redirect by role
  DEFAULT_REDIRECT: {
    ADMIN: "/admin/dashboard",
    CUSTOMER: "/customer/dashboard",
    WORKER: "/worker/dashboard",
  },
} as const;
