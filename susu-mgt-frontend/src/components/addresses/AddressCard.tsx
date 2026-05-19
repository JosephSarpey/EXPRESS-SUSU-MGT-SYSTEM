import React from 'react'
import { Address } from '@/services/api/addresses.service'
import { MapPin, Edit, Trash2, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface AddressCardProps {
  address: Address
  onEdit?: (address: Address) => void
  onDelete?: (address: Address) => void
  onSetPrimary?: (addressId: string) => void
  isLoading?: boolean
}

export const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetPrimary,
  isLoading = false
}) => {
  const formatAddress = (addr: Address) => {
    const parts = [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean)
    return parts.join(', ') || 'No address details'
  }

  return (
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-zinc-900/50 group border-zinc-200 dark:border-zinc-800">
      <div className={`absolute top-0 left-0 w-1.5 h-full ${address.isPrimary ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 pl-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <MapPin className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {address.city || 'Address'}
              </h3>
              {address.isPrimary && (
                <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-100 border-none text-[10px] px-1.5 py-0">
                  <Star className="h-3 w-3 mr-1 inline" />
                  Primary
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!address.isPrimary && onSetPrimary && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSetPrimary(address.id)}
                disabled={isLoading}
                className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Set as primary"
              >
                <Star className="h-4 w-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(address)}
                disabled={isLoading}
                className="h-8 w-8 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(address)}
                disabled={isLoading}
                className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="pl-3 mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
            {formatAddress(address)}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Added {new Date(address.createdAt).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
