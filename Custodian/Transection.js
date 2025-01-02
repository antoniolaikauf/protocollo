const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");

function createTransection(pk) {
  // const verifyScriptHash = bitcoin.crypto.Hash.sha256ripemd160(prova);
  // const addressMoney = bitcoin.Address.fromScriptHash(verifyScriptHash, bitcoin.Networks.testnet);
  // console.log(verifyAddress.toString("hex"));

  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  const addressMoney = privateKey.toAddress(bitcoin.Networks.testnet);
  // console.log(privateKey);

  // const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // address a cui inviare soldi
  const address_test = "2N8Wopo3ro4KJ91dp2FBC5UPfjx3fUw7dmG"; // address a cui inviare soldi
  // const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi

  const utxos = {
    txId: "42142e5c568d8028d8b140667b9a80654e824b2cf828dc8676d673f311e01679",
    outputIndex: 1,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 97000, // satoshi che ha la transazione
  };

  console.log(addressMoney.toString("hex"));
  console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 1000) // Add an output with the given amount of satoshis
    .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    .fee(fee)
    .sign(privateKey);

  console.log(transaction);

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
function dubleHash(s) {
  const first_hash = crypto.createHash("sha256").update(s).digest();
  const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
  return scriptHash;
}

function createTransection1(pk) {
  const privateKey2 = new bitcoin.PrivateKey("97401bd9e0c17c8ffdbd24d7e81141c43b4aa31e914a1ae24d05120d55243ee3");

  const t = dubleHash("023e00a721085a54d615ed7b3c3f3d7d188ebe7978be49d338a800d25a75b126a");

  // Lo script che hai già (può essere un P2SH, P2PKH, ecc.)
  const script = Buffer.concat([
    Buffer.from([0x63]), // OP_IF
    Buffer.from([0x76]), // OP_DUP
    Buffer.from([0xa9]), // OP_HASH160
    Buffer.from([0x14]), // Lunghezza pubKeyHash (20 byte) // pubKeyHash
    t,
    Buffer.from([0x88]), // OP_EQUALVERIFY
    Buffer.from([0xac]), // OP_CHECKSIG
    Buffer.from([0x67]), // OP_ELSE
    Buffer.from([0x6a]), // OP_RETURN
    Buffer.from([0x68]), // OP_ENDIF
  ]);

  const p2shAddress = bitcoin.Address.fromScriptHash(bitcoin.crypto.Hash.sha256ripemd160(script), bitcoin.Networks.testnet);

  console.log("Indirizzo P2SH:", p2shAddress.toString());

  // const privateKey1 = new bitcoin.PrivateKey("978340e800569e32b10fd1bac05ddfca28dd2131");
  const verifyScriptHash = bitcoin.crypto.Hash.sha256ripemd160(pk);

  const addressMoney = bitcoin.Address.fromScriptHash(verifyScriptHash, bitcoin.Networks.testnet);

  const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi

  const redeemScript = bitcoin.Script.fromBuffer(script); // Il tuo script P2SH
  // console.log(redeemScript);

  const utxos = {
    txId: "5bc77d66579662f1fe10db6b42dbe19b6add4a81d4ff9fb4c2cad522b55e2308",
    outputIndex: 0,
    address: "2N8Wopo3ro4KJ91dp2FBC5UPfjx3fUw7dmG",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 1000, // satoshi che ha la transazione
  };

  console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 200;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 800) // Add an output with the given amount of satoshis
    .change("2N8Wopo3ro4KJ91dp2FBC5UPfjx3fUw7dmG") // Sets up a change address where the rest of the funds will go
    .fee(fee)
    .sign(privateKey2);
  // console.log(transaction);

  return transaction.serialize({ disableIsFullySigned: true });
}

function main() {
  const prova = Buffer.from([
    0x63, 0x76, 0xa9, 0x14, 0x33, 0xa8, 0x5c, 0x80, 0x1c, 0xe2, 0xb6, 0xa4, 0xbe, 0xc5, 0xf1, 0x68, 0xea, 0xfe, 0x52, 0xe7, 0x8a, 0x4e, 0xdf, 0x21,
    0x88, 0xac, 0x67, 0x6a, 0x68,
  ]);
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  const transection = createTransection1(prova);
  broadcast(transection);
}

main();

/*

Transaction {
  inputs: [
    PublicKeyHashInput {
      witnesses: [],
      output: [Output],
      prevTxId: <Buffer 6b 6c 01 b2 00 da d4 4b dd 14 f8 98 c0 37 d3 b7 21 c6 46 3b 1b ce 63 d4 c9 38 26 f3 76 5d 62 02>,
      outputIndex: 1,
      sequenceNumber: 4294967295,
      _script: [Script],
      _scriptBuffer: <Buffer 48 30 45 02 21 00 bf e6 2b 7e fb 62 e8 39 fb 93 a2 01 b6 98 80 0a 18 02 8d 2b f3 6f 9a ed ae b4 f9 63 51 25 8e bd 02 20 1e 61 8c 1e 31 ad 33 e7 8a 83 ... 57 more bytes>
    }
  ],
  outputs: [
    Output {
      _satoshisBN: [BN],
      _satoshis: 1000,
      _scriptBuffer: <Buffer a9 14 56 75 93 c7 3a 2a 02 9c 9e 82 9a 02 bf 4e 82 b0 5e 3b 36 11 87>,
      _script: [Script]
    },
    Output {
      _satoshisBN: [BN],
      _satoshis: 97000,
      _scriptBuffer: <Buffer 76 a9 14 d3 20 c2 42 46 a9 24 54 53 aa 45 23 8e 94 56 fc 8a af bc f5 88 ac>,
      _script: [Script]
    }
  ],
  _inputAmount: 99000,
  _outputAmount: undefined,
  version: 2,
  nLockTime: 0,
  _changeScript: Script {
    chunks: [ [Object], [Object], [Object], [Object], [Object] ],
    _network: Network {
      name: 'testnet',
      alias: 'testnet',
      is: [Function: is],
      pubkeyhash: 111,
      privatekey: 239,
      scripthash: 196,
      bech32prefix: 'tb',
      xpubkey: 70617039,
      xprivkey: 70615956
    },
    _isOutput: true
  },
  _changeIndex: 1,
  _fee: 1000
}


*/
// https://github.com/bitpay/bitcore-lib/blob/master/docs/examples.md

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
