import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Wallet, BarChart3, Lock } from 'lucide-react'

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 dark:bg-zinc-950/80 dark:border-zinc-800">
        <Link className="flex items-center justify-center gap-2" to="/">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">EXPRESS CAPITAL MGT.</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-blue-600 transition-colors dark:text-zinc-400 dark:hover:text-blue-400" to="/login">
            Sign In
          </Link>
          <Link
            className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            to="/register"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-40 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none" />
          <div className="container px-4 md:px-6 relative mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-400">
                🚀 Modernizing Susu Operations
              </div>
              <div className="space-y-4 max-w-3xl mx-auto">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-zinc-900 dark:text-zinc-100">
                  Secure Your Financial Future with <span className="text-blue-600">Smart Susu</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-zinc-500 md:text-xl dark:text-zinc-400 leading-relaxed">
                  The all-in-one digital platform for managing traditional Susu collections. Secure, transparent, and built for everyone.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-bold text-white shadow-xl shadow-blue-500/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 group"
                  to="/register"
                >
                  Start Saving Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-base font-bold text-zinc-900 transition-all hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                  to="/login"
                >
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-white dark:bg-zinc-900">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center group p-6 rounded-3xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div className="p-4 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <Wallet className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold dark:text-zinc-100">Digital Deposits</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Easy and secure cash deposits through our verified field workers or online payments.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center group p-6 rounded-3xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Lock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold dark:text-zinc-100">Secure Tracking</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Real-time monitoring of your savings with instant notifications and transparent history.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center group p-6 rounded-3xl transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                <div className="p-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold dark:text-zinc-100">Smart Insights</h3>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Detailed reports and analytics to help you understand your financial progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-24 bg-blue-600">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Join the Revolution?
              </h2>
              <p className="mx-auto max-w-[600px] text-blue-100 md:text-xl">
                Join thousands of users who trust our platform for their traditional savings needs.
              </p>
              <Link
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-10 text-base font-bold text-blue-600 shadow-xl transition-all hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                to="/register"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t dark:border-zinc-800 dark:bg-zinc-950">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <span className="font-bold text-zinc-900 dark:text-zinc-100">SUSU MGT.</span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            © 2026 SUSU Management System. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link className="text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400" to="#">
              Terms
            </Link>
            <Link className="text-sm text-zinc-500 hover:text-blue-600 dark:text-zinc-400" to="#">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
