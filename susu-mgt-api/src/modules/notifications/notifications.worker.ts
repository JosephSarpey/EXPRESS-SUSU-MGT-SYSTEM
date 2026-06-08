import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma.service.js';
import { Resend } from 'resend';

@Injectable()
export class NotificationsWorker {
  private readonly logger = new Logger(NotificationsWorker.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
    this.fromEmail =
      this.config.get<string>('RESEND_FROM_EMAIL') ||
      'noreply@uniquecapitalsavings.com';
  }

  /**
   * Email Delivery Worker
   * Runs every 30 seconds. Picks up unsent notifications for CUSTOMER users
   * or notification of type EMAIL, and sends them via Resend.
   */
  @Cron('*/30 * * * * *')
  async processEmailDelivery() {
    const unsent = await this.prisma.notification.findMany({
      where: {
        sent: false,
        OR: [
          { type: 'EMAIL' },
          {
            user: {
              role: 'CUSTOMER',
            },
          },
        ],
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
        if (!notification.user?.email) {
          throw new Error(`User does not have an email address`);
        }

        const subject = notification.subject || 'Notification';

        const { error } = await this.resend.emails.send({
          from: this.fromEmail,
          to: notification.user.email,
          subject,
          text: notification.message,
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .bg-wrapper { background-color: #030712 !important; color: #f3f4f6 !important; }
      .bg-container { background-color: #030712 !important; }
      .text-title { color: #34d399 !important; }
      .text-body { color: #d1d5db !important; }
      .text-muted { color: #9ca3af !important; }
      hr { border-top-color: #1f2937 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: sans-serif; text-align: center; background-color: #f9fafb;">
  <div class="bg-wrapper" style="background-color: #f9fafb; padding: 32px; font-family: sans-serif; text-align: center; color: #111827;">
    <div class="bg-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 24px; border-radius: 8px;">
      
      <img src="https://www.uniquecapitalsavings.com/logo2.jpg" alt="Unique Capital Savings" width="120" style="width: 120px; max-width: 100%; height: auto; margin-bottom: 32px; display: inline-block;" />
      
      <h2 class="text-title" style="color: #059669; font-size: 24px; margin-bottom: 16px; margin-top: 0;">${subject}</h2>
      
      <p class="text-body" style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 24px; white-space: pre-wrap; text-align: left;">Hello ${notification.user.fullName},

${notification.message}</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0 24px;" />
      <p class="text-muted" style="font-size: 12px; color: #6b7280; text-align: center; margin: 0;">This email was sent to ${notification.user.fullName} (${notification.user.email}).<br>This is an automated notification from Unique Capital Savings.</p>
    </div>
  </div>
</body>
</html>`,
        });

        if (error) {
          throw new Error(
            `Resend API Error: ${error.message || JSON.stringify(error)}`,
          );
        }

        this.logger.log(
          `Successfully sent email to ${notification.user.email} (Notification ID: ${notification.id})`,
        );

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
