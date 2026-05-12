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

    const where: Prisma.TransactionWhereInput = { userId };

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
        user: { select: { id: true, fullName: true, email: true } },
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
      return { tx: existing, currency: wallet.currency };
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

      await trx.notification.create({
        data: {
          userId: tx.userId,
          type: 'SYSTEM',
          subject: 'Deposit successful',
          message: `Your deposit of ${wallet.currency} ${tx.amount.toString()} was successful.`,
        },
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
        await trx.notification.create({
          data: {
            userId: admin.id,
            type: 'SYSTEM',
            subject: 'Online deposit received',
            message: `Customer ${customer?.fullName ?? 'Unknown'} made a deposit of ${wallet.currency} ${tx.amount.toString()} via Paystack (${updatedPaymentMethod}).`,
          },
        });
      }

      return updated;
    });
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

      await trx.notification.create({
        data: {
          userId: tx.userId,
          type: 'SYSTEM',
          subject: 'Withdrawal approved',
          message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been approved. Admin will process payment via ${tx.paymentMethod}.`,
        },
      });

      return updated;
    });
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

      await trx.notification.create({
        data: {
          userId: tx.userId,
          type: 'SYSTEM',
          subject: 'Withdrawal payment completed',
          message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been paid via ${tx.paymentMethod}.`,
        },
      });

      // Notify the admin who confirmed the payment
      await trx.notification.create({
        data: {
          userId: params.adminId,
          type: 'SYSTEM',
          subject: 'Withdrawal payment confirmed',
          message: `You confirmed a withdrawal payment of ${wallet.currency} ${tx.amount.toString()} via ${tx.paymentMethod}.`,
        },
      });

      return updated;
    });
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

      await trx.notification.create({
        data: {
          userId: tx.userId,
          type: 'SYSTEM',
          subject: 'Withdrawal payment completed',
          message: `Your withdrawal of ${wallet.currency} ${tx.amount.toString()} has been paid in cash by our agent.`,
        },
      });

      // Notify the worker who confirmed the cash payment
      await trx.notification.create({
        data: {
          userId: params.workerId,
          type: 'SYSTEM',
          subject: 'Withdrawal payment confirmed',
          message: `You confirmed a cash withdrawal payment of ${wallet.currency} ${tx.amount.toString()}.`,
        },
      });

      return updated;
    });
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
