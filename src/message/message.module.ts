/* eslint-disable prettier/prettier */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { IdentityModule } from 'src/identity/identity.module';

@Module({
  imports: [CacheModule.register({ isGlobal: true }), IdentityModule],
  controllers: [MessageController],
  providers: [PrismaService, MessageService],
  exports: [MessageService],
})
export class MessageModule {}
