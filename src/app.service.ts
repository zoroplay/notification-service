import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import {
  DeleteAgentNotificationRequest,
  DeleteAgentNotificationResponse,
  GetSettingsRequest,
  GetUserNotificationsRequest,
  GetUserNotificationsResponse,
  HandleNotificationsRequest,
  HandleNotificationsResponse,
  SaveSettingsRequest,
  SaveSettingsResponse,
  SetReadNotificationsRequest,
  SetReadNotificationsResponse,
  SettingData,
} from './proto/noti.pb';
import { InAppGateway } from './in-app/in-app.gateway';

@Injectable()
export class AppService {
  constructor(
    private prisma: PrismaService,
    private readonly inAppGateway: InAppGateway,
  ) {}

  response(value: any): {
    userId: number;
    description: string;
    title: string;
    status: number;
    createdAt: string;
    id: number;
  } {
    const createdAt =
      value.createdAt instanceof Date
        ? value.createdAt.toISOString()
        : String(value.createdAt ?? '');
    return {
      ...value,
      description: value.description,
      title: value.title,
      status: value.status,
      createdAt,
      id: value.id,
      userId: value.userID,
    };
  }

  async saveSettings(
    _request: SaveSettingsRequest,
  ): Promise<SaveSettingsResponse> {
    try {
      const data = {
        displayName: _request.displayName,
        gatewayName: _request.gatewayName,
        apiKey: _request.apiKey,
        username: _request.username,
        password: _request.password,
        status: _request.enable,
        senderID: _request.senderID,
        clientID: _request.clientId,
      };

      if (_request.settingsID) {
        const is_settings_id = await this.prisma.settings.findUnique({
          where: {
            id: _request.settingsID,
          },
        });

        if (!is_settings_id)
          return {
            status: false,
            message: `The Id sent does not exist in database, verify`,
          };

        await this.prisma.settings.update({
          where: {
            id: _request.settingsID,
          },
          data,
        });

        if (is_settings_id.status) {
          await this.prisma.settings.updateMany({
            where: {
              id: {
                not: _request.settingsID,
              },
            },
            data: {
              status: false,
            },
          });
        }
      } else {
        const newSetting = await this.prisma.settings.create({ data });

        if (newSetting.status) {
          await this.prisma.settings.updateMany({
            where: {
              id: {
                not: newSetting.id,
              },
            },
            data: {
              status: false,
            },
          });
        }
      }
      return { status: true, message: 'Settings saved sucessfully' };
    } catch (error) {
      return { status: false, message: `Failed to send SMS: ${error.message}` };
    }
  }

  private resolveNotificationRecipientIds(
    request: HandleNotificationsRequest,
  ): number[] {
    const fromList = (request.userIds ?? []).filter(
      (id) => Number.isFinite(id) && id > 0,
    );
    if (fromList.length > 0) {
      return [...new Set(fromList)];
    }
    if (request.userId > 0) {
      return [request.userId];
    }
    return [];
  }

  async handleUserNotifications(
    request: HandleNotificationsRequest,
  ): Promise<HandleNotificationsResponse> {
    const recipientIds = this.resolveNotificationRecipientIds(request);
    if (recipientIds.length === 0) {
      return {
        status: false,
        message: 'No recipient user ids',
        data: undefined,
        dataList: [],
      };
    }

    const { description, title } = request;
    try {
      const rows = await this.prisma.$transaction(
        recipientIds.map((uid) =>
          this.prisma.notifications.create({
            data: {
              userID: uid,
              description,
              title,
            },
          }),
        ),
      );

      const dataList = rows.map((row) => this.response(row));
      for (let i = 0; i < rows.length; i++) {
        this.inAppGateway.emitNotificationNew(recipientIds[i], dataList[i]);
      }

      return {
        status: true,
        message: 'Notifications created successfully',
        data: dataList[0],
        dataList,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        data: undefined,
        dataList: [],
      };
    }
  }

  async setReadNotifications({
    id,
    userId,
  }: SetReadNotificationsRequest): Promise<SetReadNotificationsResponse> {
    try {
      const existing = await this.prisma.notifications.findFirst({
        where: { id, deletedAt: null },
      });
      if (!existing) {
        return {
          status: false,
          message: 'Notification not found',
          data: undefined,
        };
      }
      if (
        userId !== undefined &&
        userId !== null &&
        existing.userID !== userId
      ) {
        return {
          status: false,
          message: 'Forbidden',
          data: undefined,
        };
      }
      const user = await this.prisma.notifications.update({
        where: {
          id,
        },
        data: {
          status: 1,
        },
      });
      const new_user = this.response(user);
      this.inAppGateway.emitNotificationRead(user.userID, new_user);
      return {
        status: true,
        message: 'handled read notifications successfully',
        data: new_user,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        data: undefined,
      };
    }
  }

  async deleteAgentNotification({
    id,
    userId,
  }: DeleteAgentNotificationRequest): Promise<DeleteAgentNotificationResponse> {
    try {
      const existing = await this.prisma.notifications.findFirst({
        where: { id, userID: userId, deletedAt: null },
      });
      if (!existing) {
        return { status: false, message: 'Notification not found' };
      }
      await this.prisma.notifications.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      this.inAppGateway.emitNotificationDeleted(userId, id);
      return { status: true, message: 'Notification deleted' };
    } catch (error) {
      return { status: false, message: error.message };
    }
  }

  async getUserNotifications({
    userId,
    includeRead,
  }: GetUserNotificationsRequest): Promise<GetUserNotificationsResponse> {
    const users = await this.prisma.notifications.findMany({
      where: {
        userID: userId,
        deletedAt: null,
        ...(includeRead ? {} : { status: 0 }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const handled_users = await Promise.all(
      users.map((user) => {
        return this.response(user);
      }),
    );
    return {
      status: true,
      message: 'Notifications retrieved successfully',
      data: handled_users,
    };
  }

  async getSettings({ clientId }: GetSettingsRequest): Promise<any> {
    const data = [] as SettingData[];
    const settings = await this.prisma.settings.findMany({
      where: { clientID: clientId },
    });

    // build data
    if (settings.length) {
      for (const setting of settings) {
        data.push({
          id: setting.id,
          senderID: setting.senderID,
          displayName: setting.displayName,
          gatewayName: setting.gatewayName,
          apiKey: setting.apiKey,
          status: setting.status,
          username: setting.username,
          password: setting.password,
        });
      }
    }

    return { status: true, message: 'Settings retrieved successfully', data };
  }
}
