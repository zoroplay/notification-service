import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { GetSettingsRequest, GetUserNotificationsRequest, GetUserNotificationsResponse, HandleNotificationsRequest, HandleNotificationsResponse, SaveSettingsRequest, SaveSettingsResponse, SetReadNotificationsRequest, SetReadNotificationsResponse, SettingData } from './proto/noti.pb';
import { Notifications } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) { }

  response(value: any): {
    userId: number;
    description: string;
    title: string;
    status: number;
    createdAt: string;
    id: number;
  } {
    return {
      ...value,
      description: value.description,
      title: value.title,
      status: value.status,
      createdAt: value.createdAt,
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

  async handleUserNotifications({
    userId,
    description,
    title,
  }: HandleNotificationsRequest): Promise<HandleNotificationsResponse> {
    try {
      const user = await this.prisma.notifications.create({
        data: {
          userID: userId,
          description: description,
          title: title,
        },
      });
      const new_user = this.response(user);

      return {
        status: true,
        message: 'Notifications created successfully',
        data: new_user,
      };
    } catch (error) {
      return { status: false, message: error.message, data: null };
    }
  }

  async setReadNotifications({
    id,
  }: SetReadNotificationsRequest): Promise<SetReadNotificationsResponse> {
    try {
      const user = await this.prisma.notifications.update({
        where: {
          id,
        },
        data: {
          status: 1,
        },
      });
      const new_user = this.response(user);
      return {
        status: true,
        message: 'handled read notifications successfully',
        data: new_user,
      };
    } catch (error) {
      return {
        status: false,
        message: error.message,
        data: null,
      };
    }
  }

  async getUserNotifications({
    userId,
  }: GetUserNotificationsRequest): Promise<GetUserNotificationsResponse> {
    const users = await this.prisma.notifications.findMany({
      where: {
        userID: userId,
        status: 0,
      },
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
    let data = [] as SettingData[];
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
