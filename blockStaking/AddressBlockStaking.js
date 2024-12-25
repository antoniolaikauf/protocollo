const crypto = require("crypto");
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
  console.log(public_key);

  let cordinata_x = public_key[0];
  let cordinata_y = public_key[1];
  let prefisso = "";
  if (parseInt(cordinata_y[cordinata_y.length - 1], 16) % 2 == 0) prefisso = "02";
  else prefisso = "03";
  cordinata_x = prefisso + cordinata_x;
  cordinata_y = prefisso + cordinata_y;

  return { "chiave pubblica": cordinata_x, "chiave privata": cordinata_y };
}

function duble_hash(pk) {
  const f
}

async function main() {
  const bits_entropy = Entopy();
  const checksum = crypto.createHash("sha256").update(bits_entropy).digest("hex").slice(0, 1);
  const bits_checksum = bits_entropy + parseInt(checksum, 16).toString(2).padStart(4, "0");
  const list_words = await words(bits_checksum);
  const key = PBKDF2_HMAC(list_words);
  const key_pair = eliptic_curve(key) 
  console.log(duble_hash(key_pair));
  
}

main();
