import benchmark from "benchmark";
import { SODIUM_AUTH, SODIUM_SECRETBOX } from "src";
import { secretKey } from "test/fixtures";

const jsonMessage = Buffer.from(JSON.stringify({ hello: "world" }));
const { Suite } = benchmark;

new Suite()
  .add("SODIUM_SECRETBOX#sealJson", function () {
    SODIUM_SECRETBOX.sealMessage(jsonMessage, secretKey);
  })
  .add("SODIUM_AUTH#sealJson", function () {
    SODIUM_AUTH.sealMessage(jsonMessage, secretKey);
  })
  // .add("HMAC#sealJson", function () {
  //   HMAC.sealMessage(jsonMessage, secretKey);
  // })
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
