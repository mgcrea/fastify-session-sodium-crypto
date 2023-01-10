import { CRYPTO_SPLIT_CHAR } from "@mgcrea/fastify-session";

export const sodiumSecretboxFixture = `aNadtnJGpxwouemOHO7n+rL1fKn83iKD+GB9XgZyTRsF${CRYPTO_SPLIT_CHAR}U4f4jGtSx+9rPqgzlztQ1hdEMtGaKUEi`;

export const sodiumAuthFixture = `eyJoZWxsbyI6IndvcmxkIn0=${CRYPTO_SPLIT_CHAR}oRQUCkLcVn05En8mVOJYMh3PjVKN+96Tg6zhYs4YsvY=`;
