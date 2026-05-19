import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
import { SupabaseService } from '../auth/supabase.service.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalCustomers,
      totalWorkers,
      totalAdmins,
      activeWorkers,
      totalTransactions,
      totalDeposits,
      totalWithdrawals,
      pendingApprovals,
      pendingDeposits,
      pendingWithdrawals,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
      this.prisma.user.count({ where: { role: 'WORKER' } }),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.workerSession.count({
        where: { status: 'ACTIVE' },
      }),
      this.prisma.transaction.count(),
      this.prisma.transaction.count({
        where: { type: 'DEPOSIT', status: 'SUCCESS' },
      }),
      this.prisma.transaction.count({
        where: { type: 'WITHDRAWAL', status: 'SUCCESS' },
      }),
      this.prisma.user.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.transaction.count({
        where: { type: 'DEPOSIT', status: 'PENDING' },
      }),
      this.prisma.transaction.count({
        where: { type: 'WITHDRAWAL', status: 'PENDING' },
      }),
    ]);

    const totalVolume = await this.prisma.transaction.aggregate({
      where: { status: 'SUCCESS' },
      _sum: { amount: true },
    });

    const totalWallets = await this.prisma.wallet.aggregate({
      _sum: { balance: true },
    });

    return {
      users: {
        total: totalUsers,
        customers: totalCustomers,
        workers: totalWorkers,
        admins: totalAdmins,
        activeWorkers,
        pendingApprovals,
      },
      transactions: {
        total: totalTransactions,
        deposits: totalDeposits,
        withdrawals: totalWithdrawals,
        pendingDeposits,
        pendingWithdrawals,
        totalVolume: totalVolume._sum.amount || 0,
      },
      wallets: {
        totalBalance: totalWallets._sum.balance || 0,
      },
      system: {
        database: 'ACTIVE',
        server: 'STABLE',
        workerNodes: activeWorkers > 0 ? 'HEALTHY' : 'IDLE',
      },
    };
  }

  async createStaffAccount(adminUserId: string, data: CreateStaffDto) {
    // 1. Create the user in Supabase Auth via Admin API
    const supabaseUser = await this.supabaseService.adminCreateUser(
      data.email,
      data.password,
      {
        fullName: data.fullName,
        phone: data.phone,
        role: data.role,
      },
    );

    if (!supabaseUser.user) {
      throw new Error('Failed to create staff account in Supabase');
    }

    // 2. Create the user in the local Prisma Database
    const createdUser = await this.prisma.user.create({
      data: {
        id: supabaseUser.user.id,
        email: data.email,
        phone: data.phone ?? null,
        fullName: data.fullName,
        role: data.role,
        status: 'ACTIVE',
        emailVerified: true,
      },
    });

    return createdUser;
  }

  async getRecentTransactions(params?: {
    page: number;
    limit: number;
    userId?: string;
    search?: string;
    type?: string;
    status?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      ...(params?.userId ? { userId: params.userId } : {}),
      ...(params?.type ? { type: params.type as any } : {}),
      ...(params?.status ? { status: params.status as any } : {}),
    };

    if (params?.search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.search.trim());
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { referenceId: { contains: params.search, mode: 'insensitive' } },
        { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        ...(isUuid ? [{ id: params.search.trim() }] : []),
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          worker: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAuditLogs(params?: { page: number; limit: number; search?: string }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (params?.search) {
      where.OR = [
        { action: { contains: params.search, mode: 'insensitive' } },
        { entityType: { contains: params.search, mode: 'insensitive' } },
        { targetId: { contains: params.search, mode: 'insensitive' } },
        { actor: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { actor: { email: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: { select: { fullName: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkerCollections(params?: {
    page: number;
    limit: number;
    workerId?: string;
    search?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      type: 'DEPOSIT',
      paymentGateway: 'WORKER_CASH',
      ...(params?.workerId
        ? { workerId: params.workerId }
        : { workerId: { not: null } }),
    };

    if (params?.search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.search.trim());
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { referenceId: { contains: params.search, mode: 'insensitive' } },
        { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        { worker: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { worker: { email: { contains: params.search, mode: 'insensitive' } } },
        ...(isUuid ? [{ id: params.search.trim() }] : []),
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          worker: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerDeposits(params?: {
    page: number;
    limit: number;
    userId?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      type: 'DEPOSIT',
      ...(params?.userId ? { userId: params.userId } : {}),
    };

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          worker: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllWithdrawals(params?: {
    page: number;
    limit: number;
    userId?: string;
    workerId?: string;
    search?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      type: 'WITHDRAWAL',
      ...(params?.userId ? { userId: params.userId } : {}),
      ...(params?.workerId ? { workerId: params.workerId } : {}),
    };

    if (params?.search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.search.trim());
      where.OR = [
        { description: { contains: params.search, mode: 'insensitive' } },
        { referenceId: { contains: params.search, mode: 'insensitive' } },
        { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
        { user: { email: { contains: params.search, mode: 'insensitive' } } },
        ...(isUuid ? [{ id: params.search.trim() }] : []),
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          user: { select: { fullName: true, email: true } },
          worker: { select: { fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── Phase 2: Wallet Controls ───────────────────────────────────────

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    return wallet;
  }

  async lockWallet(userId: string, adminId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    if (wallet.isLocked) {
      throw new BadRequestException('Wallet is already locked');
    }

    const updated = await this.prisma.wallet.update({
      where: { userId },
      data: { isLocked: true },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'WALLET_LOCKED',
        targetId: wallet.id,
        entityType: 'Wallet',
        oldValues: { isLocked: false },
        newValues: { isLocked: true },
      },
    });

    return updated;
  }

  async unlockWallet(userId: string, adminId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found for this user');
    }

    if (!wallet.isLocked) {
      throw new BadRequestException('Wallet is already unlocked');
    }

    const updated = await this.prisma.wallet.update({
      where: { userId },
      data: { isLocked: false },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'WALLET_UNLOCKED',
        targetId: wallet.id,
        entityType: 'Wallet',
        oldValues: { isLocked: true },
        newValues: { isLocked: false },
      },
    });

    return updated;
  }

  // ─── Phase 3: System Settings ───────────────────────────────────────

  async getSystemSettings() {
    const settings = await this.prisma.systemSetting.findMany({
      orderBy: { settingKey: 'asc' },
    });

    return settings;
  }

  async updateSystemSetting(
    settingKey: string,
    settingValue: string,
    description?: string,
  ) {
    const setting = await this.prisma.systemSetting.upsert({
      where: { settingKey },
      update: {
        settingValue,
        ...(description !== undefined && { description }),
      },
      create: {
        settingKey,
        settingValue,
        description,
      },
    });

    return setting;
  }

  // ─── Phase 4: Worker Session Management ─────────────────────────────

  async getWorkerSessions(params?: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.WorkerSessionWhereInput = {
      ...(params?.status ? { status: params.status as any } : {}),
    };

    if (params?.search) {
      where.worker = {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { fullName: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.workerSession.count({ where }),
      this.prisma.workerSession.findMany({
        where,
        include: {
          worker: { select: { fullName: true, email: true } },
        },
        orderBy: { loginTime: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async terminateWorkerSession(sessionId: string, adminId: string) {
    const session = await this.prisma.workerSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Worker session not found');
    }

    if (session.status !== 'ACTIVE') {
      throw new BadRequestException('Session is not active');
    }

    const updated = await this.prisma.workerSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        logoutTime: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'WORKER_SESSION_TERMINATED',
        targetId: sessionId,
        entityType: 'WorkerSession',
        newValues: { status: 'ENDED', terminatedByAdmin: true },
      },
    });

    return updated;
  }

  // ─── Phase 5: Wallets & Workers Management ───────────────────────

  async listWallets(params?: { page: number; limit: number; search?: string }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.WalletWhereInput = {};
    if (params?.search) {
      where.user = {
        OR: [
          { email: { contains: params.search, mode: 'insensitive' } },
          { fullName: { contains: params.search, mode: 'insensitive' } },
        ],
      };
    }

    const [total, data] = await Promise.all([
      this.prisma.wallet.count({ where }),
      this.prisma.wallet.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listWorkers(params?: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = { role: 'WORKER' };
    if (params?.search) {
      where.OR = [
        { email: { contains: params.search, mode: 'insensitive' } },
        { fullName: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params?.status) {
      where.status = params.status as any;
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          phone: true,
          wallet: {
            select: {
              id: true,
              balance: true,
              currency: true,
              isLocked: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
