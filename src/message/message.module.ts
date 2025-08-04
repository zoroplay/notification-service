/* eslint-disable prettier/prettier */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [CacheModule.register({ isGlobal: true })],
  controllers: [MessageController],
  providers: [PrismaService, MessageService],
})


export class MessageModule {}
