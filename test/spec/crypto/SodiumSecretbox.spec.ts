import { CRYPTO_SPLIT_CHAR } from '@mgcrea/fastify-session';
import { SODIUM_SECRETBOX } from 'src/crypto';
import { secretKey, sodiumSecretboxFixture } from 'test/fixtures';
import { describe, expect, it } from 'vitest';

describe('SodiumSecretbox', () => {
  it('should properly encrypt a message', async () => {
    const message = Buffer.from(JSON.stringify({ hello: 'world' }));
    const encrypted = SODIUM_SECRETBOX.sealMessage(message, secretKey);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toEqual('string');
    expect(encrypted.length).toEqual(77);
    expect(encrypted.split(CRYPTO_SPLIT_CHAR).length).toEqual(2);
  });
  it('should properly decrypt an encrypted message', async () => {
    const result = SODIUM_SECRETBOX.unsealMessage(sodiumSecretboxFixture, [secretKey]);
    expect(result).toBeDefined();
    expect(typeof result).toEqual('object');
    expect(Object.keys(result)).toEqual(['buffer', 'rotated']);
    expect(Buffer.isBuffer(result.buffer)).toBeTruthy();
    expect(result.buffer.toString('utf8')).toEqual(JSON.stringify({ hello: 'world' }));
    expect(result.rotated).toBeFalsy();
  });
});
