import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { MockConversionService } from './conversion/mock-conversion.service';

@Injectable()
export class WalletService {
  constructor(
    private prisma: PrismaService,
    private conversion: MockConversionService,
  ) {}

  private toPiasters(amountEgp: number): number {
    return Math.round(amountEgp * 100);
  }

  async createTransaction(dto: CreateTransactionDto) {
    const amountEgp = this.conversion.toEgp(dto.amount, dto.currency);

    const amountPiasters = this.toPiasters(amountEgp);

    const signedAmount =
      dto.type === 'deposit' ? amountPiasters : -amountPiasters;

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.transaction.findUnique({
          where: { transactionId: dto.transactionId },
        });
        if (existing) {
          const ledger = await tx.ledger.findFirst();
          return {
            transaction: existing,
            balancePiasters: ledger?.balancePiasters ?? 0,
          };
        }

        const ledger = await tx.ledger.findUnique({ where: { id: 1 } });
        if (!ledger) {
          throw new BadRequestException('Ledger not initialized');
        }

        const newBalancePiasters = ledger.balancePiasters + signedAmount;

        if (newBalancePiasters < 0) {
          throw new BadRequestException('Insufficient funds');
        }

        const updatedLedger = await tx.ledger.update({
          where: { id: 1 },
          data: {
            balancePiasters: {
              increment: signedAmount,
            },
          },
        });

        const created = await tx.transaction.create({
          data: {
            transactionId: dto.transactionId,
            type: dto.type,
            amountPiasters: signedAmount,
            currency: dto.currency,
            originalAmountMinor: Math.round(dto.amount * 100),
          },
        });

        return {
          transaction: created,
          balancePiasters: updatedLedger.balancePiasters,
        };
      });

      return result;
    } catch (err) {
      if ((err as any)?.code === 'P2002') {
        const existingTransaction = await this.prisma.transaction.findUnique({
          where: { transactionId: dto.transactionId },
        });
        const ledger = await this.prisma.ledger.findFirst();
        return {
          transaction: existingTransaction,
          balancePiasters: ledger?.balancePiasters ?? 0,
        };
      }

      if (err instanceof BadRequestException) throw err;

      throw err;
    }
  }

  // helper for tests
  async getBalancePiasters(): Promise<number> {
    const ledger = await this.prisma.ledger.findFirst();
    return ledger?.balancePiasters ?? 0;
  }
}
