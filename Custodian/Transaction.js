const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");
const bs58check = require("bs58check");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

const address_testTo = "2N646YQJBRKAGJxkqstmYtM9biWApz8wuqD";
const address_testFrom = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const publicKeyNotCompress = "03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e";
const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
const inputIndex = 0;
const transaction = "d7fea33a641b3387677e741abca827fc17c60fd624893abf06ae2490c5ec5bed";
const amountUTXO = 90000;
const amoutUTXOTransaction = 100000;
const fee = 1000;
// 0200000001f778c7deb0d8bbf546a9d9d39ea36f595ec21ac0998fa83aa50dc492ff1c38550100000048473044022057d87046563e7a1094168a7d04bc2f016a41434f7fd73c745bc79424ad211f0502204dd1b099f86f5d111f1da019fa582bc747c98d4167e4b8b7781994bda1a426b301ffffffff02d00700000000000017a914f1384ced7248c3db7fe1950d415772291fafae8487e87a0100000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
// 0200000001f778c7deb0d8bbf546a9d9d39ea36f595ec21ac0998fa83aa50dc492ff1c3855010000006a473044022057d87046563e7a1094168a7d04bc2f016a41434f7fd73c745bc79424ad211f0502204dd1b099f86f5d111f1da019fa582bc747c98d4167e4b8b7781994bda1a426b3012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02d00700000000000017a914f1384ced7248c3db7fe1950d415772291fafae8487e87a0100000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
class Transaction {
  constructor(addressTo, addressFrom, inputIndex, transaction, amount, amountTransaction, fee = 1000, PrivateKey, PublicKey) {
    this.addressTo = addressTo;
    this.addressFrom = addressFrom;
    this.lookTime = reverse("00000000");
    this.hashCodeType = reverse("00000001");
    this.amountOutput = Buffer.from([0x02]);
    this.amount = this.valueOutput(amount).padEnd(16, "0");
    this.scriptPubKey = this.reedem(addressTo);
    this.addressChange = this.reedem(addressFrom);
    this.amountChange = this.valueOutput(amountTransaction - amount - fee).padEnd(16, "0");
    this.sequenza = Buffer.from("ffffffff", "hex");
    this.version = reverse("2".padStart(8, "0"));
    this.amountInput = Buffer.from([0x01]);
    this.transaction = reverse(transaction);
    this.inputIndex = reverse(inputIndex.toString().padStart(8, "0"));
    this.LenghtScriptSig = Buffer.from([0x19]); // 25 bytes
    this.emptyScript = this.reedem(addressFrom);
    this.ScriptSig = this.scriptSig(PrivateKey, PublicKey);
  }

  doubleHash(dataToHash) {
    return crypto.createHash("sha256").update(crypto.createHash("sha256").update(dataToHash).digest()).digest("hex");
  }

  typeAddress(address) {
    // in mainet p2sh inizia con 3 e p2pkh inizia con 1 ora usiamo il testnet
    if (address.startsWith("m") && address.length === 34) return "P2PKH";
    else if (address.startsWith("2") && address.length === 35) return "P2SH";
  }
  // calcolo amount 16 bytes
  valueOutput(amount) {
    let amountBytes = parseInt(amount, "hex").toString(16);
    if (amountBytes.length % 2 == 1) amountBytes = amountBytes.padStart(amountBytes.length + 1, "0");
    return reverse(amountBytes);
  }
  // reverse data in little-endian
  reverse(p) {
    return Buffer.from(p, "hex").reverse().join("");
  }

  reedem(address) {
    const decoded = bs58check.default.decode(address);
    const redeemScriptAddress = decoded.slice(1);

    const typeAddress = this.typeAddress(address);
    // console.log("sono qua " + Buffer.from(redeemScriptAddress, "hex").toString("hex"));
    // console.log(typeAddress);
    // console.log("\n\n");

    return this.script(redeemScriptAddress, typeAddress);
  }

  script(bytes, address) {
    if (address == "P2PKH") {
      return Buffer.concat([
        Buffer.from([0x76]), // ---------------------
        Buffer.from([0xa9]),
        Buffer.from([0x14]), // butta su 20 bytes
        Buffer.from(bytes, "hex"),
        Buffer.from([0x88]),
        Buffer.from([0xac]),
      ]);
    } else if (address == "P2SH") {
      console.log(Buffer.from(bytes).toString("hex"));

      return Buffer.concat([
        Buffer.from([0xa9]), // ---------------
        Buffer.from([0x14]), // butta su 20 bytes
        Buffer.from(bytes, "hex"),
        Buffer.from([0x87]),
      ]);
    }
  }

