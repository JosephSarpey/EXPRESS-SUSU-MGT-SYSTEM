import { Outlet } from 'react-router-dom'
import { DashboardLayout } from './dashboard-layout'

export function LayoutWrapper() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}
