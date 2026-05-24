import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  type PaymentGateway,
  type PaymentMethod,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma.service.js';

function generateReference(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredPendingTransactions() {
    this.logger.log('Running cleanup job for expired pending transactions...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await this.prisma.transaction.updateMany({
      where: {
        status: TransactionStatus.PENDING,
        createdAt: {
          lt: twentyFourHoursAgo,
        },
      },
      data: {
        status: TransactionStatus.FAILED,
        description: 'Transaction expired after 24 hours of inactivity.',
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Expired ${result.count} pending transaction(s) older than 24 hours.`,
      );
    } else {
      this.logger.log('No expired pending transactions found.');
    }
  }

  async listMyTransactions(
    userId: string,
    params?: { 
      page: number; 
      limit: number;
      search?: string;
      type?: string;
      status?: string;
    },
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

    const where: Prisma.TransactionWhereInput = { userId };

    if (params?.search) {
      where.OR = [
        { referenceId: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params?.type && Object.values(TransactionType).includes(params.type as TransactionType)) {
      where.type = params.type as TransactionType;
    }

    if (params?.status && Object.values(TransactionStatus).includes(params.status as TransactionStatus)) {
      where.status = params.status as TransactionStatus;
    }

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
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

  async findById(transactionId: string, userId?: string) {
    const where: Prisma.TransactionWhereInput = {
      id: transactionId,
      ...(userId ? { userId } : {}),
    };

    const transaction = await this.prisma.transaction.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
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
        worker: { select: { id: true, fullName: true, email: true } },
        wallet: { select: { id: true, currency: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async listMyWithdrawals(
    userId: string,
    params?: { page: number; limit: number },
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
      userId,
      type: TransactionType.WITHDRAWAL,
    };

    const [total, data] = await Promise.all([
      this.prisma.transaction.count({ where }),
      this.prisma.transaction.findMany({
        where,
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

  async createWithdrawalRequest(params: {
    userId: string;
    amount: Prisma.Decimal;
    method: PaymentMethod;
  }) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isLocked) {
      throw new ForbiddenException('Wallet is locked');
    }

    if (wallet.balance.lessThan(params.amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const referenceId = generateReference('wd');

    // Idempotency: if a similar pending withdrawal was just created, return it
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const existingPending = await this.prisma.transaction.findFirst({
      where: {
        userId: params.userId,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        amount: params.amount,
        paymentMethod: params.method,
        createdAt: { gte: oneMinuteAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingPending) {
      this.logger.log(
        `Found existing pending withdrawal for user ${params.userId}, returning existing transaction ${existingPending.id}`,
      );
      return existingPending;
    }

    // Determine payment gateway based on payment method
    const paymentGateway =
      params.method === 'CASH'
        ? ('WORKER_CASH' as PaymentGateway)
        : ('PAYSTACK' as PaymentGateway);

    const tx = await this.prisma.transaction.create({
      data: {
        referenceId,
        userId: params.userId,
        walletId: wallet.id,
        type: TransactionType.WITHDRAWAL,
        amount: params.amount,
        paymentGateway,
        paymentMethod: params.method,
        status: TransactionStatus.PENDING,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
      },
    });

    // Notify the customer about the withdrawal request
    await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: 'SYSTEM',
        subject: 'Withdrawal request submitted',
        message: `Your withdrawal request of ${wallet.currency} ${params.amount.toString()} via ${params.method} has been submitted and is pending approval.`,
      },
    });

    // Notify all admins (in-app SYSTEM notification + EMAIL notification)
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true, email: true },
      });

      const adminSubject = 'New withdrawal request submitted';
      const adminMessage = `User ${params.userId} requested a withdrawal of ${wallet.currency} ${params.amount.toString()} via ${params.method}. Reference: ${referenceId}`;

      const notificationsData: Array<any> = [];
      for (const admin of admins) {
        notificationsData.push({
          userId: admin.id,
          type: 'SYSTEM',
          subject: adminSubject,
          message: adminMessage,
        });
        notificationsData.push({
          userId: admin.id,
          type: 'EMAIL',
          subject: adminSubject,
          message: adminMessage,
        });
      }

      if (notificationsData.length > 0) {
        await this.prisma.notification.createMany({ data: notificationsData });
      }
    } catch (err) {
      this.logger.error(
        'Failed to notify admins about withdrawal request',
        err,
      );
    }

    // Notify workers if method is CASH
    if (params.method === 'CASH') {
      try {
        const workers = await this.prisma.user.findMany({
          where: { role: 'WORKER' },
          select: { id: true },
        });

        const workerSubject = 'New cash withdrawal request';
        const workerMessage = `A new cash withdrawal of ${wallet.currency} ${params.amount.toString()} has been requested. Reference: ${referenceId}`;

        const workerNotifications = workers.map((worker) => ({
          userId: worker.id,
          type: 'SYSTEM' as const,
          subject: workerSubject,
          message: workerMessage,
        }));

        if (workerNotifications.length > 0) {
          await this.prisma.notification.createMany({
            data: workerNotifications,
          });
        }
      } catch (err) {
        this.logger.error(
          'Failed to notify workers about cash withdrawal request',
          err,
        );
      }
    }

    // Create an audit log entry for this withdrawal request
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: params.userId,
          action: 'CREATE_WITHDRAWAL_REQUEST',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: {
            amount: params.amount.toString(),
            currency: wallet.currency,
            paymentMethod: params.method,
            referenceId,
            status: tx.status,
          },
        },
      });
    } catch (err) {
      this.logger.error(
        'Failed to create audit log for withdrawal request',
        err,
      );
    }

    return tx;
  }

  async createOrReusePendingPaystackDeposit(params: {
    userId: string;
    amount: Prisma.Decimal;
  }) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId: params.userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.isLocked) {
      throw new ForbiddenException('Wallet is locked');
    }

    const existing = await this.prisma.transaction.findFirst({
      where: {
        userId: params.userId,
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        paymentGateway: 'PAYSTACK',
        status: TransactionStatus.PENDING,
        amount: params.amount,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      // Update referenceId to prevent "Duplicate Transaction Reference" from Paystack on retries
      const newReferenceId = generateReference('ps');
      const updatedTx = await this.prisma.transaction.update({
        where: { id: existing.id },
        data: { referenceId: newReferenceId }
      });
      return { tx: updatedTx, currency: wallet.currency };
    }

    const referenceId = generateReference('ps');

    const newTx = await this.prisma.transaction.create({
      data: {
        referenceId,
        userId: params.userId,
        walletId: wallet.id,
        type: TransactionType.DEPOSIT,
        amount: params.amount,
        paymentGateway: 'PAYSTACK',
        paymentMethod: 'MTN_MOMO',
        status: TransactionStatus.PENDING,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
      },
    });

    // Notify the customer about the new deposit initiation
    await this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: 'SYSTEM',
        subject: 'Deposit initiated',
        message: `Your deposit of ${wallet.currency} ${params.amount.toString()} has been initiated via Paystack. Complete the payment to credit your wallet.`,
      },
    });

    return { tx: newTx, currency: wallet.currency };
  }

  async applyPaystackSuccessWebhook(params: {
    referenceId: string;
    userId: string;
    amount: number;
    gatewayResponse: Prisma.InputJsonValue;
  }) {
    return this.prisma.$transaction(async (trx) => {
      const tx = await trx.transaction.findUnique({
        where: { referenceId: params.referenceId },
      });

      if (!tx) {
        throw new NotFoundException('Transaction not found');
      }

      if (tx.userId !== params.userId) {
        throw new BadRequestException('User mismatch');
      }

      if (tx.type !== TransactionType.DEPOSIT) {
        throw new BadRequestException('Not a deposit transaction');
      }

      if (tx.status === TransactionStatus.SUCCESS) {
        return tx;
      }

      if (tx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Transaction is not pending');
      }

      const incomingAmount = new Prisma.Decimal(params.amount);
      if (!tx.amount.equals(incomingAmount)) {
        throw new BadRequestException('Amount mismatch');
      }

      const wallet = await trx.wallet.findUnique({
        where: { id: tx.walletId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.isLocked) {
        throw new ForbiddenException('Wallet is locked');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.plus(tx.amount);

      await trx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      let updatedPaymentMethod = tx.paymentMethod;
      const resData = params.gatewayResponse as any;
      const auth = resData?.data?.authorization || resData?.authorization;
      const channel =
        auth?.channel || resData?.data?.channel || resData?.channel;
      const bank = (auth?.bank || '').toUpperCase();

      if (channel === 'mobile_money') {
        if (bank.includes('MTN')) updatedPaymentMethod = 'MTN_MOMO';
        else if (bank.includes('TELECEL') || bank.includes('VODAFONE'))
          updatedPaymentMethod = 'TELECEL_CASH';
        else if (bank.includes('AIRTEL') || bank.includes('TIGO'))
          updatedPaymentMethod = 'AIRTELTIGO_MONEY';
      } else if (channel === 'bank' || channel === 'bank_transfer') {
        updatedPaymentMethod = 'BANK_TRANSFER';
      } else if (channel === 'ussd') {
        updatedPaymentMethod = 'USSD';
      } else if (channel === 'card') {
        updatedPaymentMethod = 'CARD';
      }

      const updated = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: TransactionStatus.SUCCESS,
          balanceBefore,
          balanceAfter,
          gatewayResponse: params.gatewayResponse,
          paymentMethod: updatedPaymentMethod,
        },
      });

      await trx.auditLog.create({
        data: {
          actorId: tx.userId,
          action: 'PAYSTACK_DEPOSIT_SUCCESS',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: { status: TransactionStatus.SUCCESS },
        },
      });

      const notificationsData: any[] = [];
      notificationsData.push({
        userId: tx.userId,
        type: 'SYSTEM',
        subject: 'Deposit successful',
        message: `Your deposit of ${wallet.currency} ${tx.amount.toString()} was successful.`,
      });

      // Notify all admins about the Paystack deposit
      const customer = await trx.user.findUnique({
        where: { id: tx.userId },
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
          subject: 'Online deposit received',
          message: `Customer ${customer?.fullName ?? 'Unknown'} made a deposit of ${wallet.currency} ${tx.amount.toString()} via Paystack (${updatedPaymentMethod}).`,
        });
      }

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return updated;
    }, { timeout: 15000 });
  }

  async approveWithdrawalRequest(params: {
    adminId: string;
    transactionId: string;
    remarks?: string;
  }) {
    return this.prisma.$transaction(async (trx) => {
      const tx = await trx.transaction.findUnique({
        where: { id: params.transactionId },
      });
      if (!tx) {
        throw new NotFoundException('Transaction not found');
      }

      if (tx.type !== TransactionType.WITHDRAWAL) {
        throw new BadRequestException('Not a withdrawal transaction');
      }

      if (tx.status !== TransactionStatus.PENDING) {
        throw new BadRequestException('Transaction is not pending');
      }

      const wallet = await trx.wallet.findUnique({
        where: { id: tx.walletId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.isLocked) {
        throw new ForbiddenException('Wallet is locked');
      }

      if (wallet.balance.lessThan(tx.amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      // Note: We don't deduct from wallet here - admin handles payment manually
      // The wallet balance remains unchanged until admin confirms payment is complete

      const updated = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: TransactionStatus.APPROVED,
          description: params.remarks ?? tx.description,
        },
      });

      await trx.auditLog.create({
        data: {
          actorId: params.adminId,
          action: 'WITHDRAWAL_APPROVED',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: { status: TransactionStatus.APPROVED },
        },
      });

      const notificationsData: any[] = [];
      notificationsData.push({
        userId: tx.userId,
        type: 'SYSTEM',
        subject: 'Withdrawal approved',
        message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been approved. Admin will process payment via ${tx.paymentMethod}.`,
      });

      // Notify workers if method is CASH
      if (tx.paymentMethod === 'CASH') {
        const workers = await trx.user.findMany({
          where: { role: 'WORKER' },
          select: { id: true },
        });

        for (const worker of workers) {
          notificationsData.push({
            userId: worker.id,
            type: 'SYSTEM',
            subject: 'Approved cash withdrawal ready',
            message: `A cash withdrawal of ${wallet.currency} ${tx.amount.toString()} has been approved and is ready for payout.`,
          });
        }
      }

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return updated;
    }, { timeout: 15000 });
  }

  async confirmWithdrawalPayment(params: {
    adminId: string;
    transactionId: string;
    remarks?: string;
  }) {
    return this.prisma.$transaction(async (trx) => {
      const tx = await trx.transaction.findUnique({
        where: { id: params.transactionId },
      });
      if (!tx) {
        throw new NotFoundException('Transaction not found');
      }

      if (tx.type !== TransactionType.WITHDRAWAL) {
        throw new BadRequestException('Not a withdrawal transaction');
      }

      if (tx.status !== TransactionStatus.APPROVED) {
        throw new BadRequestException('Transaction must be approved first');
      }

      const wallet = await trx.wallet.findUnique({
        where: { id: tx.walletId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.isLocked) {
        throw new ForbiddenException('Wallet is locked');
      }

      if (wallet.balance.lessThan(tx.amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.minus(tx.amount);

      await trx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const updated = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: TransactionStatus.SUCCESS,
          balanceBefore,
          balanceAfter,
          description: `Payment completed via ${tx.paymentMethod}. ${params.remarks ?? ''}`,
        },
      });

      await trx.auditLog.create({
        data: {
          actorId: params.adminId,
          action: 'WITHDRAWAL_PAYMENT_CONFIRMED',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: {
            balanceBefore,
            balanceAfter,
            status: TransactionStatus.SUCCESS,
          },
        },
      });

      const notificationsData: any[] = [];
      notificationsData.push({
        userId: tx.userId,
        type: 'SYSTEM',
        subject: 'Withdrawal payment completed',
        message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been paid via ${tx.paymentMethod}.`,
      });

      // Notify the admin who confirmed the payment
      notificationsData.push({
        userId: params.adminId,
        type: 'SYSTEM',
        subject: 'Withdrawal payment confirmed',
        message: `You confirmed a withdrawal payment of ${wallet.currency} ${tx.amount.toString()} via ${tx.paymentMethod}.`,
      });

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return updated;
    }, { timeout: 15000 });
  }

  async workerConfirmWithdrawalPayment(params: {
    workerId: string;
    transactionId: string;
    remarks?: string;
  }) {
    return this.prisma.$transaction(async (trx) => {
      const tx = await trx.transaction.findUnique({
        where: { id: params.transactionId },
      });
      if (!tx) {
        throw new NotFoundException('Transaction not found');
      }

      if (tx.type !== TransactionType.WITHDRAWAL) {
        throw new BadRequestException('Not a withdrawal transaction');
      }

      if (tx.status !== TransactionStatus.APPROVED) {
        throw new BadRequestException('Transaction must be approved first');
      }

      // Only allow workers to confirm CASH withdrawals
      if (tx.paymentMethod !== 'CASH') {
        throw new BadRequestException(
          'Only cash withdrawals can be confirmed by workers',
        );
      }

      const wallet = await trx.wallet.findUnique({
        where: { id: tx.walletId },
      });
      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.isLocked) {
        throw new ForbiddenException('Wallet is locked');
      }

      if (wallet.balance.lessThan(tx.amount)) {
        throw new BadRequestException('Insufficient balance');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.minus(tx.amount);

      await trx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const updated = await trx.transaction.update({
        where: { id: tx.id },
        data: {
          status: TransactionStatus.SUCCESS,
          workerId: params.workerId,
          balanceBefore,
          balanceAfter,
          description: `Cash payment completed by worker. ${params.remarks ?? ''}`,
        },
      });

      await trx.auditLog.create({
        data: {
          actorId: params.workerId,
          action: 'WORKER_WITHDRAWAL_PAYMENT_CONFIRMED',
          targetId: tx.id,
          entityType: 'Transaction',
          newValues: {
            balanceBefore,
            balanceAfter,
            status: TransactionStatus.SUCCESS,
          },
        },
      });

      const notificationsData: any[] = [];
      notificationsData.push({
        userId: tx.userId,
        type: 'SYSTEM',
        subject: 'Withdrawal payment completed',
        message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been paid in cash by our agent.`,
      });

      // Notify the worker who confirmed the cash payment
      notificationsData.push({
        userId: params.workerId,
        type: 'SYSTEM',
        subject: 'Withdrawal payment confirmed',
        message: `You confirmed a cash withdrawal payment of ${wallet.currency} ${tx.amount.toString()}.`,
      });

      if (notificationsData.length > 0) {
        await trx.notification.createMany({ data: notificationsData });
      }

      return updated;
    }, { timeout: 15000 });
  }

  async rejectWithdrawalRequest(params: {
    adminId: string;
    transactionId: string;
    remarks?: string;
  }) {
    const tx = await this.prisma.transaction.findUnique({
      where: { id: params.transactionId },
      include: { wallet: true },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    if (tx.type !== TransactionType.WITHDRAWAL) {
      throw new BadRequestException('Not a withdrawal transaction');
    }

    if (tx.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    const updated = await this.prisma.transaction.update({
      where: { id: tx.id },
      data: {
        status: TransactionStatus.FAILED,
        description: params.remarks ?? tx.description,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: params.adminId,
        action: 'WITHDRAWAL_REJECTED',
        targetId: tx.id,
        entityType: 'Transaction',
        newValues: { status: TransactionStatus.FAILED },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: tx.userId,
        type: 'SYSTEM',
        subject: 'Withdrawal rejected',
        message: `Your withdrawal of ${tx.wallet.currency} ${tx.amount.toString()} was rejected.`,
      },
    });

    return updated;
  }
}
