


















import { X, Receipt, Clock, CreditCard, Hash, Activity, FileText, User, Users, MapPin, Loader2 } from 'lucide-react'
import { Transaction } from '@/services/api/transactions.service'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { getTransactionStatusVariant } from '@/store'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePaystackPayment } from 'react-paystack'
import { paymentsService } from '@/services/api/payments.service'
import { transactionKeys } from '@/hooks/use-transactions'
import { useAuthStore } from '@/store'

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  onClose: () => void
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const [paystackConfig, setPaystackConfig] = useState<any>(null)
  
  const initializePayment = usePaystackPayment(paystackConfig || {})

  const handleRetry = async () => {
    try {
      setIsInitializing(true)
      const initData = await paymentsService.initializePaystack(Number(transaction!.amount))
      
      const config = {
        reference: initData.referenceId,
        email: user?.email || transaction?.user?.email,
        amount: Number(transaction!.amount) * 100,
        currency: initData.currency,
        accessCode: initData.accessCode, 
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_sample',
      }
      setPaystackConfig(config)
    } catch (err: any) {
      console.error('Error initializing retry payment:', err)
    } finally {
      setIsInitializing(false)
    }
  }

  const onSuccess = async (reference: any) => {
    try {
      await paymentsService.verifyPaystackTransaction(reference.reference)
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
      onClose()
    } catch (err: any) {
      console.error('Payment verification failed', err)
    }
  }

  if (!transaction) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'COLLECTION': return 'text-emerald-400'
      case 'WITHDRAWAL': return 'text-amber-400'
      case 'TRANSFER': return 'text-blue-400'
      default: return 'text-zinc-400'
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f1630] border border-white/5 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] text-white animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-white/5 bg-[#0b1026]">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("p-2.5 rounded-xl bg-[#141d3d] border border-white/5 shrink-0", getTypeColor(transaction.type))}>
              <Receipt className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">Transaction Details</h2>
              <p className="text-[11px] sm:text-xs text-zinc-500 font-mono tracking-wider truncate mt-0.5">#{transaction.id.toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 sm:space-y-6 scrollbar-thin">
          
          {/* Main Amount Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#141d3d] border border-white/5 flex flex-col items-center justify-center text-center shadow-2xs">
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
              {transaction.type}
            </p>
            <h3 className={cn("text-2xl sm:text-3xl font-black mb-3 tracking-tight", getTypeColor(transaction.type))}>
              GH₵ {Number(transaction.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <Badge 
              variant={getTransactionStatusVariant(transaction.status)} 
              className={cn(
                "text-[10px] uppercase tracking-wider font-extrabold px-3 py-0.5 rounded-md border shadow-2xs",
                transaction.status === 'SUCCESS' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",
                transaction.status === 'PENDING' && "bg-amber-500/10 text-amber-400 border-amber-500/10",
                transaction.status === 'APPROVED' && "bg-blue-500/10 text-blue-400 border-blue-500/10",
                transaction.status === 'FAILED' && "bg-red-500/10 text-red-400 border-red-500/10",
                transaction.status === 'REVERSED' && "bg-zinc-700 text-zinc-300 border-white/5"
              )}
            >
              {transaction.status}
            </Badge>
          </div>

          {/* User & Worker Info */}
          {(transaction.user || transaction.worker) && (
            <div className="space-y-3">
              {transaction.user && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 shadow-2xs">
                  <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-md shadow-blue-500/10">
                    {transaction.user.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Customer</span>
                    </div>
                    <p className="font-bold text-sm text-white truncate mt-1">{transaction.user.fullName}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5 font-medium">{transaction.user.email}</p>
                    
                    {transaction.user.addresses && transaction.user.addresses.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/5 space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                          Addresses
                        </span>
                        {transaction.user.addresses.map((addr, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-xs text-zinc-300 font-medium leading-relaxed">
                            <MapPin className="h-3.5 w-3.5 mt-0.5 text-blue-400 shrink-0" />
                            <span>
                              {[addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ')}
                              {addr.isPrimary && (
                                <span className="text-[8px] ml-1.5 px-1 py-0.2 bg-blue-500/10 text-blue-400 rounded font-black uppercase tracking-wider border border-blue-500/10 shadow-2xs">
                                  Primary
                                </span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {transaction.worker && (
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 shadow-2xs">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-md shadow-purple-500/10">
                    {transaction.worker.fullName?.charAt(0)?.toUpperCase() || 'W'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Worker</span>
                    </div>
                    <p className="font-bold text-sm text-white truncate mt-1">{transaction.worker.fullName}</p>
                    <p className="text-xs text-zinc-400 truncate mt-0.5 font-medium">{transaction.worker.email}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Grid (Added specific py-2 sm:py-0 padding) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 py-2 sm:py-0">
            <div className="p-4 rounded-2xl bg-[#141d3d] border border-white/5 flex flex-col justify-center min-w-0 shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Date & Time</span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-zinc-200 leading-tight">
                {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                <span className="block sm:inline text-zinc-400 font-medium sm:ml-1 mt-0.5 sm:mt-0">
                   · {format(new Date(transaction.createdAt), 'hh:mm a')}
                </span>
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141d3d] border border-white/5 flex flex-col justify-center min-w-0 shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                <CreditCard className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Method</span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-zinc-200 capitalize truncate">
                {transaction.paymentMethod.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141d3d] border border-white/5 flex flex-col justify-center min-w-0 shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                <Hash className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Reference ID</span>
              </div>
              <p className="font-mono text-[10px] sm:text-xs text-zinc-200 break-all select-all leading-normal">
                {transaction.referenceId || 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141d3d] border border-white/5 flex flex-col justify-center min-w-0 shadow-sm">
              <div className="flex items-center gap-1.5 text-zinc-500 mb-1.5">
                <Activity className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Gateway</span>
              </div>
              <p className="font-bold text-xs sm:text-sm text-zinc-200 truncate">
                {transaction.paymentGateway || 'N/A'}
              </p>
            </div>
          </div>

          {/* Descriptive Info */}
          {(transaction.description || transaction.remarks) && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              {transaction.description && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <FileText className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Description</span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 bg-[#141d3d] border border-white/5 p-3 rounded-xl leading-relaxed font-medium">
                    {transaction.description}
                  </p>
                </div>
              )}
              {transaction.remarks && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                    <FileText className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Admin Remarks</span>
                  </div>
                  <p className="text-xs sm:text-sm text-red-400 bg-red-500/5 p-3 rounded-xl border border-red-500/10 leading-relaxed font-medium">
                    {transaction.remarks}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {(transaction.status === 'PENDING' || transaction.status === 'FAILED') && transaction.type === 'DEPOSIT' && transaction.paymentMethod !== 'CASH' && (
            <div className="pt-4 border-t border-white/5">
              {!paystackConfig ? (
                <Button 
                  onClick={handleRetry} 
                  disabled={isInitializing}
                  className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all duration-200"
                >
                  {isInitializing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Initializing...</span>
                    </div>
                  ) : (
                    'Retry Payment'
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={() => {
                    // @ts-ignore
                    initializePayment(onSuccess, () => setPaystackConfig(null))
                  }}
                  className="w-full h-12 text-xs font-bold uppercase tracking-wider rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-200"
                >
                  Complete Secure Checkout
                </Button>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}