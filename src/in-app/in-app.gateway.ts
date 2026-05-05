import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { Notifications } from 'src/proto/noti.pb';

@WebSocketGateway({
  namespace: '/agent-in-app',
  cors: { origin: true, credentials: true },
})

export class InAppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(InAppGateway.name);

  @WebSocketServer()
  server: Server;

  private roomForUser(userId: number): string {
    return `agent:${userId}`;
  }

  handleConnection(client: Socket) {
    const raw =
      client.handshake.auth?.userId ??
      client.handshake.query?.userId ??
      client.handshake.headers['x-user-id'];
    const userId = Number(raw);
    if (!Number.isFinite(userId) || userId <= 0) {
      this.logger.warn(`Rejected socket ${client.id}: missing or invalid userId`);
      client.disconnect(true);
      return;
    }
    void client.join(this.roomForUser(userId));
    this.logger.debug(`Agent ${userId} connected (socket ${client.id})`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Socket disconnected ${client.id}`);
  }

  emitNotificationNew(userId: number, payload: Notifications) {
    this.server.to(this.roomForUser(userId)).emit('notification:new', payload);
  }

  emitNotificationRead(userId: number, payload: Notifications) {
    this.server.to(this.roomForUser(userId)).emit('notification:read', payload);
  }

  emitNotificationDeleted(userId: number, notificationId: number) {
    this.server
      .to(this.roomForUser(userId))
      .emit('notification:deleted', { id: notificationId });
  }
}
