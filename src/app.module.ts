/* eslint-disable prettier/prettier */
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from "cache-manager-redis-store";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { MessageModule } from "./message/message.module";
import { PrismaService } from './prisma/prisma.service';
import { SmsModule } from "./sms/sms.module";

const configService = new ConfigService();
// export const RedisOptions: CacheModuleAsyncOptions = {
//   isGlobal: true,
//   imports: [ConfigModule],
//   useFactory: async (configService: ConfigService) => {
//     const store = await redisStore({
//       socket: {
//         host: configService.get<string>('REDIS_HOST'),
//         port: parseInt(configService.get<string>('REDIS_PORT')!),
//       },
//     });
//     return {
//       store: () => store,
//       ttl: 3000
//     };
//   },
//   inject: [ConfigService],
// };

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: configService.get<string>('REDIS_HOST'),
      port: parseInt(configService.get<string>('REDIS_PORT')!),
    }),
    SmsModule,
    MessageModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,

  ],
})
export class AppModule { }
