
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
    <div className="space-y-6 w-full min-w-0">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-2.5 text-red-400 animate-in fade-in duration-200 w-full">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold leading-relaxed break-words">{error}</p>
          </div>
          <button 
            onClick={clearError} 
            className="text-zinc-500 hover:text-red-400 transition-colors text-base font-black leading-none outline-none pl-1"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <h2 className="text-sm sm:text-base font-bold text-zinc-400 uppercase tracking-widest ml-0.5">
          Saved Addresses
        </h2>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            disabled={isLoading}
            className="w-full sm:w-auto h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all active:scale-[0.98] shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
            Add New Address
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border border-white/5 bg-[#141d3d] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 w-full">
          <CardContent className="p-4 sm:p-6 bg-[#141d3d]">
            <h3 className="text-sm sm:text-base font-bold tracking-tight text-white flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl shrink-0">
                <MapPin className="h-4 w-4 stroke-[2.5]" />
              </div>
              <span className="truncate">{editingAddress ? 'Edit Address Parameters' : 'Add New Location Node'}</span>
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
        <div className="flex justify-center items-center py-12 w-full">
          <Loader2 className="h-7 w-7 animate-spin text-blue-400 shrink-0" />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div className="text-center py-12 sm:py-16 px-4 bg-[#0b1026]/40 rounded-2xl border border-dashed border-white/5 flex flex-col items-center justify-center w-full animate-in fade-in duration-300">
          <div className="w-14 h-14 bg-[#141d3d] border border-white/5 rounded-2xl flex items-center justify-center mb-4 text-blue-400 shadow-md">
            <MapPin className="h-6 w-6 stroke-[2]" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">No addresses found</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1.5 leading-relaxed font-medium">
            You haven't saved any addresses yet. Add an address layout configuration to speed up future ledger operations.
          </p>
          <Button 
            onClick={() => setShowForm(true)}
            className="mt-6 h-11 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4 mr-1.5 stroke-[3]" />
            Add your first address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
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