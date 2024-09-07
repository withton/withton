Here's a template for a README document that you can use to describe your `@withton/bridge` package. This template includes sections that are commonly found in documentation for npm packages:

---

# @withton/bridge

`@withton/bridge` is a powerful and flexible library designed to facilitate secure communication and data exchange between different components or services within your application. It leverages cryptographic techniques to ensure the integrity and confidentiality of the data being transmitted.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Configuration](#configuration)
- [Examples](#examples)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install the `@withton/bridge` package, you can use npm or yarn:

### Using npm:

```bash
npm install @withton/bridge --save
```

### Using yarn:

```bash
yarn add @withton/bridge
```

## Usage

Here's a basic example of how to use the `@withton/bridge` package:

```javascript
import { SessionCrypto } from '@withton/bridge';

// Initialize the bridge with a generated key pair or an existing one
const crypto = new SessionCrypto();
await crypto.initialize(); // if async initialization is required

// Encrypt a message to send securely
const receiverPublicKey = 'receiver-public-key-in-hex';
const encryptedMessage = await crypto.encrypt('Hello, World!', receiverPublicKey);

// Decrypt a received message
const senderPublicKey = 'sender-public-key-in-hex';
const decryptedMessage = await crypto.decrypt(encryptedMessage, senderPublicKey);

console.log('Decrypted Message:', decryptedMessage);
```

## API Reference

### SessionCrypto Class

#### `constructor(keyGen?: KeyGen)`

- **Parameters:**
  - `keyGen` (optional): An object containing a `publicKey` and `secretKey`. If not provided, a new key pair will be generated.

#### `initialize(keyGen?: KeyGen): Promise<void>`

- **Description:** Initializes the `SessionCrypto` instance. Must be called if async operations are used to generate keys.

#### `encrypt(message: string, receiverPublicKey: string): Promise<Uint8Array>`

- **Parameters:**
  - `message`: The plaintext message to encrypt.
  - `receiverPublicKey`: The public key of the message recipient.

- **Returns:** A `Promise` that resolves to an `Uint8Array` containing the encrypted message.

#### `decrypt(message: Uint8Array, senderPublicKey: string): Promise<string>`

- **Parameters:**
  - `message`: The encrypted message as a `Uint8Array`.
  - `senderPublicKey`: The public key of the sender.

- **Returns:** A `Promise` that resolves to the decrypted message as a string.

#### `stringifyKeyGen(): KeyGen`

- **Returns:** An object containing the `publicKey` and `secretKey` in hex format.

## Configuration

You can configure `@withton/bridge` to suit your needs by modifying the properties and methods within the `SessionCrypto` class. The library is designed to be flexible and can integrate with various cryptographic schemes depending on your security requirements.

## Examples

### Example 1: Basic Usage

```javascript
import { SessionCrypto } from '@withton/bridge';

(async () => {
    const crypto = new SessionCrypto();
    await crypto.initialize();

    const receiverPublicKey = 'receiver-public-key-in-hex';
    const encryptedMessage = await crypto.encrypt('Secure Message', receiverPublicKey);

    const decryptedMessage = await crypto.decrypt(encryptedMessage, 'sender-public-key-in-hex');
    console.log('Decrypted:', decryptedMessage);
})();
```

### Example 2: Using an Existing Key Pair

```javascript
import { SessionCrypto } from '@withton/bridge';

const existingKeyPair = {
  publicKey: 'your-public-key',
  secretKey: 'your-secret-key'
};

const crypto = new SessionCrypto(existingKeyPair);
// No need to initialize, since we're using an existing key pair
```

## Security

`@withton/bridge` uses modern cryptographic practices to ensure data integrity and confidentiality. It is recommended to use strong, random keys and securely manage them. Always keep your secret keys private and never expose them in your code or logs.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to improve the package or its documentation.

### How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add new feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

### Additional Notes:
- Replace the placeholder values like `receiver-public-key-in-hex` and `sender-public-key-in-hex` with actual values as per your usage.
- If you have more complex configurations or usage examples, you can add them to the appropriate sections.
- Ensure that all security practices are clearly mentioned, especially when dealing with cryptographic functions.

This README template should give users a clear understanding of how to use your package and provide them with the necessary information to get started quickly.
