import { CRYPTO_SPLIT_CHAR } from "@mgcrea/fastify-session";
import { SODIUM_AUTH } from "src/crypto";
import { secretKey, sodiumAuthFixture } from "test/fixtures";
import { describe, expect, it } from "vitest";

describe("SodiumAuth", () => {
  it("should properly sign a message", async () => {
    const message = Buffer.from(JSON.stringify({ hello: "world" }));
    const signed = SODIUM_AUTH.sealMessage(message, secretKey);
    expect(signed).toBeDefined();
    expect(typeof signed).toBe("string");
    expect(signed.length).toBe(69);
    expect(signed.split(CRYPTO_SPLIT_CHAR).length).toBe(2);
  });

  it("should properly verify a signed message", async () => {
    const result = SODIUM_AUTH.unsealMessage(sodiumAuthFixture, [secretKey]);
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
    expect(Object.keys(result)).toEqual(["buffer", "rotated"]);
    expect(Buffer.isBuffer(result.buffer)).toBeTruthy();
    expect(result.buffer.toString("utf8")).toEqual(JSON.stringify({ hello: "world" }));
    expect(result.rotated).toBeFalsy();
  });
});
