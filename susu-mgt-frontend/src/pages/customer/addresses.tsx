import { AddressesList } from '@/components/addresses/AddressesList'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function AddressesPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">Address Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage your saved addresses for collections and deliveries.
          </p>
        </div>
      </div>
      
      <div className="w-full">
        <AddressesList />
      </div>
    </div>
  )
}
