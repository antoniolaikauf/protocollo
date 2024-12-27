const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair").default; //  npm install ecpair
const ecc = require("tiny-secp256k1"); // npm install tiny-secp256k1

async function createTransection(pk) {
  const ECPair = ECPairFactory(ecc);
  const address = "3QJgBBvCzffdmTAUPTVx9WiqNMkAFs4qzA";
  const Net = bitcoin.networks.testnet;

  const txb = new bitcoin.Psbt({ Net });
  const keyPair = ECPair.fromPrivateKey(new Uint8Array(Buffer.from(pk, "hex")), Net); // Chiave privata in formato esadecimale
  //   const wif = keyPair.toWIF();

  const address_test = "miaRRcydiZjmPBTZUnDCBcCVRcXYMuXEcp";

  txb.addInput({
    hash: "e0dc30d4b02a7686a90df29e4e3313e7dc78e8000bc946e9c4bb343c3080e4ec", // utente deve fornire la id transection
    index: 0, // va in base a quanti output aveva la transazione precedente
    // si utilizza solo se si sta facendo una transazine legacy nonWitnessUtxo: Buffer.from("e0dc30d4b02a7686a90df29e4e3313e7dc78e8000bc946e9c4bb343c3080e4ec", "hex"), // passato transazione precedente come formati bytes
  });

  txb.addOutput({
    script: Buffer.from(address, "hex"),
    value: 1000000, // Quantità in satoshi (1 BTC = 100,000,000 satoshi)
  });
  console.log(txb);

  txb.signInput(0, keyPair);
  //   txb.finalizeAllInputs();
  //   const tx = txb.extractTransaction().toHex();
  //   return tx;
}
function main() {
  const privateKey = "bfe367179a6d6bd53339ad5e7b28c20ebc977af9f87ec48e83c5c4fb4f35bab4";
  const transection = createTransection(privateKey);
  // ora bisogna trasmettere la transazione bitcoin-cli -testnet sendrawtransaction <transactionHex>
  console.log(transection);
}

main();

// https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6
