const bitcoin = require("bitcore-lib");
const axios = require("axios");

function createTransection(pk) {
  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  // const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // address a cui inviare soldi
  const address_test = "2N18NxC7uHC36ETaYAjpEeLtG6pJdThB1fz"; // address a cui inviare soldi
  const sourceAddress = privateKey.toAddress(bitcoin.Networks.testnet);

  console.log(bitcoin.Script.buildPublicKeyHashOut(sourceAddress).chunks[2].buf.toString("hex"));

  const utxos = {
    txId: "34f4100aed15f12ebd72df52ad9c2feb8e701f435389c06a69bdad21e61d15a9",
    outputIndex: 0,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(sourceAddress),
    satoshis: 500000, // satoshi che ha la transazione
  };
  // console.log(sourceAddress.toString("hex"));
  // console.log("Match:", sourceAddress.toString("hex") === utxos.address);
  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 400000) // Add an output with the given amount of satoshis
    .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    .fee(fee)
    .sign(privateKey);

  return transaction.serialize();
}

function broadcast(tx) {
  console.log(tx);

  const transactions = axios
    .post("https://mempool.space/testnet4/api/tx", tx, {
      // timeout: 50000,
      headers: {
        "Content-Type": "text/plain",
      },
    })
    .then((responde) => {
      console.log("risposta " + responde);
    })
    .catch((err) => {
      console.log("errore" + err);
    });
}

function main() {
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  // const privateKey = "ed0c2a2bd1f997e911e6b37921a97a6cfd9cadbeda307c1b7616aebedc282434";
  const transection = createTransection(privateKey);
  // inviare transection ad un nodo
  broadcast(transection);
  // console.log(transection);
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




  // var socket = net.createConnection(18333, "161.35.211.215", () => {
  //   console.log("connect");
  // });
  // socket
  //   .on("data", function (data) {
  //     // Log the response from the HTTP server.
  //     console.log("RESPONSE: " + data);
  //   })
  //   .on("connect", function () {
  //     console.log("connect");
  //     // Manually write an HTTP request.
  //     socket.write(tx);
  //   })
  //   .on("end", function () {
  //     console.log("DONE");
  //   });


mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF
  mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN

*/
