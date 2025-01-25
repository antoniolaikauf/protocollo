const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");
const bs58check = require("bs58check");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

class Transaction {
  constructor(addressTo, addressFrom, inputIndex, transaction, amount, amountTransaction, fee = 1000, PrivateKey, PublicKey) {
    this.addressTo = addressTo;
    this.addressFrom = addressFrom;
    this.lookTime = this.reverseData("00000000");
    this.hashCodeType = this.reverseData("00000001");
    this.amountOutput = Buffer.from([0x02]);
    this.amount = this.valueOutput(amount).padEnd(16, "0");
    this.scriptPubKey = this.reedem(addressTo);
    this.addressChange = this.reedem(addressFrom);
    this.amountChange = this.valueOutput(amountTransaction - amount - fee).padEnd(16, "0");
    this.sequenza = Buffer.from("ffffffff", "hex");
    this.version = this.reverseData("2".padStart(8, "0"));
    this.amountInput = Buffer.from([0x01]);
    this.transaction = this.reverseData(transaction);
    this.inputIndex = this.reverseData(inputIndex.toString().padStart(8, "0"));
    this.LenghtScriptSig = Buffer.from([0x19]); // 25 bytes
    this.emptyScript = this.reedem(addressFrom);
    this.ScriptSig = this.scriptSig(PrivateKey, PublicKey);
  }

  doubleHash(dataToHash) {
    return crypto.createHash("sha256").update(crypto.createHash("sha256").update(dataToHash).digest()).digest();
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
    return this.reverseData(amountBytes);
  }
  // reverseData data in little-endian
  reverseData(hex) {
    // Ensure the hex string has an even length
    if (hex.length % 2 !== 0) {
      hex = "0" + hex;
    }

    return hex
      .match(/.{1,2}/g)
      .reverse()
      .join(""); // ---------------
  }

