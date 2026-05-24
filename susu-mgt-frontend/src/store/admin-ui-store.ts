import { create } from 'zustand'

interface UserManagementState {
  search: string
  statusFilter: string
  roleFilter: string
  page: number
  selectedUser: any | null
  setSearch: (search: string) => void
  setStatusFilter: (status: string) => void
  setRoleFilter: (role: string) => void
  setPage: (page: number) => void
  setSelectedUser: (user: any | null) => void
}

interface WorkerManagementState {
  search: string
  page: number
  activeTab: 'sessions' | 'collections'
  selectedSession: any | null
  setSearch: (search: string) => void
  setPage: (page: number) => void
  setActiveTab: (tab: 'sessions' | 'collections') => void
  setSelectedSession: (session: any | null) => void
}

interface WalletsState {
  search: string
  page: number
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

interface WorkersState {
  search: string
  statusFilter: string
  page: number
  setSearch: (search: string) => void
  setStatusFilter: (status: string) => void
  setPage: (page: number) => void
}

interface UserApprovalState {
  search: string
  page: number
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

interface WorkerCollectionsState {
  search: string
  page: number
  setSearch: (search: string) => void
  setPage: (page: number) => void
}

interface AdminUIState {
  userManagement: UserManagementState
  workerManagement: WorkerManagementState
  wallets: WalletsState
  workers: WorkersState
  userApproval: UserApprovalState
  workerCollections: WorkerCollectionsState
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  userManagement: {
    search: '',
    statusFilter: '',
    roleFilter: '',
    page: 1,
    selectedUser: null,
    setSearch: (search) => set((state) => ({ userManagement: { ...state.userManagement, search, page: 1 } })),
    setStatusFilter: (statusFilter) => set((state) => ({ userManagement: { ...state.userManagement, statusFilter, page: 1 } })),
    setRoleFilter: (roleFilter) => set((state) => ({ userManagement: { ...state.userManagement, roleFilter, page: 1 } })),
    setPage: (page) => set((state) => ({ userManagement: { ...state.userManagement, page } })),
    setSelectedUser: (selectedUser) => set((state) => ({ userManagement: { ...state.userManagement, selectedUser } })),
  },
  workerManagement: {
    search: '',
    page: 1,
    activeTab: 'sessions',
    selectedSession: null,
    setSearch: (search) => set((state) => ({ workerManagement: { ...state.workerManagement, search, page: 1 } })),
    setPage: (page) => set((state) => ({ workerManagement: { ...state.workerManagement, page } })),
    setActiveTab: (activeTab) => set((state) => ({ workerManagement: { ...state.workerManagement, activeTab } })),
    setSelectedSession: (selectedSession) => set((state) => ({ workerManagement: { ...state.workerManagement, selectedSession } })),
  },
  wallets: {
    search: '',
    page: 1,
    setSearch: (search) => set((state) => ({ wallets: { ...state.wallets, search, page: 1 } })),
    setPage: (page) => set((state) => ({ wallets: { ...state.wallets, page } })),
  },
  workers: {
    search: '',
    statusFilter: '',
    page: 1,
    setSearch: (search) => set((state) => ({ workers: { ...state.workers, search, page: 1 } })),
    setStatusFilter: (statusFilter) => set((state) => ({ workers: { ...state.workers, statusFilter, page: 1 } })),
    setPage: (page) => set((state) => ({ workers: { ...state.workers, page } })),
  },
  userApproval: {
    search: '',
    page: 1,
    setSearch: (search) => set((state) => ({ userApproval: { ...state.userApproval, search, page: 1 } })),
    setPage: (page) => set((state) => ({ userApproval: { ...state.userApproval, page } })),
  },
  workerCollections: {
    search: '',
    page: 1,
    setSearch: (search) => set((state) => ({ workerCollections: { ...state.workerCollections, search, page: 1 } })),
    setPage: (page) => set((state) => ({ workerCollections: { ...state.workerCollections, page } })),
  }
}))
