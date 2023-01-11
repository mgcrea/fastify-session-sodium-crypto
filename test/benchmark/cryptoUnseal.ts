import { HMAC } from "@mgcrea/fastify-session";
import benchmark from "benchmark";
import { SODIUM_AUTH, SODIUM_SECRETBOX } from "src";
import { hmacFixture, secretKey, sodiumAuthFixture, sodiumSecretboxFixture } from "test/fixtures";

const { Suite } = benchmark;

new Suite()
  .add("SODIUM_SECRETBOX#unsealJson", function () {
    SODIUM_SECRETBOX.unsealMessage(sodiumSecretboxFixture, [secretKey]);
  })
  .add("SODIUM_AUTH#unsealJson", function () {
    SODIUM_AUTH.unsealMessage(sodiumAuthFixture, [secretKey]);
  })
  .add("HMAC#unsealJson", function () {
    HMAC.unsealMessage(hmacFixture, [secretKey]);
  })
  // add listeners
  .on("cycle", function (event: Event) {
    console.log(String(event.target));
  })
  .on("complete", function () {
    // @ts-expect-error this
    console.log("Fastest is " + this.filter("fastest").map("name"));
  })
  // run async
  .run({ async: true });
