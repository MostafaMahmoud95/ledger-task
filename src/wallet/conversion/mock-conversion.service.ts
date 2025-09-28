import { Injectable } from '@nestjs/common';

@Injectable()
export class MockConversionService {
  private rates: Record<string, number> = {
    EGP: 1,
    USD: 48.0,
    EUR: 57.0,
  };

  toEgp(amount: number, currency: string) {
    const rate = this.rates[currency] ?? 1;
    return amount * rate;
  }
}
