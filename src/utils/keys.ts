import { SecretKey } from '@mgcrea/fastify-session';
import sodium from 'sodium-native';
import { asBuffer } from './buffer';
import { generateSalt } from './crypto';

export const sanitizeSecretKeys = (key: SecretKey): Buffer[] => {
  const secretKeys: Buffer[] = Array.isArray(key) ? key.map((v) => asBuffer(v, 'base64')) : [asBuffer(key, 'base64')];
  if (secretKeys.some((key) => key.byteLength < sodium.crypto_secretbox_KEYBYTES)) {
    throw new Error(`key lengths must be at least ${sodium.crypto_secretbox_KEYBYTES} bytes`);
  }
  return secretKeys;
};

export const buildKeyFromSecretAndSalt = (secret: Buffer, salt: Buffer = generateSalt()): Buffer => {
  if (Buffer.byteLength(secret) < 32) {
    throw new Error('secret must be at least 32 bytes');
  }

  if (Buffer.byteLength(salt) !== sodium.crypto_pwhash_SALTBYTES) {
    throw new Error('salt must be length ' + sodium.crypto_pwhash_SALTBYTES);
  }

  const key = Buffer.allocUnsafe(sodium.crypto_secretbox_KEYBYTES);

  sodium.crypto_pwhash(
    key,
    secret,
    salt,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  return key;
};
