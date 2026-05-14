import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';
import { TransactionType, TransactionStatus } from '../../generated/prisma/client.js';

@Injectable()
export class WalletsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWalletByUserId(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async getWalletStats(userId: string) {
    const [deposits, withdrawals] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: { in: [TransactionType.DEPOSIT, TransactionType.TRANSFER] }, // Transfers received are usually deposits in this context, but let's stick to DEPOSIT for clarity if it's Susu
          status: TransactionStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.WITHDRAWAL,
          status: TransactionStatus.SUCCESS,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

    // Re-check: If we have multiple transaction types, we should be precise.
    // In this system: DEPOSIT, WITHDRAWAL, TRANSFER.
    // COLLECTIONS are also DEPOSITS (from worker perspective, but they are stored as DEPOSIT type).

    return {
      totalDeposited: deposits._sum.amount || 0,
      totalWithdrawn: withdrawals._sum.amount || 0,
    };
  }
}
