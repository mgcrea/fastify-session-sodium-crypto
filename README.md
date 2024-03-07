# FastifySession SodiumCrypto

<!-- markdownlint-disable MD033 -->
<p align="center">
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-sodium-crypto">
    <img src="https://img.shields.io/npm/v/@mgcrea/fastify-session-sodium-crypto.svg?style=for-the-badge" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-sodium-crypto">
    <img src="https://img.shields.io/npm/dt/@mgcrea/fastify-session-sodium-crypto.svg?style=for-the-badge" alt="npm total downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-sodium-crypto">
    <img src="https://img.shields.io/npm/dm/@mgcrea/fastify-session-sodium-crypto.svg?style=for-the-badge" alt="npm monthly downloads" />
  </a>
  <a href="https://www.npmjs.com/package/@mgcrea/fastify-session-sodium-crypto">
    <img src="https://img.shields.io/npm/l/@mgcrea/fastify-session-sodium-crypto.svg?style=for-the-badge" alt="npm license" />
  </a>
  <br />
  <a href="https://github.com/mgcrea/fastify-session-sodium-crypto/actions/workflows/main.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/mgcrea/fastify-session-sodium-crypto/main.yml?style=for-the-badge&branch=master" alt="build status" />
  </a>
  <a href="https://depfu.com/github/mgcrea/fastify-session-sodium-crypto">
    <img src="https://img.shields.io/depfu/dependencies/github/mgcrea/fastify-session-sodium-crypto?style=for-the-badge" alt="dependencies status" />
  </a>
</p>
<!-- markdownlint-enable MD037 -->

## Features

