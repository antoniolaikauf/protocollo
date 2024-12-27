const bitcoin = require("bitcoinjs-lib");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

function getPublicKey(pk) {
  const key = ec.keyFromPrivate(pk);
  const publicKey = key.getPublic(true, "hex");
  return publicKey;
}

async function createTransection() {
  const address = "3Mufd9NCPS6HUT6MVpdanQcpc6pcKCczvh";
  const Net = bitcoin.networks.testnet;
  const txb = new bitcoin.Psbt({ Net });

  txb.addInput({});

  txb.addOutput({
    script: Buffer.from(address, "hex"),
    value: 1000000, // Quantità in satoshi (1 BTC = 100,000,000 satoshi)
  });
}
function main() {
  const privateKey = "d2492b1e6e30255e41b729cdd09a4d7710075fdfa566fec0a3f9d875cef331e6";
  const publiKey = getPublicKey(privateKey);
  const transection = createTransection();
  console.log(publiKey);
}

main();
