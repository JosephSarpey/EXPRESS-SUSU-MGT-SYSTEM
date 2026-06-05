import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/api/auth.service'
import { setAccessToken } from '@/services/api/client'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER' | 'WORKER'
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED'
  profileImage?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setAuth: (user: User) => void
  logout: () => Promise<void>
  setLoading: (loading: boolean) => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      setAuth: (user) => {
        set({ user, isAuthenticated: true, isLoading: false })
      },
      
      logout: async () => {
        try {
          await authService.signOut()
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          setAccessToken(null)
          set({ user: null, isAuthenticated: false, isLoading: false })
          localStorage.removeItem('auth-storage')
        }
      },
      
      setLoading: (loading) => {
        set({ isLoading: loading })
      },
      
      updateUser: (userData) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
