export function UnauthorizedPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#070c1e] text-white p-6 font-sans animate-in fade-in duration-500 selection:bg-emerald-500/30">
      <div className="text-center relative">
        <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-zinc-600 bg-clip-text text-transparent drop-shadow-xl">
          401
        </h1>
        <div className="w-12 h-1 bg-red-500 rounded-full mx-auto my-4 shadow-sm shadow-red-500/50" />
        <p className="text-sm font-medium text-zinc-400 tracking-tight">
          Unauthorized - Access Denied
        </p>
      </div>
    </div>
  )
}