  reedem(address) {
    const decoded = bs58check.default.decode(address);
    const redeemScriptAddress = decoded.slice(1);

    const typeAddress = this.typeAddress(address);

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
    const PK = "0394f767fa17b617b9a7f15e11efdb68bd7b2a683f6d8d07284450fbc5ba8106be";
    const PK2 = "020f3983214311e930033573fec9b9f66b0f39e34973055dfd8e642d2d21cece41";

    const empty = Buffer.concat([
      Buffer.from([0x51]), // OP_1 (firme richieste)
      Buffer.from([0x21]),
      Buffer.from(PK, "hex"), // Prima chiave pubblica
      Buffer.from([0x21]),
      Buffer.from(PK2, "hex"), // Seconda chiave pubblica
      Buffer.from([0x52]), // OP_2 (numero di chiavi pubbliche)
      Buffer.from([0xae]), // OP_CHECKMULTISIG
    ]);
    const data = Buffer.concat([
      // Versione
      Buffer.from(this.version, "hex"),
      // Input
      this.amountInput,
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([empty.length]),
      empty,
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

  signData(sk) {
    const dataToSign = this.doubleHash(this.createData());
    const keyPair = ec.keyFromPrivate(sk);
    // canonical true aggiunge regole aggiuntive segue regola low-s in cui il valore di s è minore di N/2 (N è l'ordine della curva)
    const signature = keyPair.sign(dataToSign, { canonical: true });
    return Buffer.concat([Buffer.from(signature.toDER()), Buffer.from([0x01])]);
  }

  scriptSig(SK, PK) {
    // qua controlla se stai facendo P2PKH --> P2SH o se stai facendo P2PKH <-- P2SH
    const scriptAddressType = this.typeAddress(this.addressFrom);
    const signData = Buffer.from(this.signData(SK));

    if (scriptAddressType === "P2PKH") {
      return Buffer.concat([
        Buffer.from([signData.length]), // Lunghezza della firma
        signData,
        Buffer.from([Buffer.from(PK, "hex").length]), // Lunghezza chiave pubblica
        Buffer.from(PK, "hex"),
      ]);
    } else if (scriptAddressType === "P2SH") {
      const SK2 = "1edbbd0762c5ecf546714ab9c2b11c3d47a6a6f88ea373807b3a14931456e982";
      const keyPair = ec.keyFromPrivate(SK2);
      const PK2 = keyPair.getPublic(true, "hex");
      // Create the redeem script for 2-of-2 multisig
      const redeemScript = Buffer.concat([
        Buffer.from([0x51]), // OP_1 (firme richieste)
        Buffer.from([0x21]),
        Buffer.from(PK, "hex"), // Prima chiave pubblica
        Buffer.from([0x21]),
        Buffer.from(PK2, "hex"), // Seconda chiave pubblica
        Buffer.from([0x52]), // OP_2 (numero di chiavi pubbliche)
        Buffer.from([0xae]), // OP_CHECKMULTISIG
      ]);

      console.log(redeemScript.toString("hex"));
      const sig2 = Buffer.from(this.signData(SK2));
      const first_hash = crypto.createHash("sha256").update(redeemScript).digest();
      const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
      console.log("                        " + scriptHash.toString("hex"));

      // Include both signatures and the redeem script in the scriptSig
      return Buffer.concat([
        Buffer.from([0x00]), // OP_0
        Buffer.from([signData.length]),
        signData, // Signature 1
        Buffer.from([redeemScript.length]),
        redeemScript, // Redeem script
      ]);
    }
  }

  createTransactions() {
    return Buffer.concat([
      Buffer.from(this.version, "hex"),
      this.amountInput,
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.ScriptSig.length]),
      this.ScriptSig,
      this.sequenza,
      this.amountOutput,
      Buffer.from(this.amount, "hex"),
      Buffer.from([this.scriptPubKey.length]),
      this.scriptPubKey,
      Buffer.from(this.amountChange, "hex"),
      Buffer.from([this.addressChange.length]),
      this.addressChange,
      Buffer.from(this.lookTime, "hex"),
    ]);
  }
}

const address_testTo = "2NFBf61MFsnYMbsj7ByAXeEcdsD4TVD4ixz";
const address_testFrom = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const publicKeyNotCompress = "03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e";
const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
const inputIndex = 1;
const transaction = "9700f600290fe374a9e5314444af042b3738efc4491bf4aeb541bf9faa534e96";
const amountUTXO = 13000;
const amoutUTXOTransaction = 498000;
const fee = 1000;

// const transaction1 = new Transaction(
//   address_testTo,
//   address_testFrom,
//   inputIndex,
//   transaction,
//   amountUTXO,
//   amoutUTXOTransaction,
//   fee,
//   privateKey,
//   publicKeyNotCompress
// );

/*
      const sig2 = Buffer.from(this.signData(SK2));


private key ff168e24ea9b11c950b3482d300da58b2ce97fdfea0e1681184030675fbcd94b
public key 0394f767fa17b617b9a7f15e11efdb68bd7b2a683f6d8d07284450fbc5ba8106be
hash public key 2c814d88457271f2f95ec4ed47d05657428c9330
020f3983214311e930033573fec9b9f66b0f39e34973055dfd8e642d2d21cece41
hash dello script f0a60e01893bc1be9b25d72ecb0fa288d4b09979
2NFBf61MFsnYMbsj7ByAXeEcdsD4TVD4ixz

*/

const transactionP2SH = "509c70be6ecba95fec69abb9d68b81e8b554d72b05bcd719a281fe182cc202e0";
const amountUTXOP2SH = 11000;
const amoutUTXOTransactionP2SH = 13000;
const address_testToP2SH = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const address_testFromP2SH = "2NFBf61MFsnYMbsj7ByAXeEcdsD4TVD4ixz";
const privateKeyP2sh = "ff168e24ea9b11c950b3482d300da58b2ce97fdfea0e1681184030675fbcd94b";
const publicKeyP2SHNotCompress = "0394f767fa17b617b9a7f15e11efdb68bd7b2a683f6d8d07284450fbc5ba8106be";
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

// console.log(transaction1);
// console.log("la transazione mia: " + transaction1.createTransactions().toString("hex"));

console.log("\n\n");
console.log("seconda transazione " + transactionP.emptyScript.toString("hex"));
console.log("scriptpukey " + transactionP.scriptPubKey.toString("hex"));

console.log("la transazioneP2SH mia: " + transactionP.createTransactions().toString("hex"));
console.log("\n\n");

//---------------------------------------------------
// controllare sopra
//--------------------------------------------------

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

function main() {
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  // const transection = createTransection(privateKey);
  // broadcast(transection);
}

main();

/*
// https://github.com/bitpay/bitcore-lib/blob/master/docs/examples.md

// https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// https://faucet.testnet4.dev/

*/
