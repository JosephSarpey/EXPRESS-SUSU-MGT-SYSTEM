import { X, Receipt, Clock, CreditCard, Hash, Activity, FileText } from 'lucide-react'
import { Transaction } from '@/services/api/transactions.service'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { getTransactionStatusVariant } from '@/store'

interface TransactionDetailsModalProps {
  transaction: Transaction | null
  onClose: () => void
}

export function TransactionDetailsModal({ transaction, onClose }: TransactionDetailsModalProps) {
  if (!transaction) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
      case 'COLLECTION': return 'text-emerald-600'
      case 'WITHDRAWAL': return 'text-amber-600'
      case 'TRANSFER': return 'text-blue-600'
      default: return 'text-zinc-600'
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 ${getTypeColor(transaction.type)}`}>
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Transaction Details</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {transaction.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Main Amount Card */}
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-2">
              {transaction.type}
            </p>
            <h3 className={`text-4xl font-extrabold mb-3 ${getTypeColor(transaction.type)}`}>
              GH₵ {Number(transaction.amount || 0).toFixed(2)}
            </h3>
            <Badge variant={getTransactionStatusVariant(transaction.status)} className="px-3 py-1">
              {transaction.status}
            </Badge>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Date & Time</span>
              </div>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {format(new Date(transaction.createdAt), 'MMM dd, yyyy - hh:mm a')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                <CreditCard className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Method</span>
              </div>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {transaction.paymentMethod.replace(/_/g, ' ')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                <Hash className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Reference ID</span>
              </div>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100 break-all">
                {transaction.referenceId || 'N/A'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 space-y-1">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Gateway</span>
              </div>
              <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                {transaction.paymentGateway || 'N/A'}
              </p>
            </div>
          </div>

          {/* Descriptive Info */}
          {(transaction.description || transaction.remarks) && (
            <div className="space-y-4 pt-4 border-t dark:border-zinc-800">
              {transaction.description && (
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Description</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl">
                    {transaction.description}
                  </p>
                </div>
              )}
              {transaction.remarks && (
                <div>
                  <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Admin Remarks</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                    {transaction.remarks}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
