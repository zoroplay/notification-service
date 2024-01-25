import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsController } from './sms.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [CacheModule.register({ isGlobal: true })],
  controllers: [SmsController],
  providers: [PrismaService, SmsService],
})
export class SmsModule { }
