import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';
import { IdentityModule } from 'src/identity/identity.module';
import { BettingModule } from 'src/betting/betting.module';

@Module({
  imports: [
    IdentityModule,
    BettingModule,
    CacheModule.register({ isGlobal: true }),
  ],
  controllers: [SmsController],
  providers: [PrismaService, SmsService],
  exports: [SmsService],
})
export class SmsModule {}
