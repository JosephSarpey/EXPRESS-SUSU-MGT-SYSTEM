import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthGuard } from './components/features/auth/auth-guard'
import { RoleGuard } from './components/features/auth/role-guard'
import { LayoutWrapper } from './components/layout/layout-wrapper'

// Loading fallback component with emerald branding
const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-800 to-gray-800">
    <div className="flex flex-col items-center gap-4">
      {/* Outer rotating ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 border-r-emerald-400 rounded-full animate-spin"></div>
        {/* Inner rotating ring (counter-clockwise) */}
        <div className="absolute inset-2 border-4 border-transparent border-b-emerald-300 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-emerald-600 font-medium text-sm animate-pulse">Loading A Unique Experience</p>
    </div>
  </div>
)

// Public Pages - Lazy loaded with proper exports handling
const HomePage = lazy(() => import('./pages/landingPage/HomePage'))
const AuthPage = lazy(() => import('./pages/auth/AuthPage').then(m => ({ default: m.AuthPage })))
const VerifyEmailPage = lazy(() => import('./pages/auth/verify-email').then(m => ({ default: m.VerifyEmailPage })))
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('./pages/auth/reset-password').then(m => ({ default: m.ResetPasswordPage })))
const NotFoundPage = lazy(() => import('./pages/not-found').then(m => ({ default: m.NotFoundPage })))
const UnauthorizedPage = lazy(() => import('./pages/unauthorized').then(m => ({ default: m.UnauthorizedPage })))

// Customer Pages - Lazy loaded
const CustomerDashboard = lazy(() => import('./pages/customer/dashboard').then(m => ({ default: m.CustomerDashboard })))
const DepositPage = lazy(() => import('./pages/customer/deposit').then(m => ({ default: m.DepositPage })))
const WithdrawPage = lazy(() => import('./pages/customer/withdraw').then(m => ({ default: m.WithdrawPage })))
const TransactionsPage = lazy(() => import('./pages/customer/transactions').then(m => ({ default: m.TransactionsPage })))
const AddressesPage = lazy(() => import('./pages/customer/addresses').then(m => ({ default: m.AddressesPage })))

// Shared Pages - Lazy loaded
const ProfilePage = lazy(() => import('./components/features/profile/profile-page').then(m => ({ default: m.ProfilePage })))

// Worker Pages - Lazy loaded
const WorkerDashboard = lazy(() => import('./pages/worker/dashboard').then(m => ({ default: m.WorkerDashboard })))
const ClockInOutPage = lazy(() => import('./pages/worker/clock-in-out').then(m => ({ default: m.ClockInOutPage })))
const CashDepositPage = lazy(() => import('./pages/worker/cash-deposit').then(m => ({ default: m.CashDepositPage })))
const CollectionHistoryPage = lazy(() => import('./pages/worker/collection-history').then(m => ({ default: m.CollectionHistoryPage })))
const WithdrawalRequestPage = lazy(() => import('./pages/worker/withdrawal-requests').then(m => ({ default: m.WithdrawalRequestPage })))

// Admin Pages - Lazy loaded
const AdminDashboard = lazy(() => import('./pages/admin/dashboard').then(m => ({ default: m.AdminDashboard })))
const UserManagementPage = lazy(() => import('./pages/admin/user-management').then(m => ({ default: m.UserManagementPage })))
const UserApprovalPage = lazy(() => import('./pages/admin/user-approval').then(m => ({ default: m.UserApprovalPage })))
const TransactionMonitoringPage = lazy(() => import('./pages/admin/transaction-monitoring').then(m => ({ default: m.TransactionMonitoringPage })))
const WorkerManagementPage = lazy(() => import('./pages/admin/worker-management').then(m => ({ default: m.WorkerManagementPage })))
const WalletsPage = lazy(() => import('./pages/admin/wallets').then(m => ({ default: m.WalletsPage })))
const WalletDetailsPage = lazy(() => import('./pages/admin/wallet-details').then(m => ({ default: m.WalletDetailsPage })))
const ReportsPage = lazy(() => import('./pages/admin/reports').then(m => ({ default: m.ReportsPage })))
const SettingsPage = lazy(() => import('./pages/admin/settings').then(m => ({ default: m.SettingsPage })))
const WithdrawalRequestsPage = lazy(() => import('./pages/admin/withdrawal-requests').then(m => ({ default: m.WithdrawalRequestsPage })))
const AuditLogsPage = lazy(() => import('./pages/admin/audit-logs').then(m => ({ default: m.AuditLogsPage })))

// Notifications - Lazy loaded
const NotificationsPage = lazy(() => import('./components/features/notifications/notifications-page').then(m => ({ default: m.NotificationsPage })))

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
          
          {/* Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<LayoutWrapper />}>
              {/* Customer Routes */}
              <Route element={<RoleGuard roles={['CUSTOMER']} />}>
                <Route path="/customer/dashboard" element={<CustomerDashboard />} />
                <Route path="/customer/deposit" element={<DepositPage />} />
                <Route path="/customer/withdraw" element={<WithdrawPage />} />
                <Route path="/customer/transactions" element={<TransactionsPage />} />
                <Route path="/customer/profile" element={<ProfilePage />} />
                <Route path="/customer/addresses" element={<AddressesPage />} />
                <Route path="/customer/notifications" element={<NotificationsPage />} />
              </Route>
              
              {/* Worker Routes */}
              <Route element={<RoleGuard roles={['WORKER']} />}>
                <Route path="/worker/dashboard" element={<WorkerDashboard />} />
                <Route path="/worker/clock-in-out" element={<ClockInOutPage />} />
                <Route path="/worker/cash-deposit" element={<CashDepositPage />} />
                <Route path="/worker/collection-history" element={<CollectionHistoryPage />} />
                <Route path="/worker/withdrawal-requests" element={<WithdrawalRequestPage />} />
                <Route path="/worker/profile" element={<ProfilePage />} />
                <Route path="/worker/notifications" element={<NotificationsPage />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<RoleGuard roles={['ADMIN']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/user-management" element={<UserManagementPage />} />
                <Route path="/admin/user-approval" element={<UserApprovalPage />} />
                <Route path="/admin/transaction-monitoring" element={<TransactionMonitoringPage />} />
                <Route path="/admin/worker-management" element={<WorkerManagementPage />} />
                <Route path="/admin/wallet-management" element={<WalletsPage />} />
                <Route path="/admin/wallets/:userId" element={<WalletDetailsPage />} />
                <Route path="/admin/reports" element={<ReportsPage />} />
                <Route path="/admin/withdrawal-requests" element={<WithdrawalRequestsPage />} />
                <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                </Route>
            </Route>
          </Route>
          
          {/* Error Routes */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
