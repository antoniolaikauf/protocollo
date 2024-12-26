const crypto = require("crypto");
const bs58 = require("bs58"); // dipendenza da installare

/*
// const bitcoin = require("bitcoinjs-lib"); // dipendenza npm install bitcoinjs-lib per instllarlo
// const fs = require("fs").promises;
// const EC = require("elliptic").ec; // dipendenza da installare
// const ec = new EC("secp256k1");

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
    list_words += " " + element[number].replace("\r", "");
  }

  return list_words;
}

function PBKDF2_HMAC(w) {
  const key = crypto.pbkdf2Sync(w, "mnemonic", 2048, 64, "sha512");

  const hmac = crypto.pbkdf2Sync(key, "Bitcoin seed", 1, 64, "sha512");

  const private_key = hmac.toString("hex").slice(0, 64);
  const main_chain = hmac.toString("hex").slice(64);

  return { private_key: private_key, main_chain: main_chain };
}

function eliptic_curve(key) {
  const key_pair = ec.keyFromPrivate(key["private_key"]); // chaive privata
  const public_key = key_pair.getPublic(); // chiave pubblica

  let cordinata_x = public_key.getX().toString(16);
  let cordinata_y = public_key.getY().toString(16);
  let prefisso = "";

  parseInt(cordinata_y[cordinata_y.length - 1], 16) % 2 == 0 ? (prefisso = "02") : (prefisso = "03");
  cordinata_x = prefisso + cordinata_x;
  cordinata_y = prefisso + cordinata_y;

  console.log("cordinata x " + cordinata_x);
  console.log("cordinata y " + cordinata_y);
  console.log("chiave privata " + key_pair.getPrivate().toString("hex"));

  return { chiave_pubblica_x: cordinata_x, chiave_pubblica_y: cordinata_y };
}

function duble_hash(pk) {
  const fisrt_hash = crypto.createHash("sha256").update(pk.chiave_pubblica_x).digest("hex");
  const second_hash = crypto.createHash("ripemd160").update(fisrt_hash).digest("hex");
  return second_hash;
}

function build_address(data) {
  const payload = "00" + data;
  const first_hash = crypto.createHash("sha256").update(Buffer.from(payload, "hex")).digest("hex");
  const second_hash = crypto.createHash("sha256").update(Buffer.from(first_hash, "hex")).digest("hex").slice(0, 8);

  const fullPayload = payload + second_hash;
  console.log("sono payload lunghezza " + fullPayload.length + " sono payload " + fullPayload);

  const address = bs58.default.encode(Buffer.from(fullPayload, "hex"));
  return address;
}

async function main() {
  const bits_entropy = Entopy();
  const checksum = crypto.createHash("sha256").update(bits_entropy).digest("hex").slice(0, 1);
  const bits_checksum = bits_entropy + parseInt(checksum, 16).toString(2).padStart(4, "0");

  const list_words = await words(bits_checksum);

  const key = PBKDF2_HMAC(list_words);
  const key_pair = eliptic_curve(key);
  const d_hash = duble_hash(key_pair);
  const address = build_address(d_hash);
  console.log("sono address " + address);
  return address;
}

console.log(main());

*/

// P2SH PERMETTE DI BLOCCARE BITCOIN IN SPECIFICI ADDRESS

function dubleHash(s) {
  const first_hash = crypto.createHash("sha256").update(s).digest();
  const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
  return scriptHash;
}

function buildAddress(h) {
  const testnet_network = Buffer.from([0xc4]);
  const mainnet_network = Buffer.from([0x05]);
  const address = Buffer.concat([mainnet_network, h]);

  /* ps alcuni dicono che bisogna prendere i primi 4 byte ma in verita 
        sono i primi due byte da prendere 
  */

  const hash = crypto.createHash("sha256").update(crypto.createHash("sha256").update(address).digest()).digest().slice(0, 4);

  const bs58Address = Buffer.concat([address, hash]);

  return bs58.default.encode(bs58Address);
}

function P2SH() {
  const segreto = crypto.createHash("sha256").update("ciao").digest("hex");
  const frase = "ciao"; // segreto che solo la persona che ha messo il collaterale sa
  const timeExpired = Math.floor(Date.now() / 1000) + 86400 * 7; // 7
  var seconds = new Date().getTime() / 1000;
  const day = Math.round((timeExpired - seconds) / 86400);
  console.log(day);

  /*
  lo script deve permettere alla persona di prelevare tutti i suoi soldi
  ma deve aspettare che le persone che hanno bloccato i soldi sull'altro address
  ritirino i loro e che sopratutto non prelevi i suoi soldi e quelli degli altri istantaneamente 

  la transazione va nella mempool e aspetta che le condizione (il tempo in questo caso) si verifichino 
  */

  const script = Buffer.from(
    `
   OP_IF OP_SHA256 ${frase} OP_EQUAL ${segreto} 
       ${timeExpired} OP_CHECKLOCKTIMEVERIFY OP_DROP
    OP_ELSE
       OP_RETURN
    OP_ENDIF
    `,
    "ascii"
  );

  const hashScript = dubleHash(script);
  const address = buildAddress(hashScript);
  console.log(address);
}

P2SH();

// https://github.com/BlockchainCommons/Learning-Bitcoin-from-the-Command-Line/blob/master/11_2_Using_CLTV_in_Scripts.md
