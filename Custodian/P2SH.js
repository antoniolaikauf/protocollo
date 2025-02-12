const fs = require("fs").promises;
const crypto = require("crypto");
const bs58 = require("bs58"); // dipendenza da installare
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
  const key = crypto.pbkdf2Sync(w, Buffer.from("mnemonic"), 2048, 64, "sha512");

  const hmac = crypto.pbkdf2Sync(key, Buffer.from("Bitcoin seed"), 1, 64, "sha512");

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
}

// P2SH PERMETTE DI BLOCCARE BITCOIN IN SPECIFICI ADDRESS

function doubleHash(s) {
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

  const keyPair = ec.keyFromPrivate("1edbbd0762c5ecf546714ab9c2b11c3d47a6a6f88ea373807b3a14931456e982");
  const publicKey2 = keyPair.getPublic(true, "hex");
  console.log(publicKey2);


  const script = Buffer.concat([
    Buffer.from([0x52]), // OP_2 (firme richieste)
    Buffer.from([0x21]),
    Buffer.from(publicKey, "hex"), // Prima chiave pubblica
    Buffer.from([0x21]), 
    Buffer.from(publicKey2, "hex"), // Seconda chiave pubblica da ssmartContract 
    Buffer.from([0x52]), // OP_2 (numero di chiavi pubbliche)
    Buffer.from([0xae]), // OP_CHECKMULTISIG
  ]);

  const hashScript = doubleHash(script);

  console.log("hash dello script" + hashScript.toString("hex"));

  const address = buildAddress(hashScript);
  console.log(address);
}

P2SH();

/*

private key 191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9
public key 03f6a19b3cf3240dad60914626e293410008821f63fc05add0aaf5803791c27a33
hash public key 9ff9f4e7b35c883822d3a0cfc46f6160ca2f7403
<Buffer 76 a9 14 9f f9 f4 e7 b3 5c 88 38 22 d3 a0 cf c4 6f 61 60 ca 2f 74 03 88 ac>
rimeped address f1384ced7248c3db7fe1950d415772291fafae84
2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr


private key: 793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f, master chain: b2c832d167457da44eaf72ec946e5b9e94a0151f927680528e9b9775000779ec
chiave pubblica: 04ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
chiave pubblica compressa:03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
punto x in SECP256k1: 03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
punto y in SECP256k1: 64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
ADDRESS: b'mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN'


private key 5ea9eaa95f5030b922d2695c43338cc6b8cebc73151620df014cf3b04c4af583
public key 03740cc1dc1963ad20d96af908035071c9b60ebb4f4c164e97230c5b0644ad0f00
hash public key 3c999cb3415026cc2b67bbfe628470d1c4f12ed9
hash dello script 7a51b184a3da21df87df176eb642219156ecd956
2N4PzHr3DKVA2F9DRfHajHMNhywEtZfdxUj
*/
