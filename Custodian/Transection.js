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
const buffer = require("bitcore-lib/lib/util/buffer");

function reverse(tx) {
  return Buffer.from(tx, "hex").reverse().toString("hex");
}

function main1() {
  const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);
  const publicKey2 = privateKey2.toPublicKey().toString();
  const publicKeyHash = doubleHash(publicKey2);

  const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";

  const decoded = bs58check.default.decode(address);

  const redeemScriptAddress = Buffer.from(decoded.slice(1));

  /*
  Redeem Script: Questo è lo script che devi fornire per "sbloccare" i fondi in una
  transazione P2SH. Quindi, se qualcuno vuole spendere i fondi destinati all'indirizzo 
  P2SH, deve fornire il redeem script corretto che è stato utilizzato per creare
  l'indirizzo P2SH.
  */

  const script = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    publicKeyHash, // hash public key
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  const redeemScript = doubleHash(script);

  console.log(redeemScript.toString("hex") === redeemScriptAddress.toString("hex"));

  const script1 = Buffer.concat([
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    redeemScript, // redeem script
    Buffer.from([0x87]),
  ]);

  const versionTransection = "02000000";
  const numberInput = "01";
  const hashTXReverse = reverse("9700f600290fe374a9e5314444af042b3738efc4491bf4aeb541bf9faa534e96");
  const indexPrevOutput = "00000000";
  const emptyScript = "00";
  const sequence = "ffffffff";
  const numberOut = "01";
  // aggiunto 0
  const valueOutput = reverse("02bc").toString("hex").padEnd(16, "0"); // 700 satoshis
  const ScriptPubKey = script1;
  const scriptLenghtOutput = ScriptPubKey.length.toString(16).padStart(2, "0");

  const lookTime = "00000000";
  // const sigHashCode = "01000000";

  const dataToSign = Buffer.concat([
    Buffer.from(versionTransection, "hex"),
    Buffer.from(numberInput, "hex"),
    Buffer.from(hashTXReverse, "hex"),
    Buffer.from(indexPrevOutput, "hex"),
    Buffer.from(emptyScript, "hex"),
    Buffer.from(sequence, "hex"),
    Buffer.from(numberOut, "hex"),
    Buffer.from(valueOutput, "hex"),
    Buffer.from(scriptLenghtOutput, "hex"),
    ScriptPubKey, // È già un buffer, non serve convertirlo
    Buffer.from(lookTime, "hex"),
    // Buffer.from(sigHashCode, "hex"),
  ]);

  const keyPair = ec.keyFromPrivate("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9");
  const sign = keyPair.sign(dataToSign);

  const signatureWithHashType = Buffer.concat([
    Buffer.from(sign.toDER("hex"), "hex"),
    // Buffer.from([0x01]), // SIGHASH_ALL
  ]);
  const scriptSig = Buffer.concat([Buffer.from([signatureWithHashType.length]), signatureWithHashType, Buffer.from([script.length]), script]);
  const scriptLengthInput = scriptSig.length.toString(16).padStart(2, "0");

  const rawTx = Buffer.concat([
    Buffer.from(versionTransection, "hex"), // Versione della transazione
    Buffer.from(numberInput, "hex"), // Numero di input
    Buffer.from(hashTXReverse, "hex"), // Hash della transazione precedente (invertito)
    Buffer.from(indexPrevOutput, "hex"), // Indice dell'output speso
    Buffer.from(scriptLengthInput, "hex"), // Lunghezza del scriptSig
    scriptSig, // ScriptSig per sbloccare i fondi
    Buffer.from(sequence, "hex"), // Numero di sequenza
    Buffer.from(numberOut, "hex"), // Numero di output
    Buffer.from(valueOutput, "hex"), // Valore dell'output
    Buffer.from(scriptLenghtOutput, "hex"), // Lunghezza del script di blocco (ScriptPubKey)
    ScriptPubKey, // Script di blocco per l'output
    Buffer.from(lookTime, "hex"), // Locktime
    // Buffer.from(sigHashCode, "hex"), // Tipo di firma
  ]);

  console.log("la rawtx\n\n" + rawTx.toString("hex") + "\n\n");
}

main1();

// 02000000
// 01
// 80b98c54dbab5106d5a1449f4e5fdb9146deca1d48e93d666c5d9290b7c37a3f
// 01000000
// 6b
// 483045022100f0e32ceb205a5056694611afcffe4c1f0e63e9c57382607045ff2c3d9b5b7b3f0220111f0323e56d7462a9299833166569f1a68e1f5090b49bea64f541c494109c6c012102d0648f06a31d47112f1ff7848c85ce54b772c513bc3337c98f081c19d3dca260
// ffffffff
// 02
// 006d7c4d00000000
// 19
// 76a91474d463a046e3175142464740bad692fa0762a93e88ac
// cad5e5f1b5000000
// 19
// 76a914c98fc6bd9c2fd88533f28e6797cfa2a0a0e18ecf88ac
// 00000000

// 02000000
// 01
// 69e435aaf9fb145bea4fb1944cfe8373b240fa4444135e9a473ef092006f0079
// 00000000
// 62
// 473045022100c0e52dbf710c4e7c08bfe9fe81274720c01f8bae2abfe6e6a7326e03c172468a0220523e3392eb73adf78254341611da170264ff4a4a896acfd32e8529f4d16fc7891976a9149ff9f4e7b35c883822d3a0cfc46f6160ca2f740388ac
// ffffffff
// 01
// bc02000000000000
// // 2bc0000000000000
// a9
// 14f1384ced7248c3db7fe1950d415772291fafae8487
// 00000000

// 0200000001964e53aa9fbf41b5aef41b49c4ef38372b04af444431e5a974e30f2900f600970000000062473045022100976f5699e70a07d9c0d7d649a09c1231732499d6c9c220d5a91563f73e60a3c5022026e5be9cf46b2f698c7465a2e7765df40bf6edfaa1027c1e9335920226e8d6ca1976a9149ff9f4e7b35c883822d3a0cfc46f6160ca2f740388acffffffff01bc02000000000000
// 17
// a914f1384ced7248c3db7fe1950d415772291fafae8487
// 00000000
