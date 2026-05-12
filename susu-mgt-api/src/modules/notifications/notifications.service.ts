import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma.service.js';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    type: 'EMAIL' | 'SMS' | 'SYSTEM';
    subject?: string;
    message: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async listForUser(userId: string, params?: { page: number; limit: number }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = { userId };

    const [total, data] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
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

  async listAll(params?: { page: number; limit: number }) {
    const page =
      params && Number.isFinite(params.page) && params.page > 0
        ? params.page
        : 1;
    const limit =
      params && Number.isFinite(params.limit) && params.limit > 0
        ? Math.min(params.limit, 100)
        : 20;

    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.findMany({
        include: {
          user: { select: { fullName: true, email: true, role: true } },
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

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        'You can only mark your own notifications as read',
      );
    }

    if (notification.readAt) {
      return notification;
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });

    return { updated: result.count };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return { unreadCount: count };
  }
}
