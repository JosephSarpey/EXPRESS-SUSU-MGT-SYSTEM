import { Routes, Route } from 'react-router-dom'
import { AuthGuard } from './components/features/auth/auth-guard'
import { RoleGuard } from './components/features/auth/role-guard'
import { LayoutWrapper } from './components/layout/layout-wrapper'

// Pages
import { LandingPage } from './pages/landing'
import { LoginPage } from './pages/auth/login'
import { RegisterPage } from './pages/auth/register'
import { VerifyEmailPage } from './pages/auth/verify-email'
import { ForgotPasswordPage } from './pages/auth/forgot-password'
import { ResetPasswordPage } from './pages/auth/reset-password'
import { NotFoundPage } from './pages/not-found'
import { UnauthorizedPage } from './pages/unauthorized'

// Customer Pages
import { CustomerDashboard } from './pages/customer/dashboard'
import { DepositPage } from './pages/customer/deposit'
import { WithdrawPage } from './pages/customer/withdraw'
import { TransactionsPage } from './pages/customer/transactions'
import { ProfilePage } from './pages/customer/profile'
import { AddressesPage } from './pages/customer/addresses'

// Worker Pages
import { WorkerDashboard } from './pages/worker/dashboard'
import { ClockInOutPage } from './pages/worker/clock-in-out'
import { CashDepositPage } from './pages/worker/cash-deposit'
import { CollectionHistoryPage } from './pages/worker/collection-history'

// Admin Pages
import { AdminDashboard } from './pages/admin/dashboard'
import { UserManagementPage } from './pages/admin/user-management'
import { UserApprovalPage } from './pages/admin/user-approval'
import { TransactionMonitoringPage } from './pages/admin/transaction-monitoring'
import { WorkerManagementPage } from './pages/admin/worker-management'
import { WalletsPage } from './pages/admin/wallets'
import { WalletDetailsPage } from './pages/admin/wallet-details'
import { ReportsPage } from './pages/admin/reports'
import { SettingsPage } from './pages/admin/settings'
import { WithdrawalRequestsPage } from './pages/admin/withdrawal-requests'
import { AuditLogsPage } from './pages/admin/audit-logs'

// Notifications
import { NotificationsPage } from './components/features/notifications/notifications-page'

function App() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
              <Route path="/admin/notifications" element={<NotificationsPage />} />
            </Route>
          </Route>
        </Route>
        
        {/* Error Routes */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
