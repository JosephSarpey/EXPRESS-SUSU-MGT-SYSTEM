import { AddressesList } from '@/components/addresses/AddressesList'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'

export function AddressesPage() {
  const navigate = useNavigate()

  return (
    <div className="bg-[#070c1e] min-h-screen text-white font-sans w-full pb-16 md:pb-8 selection:bg-emerald-500/30">
      {/* Universal Top Header Row */}
      <header className="w-full max-w-6xl mx-auto px-4 md:px-8 pt-4 pb-4 flex items-center justify-between border-b border-white/5 relative gap-4">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="rounded-full border border-white/5 bg-[#0f1630] text-zinc-400 hover:text-emerald-400 hover:bg-[#141d3d] transition-all duration-300 shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:block shrink-0">
              <MapPin className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent truncate leading-normal">
                Address Hub
              </h1>
              <p className="text-xs text-zinc-400 hidden sm:block mt-0.5 truncate font-medium">
                Manage your saved locations for quick operations.
              </p>
            </div>
          </div>
        </div>

        {/* Small subtle branding node */}
        <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-black text-[10px] sm:text-xs uppercase tracking-wider hidden xs:block shadow-md shrink-0 whitespace-nowrap">
          My Profile
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="w-full max-w-6xl mx-auto px-4 md:px-8 mt-6">
        
        {/* Card housing wrapper built to format nicely on computer screens and phones */}
        <div className="border border-white/5 bg-[#0f1630] text-white shadow-2xl rounded-2xl overflow-hidden p-4 sm:p-6 md:p-8 transition-all duration-300 hover:border-emerald-500/20 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          
          {/* Responsive inner context summary */}
          <div className="mb-6 pb-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f1630]">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold tracking-tight text-white truncate">Saved Locations</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-1 leading-normal font-medium sm:hidden">
                Manage your saved addresses for collections and deliveries.
              </p>
            </div>
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border bg-emerald-500/10 text-emerald-400 border-emerald-500/10 shadow-2xs w-fit shrink-0 whitespace-nowrap">
              Secure Cloud Wallet Links 🔒
            </div>
          </div>

          {/* Core Component Payload Zone */}
          <div className="w-full text-white">
            <AddressesList />
          </div>

        </div>

      </main>
    </div>
  )
}
