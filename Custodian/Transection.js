const bitcoin = require("bitcore-lib");
const ECPairFactory = require("ecpair").default; //  npm install ecpair
const ecc = require("tiny-secp256k1"); // npm install tiny-secp256k1

async function createTransection(pk) {
  var privateKey = new bitcoin.PrivateKey(pk);
  const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // dove ci sono i soldi
  const sourceAddress = privateKey.toAddress();
  const utxos = {
    txId: "a44738ee268d5d821ebb9e425f920d759ba3b0d1402d10fd03bd89459c786d97",
    outputIndex: 0,
    address: "miaRRcydiZjmPBTZUnDCBcCVRcXYMuXEcp",
    script: bitcoin.Script.buildPublicKeyHashOut(sourceAddress),
    satoshis: 5000000,
  };
  // console.log(utxos);

  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 1000) // Add an output with the given amount of satoshis
    .change("miaRRcydiZjmPBTZUnDCBcCVRcXYMuXEcp") // Sets up a change address where the rest of the funds will go
    .sign(privateKey);

  console.log(transaction);
}
function main() {
  const privateKey = "8f180c07802fcc099b5099daac2e0f79b1ab140c66d2f6bb70793054955e677c";
  const transection = createTransection(privateKey);
  // ora bisogna trasmettere la transazione bitcoin-cli -testnet sendrawtransaction <transactionHex>
  console.log(transection);
}

main();

// https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// https://faucet.testnet4.dev/
/*
445248d07b131da7b567e91aa61ca149f1a796b5d48b79554b97dd0e47816fd1
transazione a44738ee268d5d821ebb9e425f920d759ba3b0d1402d10fd03bd89459c786d97


SPAZZATURA   // const ECPair = ECPairFactory(ecc);
  // const address = "mrJhTh6LBoMTVtqBDw9crVMtJku8yvHhP8";
  // const Net = bitcoin.networks.testnet;
  // //mupuDAkY5vc96uyzBJx7DQSgQpquNd6VpS
  // const alice = ECPair.fromWIF("937hVBDkgrcWPjDqZocdQ9ErUsbKRxY7MmQ6Av38LxMujWEiN1h", Net);
  // const txb = new bitcoin.Psbt({ Net });
  // // const keyPair = ECPair.fromPrivateKey(new Uint8Array(Buffer.from(pk, "hex")), Net); // Chiave privata in formato esadecimale
  // // const address_test = "miaRRcydiZjmPBTZUnDCBcCVRcXYMuXEcp"; // dove ci sono i soldi
  // txb.addInput({
  //   hash: "445248d07b131da7b567e91aa61ca149f1a796b5d48b79554b97dd0e47816fd1", // utente deve fornire la id transection
  //   index: 0,
  //   nonWitnessUtxo: Buffer.from(
  //     "02000000000101fd34791cc6e9c3aba4e31a12f416733fc21298b0cdaa53b80ca58c9d1be046cd0100000000fdffffff0320a10700000000001976a91406c0aa6ab779c914b9558cf4a65087fcecff709388ac0000000000000000196a176661756365742e746573746e6574342e6465762074786ec6f487a2010000001976a9148baacd3f6d53f896fa25ca1c5e3823682abbda5288ac01408ce6b4e40d3d3298400646db7f6f88608bc87a6b478a1495e98a56b8b6daf40a9056605039c43c41de11cff1d4cb538fe869b32723266b3286bfc8cef43e7fdd00000000",
  //     "hex"
  //   ),
  // });
  // txb.addOutput({
  //   script: Buffer.from(address, "hex"),
  //   value: 1000, // Quantità in satoshi (1 BTC = 100,000,000 satoshi)
  // });
  // console.log(txb);
  // txb.signInput(0, keyPair);
  //   txb.finalizeAllInputs();
  //   const tx = txb.extractTransaction().toHex();
  //   return tx;
*/
