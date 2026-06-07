import logo from "../../assets/logo2.png";
import { Link } from 'react-router-dom'
import { Home , Send, Gift, MoreHorizontal,} from "lucide-react";
export const MobileNavbar = () => {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#0f1630] border-t border-white/5 grid grid-cols-5 items-center justify-center py-2 px-1 text-center shadow-2xl rounded-t-2xl z-50">
      <Link to="/customer/dashboard"  className="flex flex-col items-center justify-center text-emerald-400 font-bold">
           <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth",}) }>
          <div className="text-[10px] tracking-tight truncate w-full flex flex-col items-center">
            <Home className="h-5 w-5 mb-0.5 shrink-0" />
            Home
          </div>
       </button>
      </Link>
  
        <Link
          to="/customer/transactions"
          className="flex flex-col items-center justify-center text-zinc-500 hover:text-white transition-colors duration-200"
        >
          <Send className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            Transactions
          </span>
        </Link>

        <div className="flex flex-col items-center justify-center">
          <div className="rounded-full shadow-lg border-white hover:scale-105 transition-transform duration-250 cursor-pointer flex items-center justify-center p-0.5 shrink-0">
            <img className="h-12 w-12 sm:h-14 sm:w-14" src={logo} alt="Logo" />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:text-white transition-colors duration-200">
          <Gift className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            Offers
          </span>
        </div>
        <div className="flex flex-col items-center justify-center text-zinc-500 cursor-pointer hover:text-white transition-colors duration-200">
          <MoreHorizontal className="h-5 w-5 mb-0.5 shrink-0" />
          <span className="text-[10px] tracking-tight truncate w-full">
            More
          </span>
        </div>
      </div>
  )
}
