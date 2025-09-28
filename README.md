<p align="center"> <a href="#" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> </p> <p align="center"> <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a> <a href="https://www.npmjs.com/package/@nestjs/core" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a> <a href="https://www.npmjs.com/package/@nestjs/common" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a> </p> <p align="center"> A simple <a href="https://nestjs.com" target="_blank">NestJS</a> Ledger / Wallet Service with MySQL & Prisma ORM, supporting deposits, withdrawals, atomic balance updates, and idempotent transactions. </p>
Features

Record deposits and withdrawals.

Balance cannot go negative.

Idempotent transaction handling (via transactionId).

Multi-currency support (mock conversion to EGP).

Atomic balance updates using MySQL + Prisma ORM.

Fully tested with Jest (unit & e2e).

Getting Started

1. Clone repository
   git clone <your-repo-url>
   cd ledger-task

2. Install dependencies
   npm install

3. Create Databases in MySQL
   CREATE DATABASE ledger_prod; -- Production / Development
   CREATE DATABASE ledger_test; -- Testing

4. Configure Environment Variables

.env (dev/prod):

DATABASE_URL="mysql://root:password@localhost:3306/ledger_prod"
PORT=3000

.env.test (e2e tests):

DATABASE_URL="mysql://root:password@localhost:3306/ledger_test"
PORT=3001

Replace root:password with your MySQL credentials.

Prisma Setup

# Generate Prisma client

npx prisma generate

# Run migrations for production / development DB

npx prisma migrate dev --name init

# Run migrations for test DB

npm run migrate:test # npm script using .env.test

Optional npm script for test migrations:

"scripts": {
"migrate:test": "dotenv -e .env.test -- npx prisma migrate dev --name init"
}

Running the App

# Development

npm run start:dev

API will be available at:

http://localhost:3000

Endpoint

POST /wallet/transaction → Create a new transaction

Example body:

{
"transactionId": "tx-001",
"type": "deposit",
"amount": 100,
"currency": "EGP"
}

Running Tests

# Run unit tests

npm run test

# Run e2e tests (uses .env.test DB)

npm run test:e2e:testenv

Tests automatically reset the Ledger and Transaction tables before each test.
