import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  SessionStatus,
  TransactionStatus,
  TransactionType,
} from '../../generated/prisma/client.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma.service.js';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  async clockIn(workerId: string, deviceInfo?: string, ipAddress?: string) {
    return this.prisma.$transaction(async (trx) => {
      const active = await trx.workerSession.findFirst({
        where: {
          workerId,
          status: SessionStatus.ACTIVE,
        },
      });

      if (active) {
        throw new BadRequestException('Worker already has an active session');
      }

      const session = await trx.workerSession.create({
        data: {
          workerId,
          loginTime: new Date(),
          status: SessionStatus.ACTIVE,
          deviceInfo,
          ipAddress,
        },
      });

      const worker = await trx.user.findUnique({
        where: { id: workerId },
        select: { fullName: true },
      });

      const admins = await trx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const notificationsData: any[] = [];
      for (const admin of admins) {
        notificationsData.push({
          userId: admin.id,
          type: 'SYSTEM',
          subject: 'Worker Collection Started',
          message: `Worker ${worker?.fullName ?? 'Unknown'} has started their collection session.`,
        });
      }

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return session;
    }, { timeout: 15000 });
  }

  async clockOut(workerId: string) {
    return this.prisma.$transaction(async (trx) => {
      const active = await trx.workerSession.findFirst({
        where: {
          workerId,
          status: SessionStatus.ACTIVE,
        },
      });

      if (!active) {
        throw new BadRequestException('No active session found');
      }

      const session = await trx.workerSession.update({
        where: { id: active.id },
        data: {
          logoutTime: new Date(),
          status: SessionStatus.ENDED,
        },
      });

      const worker = await trx.user.findUnique({
        where: { id: workerId },
        select: { fullName: true },
      });

      const admins = await trx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      const notificationsData: any[] = [];
      for (const admin of admins) {
        notificationsData.push({
          userId: admin.id,
          type: 'SYSTEM',
          subject: 'Worker Collection Ended',
          message: `Worker ${worker?.fullName ?? 'Unknown'} has ended their collection session.`,
        });
      }

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return session;
    }, { timeout: 15000 });
  }

  async getActiveSession(workerId: string) {
    return this.prisma.workerSession.findFirst({
      where: {
        workerId,
        status: SessionStatus.ACTIVE,
      },
    });
  }

  async createCashDeposit(params: {
    workerId: string;
    userId: string;
    amount: Prisma.Decimal;
    description?: string;
  }) {
    return this.prisma.$transaction(async (trx) => {
      const activeSession = await trx.workerSession.findFirst({
        where: {
          workerId: params.workerId,
          status: SessionStatus.ACTIVE,
        },
      });

      if (!activeSession) {
        throw new ForbiddenException('No active worker session');
      }

      const wallet = await trx.wallet.findUnique({
        where: { userId: params.userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.isLocked) {
        throw new ForbiddenException('Wallet is locked');
      }

      const referenceId = `wd_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.plus(params.amount);

      await trx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const tx = await trx.transaction.create({
        data: {
          referenceId,
          userId: params.userId,
          workerId: params.workerId,
          walletId: wallet.id,
          type: TransactionType.DEPOSIT,
          amount: params.amount,
          paymentGateway: 'WORKER_CASH',
          paymentMethod: 'CASH',
          status: TransactionStatus.SUCCESS,
          balanceBefore,
          balanceAfter,
          description: params.description,
        },
      });

      await trx.auditLog.create({
        data: {
          actorId: params.workerId,
          action: 'WORKER_CASH_DEPOSIT',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: { amount: params.amount.toString() },
        },
      });

      const notificationsData: any[] = [];

      notificationsData.push({
        userId: params.userId,
        type: 'SYSTEM',
        subject: 'Cash deposit received',
        message: `A cash deposit of ${wallet.currency} ${params.amount.toString()} was recorded.`,
      });

      // Notify the worker who recorded the deposit
      notificationsData.push({
        userId: params.workerId,
        type: 'SYSTEM',
        subject: 'Cash deposit recorded',
        message: `You recorded a cash deposit of ${wallet.currency} ${params.amount.toString()} for customer.`,
      });

      // Notify all admins about the cash deposit
      const worker = await trx.user.findUnique({
        where: { id: params.workerId },
        select: { fullName: true },
      });
      const customer = await trx.user.findUnique({
        where: { id: params.userId },
        select: { fullName: true },
      });
      const admins = await trx.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      for (const admin of admins) {
        notificationsData.push({
          userId: admin.id,
          type: 'SYSTEM',
          subject: 'Cash deposit recorded',
          message: `Worker ${worker?.fullName ?? 'Unknown'} collected a cash deposit of ${wallet.currency} ${params.amount.toString()} from customer ${customer?.fullName ?? 'Unknown'}.`,
        });
      }

      // Notify all workers about the cash deposit (except the one who recorded it)
      const workers = await trx.user.findMany({
        where: { 
          role: 'WORKER',
          id: { not: params.workerId }
        },
        select: { id: true },
      });

      for (const w of workers) {
        notificationsData.push({
          userId: w.id,
          type: 'SYSTEM',
          subject: 'Team collection recorded',
          message: `Worker ${worker?.fullName ?? 'Unknown'} collected ${wallet.currency} ${params.amount.toString()} from customer ${customer?.fullName ?? 'Unknown'}.`,
        });
      }

      if (notificationsData.length > 0) {
        await trx.notification.createMany({
          data: notificationsData,
        });
      }

      return tx;
    }, { timeout: 15000 });
  }

  async listWorkerCollections(workerId: string): Promise<{
    data: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;
  async listWorkerCollections(
    workerId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<{
    data: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;
  async listWorkerCollections(
    workerId: string,
    params?: { page: number; limit: number; search?: string },
  ) {
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
      workerId,
      type: TransactionType.DEPOSIT,
      paymentGateway: 'WORKER_CASH',
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

  async listWorkerWithdrawals(workerId: string): Promise<{
    data: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;
  async listWorkerWithdrawals(
    workerId: string,
    params: { page: number; limit: number; search?: string },
  ): Promise<{
    data: unknown[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>;
  async listWorkerWithdrawals(
    workerId: string,
    params?: { page: number; limit: number; search?: string },
  ) {
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
      type: TransactionType.WITHDRAWAL,
      OR: [
        { workerId },
        {
          paymentMethod: 'CASH',
          status: { in: [TransactionStatus.PENDING, TransactionStatus.APPROVED] },
        },
      ],
    };

    if (params?.search) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.search.trim());
      where.AND = [
        {
          OR: [
            { workerId },
            {
              paymentMethod: 'CASH',
              status: { in: [TransactionStatus.PENDING, TransactionStatus.APPROVED] },
            },
          ],
        },
        {
          OR: [
            { description: { contains: params.search, mode: 'insensitive' } },
            { referenceId: { contains: params.search, mode: 'insensitive' } },
            { user: { fullName: { contains: params.search, mode: 'insensitive' } } },
            { user: { email: { contains: params.search, mode: 'insensitive' } } },
            ...(isUuid ? [{ id: params.search.trim() }] : []),
          ],
        },
      ];
      delete where.OR;
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              addresses: {
                select: {
                  street: true,
                  city: true,
                  state: true,
                  zipCode: true,
                  isPrimary: true,
                },
              },
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

  async getWorkerStats(workerId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCollections, todayAmountResult, pendingWithdrawals] =
      await Promise.all([
        // Today's collections count
        this.prisma.transaction.count({
          where: {
            workerId,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.SUCCESS,
            createdAt: { gte: today },
          },
        }),
        // Today's collections volume
        this.prisma.transaction.aggregate({
          where: {
            workerId,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.SUCCESS,
            createdAt: { gte: today },
          },
          _sum: {
            amount: true,
          },
        }),
        // Pending withdrawals for this worker (unassigned cash)
        this.prisma.transaction.count({
          where: {
            type: TransactionType.WITHDRAWAL,
            paymentMethod: 'CASH',
            status: { in: [TransactionStatus.PENDING, TransactionStatus.APPROVED] },
          },
        }),
      ]);

    return {
      todayCollections,
      todayAmount: todayAmountResult._sum.amount || 0,
      pendingWithdrawals,
    };
  }
}
