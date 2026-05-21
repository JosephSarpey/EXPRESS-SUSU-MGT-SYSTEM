




import { AddressesList } from '@/components/addresses/AddressesList'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'

export function AddressesPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-[#003366] min-h-screen text-white font-sans w-full pb-16 md:pb-8">
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full text-white hover:bg-white/10 hover:text-[#FFCC00] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl hidden sm:block">
              <MapPin className="h-5 w-5 text-[#FFCC00]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                Address Hub
              </h1>
              <p className="text-xs text-blue-200 hidden sm:block mt-0.5">
                Manage your saved locations for quick operations.
              </p>
            </div>
          </div>
        </div>

        {/* Small subtle branding node */}
        <div className="bg-[#FFCC00] text-[#003366] px-3 py-1 rounded-lg font-black text-xs uppercase tracking-wider hidden xs:block">
          MoMo Profile
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Card housing wrapper built to format nicely on computer screens and phones */}
        <div className="bg-white text-[#003366] border-none shadow-xl rounded-2xl overflow-hidden p-4 sm:p-6 md:p-8">
          
          {/* Responsive inner context summary */}
          <div className="mb-6 pb-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black tracking-tight text-[#002244]">Saved Locations</h2>
              <p className="text-xs text-zinc-400 mt-0.5 sm:hidden">
                Manage your saved addresses for collections and deliveries.
              </p>
            </div>
            <div className="text-[11px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-lg w-fit">
              Secure Cloud Wallet Links 🔒
            </div>
          </div>

          {/* Core Component Payload Zone */}
          <div className="w-full">
            <AddressesList />
          </div>

        </div>

      </main>
    </div>
  )
}
