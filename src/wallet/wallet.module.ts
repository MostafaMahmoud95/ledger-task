import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { MockConversionService } from './conversion/mock-conversion.service';

@Module({
  controllers: [WalletController],
  providers: [WalletService, MockConversionService],
})
export class WalletModule {}
