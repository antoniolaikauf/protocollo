const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");

// function createTransection(pk) {
//   // const verifyScriptHash = bitcoin.crypto.Hash.sha256ripemd160(prova);
//   // const addressMoney = bitcoin.Address.fromScriptHash(verifyScriptHash, bitcoin.Networks.testnet);
//   // console.log(verifyAddress.toString("hex"));

//   bitcoin.Networks.add(bitcoin.Networks.testnet);
//   var privateKey = new bitcoin.PrivateKey(pk);
//   const addressMoney = privateKey.toAddress(bitcoin.Networks.testnet);
//   // console.log(privateKey);

//   // const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // address a cui inviare soldi
//   // const address_test = "2N8Wopo3ro4KJ91dp2FBC5UPfjx3fUw7dmG"; // address a cui inviare soldi
//   // const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi
//   const address_test = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr"; // address a cui inviare soldi

//   const utxos = {
//     txId: "9eb4c9af0b93661e23bb93db8076cd86417d630d0c9d4a8d324553c634908866",
//     outputIndex: 1,
//     address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
//     script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
//     satoshis: 500000, // satoshi che ha la transazione
//   };

//   console.log(addressMoney.toString("hex"));
//   console.log("Match:", addressMoney.toString("hex") === utxos.address);

//   const fee = 1000;
//   var transaction = new bitcoin.Transaction()
//     .from(utxos) // Feed information about what unspent outputs one can use
//     .to(address_test, 1000) // Add an output with the given amount of satoshis
//     .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
//     .fee(fee)
//     .sign(privateKey);

//   return transaction.serialize();
// }

// function broadcast(tx) {
//   console.log(tx);

//   const transactions = axios
//     .post("https://mempool.space/testnet4/api/tx", tx, {
//       // timeout: 50000,
//       headers: {
//         "Content-Type": "text/plain",
//       },
//     })
//     .then((responde) => {
//       console.log("risposta " + responde);
//     })
//     .catch((err) => {
//       console.log("errore" + err);
//     });
// }

function doubleHash(s) {
  const first_hash = crypto.createHash("sha256").update(s).digest();
  const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
  return scriptHash;
}

// function createTransection1() {
//   const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);

//   const addressP2SH = new bitcoin.Address("2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr");

//   console.log("P2SH Address:", addressP2SH.toString("hex"));

//   // UTXO disponibile
//   const utxo = {
//     txId: "9700f600290fe374a9e5314444af042b3738efc4491bf4aeb541bf9faa534e96",
//     outputIndex: 1,
//     satoshis: 1000, // 0.001 BTC
//   };

//   const recipientAddress = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // Indirizzo del destinatario
//   const fee = 200;

//   const publicKeyHash = doubleHash(privateKey2.toPublicKey().toString("hex"));

//   const script = Buffer.concat([
//     // Buffer.from([0x63]), // OP_IF
//     Buffer.from([0x76]), // OP_DUP
//     Buffer.from([0xa9]), // OP_HASH160 The input is hashed twice: first with SHA-256 and then with RIPEMD-160.
//     Buffer.from([0x14]), // length pubKeyHash (20 byte)
//     publicKeyHash, // public key doblue hash
//     Buffer.from([0x88]), // OP_EQUALVERIFY
//     Buffer.from([0xac]), // OP_CHECKSIG The signature used by OP_CHECKSIG must be a valid signature for this hash and public key
//     // Buffer.from([0x67]), // OP_ELSE
//     // Buffer.from([0x6a]), // OP_RETURN Marks transaction as invalid
//     // Buffer.from([0x68]), // OP_ENDIF
//   ]);

//   var redeemScript = new bitcoin.Script(script);
//   console.log("ddddddddddddddd     " + redeemScript.toString());

//   // Creazione della transazione
//   const tx = new bitcoin.Transaction()
//     .from([
//       {
//         address: addressP2SH,
//         txId: utxo.txId,
//         outputIndex: utxo.outputIndex,
//         script: bitcoin.Script.buildScriptHashOut(redeemScript), // Placeholder, usa redeemScript come input
//         satoshis: utxo.satoshis,
//       },
//     ])
//     .to(recipientAddress, 800) // Importo da inviare (0.0007 BTC)
//     .change(addressP2SH) // Indirizzo di cambio
//     .fee(fee);
//   tx.sign(privateKey2); // Firma con la chiave privata associata
//   console.log(tx);

//   return tx.serialize();
// }

