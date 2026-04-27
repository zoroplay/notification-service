/* eslint-disable prettier/prettier */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { IdentityModule } from 'src/identity/identity.module';
import { BettingModule } from 'src/betting/betting.module';
import { SmsModule } from 'src/sms/sms.module';
import { SmsService } from 'src/sms/sms.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [IdentityModule, BettingModule, SmsModule, CacheModule.register({ isGlobal: true })],
  controllers: [MessageController],
  providers: [PrismaService, MessageService, SmsService, EmailService],
})
export class MessageModule { }
