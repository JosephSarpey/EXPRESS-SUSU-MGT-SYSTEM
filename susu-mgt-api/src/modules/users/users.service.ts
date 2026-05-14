import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service.js';
import { Role, AccountStatus } from '../../generated/prisma/client.js';

export type SupabaseClaims = {
  sub: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  app_metadata?: Record<string, any>;
  aud?: string;
  role?: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateFromSupabaseClaims(claims: SupabaseClaims) {
    const userId = claims.sub;

    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (existing) {
      if (!existing.wallet && existing.role === Role.CUSTOMER) {
        await this.prisma.wallet.create({
          data: {
            userId: existing.id,
            currency: 'GHS',
          },
        });
      }

      return existing;
    }

    const fullName =
      claims.user_metadata?.full_name ??
      claims.user_metadata?.name ??
      (claims.email ? claims.email.split('@')[0] : '');

    const created = await this.prisma.user.create({
      data: {
        id: userId,
        email: claims.email ?? `${userId}@placeholder.local`,
        phone: claims.phone ?? null,
        fullName,
        role: Role.CUSTOMER,
        wallet: {
          create: {
            currency: 'GHS',
          },
        },
      },
      include: { wallet: true },
    });

    return created;
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { wallet: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findAll(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{
    data: any[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const page = Number(params?.page) || 1;
    const limit = Number(params?.limit) || 20;
    const status = params?.status;
    const search = params?.search;

    console.log(`[UsersService] findAll called with page=${page}, limit=${limit}, status=${status}, search=${search}`);

    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { id: search.length === 36 ? search : undefined }, // Only match ID if it's a UUID
      ].filter(f => f.id !== undefined || !('id' in f));
    }

    const [total, data] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: { wallet: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    console.log(`[UsersService] Found ${data.length} users (total: ${total}) for status=${status}`);

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

  async approveAccount(userId: string, adminId: string, remarks?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== AccountStatus.PENDING) {
      throw new Error('Only pending accounts can be approved');
    }

    // Use a transaction to ensure both operations succeed
    return this.prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { status: AccountStatus.ACTIVE },
        include: { wallet: true },
      });

      await tx.accountApproval.create({
        data: {
          userId,
          approvedById: adminId,
          remarks,
        },
      });

      return updatedUser;
    });
  }

  async updateEmailVerificationStatus(userId: string, emailVerified: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified,
        status: emailVerified ? 'ACTIVE' : 'PENDING',
      },
    });
  }

  async updateStatus(id: string, status: AccountStatus) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status },
      include: { wallet: true },
    });
  }

  async updateUser(
    userId: string,
    data: { fullName?: string; phone?: string; profileImage?: string },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.fullName !== undefined && { fullName: data.fullName }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
      },
      include: { wallet: true },
    });
  }
}
