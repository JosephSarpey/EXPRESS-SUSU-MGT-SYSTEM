import React, { useState } from 'react'
import { useAddresses } from '@/hooks/useAddresses'
import { Address } from '@/services/api/addresses.service'
import { AddressCard } from './AddressCard'
import { AddressForm } from './AddressForm'
import { Plus } from 'lucide-react'

export const AddressesList: React.FC = () => {
  const {
    addresses,
    isLoading,
    error,
    createAddress,
    updateAddress,
    setPrimaryAddress,
    deleteAddress,
    clearError
  } = useAddresses()

  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleCreateAddress = async (data: any) => {
    try {
      await createAddress(data)
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create address:', error)
    }
  }

  const handleUpdateAddress = async (data: any) => {
    if (!editingAddress) return
    
    try {
      await updateAddress(editingAddress.id, data)
      setEditingAddress(null)
    } catch (error) {
      console.error('Failed to update address:', error)
    }
  }

  const handleSetPrimary = async (addressId: string) => {
    try {
      await setPrimaryAddress(addressId)
    } catch (error) {
      console.error('Failed to set primary address:', error)
    }
  }

  const handleDeleteAddress = async (address: Address) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return
    }

    try {
      await deleteAddress(address.id)
    } catch (error) {
      console.error('Failed to delete address:', error)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingAddress(null)
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-4">
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Add Address
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <AddressForm
            address={editingAddress || undefined}
            onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
            onCancel={handleCancelForm}
            isLoading={isLoading}
          />
        </div>
      )}

      {isLoading && addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No addresses found</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Add your first address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={handleDeleteAddress}
              onSetPrimary={handleSetPrimary}
              isLoading={isLoading}
            />
          ))}
        </div>
      )}
    </div>
  )
}
