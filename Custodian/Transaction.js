const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");
const bs58check = require("bs58check");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

const address_testTo = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
const address_testFrom = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const inputIndex = 1;
const transaction = "fe4b60b2da921ff3a1b94ed3bb4765e683ac99db855ef466e6d34d52c77c3f18";
const amount = "7d0";
const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";

class Transaction {
  constructor(addressTo, addressFrom, inputIndex, transaction, amount) {
    this.lookTime = reverse("00000000");
    this.hashCodeType = reverse("00000001");
    this.amountOutput = Buffer.from([0x01]);
    this.amount = this.valueOutput(amount).padEnd(16, "0");
    this.sequenza = Buffer.from("ffffffff", "hex");
    this.scriptPubKey = this.reedem(addressTo, "P2SH");
    this.version = reverse("2".padStart(8, "0"));
    this.amountInput = Buffer.from([0x01]);
    this.transaction = reverse(transaction);
    this.inputIndex = reverse(inputIndex.toString().padStart(8, "0"));
    this.LenghtScriptSig = Buffer.from([0x19]); // 25 bytes
    this.emptyScript = this.reedem(addressFrom, "P2PKH");
    this.ScriptSig = this.scriptSig();
    this.addressFrom = addressFrom;
    this.addressTo = addressTo;
  }
  // calcolo amount 16 bytes
  valueOutput(amount) {
    let amountBytes = amount;
    if (amountBytes.length % 2 == 1) amountBytes = amountBytes.padStart(amountBytes.length + 1, "0");
    return reverse(amountBytes);
  }
  // reverse data in little -endian
  reverse(p) {
    return Buffer.from(p, "hex").reverse().join("");
  }

  reedem(address, typeAddress) {
    const decoded = bs58check.default.decode(address);
    const redeemScriptAddress = decoded.slice(1);
    if (typeAddress == "P2PKH") return this.script(redeemScriptAddress);
    else if (typeAddress == "P2SH") return this.scriptP2SH(redeemScriptAddress);
  }

  scriptP2SH(bytes) {
    const S = Buffer.concat([
      Buffer.from([0xa9]), // ---------------
      Buffer.from([0x14]), // butta su 20 bytes
      Buffer.from(bytes, "hex"),
      Buffer.from([0x87]),
    ]);

    return S;
  }

  script(bytes) {
    const S = Buffer.concat([
      Buffer.from([0x76]), // ---------------------
      Buffer.from([0xa9]),
      Buffer.from([0x14]), // butta su 20 bytes
      Buffer.from(bytes, "hex"),
      Buffer.from([0x88]),
      Buffer.from([0xac]),
    ]);

    // console.log(Buffer.from(bytes).toString("hex"));

    // console.log(S.toString("hex"));

    console.log(bitcoin.Script.buildPublicKeyHashOut("2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr").toString());
    return S;
  }

  doubleHash(dataToHash) {
    return crypto.createHash("sha256").update(crypto.createHash("sha256").update(dataToHash).digest("hex")).digest("hex");
  }

  // data for sign
  createData() {
    const tra =
      "02000000000101d923fcc2b77ce7e286d232885cc224f1f39b6a26cf1742877b38ddb4aaa6dec30000000000fdffffff0347a616c3000000001976a9143b4e6e057ca085de765a1deb7dbf92437ba216b788aca0860100000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac0000000000000000196a176661756365742e746573746e6574342e6465762074786e014057b68abd6c2ff5acd88cc30f4b191e38ba900533def654fdf16288ff88e330bc1c24b4a381e563411bcd76dff7f2e22c5706cdb6d0b84da1c338654445ad3e9e00000000";
    const r = doubleHash(tra);
    const data = Buffer.concat([
      Buffer.from(this.version, "hex"),
      this.amountInput, //----------------------
      Buffer.from(r, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.emptyScript.length.toString()]),
      this.emptyScript,
      this.sequenza,
      this.amountOutput,
      Buffer.from(this.amount, "hex"),
      Buffer.from([this.scriptPubKey.length.toString()]),
      this.scriptPubKey,
      Buffer.from(this.lookTime, "hex"),
      Buffer.from(this.hashCodeType, "hex"),
    ]);
    // console.log(this.amountInput);
    // console.log(Buffer.from(r, "hex"));
    // console.log(Buffer.from(this.inputIndex, "hex"));
    console.log(Buffer.from([this.emptyScript.length.toString()]));
    // console.log(this.emptyScript);
    // console.log(this.sequenza);
    // console.log(this.amountOutput);
    // console.log(Buffer.from(this.amount, "hex"));
    // console.log(Buffer.from(this.scriptPubKey.length.toString(16), "hex"));
    // console.log(this.scriptPubKey);
    // console.log(Buffer.from(this.lookTime, "hex"));
    // console.log(Buffer.from(this.hashCodeType, "hex"));

