import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Globe,
  ShieldAlert
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { adminService } from '@/services/api/admin.service'

export function SettingsPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      await adminService.getSettings()
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">System Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Configure global parameters and platform behavior.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              General Configuration
            </CardTitle>
            <CardDescription>Main platform settings and limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <div className="flex-1">
                <p className="font-bold text-sm">Platform Name</p>
                <p className="text-xs text-zinc-500">The public name of the platform.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input defaultValue="SUSU MGT. SYSTEM" className="h-10 w-full md:w-64" />
                <Button size="sm">Update</Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border">
              <div className="flex-1">
                <p className="font-bold text-sm">Max Monthly Deposit</p>
                <p className="text-xs text-zinc-500">Maximum amount a customer can deposit per month.</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Input type="number" defaultValue="5000" className="h-10 w-full md:w-64" />
                <Button size="sm">Update</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Security & Access
            </CardTitle>
            <CardDescription>Manage authentication and authorization policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-2xl border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="font-bold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-zinc-500">Require 2FA for all administrative accounts.</p>
                </div>
              </div>
              <div className="h-6 w-12 rounded-full bg-emerald-500 p-1 flex justify-end">
                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-sm">Auto-Approve Customers</p>
                  <p className="text-xs text-zinc-500">Automatically approve accounts after email verification.</p>
                </div>
              </div>
              <div className="h-6 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700 p-1 flex justify-start">
                <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-100 dark:border-red-900/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions and critical system controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-100">Maintenance Mode</h4>
                <p className="text-sm text-red-700 dark:text-red-400">Disable all user access to the platform for maintenance.</p>
              </div>
              <Button variant="destructive" className="rounded-full px-8">Enable Mode</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {success && (
        <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right duration-300">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}
    </div>
  )
}

function UserCheck({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  )
}
