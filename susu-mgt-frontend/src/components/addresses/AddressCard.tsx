import React from 'react'
import { Address } from '@/services/api/addresses.service'
import { MapPin, Edit, Trash2, Star } from 'lucide-react'

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
    <div className="border rounded-lg p-4 bg-white shadow-sm relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-900">
            {address.city || 'Address'}
          </h3>
          {address.isPrimary && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Star className="h-3 w-3 mr-1" />
              Primary
            </span>
          )}
        </div>
        
        <div className="flex gap-1">
          {!address.isPrimary && onSetPrimary && (
            <button
              onClick={() => onSetPrimary(address.id)}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Set as primary"
            >
              <Star className="h-4 w-4" />
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(address)}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(address)}
              disabled={isLoading}
              className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-2">
        {formatAddress(address)}
      </p>
      <p className="text-xs text-gray-400">
        Added {new Date(address.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}