    return data;
  }

  sign(pK) {
    const dataToSign = this.doubleHash(this.createData());
    const keyPair = ec.keyFromPrivate(pK);
    return keyPair.sign(dataToSign).toDER("hex");
  }

  createTransactions() {
    const data = Buffer.concat([
      Buffer.from(this.version, "hex"),
      this.amountInput, //----------------------
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.ScriptSig.length.toString()]),
      this.ScriptSig,
      this.sequenza,
      this.amountOutput,
      Buffer.from(this.amount, "hex"),
      Buffer.from([this.scriptPubKey.length.toString()]),
      this.scriptPubKey,
      Buffer.from(this.lookTime, "hex"),
    ]);
    return data;
  }

  scriptSig() {
    const publicKeyNotCompress = "03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e";
    // const publicKeyNotCompress =
    // "04ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7";
    const signData = Buffer.from(this.sign(privateKey), "hex");

    console.log(signData.length);

    const script = Buffer.concat([
      Buffer.from([signData.length.toString()]), // ----------------
      signData,
      Buffer.from([publicKeyNotCompress.length.toString()]),
      Buffer.from(publicKeyNotCompress, "hex"),
    ]);

    return script;
  }
}

// 02000000
// 01
// 183f7cc7524dd3e666f45e85db99ac83e66547bbd34eb9a1f31f92dab2604bfe
// 01000000
// 6a
// 47
// 3044022062ef09ee63c91d4f4f969c63582649c5d71ac7df702cca6c2c616a68fe7d831802202459fb4e252169749b4041244d530ba79000aa2c3967bf555b71902aed2dbd5b01
// 21
// 03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
// ffffffff
// 01d0070000000000
// 00
// 17a914f1384ced7248c3db7fe1950d415772291fafae848700000000

/*
sto sbagliando lo scriptsig 

mia      0200000001183f7cc7524dd3e666f45e85db99ac83e66547bbd34eb9a1f31f92dab2604bfe01000000
6b4830450220032eae2326cbbfc4e98d48f3107a514edab69f7c902bdb2a35b7e92d1d52d0be022100f22ae5740a7c3ba7c81ec3d91e276c99e2ab69c88f477da80db1e321d4ee7ecb0142
03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
ffffffff
01
d007000000000000
17a914f1384ced7248c3db7fe1950d415772291fafae8487
00000000

libreria 0200000001183f7cc7524dd3e666f45e85db99ac83e66547bbd34eb9a1f31f92dab2604bfe01000000
6a473044022062ef09ee63c91d4f4f969c63582649c5d71ac7df702cca6c2c616a68fe7d831802202459fb4e252169749b4041244d530ba79000aa2c3967bf555b71902aed2dbd5b0121
03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
ffffffff
01
d007000000000000
17a914f1384ced7248c3db7fe1950d415772291fafae8487
00000000

*/
const transaction1 = new Transaction(address_testTo, address_testFrom, inputIndex, transaction, amount);

console.log(transaction1);
console.log("la transazione mia: " + transaction1.createTransactions().toString("hex"));

//---------------------------------------------------
// controllare sopra
//--------------------------------------------------

function createTransection(pk) {
  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  const addressMoney = privateKey.toAddress(bitcoin.Networks.testnet);
  // const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi
  const address_test = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr"; // address a cui inviare soldi
  // const address_test = "2MwVDMAhEX8WptvMNLRrofm4VY6t6K4j1qg"; // address a cui inviare soldi

  const utxos = {
    txId: "fe4b60b2da921ff3a1b94ed3bb4765e683ac99db855ef466e6d34d52c77c3f18",
    outputIndex: 1,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 100000, // satoshi che ha la transazione
  };

  // console.log(addressMoney.toString("hex"));
  // console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 2000) // Add an output with the given amount of satoshis
    // .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    // .fee(fee)
    .sign(privateKey);

  console.log("la transazione libreria: " + transaction);
  return transaction.serialize();
}

