import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('transaction')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async transaction(@Body() dto: CreateTransactionDto) {
    const res: any = await this.walletService.createTransaction(dto);
    return {
      transactionId: res.transaction.transactionId,
      type: res.transaction.type,
      amountPiasters: res.transaction.amountPiasters,
      currency: res.transaction.currency,
      createdAt: res.transaction.createdAt,
      balancePiasters: res.balancePiasters,
    };
  }
}
