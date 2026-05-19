import React, { useState } from 'react'
import { useAddresses } from '@/hooks/useAddresses'
import { Address } from '@/services/api/addresses.service'
import { AddressCard } from './AddressCard'
import { AddressForm } from './AddressForm'
import { Plus, MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Saved Addresses</h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-blue-100 dark:border-blue-900/30 shadow-blue-500/5 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <AddressForm
              address={editingAddress || undefined}
              onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
              onCancel={handleCancelForm}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      )}

      {isLoading && addresses.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-16 px-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <MapPin className="h-8 w-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">No addresses found</h3>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
            You haven't saved any addresses yet. Add an address to make your future transactions faster.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
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
