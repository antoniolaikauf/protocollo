const crypto = require("crypto");
const fs = require("fs").promises;
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");
const bs58 = require("bs58");

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
  let list_words = [];
  const data = await fs.readFile("words.txt", "utf-8");
  const element = data.toString().split("\n");
  for (let i = 0; i < bits.length; i += 11) {
    const chunk = bits.slice(i, i + 11);
    const number = parseInt(chunk, 2).toString(10);
    list_words.push(element[number]);
  }

  return list_words;
}

function PBKDF2_HMAC(w) {
  let word = "";
  w.forEach((element) => {
    word += element;
  });
  const key = crypto.pbkdf2Sync(word, "mnemonic", 2048, 64, "sha512");
  const hmac = crypto.createHmac("sha512", "Bitcoin seed").update(key).digest("hex");
  const private_key = hmac.slice(0, 64);
  const main_chain = hmac.slice(64);
  return { private_key: private_key, main_chain: main_chain };
}

function eliptic_curve(key) {
  const key_pair = ec.keyFromPrivate(key["private_key"]);
  const public_key = JSON.parse(JSON.stringify(key_pair.getPublic()));

  let cordinata_x = public_key[0];
  let cordinata_y = public_key[1];
  let prefisso = "";

  parseInt(cordinata_y[cordinata_y.length - 1], 16) % 2 == 0 ? (prefisso = "02") : (prefisso = "03");
  cordinata_x = prefisso + cordinata_x;
  cordinata_y = prefisso + cordinata_y;

  return { chiave_pubblica: cordinata_x, chiave_privata: cordinata_y };
}

function duble_hash(pk) {
  const fisrt_hash = crypto.createHash("sha256").update(pk.chiave_pubblica).digest("hex");
  const second_hash = crypto.createHash("ripemd160").update(fisrt_hash).digest("hex");
  return second_hash;
}

function build_address(data) {
  const version = "00";
  let payload = version + data;
  const public_key_hash = crypto.createHash("sha256").update(payload).digest("hex");
  const checksum = public_key_hash.slice(0, 8);
  payload += checksum;
  const address = bs58.default.encode(Buffer.from(payload, "utf-8"));
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
  console.log(build_address(d_hash));
}

main();
