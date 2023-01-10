#!/usr/bin/env ts-node
import sodium from "sodium-native";

const [action = "help", ...args] = process.argv.slice(2);

const main = async () => {
  switch (action) {
    case "generate-keypair": {
      const publicKey = Buffer.alloc(sodium.crypto_box_PUBLICKEYBYTES);
      const secretKey = Buffer.alloc(sodium.crypto_box_SECRETKEYBYTES);
      sodium.crypto_box_keypair(publicKey, secretKey);
      console.dir({ publicKey: publicKey.toString("base64"), secretKey: secretKey.toString("base64") });
      break;
    }
    case "random-bytes": {
      const buffer = Buffer.allocUnsafe(args[0] ? parseInt(args[0], 10) : sodium.crypto_secretbox_KEYBYTES);
      sodium.randombytes_buf(buffer);
      console.dir({ buffer: buffer.toString("base64") });
      break;
    }
    default:
      console.log("Sorry, that is not something I know how to do.");
      console.log(`Try generate-keypair, random-bytes`);
  }
};

main();
