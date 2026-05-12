import React, { useState, useEffect } from 'react'
import { Address, CreateAddressDto, UpdateAddressDto } from '@/services/api/addresses.service'

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
          Street Address
        </label>
        <input
          type="text"
          id="street"
          name="street"
          value={formData.street}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="123 Main Street"
        />
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
          City
        </label>
        <input
          type="text"
          id="city"
          name="city"
          value={formData.city}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Accra"
        />
      </div>

      <div>
        <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
          State/Region
        </label>
        <input
          type="text"
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Greater Accra"
        />
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
          Postal/Zip Code
        </label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="00233"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPrimary"
          name="isPrimary"
          checked={formData.isPrimary}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700">
          Set as primary address
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : (address ? 'Update Address' : 'Add Address')}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
