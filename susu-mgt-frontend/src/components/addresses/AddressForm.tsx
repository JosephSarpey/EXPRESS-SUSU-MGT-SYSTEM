import React, { useState, useEffect } from 'react'
import { Address, CreateAddressDto, UpdateAddressDto } from '@/services/api/addresses.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface AddressFormProps {
  address?: Address
  onSubmit: (data: CreateAddressDto | UpdateAddressDto) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const AddressForm: React.FC<AddressFormProps> = ({
  address,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isPrimary: false
  })

  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.zipCode || '',
        isPrimary: address.isPrimary
      })
    }
  }, [address])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate at least one field is filled
    const hasData = Object.values(formData).some(value => 
      typeof value === 'string' ? value.trim() !== '' : value
    )
    
    if (!hasData) {
      alert('Please fill in at least one address field')
      return
    }
    
    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="street" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Street Address
          </label>
          <Input
            type="text"
            id="street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            placeholder="123 Main Street"
            className="w-full bg-white dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="city" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            City
          </label>
          <Input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Accra"
            className="w-full bg-white dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="state" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            State/Region
          </label>
          <Input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Greater Accra"
            className="w-full bg-white dark:bg-zinc-950"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="zipCode" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Postal/Zip Code
          </label>
          <Input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="00233"
            className="w-full bg-white dark:bg-zinc-950"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <div className="relative flex items-start">
          <div className="flex h-6 items-center">
            <input
              type="checkbox"
              id="isPrimary"
              name="isPrimary"
              checked={formData.isPrimary}
              onChange={handleChange}
              className="h-5 w-5 rounded border-zinc-300 text-blue-600 focus:ring-blue-600 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-blue-600 transition-colors"
            />
          </div>
          <div className="ml-3 text-sm leading-6">
            <label htmlFor="isPrimary" className="font-medium text-zinc-900 dark:text-zinc-100 cursor-pointer">
              Set as primary address
            </label>
            <p className="text-zinc-500 dark:text-zinc-400">Make this your default address for all activities.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t dark:border-zinc-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {address ? 'Update Address' : 'Save Address'}
        </Button>
      </div>
    </form>
  )
}