  createData() {
    const data = Buffer.concat([
      // Versione
      Buffer.from(this.version, "hex"),
      // Input
      this.amountInput,
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.emptyScript.length]),
      this.emptyScript,
      this.sequenza,
      // Output
      this.amountOutput,
      Buffer.from(this.amount, "hex"),
      Buffer.from([this.scriptPubKey.length]),
      this.scriptPubKey,
      // output change
      Buffer.from(this.amountChange, "hex"),
      Buffer.from([this.addressChange.length]),
      this.addressChange,
      // looktime
      Buffer.from(this.lookTime, "hex"),
      // hashcode
      Buffer.from(this.hashCodeType, "hex"),
    ]);

    return data;
  }

  sign(sk) {
    const dataToSign = this.doubleHash(this.createData());
    const keyPair = ec.keyFromPrivate(sk);
    // canonical true aggiunge regole aggiuntive segue regola low-s in cui il valore di s è minore di N/2 (N è l'ordine della curva)
    const signature = keyPair.sign(dataToSign, { canonical: true });
    return Buffer.concat([Buffer.from(signature.toDER()), Buffer.from([0x01])]);
  }

  scriptSig(SK, PK) {
    // qua controlla se stai facendo P2PKH --> P2SH o se stai facendo P2PKH <-- P2SH
    const scriptAddressType = this.typeAddress(this.addressFrom);
    const signData = Buffer.from(this.sign(SK));

    if (scriptAddressType === "P2PKH") {
      return Buffer.concat([
        Buffer.from([signData.length]), // Lunghezza della firma
        signData,
        Buffer.from([Buffer.from(PK, "hex").length]), // Lunghezza chiave pubblica
        Buffer.from(PK, "hex"),
      ]);
    } else if (scriptAddressType === "P2SH") {
      // const scriptP2SH = this.reedem(this.addressFrom);
      const SK2 = "1edbbd0762c5ecf546714ab9c2b11c3d47a6a6f88ea373807b3a14931456e982";
      const keyPair = ec.keyFromPrivate(SK2);
      // const sig2 = Buffer.from(this.sign(SK2));
      const publicKey2 = keyPair.getPublic(true, "hex");
      console.log(publicKey2);
      console.log(PK);

      const script = Buffer.concat([
        Buffer.from([0x51]), // ----------------------
        Buffer.from([0x21]),
        Buffer.from(PK, "hex"),
        Buffer.from([0x21]),
        Buffer.from(publicKey2, "hex"),
        Buffer.from([0x52]),
        Buffer.from([0xae]),
      ]);

      return Buffer.concat([
        Buffer.from([0x00]),
        Buffer.from([signData.length]), // Lunghezza della firma
        signData,
        Buffer.from([script.length]),
        script,
      ]);
    }
  }

  createTransactions() {
    return Buffer.concat([
      // Versione
      Buffer.from(this.version, "hex"),
      // Input
      this.amountInput,
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.ScriptSig.length]),
      this.ScriptSig,
      this.sequenza,
      // Output
      this.amountOutput,
      Buffer.from(this.amount, "hex"),
      Buffer.from([this.scriptPubKey.length]),
      this.scriptPubKey,
      // output change
      Buffer.from(this.amountChange, "hex"),
      Buffer.from([this.addressChange.length]),
      this.addressChange,
      // Locktime
      Buffer.from(this.lookTime, "hex"),
    ]);
  }
}


const transaction1 = new Transaction(
  address_testTo,
  address_testFrom,
  inputIndex,
  transaction,
  amountUTXO,
  amoutUTXOTransaction,
  fee,
  privateKey,
  publicKeyNotCompress
);

