import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [PrismaModule, ConfigModule.forRoot({ isGlobal: true }), WalletModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
