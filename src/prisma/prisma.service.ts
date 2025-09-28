import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private config: ConfigService) {
    const dbUrl = config.get<string>('DATABASE_URL');
    super({
      datasources: {
        db: {
          url: dbUrl,
        },
      },
    });
  }
}
