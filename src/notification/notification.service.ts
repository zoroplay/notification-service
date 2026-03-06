/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as webpush from 'web-push';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    if (
      !this.configService.get<string>('VAPID_EMAIL') ||
      !this.configService.get<string>('VAPID_PUBLIC_KEY') ||
      !this.configService.get<string>('VAPID_PRIVATE_KEY')
    ) {
      this.logger.warn(
        'VAPID configuration is incomplete. Push notifications will not work until all VAPID environment variables are set.',
      );
    } else {
      this.logger.log('VAPID configuration loaded successfully');
      webpush.setVapidDetails(
        `mailto:${this.configService.get<string>('VAPID_EMAIL')}`,
        this.configService.get<string>('VAPID_PUBLIC_KEY') || '',
        this.configService.get<string>('VAPID_PRIVATE_KEY') || '',
      );
    }
  }

  async savePushSubscription({
    user_id,
    client_id,
    subscription,
    platform = 'WEB',
  }: {
    user_id: number;
    client_id: number;
    subscription: webpush.PushSubscription;
    platform?: 'WEB' | 'ANDROID' | 'IOS';
  }) {
    try {
      await this.prisma.pushSubscription.upsert({
        where: {
          user_id_endpoint_client_id: {
            user_id: user_id,
            endpoint: subscription.endpoint,
            client_id: client_id,
          },
        },
        update: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          platform,
          updated_at: new Date(),
        },
        create: {
          user_id: user_id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          platform,
          client_id: client_id,
        },
      });

      this.logger.log(`Push subscription saved for user ${user_id} on WEB`);
      return { success: true };
    } catch (error) {
      this.logger.error(`Error saving push subscription: ${error.message}`);
      throw new Error('Failed to save push subscription');
    }
  }

  async sendNotificationToUser({
    user_id,
    client_id,
    notification,
  }: {
    user_id: number;
    client_id: number;
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
      icon?: string;
      badge?: string;
      tag?: string;
    };
  }) {
    try {
      const subscriptions = await this.prisma.pushSubscription.findMany({
        where: { user_id: user_id, client_id: client_id },
      });

      if (!subscriptions.length) {
        this.logger.warn(`No push subscriptions found for user ${user_id}`);
        return { success: false, message: 'No subscriptions found' };
      }
      let notification_id: number | null = null;
      const results = await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          const notificationResult = await this.sendWebPushNotification(
            subscription,
            notification,
          );
          notification_id = notificationResult.notification_id || null;
          return notificationResult;
        }),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      this.logger.log(
        `Sent notifications to user ${user_id}: ${successful} successful, ${failed} failed`,
      );
      return { success: true, successful, failed, notification_id };
    } catch (error) {
      this.logger.error(
        `Error sending notification to user ${user_id}: ${error.message}`,
      );
      throw new Error('Failed to send notification');
    }
  }

  private async sendWebPushNotification(
    subscription: Prisma.PushSubscriptionGetPayload<{
      select: {
        endpoint: true;
        p256dh: true;
        auth: true;
        user_id: true;
        client_id: true;
      };
    }>,
    notification: {
      title: string;
      body: string;
      data?: Record<string, string>;
      icon?: string;
      badge?: string;
      tag?: string;
    },
  ) {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const webPushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        };

        const notifi = await this.prisma.notificationMessage.create({
          data: {
            client_id: subscription.client_id,
            user_id: subscription.user_id,
            title: notification.title,
            content: notification.body,
          },
        });
        const payload = JSON.stringify({
          title: notification.title,
          body: notification.body,
          icon: notification.icon || '/icon-192x192.png',
          badge: notification.badge || '/badge.png',
          tag: notification.tag || 'default',
          data: notification.data
            ? { ...notification.data, notification_id: notifi?.notification_id }
            : { notification_id: notifi?.notification_id },
        });

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 10000);
        });

        const sendPromise = webpush.sendNotification(
          webPushSubscription,
          payload,
        );

        await Promise.race([sendPromise, timeoutPromise]);

        this.logger.log(
          `Push notification sent successfully to user ${subscription.user_id} (attempt ${attempt})`,
        );
        return { success: true, notification_id: notifi?.notification_id };
      } catch (error) {
        lastError = error;

        if (error.statusCode === 410) {
          await this.prisma.pushSubscription.delete({
            where: {
              user_id_endpoint_client_id: {
                user_id: subscription.user_id,
                endpoint: subscription.endpoint,
                client_id: subscription.client_id,
              },
            },
          });
          this.logger.warn(
            `Deleted expired push subscription for user ${subscription.user_id}`,
          );
          throw error;
        }

        const isNetworkError =
          error.message?.includes('EAI_AGAIN') ||
          error.message?.includes('ENOTFOUND') ||
          error.message?.includes('ECONNREFUSED') ||
          error.message?.includes('ETIMEDOUT') ||
          error.message?.includes('Request timeout') ||
          error.code === 'EAI_AGAIN' ||
          error.code === 'ENOTFOUND' ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT';

        if (isNetworkError) {
          this.logger.warn(
            `Network error sending push notification to user ${subscription.user_id} (attempt ${attempt}/${maxRetries}): ${error.message}`,
          );

          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        } else {
          this.logger.error(
            `Non-network error sending push notification: ${error.message}`,
          );
          break;
        }
      }
    }

    this.logger.error(
      `Failed to send push notification to user ${subscription.user_id} after ${maxRetries} attempts: ${lastError?.message}`,
    );
    throw lastError;
  }

  checkVapidConfiguration() {
    const vapidEmail = this.configService.get<string>('VAPID_EMAIL');
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');

    const issues = [];

    if (!vapidEmail) {
      issues.push('VAPID_EMAIL environment variable is not set' as never);
    }
    if (!vapidPublicKey) {
      issues.push('VAPID_PUBLIC_KEY environment variable is not set' as never);
    }
    if (!vapidPrivateKey) {
      issues.push('VAPID_PRIVATE_KEY environment variable is not set' as never);
    }

    return {
      hasIssues: issues.length > 0,
      issues,
      config: {
        email: vapidEmail ? 'Set' : 'Not set',
        publicKey: vapidPublicKey ? 'Set' : 'Not set',
        privateKey: vapidPrivateKey ? 'Set' : 'Not set',
      },
    };
  }
}
