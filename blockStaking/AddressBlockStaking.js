const crypto = require("crypto");
const fs = require("fs").promises;
const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");
const bs58 = require("bs58");
const { buffer } = require("stream/consumers");

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
  const parole = " setola bulbo curvo malto totano pomice srotolato sbancato retina affabile salivare fiore"; // mnemonic
  const key = crypto.pbkdf2Sync(w, "mnemonic", 2048, 64, "sha512");
  // console.log(key.toString("hex") + "ssss");

  const hmac = crypto.pbkdf2Sync(key, "Bitcoin seed", 1, 64, "sha512");
  // console.log(hmac.toString("hex") + " fffffffffffffffffffffff");

  const private_key = hmac.slice(0, 32);
  const main_chain = hmac.slice(32);

  return { private_key: private_key.toString("hex"), main_chain: main_chain.toString("hex") };
}

function eliptic_curve(key) {
  const key_pair = ec.keyFromPrivate(key["private_key"]);
  const public_key = key_pair.getPublic();

  let cordinata_x = public_key.getX().toString(16);
  let cordinata_y = public_key.getY().toString(16);
  let prefisso = "";

  parseInt(cordinata_y[cordinata_y.length - 1], 16) % 2 == 0 ? (prefisso = "02") : (prefisso = "03");
  cordinata_x = prefisso + cordinata_x;
  cordinata_y = prefisso + cordinata_y;

  console.log("cordinata x " + cordinata_x);
  console.log("cordinata y " + cordinata_y);

  return { chiave_pubblica_x: cordinata_x, chiave_pubblica_y: cordinata_y };
}

function duble_hash(pk) {
  const fisrt_hash = crypto.createHash("sha256").update(pk.chiave_pubblica_x).digest("hex");
  const second_hash = crypto.createHash("ripemd160").update(fisrt_hash).digest("hex");
  return second_hash;
}

function build_address(data) {
  payload = "00" + data;
  console.log(payload.length);
  // const version = Buffer.from("00", "hex");
  // data = Buffer.from(data, "hex");
  // let payload = Buffer.concat([version, data]);
  const first_hash = crypto.createHash("sha256").update(payload).digest("hex");
  const second_hash = crypto.createHash("sha256").update(first_hash).digest("hex").slice(0, 8);

  const fullPayload = payload + second_hash;
  // const fullPayload = Buffer.concat([payload, Buffer.from(second_hash)]);
  console.log("sono payload lunghezza " + fullPayload.length + " sono payload " + fullPayload);

  const address = bs58.default.encode(Buffer.from(fullPayload, "hex"));
  console.log(address);

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
  console.log("sono address " + build_address(d_hash).length);
  console.log("00d295fe2cb5e35dc3b65684fa0cfb6c5fac84ff423aaa0de3".length);
}

main();
