import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  NOTIFICATION_SERVICE_NAME,
  SavePushSubscriptionRequest,
  SendNotificationToUserRequest,
} from 'src/proto/noti.pb';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SavePushSubscription')
  savePushSubscription(payload: SavePushSubscriptionRequest) {
    return this.notificationService.savePushSubscription({
      user_id: payload.userId,
      client_id: payload.clientId,
      subscription: {
        endpoint: payload.endpoint,
        keys: {
          p256dh: payload.p256dh,
          auth: payload.auth,
        },
      },
      platform: (payload.platform as 'WEB' | 'ANDROID' | 'IOS') ?? 'WEB',
    });
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SendNotificationToUser')
  sendNotificationToUser(payload: SendNotificationToUserRequest) {
    return this.notificationService.sendNotificationToUser({
      user_id: payload.userId,
      notification: payload.notification,
      client_id: payload.clientId,
    });
  }
}
