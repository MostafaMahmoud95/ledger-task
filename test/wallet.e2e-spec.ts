import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';

describe('Wallet Service (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = new PrismaClient();

    await prisma.ledger.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.ledger.create({
      data: { id: 1, balancePiasters: 0 },
    });
  });

  beforeEach(async () => {
    await prisma.transaction.deleteMany();
    await prisma.ledger.update({
      where: { id: 1 },
      data: { balancePiasters: 0 },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  const createTransaction = (data: any) => {
    return request(app.getHttpServer()).post('/wallet/transaction').send(data);
  };

  it('Deposit increases balance', async () => {
    const res = await createTransaction({
      transactionId: 'tx-deposit-1',
      type: 'deposit',
      amount: 100,
      currency: 'EGP',
    }).expect(201);

    expect(res.body.balancePiasters).toBe(100 * 100);
  });

  it('Withdrawal decreases balance and fails if insufficient funds', async () => {
    const deposit = await createTransaction({
      transactionId: 'tx-deposit-2',
      type: 'deposit',
      amount: 50,
      currency: 'EGP',
    }).expect(201);

    const balanceAfterDeposit = deposit.body.balancePiasters;

    const withdraw = await createTransaction({
      transactionId: 'tx-withdraw-1',
      type: 'withdrawal',
      amount: 20,
      currency: 'EGP',
    }).expect(201);

    expect(withdraw.body.balancePiasters).toBe(balanceAfterDeposit - 2000);

    const overWithdraw = await createTransaction({
      transactionId: 'tx-withdraw-2',
      type: 'withdrawal',
      amount: 999999,
      currency: 'EGP',
    }).expect(400);

    expect(overWithdraw.body.message).toContain('Insufficient funds');
  });

  it('Multiple concurrent transactions keep the balance consistent', async () => {
    await createTransaction({
      transactionId: 'tx-concurrent-base',
      type: 'deposit',
      amount: 1000,
      currency: 'EGP',
    }).expect(201);

    const promises = Array.from({ length: 10 }).map((_, i) =>
      createTransaction({
        transactionId: `tx-concurrent-${i}`,
        type: 'deposit',
        amount: 10,
        currency: 'EGP',
      }),
    );

    const results = await Promise.all(promises);
    results.forEach((res) => expect(res.status).toBe(201));

    const lastRes = results[results.length - 1];
    const expectedBalance = 1000 * 100 + 10 * 10 * 100;
    expect(lastRes.body.balancePiasters).toBe(expectedBalance);
  });

  it('Idempotent transaction does not duplicate effects', async () => {
    const tx = {
      transactionId: 'tx-idem-1',
      type: 'deposit',
      amount: 30,
      currency: 'EGP',
    };

    const first = await createTransaction(tx).expect(201);
    const balanceAfterFirst = first.body.balancePiasters;

    const second = await createTransaction(tx).expect(201);

    expect(second.body.transactionId).toBe('tx-idem-1');
    const balanceAfterSecond = second.body.balancePiasters;
    expect(balanceAfterSecond).toBe(balanceAfterFirst);
  });
});
