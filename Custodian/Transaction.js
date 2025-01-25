const axios = require("axios");
const crypto = require("crypto");
const bs58check = require("bs58check");
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

class Transaction {
  constructor(addressTo, addressFrom, inputIndex, transaction, amount, amountTransaction, fee = 1000, PrivateKey) {
    this.addressTo = addressTo;
    this.addressFrom = addressFrom;
    this.PrivateKey = PrivateKey;
    this.version = this.reverseData("2".padStart(8, "0"));
    this.transaction = this.reverseData(transaction);
    this.sequenza = Buffer.from("ffffffff", "hex");
    this.lookTime = this.reverseData("00000000");
    this.hashCodeType = this.reverseData("00000001");

    // output
    this.amountOutput = this.valueOutput(amount).padEnd(16, "0");
    this.scriptPubKey = this.reedem(addressTo);
    //output change
    this.addressChange = this.reedem(addressFrom);
    this.amountChange = this.valueOutput(amountTransaction - amount - fee).padEnd(16, "0");
    // input
    this.amountInput = Buffer.from([0x01]);
    this.inputIndex = this.reverseData(inputIndex.toString().padStart(8, "0"));
    this.LenghtScriptSig = Buffer.from([0x19]); // 25 bytes
    this.emptyScript = this.scriptForSigning(addressFrom);
    this.ScriptSig = this.scriptSig(PrivateKey);
  }

  publicKey(SK) {
    const keypair1 = ec.keyFromPrivate(SK);
    return keypair1.getPublic(true, "hex");
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
    return hex
      .match(/.{1,2}/g)
      .reverse()
      .join("");
  }

  reedem(address) {
    const decoded = bs58check.default.decode(address);
    const redeemScriptAddress = decoded.slice(1);

    const typeAddress = this.typeAddress(address);

    return this.script(redeemScriptAddress, typeAddress);
  }

  // empty script for hash transaction
  scriptForSigning(address) {
    if (this.typeAddress(address) === "P2SH") {
      return Buffer.concat([
        Buffer.from([0x51]), // OP_1 (sign required)
        Buffer.from([0x21]),
        Buffer.from(this.publicKey(this.PrivateKey[0]), "hex"), // first publicKey
        Buffer.from([0x21]),
        Buffer.from(this.publicKey(this.PrivateKey[1]), "hex"), // first publicKey
        Buffer.from([0x52]), // OP_2 number of publicKey
        Buffer.from([0xae]), // OP_CHECKMULTISIG
      ]);
    } else {
      return Buffer.concat([
        Buffer.from([0x76]),
        Buffer.from([0xa9]),
        Buffer.from([0x14]),
        Buffer.from(bytes, "hex"),
        Buffer.from([0x88]),
        Buffer.from([0xac]),
      ]);
    }
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
      Buffer.from([0x02]),
      Buffer.from(this.amountOutput, "hex"),
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

  signData(SK) {
    const dataToSign = this.doubleHash(this.createData());
    const keyPair = ec.keyFromPrivate(SK);
    // canonical true aggiunge regole aggiuntive segue regola low-s in cui il valore di s è minore di N/2 (N è l'ordine della curva)
    const signature = keyPair.sign(dataToSign, { canonical: true });
    return Buffer.concat([Buffer.from(signature.toDER()), Buffer.from([0x01])]);
  }

  scriptSig(SK) {
    // qua controlla se stai facendo P2PKH --> P2SH o se stai facendo P2PKH <-- P2SH
    const scriptAddressType = this.typeAddress(this.addressFrom);
    const signData = Buffer.from(this.signData(SK[0]));

    if (scriptAddressType === "P2PKH") {
      return Buffer.concat([
        Buffer.from([signData.length]), // length sign
        signData,
        Buffer.from([Buffer.from(this.publicKey(this.PrivateKey[0]).length, "hex").length]), // length publicKey
        Buffer.from(this.publicKey(this.PrivateKey[0]), "hex"),
      ]);
    } else if (scriptAddressType === "P2SH") {
      const redeemScript = Buffer.concat([
        Buffer.from([0x51]), // OP_1 (sign required)
        Buffer.from([0x21]),
        Buffer.from(this.publicKey(this.PrivateKey[0]), "hex"), // first publicKey
        Buffer.from([0x21]),
        Buffer.from(this.publicKey(this.PrivateKey[1]), "hex"), // second publicKey
        Buffer.from([0x52]), // OP_2 Number of publicKey
        Buffer.from([0xae]), // OP_CHECKMULTISIG
      ]);

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
      // Versione
      Buffer.from(this.version, "hex"),
      // input
      this.amountInput,
      Buffer.from(this.transaction, "hex"),
      Buffer.from(this.inputIndex, "hex"),
      Buffer.from([this.ScriptSig.length]),
      this.ScriptSig,
      // sequence
      this.sequenza,
      // output
      Buffer.from([0x02]),
      Buffer.from(this.amountOutput, "hex"),
      Buffer.from([this.scriptPubKey.length]),
      this.scriptPubKey,
      // output Change
      Buffer.from(this.amountChange, "hex"),
      Buffer.from([this.addressChange.length]),
      this.addressChange,
      // looktime
      Buffer.from(this.lookTime, "hex"),
    ]);
  }
}

const address_testTo = "2NFBf61MFsnYMbsj7ByAXeEcdsD4TVD4ixz";
const address_testFrom = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const privateKey = ["793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f"];
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
const privateKeyP2sh = [
  "ff168e24ea9b11c950b3482d300da58b2ce97fdfea0e1681184030675fbcd94b",
  "1edbbd0762c5ecf546714ab9c2b11c3d47a6a6f88ea373807b3a14931456e982",
];
const inputIndexP2SH = 0;

const transactionP = new Transaction(
  address_testToP2SH,
  address_testFromP2SH,
  inputIndexP2SH,
  transactionP2SH,
  amountUTXOP2SH,
  amoutUTXOTransactionP2SH,
  fee,
  privateKeyP2sh
  // publicKeyP2SHNotCompress
);

// console.log("la transazione mia: " + transaction1.createTransactions().toString("hex"));
console.log("\n\n");
console.log("la transazioneP2SH mia: " + transactionP.createTransactions().toString("hex"));
console.log("\n\n");

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
