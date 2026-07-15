import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { DeleteAgentNotificationRequest, GetSettingsRequest, GetSettingsResponse, GetUserNotificationsRequest, HandleNotificationsRequest, NOTIFICATION_SERVICE_NAME, NotifyCampaignAwardRequest, NotifyCampaignAwardResponse, SaveSettingsRequest, SaveSettingsResponse, SetReadNotificationsRequest } from './proto/noti.pb';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }

  @Get()
  root() {
    return {
      ok: true,
      service: 'notification-service',
      message: 'HTTP server is running (gRPC + Socket.IO /agent-in-app)',
    };
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SaveSettings')
  async SaveSettings(
    saveSettings: SaveSettingsRequest,
  ): Promise<SaveSettingsResponse> {
    return this.appService.saveSettings(saveSettings);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetSettings')
  async GetSettings(data: GetSettingsRequest): Promise<GetSettingsResponse> {
    const res = await this.appService.getSettings(data);
    return res;
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'SetReadNotifications')
  async SetReadNotifications(
    SetReadNotificationsDto: SetReadNotificationsRequest,
  ) {
    return this.appService.setReadNotifications(SetReadNotificationsDto);
  }
  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'GetUserNotifications')
  async GetUserNotifications(
    GetUserNotificationsDto: GetUserNotificationsRequest,
  ) {
    return this.appService.getUserNotifications(GetUserNotificationsDto);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'DeleteAgentNotification')
  async DeleteAgentNotification(dto: DeleteAgentNotificationRequest) {
    return this.appService.deleteAgentNotification(dto);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'HandleNotifications')
  async HandleNotifications(
    HandleNotificationsDto: HandleNotificationsRequest,
  ) {
    return this.appService.handleUserNotifications(HandleNotificationsDto);
  }

  @GrpcMethod(NOTIFICATION_SERVICE_NAME, 'NotifyCampaignAward')
  async NotifyCampaignAward(
    dto: NotifyCampaignAwardRequest,
  ): Promise<NotifyCampaignAwardResponse> {
    return this.appService.notifyCampaignAward(dto);
  }

}
