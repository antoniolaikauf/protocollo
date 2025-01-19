const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");
const bs58check = require("bs58check");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

const address_testTo = "2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj";
const address_testFrom = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const publicKeyNotCompress = "03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e";
const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
const inputIndex = 1;
const transaction = "58802629722001e44d196b593871aa01c0137f327ecd2f695f33525a49d16157";
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
      const scriptP2SH = this.reedem(this.addressFrom);
      const t = "03740cc1dc1963ad20d96af908035071c9b60ebb4f4c164e97230c5b0644ad0f00";
      const publicKeyHash = crypto.createHash("ripemd160").update(crypto.createHash("sha256").update(t).digest()).digest();
      console.log(publicKeyHash.toString("hex"));

      const script = Buffer.concat([
        Buffer.from([0xa9]), // ---------------
        Buffer.from([0x14]), // butta su 20 bytes
        Buffer.from(publicKeyHash, "hex"),
        Buffer.from([0x87]),
      ]);
      console.log(scriptP2SH);

      const scriptDaInserire = "a9147a51b184a3da21df87df176eb642219156ecd95687";
      return Buffer.concat([
        Buffer.from([signData.length]), // Lunghezza della firma
        signData,
        Buffer.from([scriptP2SH.length]),
        scriptP2SH,
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
// console.log("\n\n");
// console.log("prima transazione " + transaction1.emptyScript);
// console.log("prima transazione " + transaction1.emptyScript);

// private key 5ea9eaa95f5030b922d2695c43338cc6b8cebc73151620df014cf3b04c4af583
// public key 03740cc1dc1963ad20d96af908035071c9b60ebb4f4c164e97230c5b0644ad0f00
// hash public key 3c999cb3415026cc2b67bbfe628470d1c4f12ed9
// hash dello script 7a51b184a3da21df87df176eb642219156ecd956
// 2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj

const transactionP2SH = "b01b5cdec4d57aea22d00b107c154a967238d0021576b36b3889db50c6d90004";
const amountUTXOP2SH = 38000;
const amoutUTXOTransactionP2SH = 90000;
const address_testToP2SH = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const address_testFromP2SH = "2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj";
const privateKeyP2sh = "5ea9eaa95f5030b922d2695c43338cc6b8cebc73151620df014cf3b04c4af583";
const publicKeyP2SHNotCompress = "03740cc1dc1963ad20d96af908035071c9b60ebb4f4c164e97230c5b0644ad0f00";
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
47
3044022044fdf628da21e3ae7fd4c974f20a64ec7726d7148d4ac9d8c4dab04274b9122f02200724042c0782f1597014990055f2d668506df5087a3a14686c2934413e4c494c01
17
a9143c999cb3415026cc2b67bbfe628470d1c4f12ed987
  01000000
  01
  ffd83c4d05cad30c250a3ceea364e5624c1f69db1952f701c55175f986071f2a
  01000000
  93
  00
  49
  3046022100b193aa16a40f15abbed1846cbd680a916c7c4a99a14a37ed54a9c24717a937a0022100bfb61272c9479443f48b21a3dd1a48d3959244733f9f14d568b43553de5c174d01
  47
  5121022afc20bf379bc96a2f4e9e63ffceb8652b2b6a097f63fbee6ecec2a49a48010e2103a767c7221e9f15f870f1ad9311f5ab937d79fcaeee15bb2c722bca515581b4c052ae
  ffffffff
  02
  00e1f50500000000
  19
  76a9143b7d0eba8877614de44eb5d6049094d1d23465fc88ac
  787a750800000000
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
  const address_test = "2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj"; // address a cui inviare soldi
  // const address_test = "2MwVDMAhEX8WptvMNLRrofm4VY6t6K4j1qg"; // address a cui inviare soldi

  const utxos = {
    txId: "da6bb378249a2ecadec36432ecc044ab219c9a0e9d75e32035a852d368691e01",
    outputIndex: 1,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 97000, // satoshi che ha la transazione
  };

  // console.log(addressMoney.toString("hex"));
  // console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 40000) // Add an output with the given amount of satoshis
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