// function main() {
//   const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
//   const transection = createTransection1();
//   // const transection = createTransection(privateKey);
//   broadcast(transection);
// }

// main();

// */
// // https://github.com/bitpay/bitcore-lib/blob/master/docs/examples.md

// // https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// // https://faucet.testnet4.dev/

// /*
// mettere soldi su address mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN

// transazione c22cd889dbf88ce536b929fe35392333481e45621281d21af1c55350ad4d780d

// private key: 793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f, master chain: b2c832d167457da44eaf72ec946e5b9e94a0151f927680528e9b9775000779ec
// chiave pubblica: 04ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
// chiave pubblica compressa:03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
// punto x in SECP256k1: 03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
// punto y in SECP256k1: 64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
// ADDRESS: b'mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN'

/*
291fafae8487509907000000000
76a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
version 02000000
input count  01
hash tx reverse 66889034c65345328d4a9d0c0d637d4186cd7680db93bb231e66930bafc9b49e01
index transection 000000
script size 6b
script della firma 483045022100bfb9fb765d30d70582c7d5e22aecd93f6253f0545cb456ec6e82ab0e477c4fbf022039ce8e3a9046fa85a88e0f332a96fe97d88076aeb46cfef6b4e2a5c1bb4719e1012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760
Input 1 sequence effffffff
output count 02
output value 1 e803000000000000
public key script lenght 17
public key script a914f1384ced7248c3db7fe1950d415772 lunga 17 
output 2 value 
ouput 2 length 19


02000000
01
66889034c65345328d4a9d0c0d637d4186cd7680db93bb231e66930bafc9b49e
010000
006b483045022100bfb9fb765d30d70582c7d5e22aecd93f6253f0545cb456ec6e82ab0e477c4fbf022039ce8e3a9046fa85a88e0f332a96fe97d88076aeb46cfef6b4e2a5c1bb4719e1012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02e80300000000000017a914f1384ced7248c3db7fe1950d415772291fafae848750990700000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
*/

const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");
const bs58check = require("bs58check");

function reverseTx(tx) {
  return tx.split("").reverse().join("");
}

function main1() {
  const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);
  const publicKey2 = privateKey2.toPublicKey().toString();
  const publicKeyHash = doubleHash(publicKey2);

  const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";

  const decoded = bs58check.default.decode(address);

  const pubKeyHash = Buffer.from(decoded.slice(1));

  /*
  Redeem Script: Questo è lo script che devi fornire per "sbloccare" i fondi in una
  transazione P2SH. Quindi, se qualcuno vuole spendere i fondi destinati all'indirizzo 
  P2SH, deve fornire il redeem script corretto che è stato utilizzato per creare
  l'indirizzo P2SH.
  */

  const script1 = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    pubKeyHash,
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  const script = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    publicKeyHash,
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  const versionTransection = "02000000";
  const numberInput = "01";
  const hashTXReverse = reverseTx("9700f600290fe374a9e5314444af042b3738efc4491bf4aeb541bf9faa534e96");
  const indexPrevOutput = "00000000";
  const sequence = "ffffffff";
  const numberOut = "01";
  const valueOutput = "2bc0000000000000";
  const scriptLenghtOutput = "19";
  const scriptPubKeyOutput = script1.toString("hex");
  const lookTime = "00000000";

  const dataToSign = Buffer.concat([
    Buffer.from(versionTransection),
    Buffer.from(numberInput),
    Buffer.from(hashTXReverse),
    Buffer.from(indexPrevOutput),
    Buffer.from(sequence),
    Buffer.from(numberOut),
    Buffer.from(valueOutput),
    Buffer.from(scriptLenghtOutput),
    Buffer.from(scriptPubKeyOutput),
    Buffer.from(lookTime),
  ]);

  const keyPair = ec.keyFromPrivate("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9");
  const sign = keyPair.sign(dataToSign);
  const signScriptInput = [sign.toDER("hex"), script.toString("hex")];

  const rawTx = Buffer.concat([
    Buffer.from(versionTransection),
    Buffer.from(numberInput),
    Buffer.from(hashTXReverse),
    Buffer.from(indexPrevOutput),
    Buffer.from(signScriptInput.join("")),
    Buffer.from(sequence),
    Buffer.from(numberOut),
    Buffer.from(valueOutput),
    Buffer.from(scriptLenghtOutput),
    Buffer.from(scriptPubKeyOutput),
    Buffer.from(lookTime),
  ]);

  console.log("la rawtx\n" + rawTx + "\n\n");
}

main1();