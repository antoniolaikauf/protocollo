const bitcoin = require("bitcore-lib");

async function createTransection(pk) {
  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // address a cui inviare soldi
  const sourceAddress = privateKey.toAddress(bitcoin.Networks.testnet);

  const utxos = {
    txId: "c22cd889dbf88ce536b929fe35392333481e45621281d21af1c55350ad4d780d",
    outputIndex: 0,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(sourceAddress),
    satoshis: 5000000,
  };
  console.log(sourceAddress.toString("hex"));
  console.log("Match:", sourceAddress.toString("hex") === utxos.address);

  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 1000) // Add an output with the given amount of satoshis
    .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    .sign();

  return transaction.serialize();
}
function main() {
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  const transection = createTransection(privateKey);
  // inviare transection ad un nodo
  console.log(transection);
}

main();

// https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// https://faucet.testnet4.dev/

/*
mettere soldi su address mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN

transazione c22cd889dbf88ce536b929fe35392333481e45621281d21af1c55350ad4d780d

private key: 793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f, master chain: b2c832d167457da44eaf72ec946e5b9e94a0151f927680528e9b9775000779ec
chiave pubblica: 04ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
chiave pubblica compressa:03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
punto x in SECP256k1: 03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
punto y in SECP256k1: 64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
ADDRESS: b'mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN'


*/
