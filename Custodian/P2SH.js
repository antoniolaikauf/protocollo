const crypto = require("crypto");
const bs58 = require("bs58"); // dipendenza da installare
const fs = require("fs").promises;
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");

function Entopy() {
  const entropy = crypto.randomBytes(16).toString("hex");
  let entropy_bits = "";
  for (let i = 0; i < entropy.length; i += 2) {
    const chunk = entropy.slice(i, i + 2);
    entropy_bits += parseInt(chunk, 16).toString(2).padStart(8, "0");
  }
  return entropy_bits;
}

async function words(bits) {
  let list_words = "";
  const data = await fs.readFile("words.txt", "utf-8");
  const element = data.toString().split("\n");
  for (let i = 0; i < bits.length; i += 11) {
    const chunk = bits.slice(i, i + 11);
    const number = parseInt(chunk, 2).toString(10);

    i == 0 ? (list_words += element[number].replace("\r", "")) : (list_words += " " + element[number].replace("\r", ""));
  }

  return list_words;
}

function PBKDF2_HMAC(w) {
  const key = crypto.pbkdf2Sync(w, "mnemonic", 2048, 64, "sha512");

  const hmac = crypto.pbkdf2Sync(key, "Bitcoin seed", 1, 64, "sha512");

  const private_key = hmac.toString("hex").slice(0, 64);
  const main_chain = hmac.toString("hex").slice(64);

  return { masterPrivateKey: private_key, mainChain: main_chain };
}

function eliptic_curve(key) {
  const key_pair = ec.keyFromPrivate(key["masterPrivateKey"]); // chaive privata
  const public_key = key_pair.getPublic(); // chiave pubblica

  let cordinata_x = public_key.getX().toString(16);
  let cordinata_y = public_key.getY().toString(16);
  let prefisso = "";

  parseInt(cordinata_y[cordinata_y.length - 1], 16) % 2 == 0 ? (prefisso = "02") : (prefisso = "03");
  cordinata_x = prefisso + cordinata_x;
  cordinata_y = prefisso + cordinata_y;

  return { privateKey: key_pair.getPrivate().toString("hex"), publicKey: cordinata_x };

  // console.log("cordinata x " + cordinata_x);
  // console.log("cordinata y " + cordinata_y);
  // return { chiave_pubblica_x: cordinata_x, chiave_pubblica_y: cordinata_y };
}

// P2SH PERMETTE DI BLOCCARE BITCOIN IN SPECIFICI ADDRESS

function dubleHash(s) {
  const first_hash = crypto.createHash("sha256").update(s).digest();
  const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
  return scriptHash;
}

function buildAddress(h) {
  const testnet_network = Buffer.from([0xc4]);
  const mainnet_network = Buffer.from([0x05]);
  const address = Buffer.concat([testnet_network, h]);

  const hash = crypto.createHash("sha256").update(crypto.createHash("sha256").update(address).digest()).digest().slice(0, 4);
  const bs58Address = Buffer.concat([address, hash]);

  return bs58.default.encode(bs58Address);
}

async function P2SH() {
  const bits_entropy = Entopy();
  const checksum = crypto.createHash("sha256").update(bits_entropy).digest("hex").slice(0, 1);
  const bits_checksum = bits_entropy + parseInt(checksum, 16).toString(2).padStart(4, "0");

  const list_words = await words(bits_checksum);
  const key = PBKDF2_HMAC(list_words);
  const { privateKey, publicKey } = eliptic_curve(key);

  console.log("private key " + privateKey);
  console.log("public key " + publicKey);

  const publicKeyHash = dubleHash(publicKey);

  console.log(publicKeyHash);

  /*
  bisogna controllare il segreto e se è avvenuto il burn dall'altra parte che potrebbe avvenire tramit euna firma da parte del relay 
  la transazione va nella mempool e aspetta che le condizione (il tempo in questo caso) si verifichino 
  */

  const script = Buffer.concat([
    Buffer.from([0x63]),
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    publicKeyHash,
    Buffer.from([0x88]),
    Buffer.from([0xac]),
    Buffer.from([0x67]),
    Buffer.from([0x6a]),
    Buffer.from([0x68]),
  ]);

  console.log(script);

  const hashScript = dubleHash(script);

  console.log("rimeped address " + hashScript.toString("hex"));

  const address = buildAddress(hashScript);
  console.log(address);
}

P2SH();

// https://bitcointalk.org/index.php?topic=5229211.0 creare p2sh address

// https://github.com/BlockchainCommons/Learning-Bitcoin-from-the-Command-Line/blob/master/11_2_Using_CLTV_in_Scripts.md

/*
${timeExpired} OP_CHECKLOCKTIMEVERIFY OP_DROP
const timeExpired = Math.floor(Date.now() / 1000) + 86400 * 7; // 7
var seconds = new Date().getTime() / 1000;
const day = Math.round((timeExpired - seconds) / 86400);
console.log(day);


private key b117532395674c64a408d731a1354be8b0f1f8e06a4ce94a0eda126378be2451
public key 035148e86faa66aa63c2b1562375962bba813658c0bc59a0903dea15aab6ee757
<Buffer 97 83 40 e8 00 56 9e 32 b1 0f d1 ba c0 5d df ca 28 dd 21 31>
<Buffer 63 76 a9 14 97 83 40 e8 00 56 9e 32 b1 0f d1 ba c0 5d df ca 28 dd 21 31 88 ac 67 6a 68>
rimeped address 567593c73a2a029c9e829a02bf4e82b05e3b3611
address 2N18NxC7uHC36ETaYAjpEeLtG6pJdThB1fz
*/