/*


inviare soldi ad address  mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN poi da questo address mandarli a 2N646YQJBRKAGJxkqstmYtM9biWApz8wuqD
e dopo fare transazione



 console.log("\n\n");
 console.log("prima transazione " + transaction1.emptyScript);
 console.log("prima transazione " + transaction1.emptyScript);

 private key bce11680346d2738c6d8e58e50aabae2c52334cf9649cc40a27cca6892eda5a
 public key 0319985d8417735f8ca958fe75325036ed932531af79c4578e7e2f5d28b5516b2f
 hash public key 67dc1ebe7a0b4ed565415c986c23c37891c16e2b
 hash dello script 8c7ed803c7a77469ee78d88854e677a0c6973756
 2N646YQJBRKAGJxkqstmYtM9biWApz8wuqD
 020f3983214311e930033573fec9b9f66b0f39e34973055dfd8e642d2d21cece41

 private key 5ea9eaa95f5030b922d2695c43338cc6b8cebc73151620df014cf3b04c4af583
 public key 03740cc1dc1963ad20d96af908035071c9b60ebb4f4c164e97230c5b0644ad0f00
 hash public key 3c999cb3415026cc2b67bbfe628470d1c4f12ed9
 hash dello script 7a51b184a3da21df87df176eb642219156ecd956
 2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj

*/

const transactionP2SH = "f218d541953d43ce5c6e81d31159be96f9b1dac480da50c979c65d40de8cedb7";
const amountUTXOP2SH = 38000;
const amoutUTXOTransactionP2SH = 90000;
const address_testToP2SH = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const address_testFromP2SH = "2N646YQJBRKAGJxkqstmYtM9biWApz8wuqD";
const privateKeyP2sh = "bce11680346d2738c6d8e58e50aabae2c52334cf9649cc40a27cca6892eda5a";
const publicKeyP2SHNotCompress = "0319985d8417735f8ca958fe75325036ed932531af79c4578e7e2f5d28b5516b2f";
const inputIndexP2SH = 0;

const transactionP = new Transaction(
  address_testToP2SH,
  address_testFromP2SH,
  inputIndexP2SH,
  transactionP2SH,
  amountUTXOP2SH,
  amoutUTXOTransactionP2SH,
  fee,
  privateKeyP2sh,
  publicKeyP2SHNotCompress
);

/*
02000000
01
b7ed8cde405dc679c950da80c4dab1f996be5911d3816e5cce433d9541d518f2
00000000
91
48
3045022100dd6ff9640d1d17759b4f37935a6a1d520b11c7698063ee9333653273e7b11758022023823a1866dacca9e2fe8c0a854e7a99aef9f7cf5378813c6840d29e61aa746801
47
5121022afc20bf379bc96a2f4e9e63ffceb8652b2b6a097f63fbee6ecec2a49a48010e2103a767c7221e9f15f870f1ad9311f5ab937d79fcaeee15bb2c722bca515581b4c052ae
ffffffff
02
7094000000000000
19
76a914d320c24246a9245453aa45238e9456fc8aafbcf588ac
38c7000000000000
17
a914748284390f9e263a4b766a75d0633c50426eb87587
00000000
*/

// console.log(transaction1);
console.log("la transazione mia: " + transaction1.createTransactions().toString("hex"));

// console.log("\n\n");
// console.log("seconda transazione " + transactionP.emptyScript);

console.log("la transazioneP2SH mia: " + transactionP.createTransactions().toString("hex"));
// console.log("\n\n");
//---------------------------------------------------
// controllare sopra
//--------------------------------------------------

function createTransection(pk) {
  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  const addressMoney = privateKey.toAddress(bitcoin.Networks.testnet);
  // const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi
  const address_test = "2N3sGiyscxqd3r6DQSbgXT738ZwhUpBqkej"; // address a cui inviare soldi
  // const address_test = "2MwVDMAhEX8WptvMNLRrofm4VY6t6K4j1qg"; // address a cui inviare soldi

  const utxos = {
    txId: "d7fea33a641b3387677e741abca827fc17c60fd624893abf06ae2490c5ec5bed",
    outputIndex: 0,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 100000, // satoshi che ha la transazione
  };

  // console.log(addressMoney.toString("hex"));
  // console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 90000) // Add an output with the given amount of satoshis
    .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    .fee(fee)
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

  const script = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    p2shHash, //--------------------s
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  // console.log("sono qua \n\n" + doubleHash(script).toString("hex") + "\n\n");

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

  // console.log(ScriptPubKey.toString("hex"));

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