Fast sodium-based crypto for [@mgcrea/fastify-session](https://github.com/mgcrea/fastify-session)

- Support both encrypted stateless sessions and signed stateful session with an external store.
- Relies on [sodium-native](https://github.com/sodium-friends/sodium-native) (aka. [libsodium](https://doc.libsodium.org)) to perform crypto.
- Built with [TypeScript](https://www.typescriptlang.org/) for static type checking with exported types along the library.

### Benefits: Libsodium vs. OpenSSL

Node.js uses OpenSSL as its default SSL/TLS implementation. Libsodium and OpenSSL are both popular libraries used for cryptographic operations, but they have different design philosophies and features. The pros of using Libsodium are:

- **Easy-to-use API**: Libsodium is designed to be simple and easy to use. Its API is more straightforward than OpenSSL's, which can help prevent implementation errors and improve code maintainability.
- **Modern cryptography**: Libsodium focuses on modern, secure, and high-performance cryptographic algorithms, such as [ChaCha20](https://en.wikipedia.org/wiki/Salsa20#ChaCha_variant), [Poly1305](https://en.wikipedia.org/wiki/Poly1305), and [Ed25519](https://en.wikipedia.org/wiki/EdDSA). These algorithms are considered more secure and efficient than some older algorithms supported by OpenSSL.
- **Side-channel attack resistance**: Libsodium emphasizes protection against side-channel attacks like timing attacks, which can reveal sensitive information through indirect means.
- **Minimal configuration**: Libsodium requires minimal configuration to use securely, which can help reduce the likelihood of security issues caused by misconfigurations.
- **Constant-time implementations**: Libsodium is designed with constant-time implementations to prevent timing attacks, a concern with some OpenSSL functions.

## Usage

```bash
npm install @mgcrea/fastify-session sodium-native @mgcrea/fastify-session-sodium-crypto --save
# or
pnpm add @mgcrea/fastify-session sodium-native @mgcrea/fastify-session-sodium-crypto
```

### Generate keys

Copy a freshly generated `secretKey` from the bundled cli:

```sh
npx fastify-session-sodium-crypto generate-keypair
```

### Stateful signed session with an external store

Leveraging an external store, the session id (generated with [nanoid](https://github.com/ai/nanoid)) is signed using a
secret-key with
[libsodium's crytpo_auth](https://libsodium.gitbook.io/doc/secret-key_cryptography/secret-key_authentication)

```ts
import createFastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import fastifyCookie from "fastify-cookie";
import fastifySession from "@mgcrea/fastify-session";
import { SODIUM_AUTH } from "@mgcrea/fastify-session-sodium-crypto";

const SESSION_KEY = "Egb/g4RUumlD2YhWYfeDlm5MddajSjGEBhm0OW+yo9s="; // generated secretKey from the cli
const SESSION_TTL = 864e3; // 1 day in seconds
const REDIS_URI = process.env.REDIS_URI || "redis://localhost:6379/1";

export const buildFastify = (options?: FastifyServerOptions): FastifyInstance => {
  const fastify = createFastify(options);

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    key: Buffer.from(SESSION_KEY, "base64"),
    crypto: SODIUM_AUTH,
    store: new RedisStore({ client: new Redis(REDIS_URI), ttl: SESSION_TTL }),
    cookie: { maxAge: SESSION_TTL },
  });

  return fastify;
};
```

### Stateless encrypted session without a store

No external store required, the entire session data is encrypted using a secret-key with
[libsodium's crypto_secretbox_easy](https://libsodium.gitbook.io/doc/secret-key_cryptography/secretbox)

Here we used a `secret` instead of providing a `key`, key derivation will happen automatically on startup.

```ts
import createFastify, { FastifyInstance, FastifyServerOptions } from "fastify";
import fastifyCookie from "fastify-cookie";
import fastifySession from "@mgcrea/fastify-session";
import { SODIUM_SECRETBOX } from "@mgcrea/fastify-session-sodium-crypto";

const SESSION_TTL = 864e3; // 1 day in seconds

export const buildFastify = (options?: FastifyServerOptions): FastifyInstance => {
  const fastify = createFastify(options);

  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    secret: "a secret with minimum length of 32 characters",
    crypto: SODIUM_SECRETBOX,
    cookie: { maxAge: SESSION_TTL },
  });

  return fastify;
};
```

## Benchmarks

### Session crypto sealing

```sh
node --experimental-specifier-resolution=node --loader=ts-paths-esm-loader/transpile-only --no-warnings test/benchmark/cryptoSeal.ts
```

```txt
SODIUM_SECRETBOX#sealJson x 333,747 ops/sec ±0.62% (91 runs sampled)
SODIUM_AUTH#sealJson x 376,300 ops/sec ±0.50% (89 runs sampled)
HMAC#sealJson x 264,292 ops/sec ±3.13% (85 runs sampled)
Fastest is SODIUM_AUTH#sealJson
```

### Session crypto unsealing

```sh
node --experimental-specifier-resolution=node --loader=ts-paths-esm-loader/transpile-only --no-warnings test/benchmark/cryptoUnseal.ts
```

```txt
SODIUM_SECRETBOX#unsealJson x 424,297 ops/sec ±0.69% (86 runs sampled)
SODIUM_AUTH#unsealJson x 314,736 ops/sec ±0.96% (89 runs sampled)
HMAC#unsealJson x 145,037 ops/sec ±5.67% (78 runs sampled)
Fastest is SODIUM_SECRETBOX#unsealJson
```

## Authors

- [Olivier Louvignes](https://github.com/mgcrea) <<olivier@mgcrea.io>>

### Credits

Heavily inspired from

- [fastify-secure-session](https://github.com/fastify/fastify-secure-session) by
  [Matteo Collina](https://github.com/mcollina)
- [fastify-session](https://github.com/SerayaEryn/fastify-session) by [Denis Fäcke](https://github.com/SerayaEryn)
- [express-session](https://github.com/expressjs/session) by [Douglas Wilson](https://github.com/dougwilson)

## License

```txt
The MIT License

Copyright (c) 2023 Olivier Louvignes <olivier@mgcrea.io>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