function broadcast(tx) {
  // console.log(tx);

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

//   const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
//   const decodedP2SH = bs58check1.default.decode(address);
//   const p2shHash = Buffer.from(decodedP2SH.slice(1), "hex");

//   const script = Buffer.concat([
//     // Buffer.from([0x63]), // OP_IF
//     Buffer.from([0x76]), // OP_DUP
//     Buffer.from([0xa9]), // OP_HASH160 The input is hashed twice: first with SHA-256 and then with RIPEMD-160.
//     Buffer.from([0x14]), // length pubKeyHash (20 byte)
//     p2shHash, // public key doblue hash
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
//         script: script, // Placeholder, usa redeemScript come input
//         satoshis: utxo.satoshis,
//       },
//     ])
//     .to(recipientAddress, 800) // Importo da inviare (0.0007 BTC)
//     .change(addressP2SH) // Indirizzo di cambio
//     .fee(fee);
//   tx.sign(privateKey2); // Firma con la chiave privata associata
//   console.log(tx);

//   //   return tx.serialize();
// }

function main() {
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  // const transection = createTransection1();
  const transection = createTransection(privateKey);
  // broadcast(transection);
}

main();

/*
// https://github.com/bitpay/bitcore-lib/blob/master/docs/examples.md

// https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// https://faucet.testnet4.dev/

*/

function reverse(tx) {
  return Buffer.from(tx, "hex").reverse().toString("hex");
}

function main1() {
  const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);
  const publicKey2 = privateKey2.toPublicKey().toString();
  const p = doubleHash(publicKey2);

  const destinationAddress = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
  const decoded = bs58check.default.decode(destinationAddress);
  const redeemScriptAddress = decoded.slice(1);

  const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
  const decodedP2SH = bs58check.default.decode(address);
  const p2shHash = Buffer.from(decodedP2SH.slice(1), "hex");
  const privateKeyAddressTo = bitcoin.PrivateKey("793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f", bitcoin.Networks.testnet);

  const scriptAddressFrom = bitcoin.Script.buildPublicKeyHashOut(address);
  const publicKeyHash = doubleHash(publicKey2);
  const scriptAddress = bitcoin.Script.buildPublicKeyHashOut(destinationAddress); // script in address
  const publicKey = doubleHash(privateKeyAddressTo.toPublicKey().toString("hex")).toString("hex");

  // script address from OP_DUP OP_HASH160 20 0xf1384ced7248c3db7fe1950d415772291fafae84 OP_EQUALVERIFY OP_CHECKSIG

  const t = doubleHash("03f6a19b3cf3240dad60914626e293410008821f63fc05add0aaf5803791c27a33");
  console.log(t);

  const script = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    p2shHash, //--------------------s
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  console.log("sono qua \n\n" + doubleHash(script).toString("hex") + "\n\n");

  // script address to OP_DUP OP_HASH160 20 0xd320c24246a9245453aa45238e9456fc8aafbcf5 OP_EQUALVERIFY OP_CHECKSIG

  // corretto
  const ScriptPubKey = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    redeemScriptAddress,
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  console.log(ScriptPubKey.toString("hex"));

  const version = reverse("2".padStart(8, "0"));
  const tx_in_count = "01";
  // input
  const hashTXReverse = reverse("2353086dbe5fa4c739408216cc319659df0b3bff41a01456ee702e7e021112e6");
  const indexPrevOutput = reverse("0".padStart(8, "0"));

  const emptyScript = "76a914" + doubleHash(p.toString("hex")).toString("hex") + "88ac";
  const emptyScriptLenght = emptyScript.length.toString(16);
  const sequence = "ffffffff";
  // output
  const tx_out_count = "01";
  // aggiunto 0
  const valueOutput = reverse("06a4").toString("hex").padEnd(16, "0"); // 1700
  const scriptLenghtOutput = ScriptPubKey.length.toString(16).padStart(2, "0");

  const lookTime = reverse("00000000");
  const sigHashCode = reverse("00000001");

  const dataToSign = Buffer.concat([
    Buffer.from(version, "hex"),
    Buffer.from(tx_in_count, "hex"),
    Buffer.from(hashTXReverse, "hex"),
    Buffer.from(indexPrevOutput, "hex"),
    Buffer.from(emptyScriptLenght, "hex"),
    Buffer.from(emptyScript, "hex"),
    Buffer.from(sequence, "hex"),
    Buffer.from(tx_out_count, "hex"),
    Buffer.from(valueOutput, "hex"),
    Buffer.from(scriptLenghtOutput, "hex"),
    ScriptPubKey, // È già un buffer, non serve convertirlo
    Buffer.from(lookTime, "hex"),
    Buffer.from(sigHashCode, "hex"),
  ]);

  const data1 = crypto.createHash("sha256").update(dataToSign).digest();
  const data = crypto.createHash("sha256").update(data1).digest();

  const keyPair = ec.keyFromPrivate("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9");

  const sign = keyPair.sign(data);

  const signatureWithHashType = Buffer.concat([Buffer.from(sign.toDER("hex"), "hex"), Buffer.from([0x01])]);

  const scriptSig = Buffer.concat([
    Buffer.from([signatureWithHashType.length.toString()]),
    signatureWithHashType, // ------------------s-
    // Buffer.from([publicKey2.length]),
    // Buffer.from(publicKey2),
    Buffer.from([script.length.toString()]),
    script,
  ]);

  const scriptLengthInput = scriptSig.length.toString(16).padStart(2, "0");

  const rawTx = Buffer.concat([
    Buffer.from(version, "hex"), // Versione della transazione
    Buffer.from(tx_in_count, "hex"), // Numero di input
    Buffer.from(hashTXReverse, "hex"), // Hash della transazione precedente (invertito)
    Buffer.from(indexPrevOutput, "hex"), // Indice dell'output speso
    Buffer.from(scriptLengthInput, "hex"), // Lunghezza del scriptSig
    scriptSig, // ScriptSig per sbloccare i fondi
    Buffer.from(sequence, "hex"), // Numero di sequenza
    Buffer.from(tx_out_count, "hex"), // Numero di output
    Buffer.from(valueOutput, "hex"), // Valore dell'output
    Buffer.from(scriptLenghtOutput, "hex"), // Lunghezza del script di blocco (ScriptPubKey)
    ScriptPubKey, // Script di blocco per l'output
    Buffer.from(lookTime, "hex"), // Locktime
    // Buffer.from(sigHashCode, "hex"), // Tipo di firma
  ]);

  console.log("la rawtx\n\n" + rawTx.toString("hex") + "\n\n");
}

main1();
