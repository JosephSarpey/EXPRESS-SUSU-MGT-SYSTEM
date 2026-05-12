import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma.service.js';

@Injectable()
export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Email Delivery Worker
   * Runs every 30 seconds. Picks up unsent notifications for CUSTOMER users
   * and simulates sending them via email (Resend integration pending).
   * Skips ADMIN and WORKER users — they only get in-app notifications.
   */
  @Cron('*/30 * * * * *')
  async processEmailDelivery() {
    const unsent = await this.prisma.notification.findMany({
      where: {
        sent: false,
        user: {
          role: 'CUSTOMER',
        },
      },
      include: {
        user: { select: { email: true, fullName: true, role: true } },
      },
      take: 50,
      orderBy: { createdAt: 'asc' },
    });

    if (unsent.length === 0) return;

    this.logger.log(
      `Processing ${unsent.length} notification(s) for email delivery`,
    );

    for (const notification of unsent) {
      try {
        // ── Simulated Resend email ──────────────────────────────
        // Replace this block with actual Resend SDK call when ready:
        //   await resend.emails.send({ from, to, subject, html });
        this.logger.log(
          `[SIMULATED EMAIL] To: ${notification.user.email} | ` +
            `Subject: ${notification.subject ?? '(no subject)'} | ` +
            `Body: ${notification.message}`,
        );
        // ────────────────────────────────────────────────────────

        await this.prisma.notification.update({
          where: { id: notification.id },
          data: {
            sent: true,
            sentAt: new Date(),
          },
        });
      } catch (error) {
        this.logger.error(
          `Failed to send notification ${notification.id}`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  /**
   * Read Notifications Cleanup
   * Runs every Sunday at midnight. Deletes read notifications
   * older than 7 days to keep the database lean.
   */
  @Cron('0 0 * * 0')
  async cleanupReadNotifications() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await this.prisma.notification.deleteMany({
      where: {
        readAt: {
          not: null,
          lt: sevenDaysAgo,
        },
      },
    });

    if (result.count > 0) {
      this.logger.log(
        `Cleanup: deleted ${result.count} read notification(s) older than 7 days`,
      );
    }
  }
}
