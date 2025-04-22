# @withton/package

A TypeScript package for integrating TON blockchain wallets into your applications.

## Installation

```bash
npm install @withton/package
# or
yarn add @withton/package
# or
pnpm add @withton/package
```

## Features

- TON wallet connection management
- Transaction handling
- Balance checking
- Session management
- TypeScript support

## Usage

```typescript
import { WithTon } from '@withton/package';

// Initialize the package
const withTon = new WithTon();

// Connect to a wallet
const wallet = await withTon.connect({
  name: 'Tonkeeper',
  appName: 'My App',
  iconUrl: 'https://example.com/icon.png',
  aboutUrl: 'https://example.com',
  platforms: ['ios', 'android', 'chrome', 'firefox', 'safari']
});

// Send a transaction
const transaction = await withTon.sendTransaction({
  to: 'EQ...',
  value: '0.1',
  comment: 'Payment'
});

// Check balance
const balance = await withTon.getBalance();

// Disconnect
await withTon.disconnect();
```

## API Reference

### WithTon Class

The main class for interacting with TON wallets.

#### Methods

- `connect(options: WalletDetails): Promise<Wallet>`
- `disconnect(): Promise<void>`
- `sendTransaction(options: TransactionOptions): Promise<Transaction>`
- `getBalance(): Promise<string>`
- `hasSession(): boolean`
- `isPaused(): boolean`
- `validateBalance(amount: string): Promise<boolean>`

### Types

```typescript
interface WalletDetails {
  name: string;
  appName: string;
  iconUrl: string;
  aboutUrl: string;
  platforms: string[];
}

interface TransactionOptions {
  to: string;
  value: string;
  comment?: string;
}
```

## License

MIT 