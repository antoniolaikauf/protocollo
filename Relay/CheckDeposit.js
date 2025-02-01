const axios = require("axios");
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");
const keccak256 = require("keccak256"); // npm i keccak256
const ethers = require("ethers");
require("dotenv").config({ path: "../.env" });
const abi = require("./ABI.json");
const privateKey = process.env.PRIVATE_KEY;

// const addressUsers = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
const addressUsers = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const amount = 2000; // in satoshi

// transazione dell address
async function transectionAddress(address) {
  // const data = await axios.get("https://blockstream.info/api/address/${address}/txs", {
  // timeout: 10000,
  // });
  const transactions = await axios.get(`https://mempool.space/testnet4/api/address/${address}/txs`, {
    timeout: 50000,
  });

  return transactions.data;
}

// validazione
async function validate(txs) {
  const heightTip = await axios.get("https://mempool.space/testnet4/api/blocks/tip/height");

  txs.forEach((tx) => {
    const checkHeight = heightTip.data - tx.status.block_height;
    if (5 < checkHeight) {
      // && checkHeight < 103
      // console.log("controllo");
      validateOutput(tx, amount, addressUsers);
    }
  });
}

// validazione output

/*
OGNI TRANSAZIONE FA PARTE AD UN ADDRESS DIFFERENTE QUINDI NON CI SONO PROBLEMI NEL CONTROLLARE 
ESSENDO CHE CI SARANNO SEMPRE ADDRESS E FACCIAMO IL CONTROLLO CHE LA TRANSAZIONE SIA AVVENUTA IN QUEL ADDRESS
*/

function validateOutput(tx, satoshi, address) {
  // console.log(tx.status.block_time, tx.txid);
  tx.vout.forEach((txOutput) => {
    if (txOutput.value === satoshi && txOutput.scriptpubkey_address === address) {
      const para = {
        txid: tx.txid,
        amount: satoshi,
        address: txOutput.scriptpubkey_address,
        time: tx.status.block_time,
      };
      console.log(para);
      Transection();
      sign(para);
      // console.log("passo");
    }
  });
}

async function Transection() {
  const apiURL = process.env.API_URL;
  const provider = new ethers.JsonRpcProvider(apiURL);
  const addressContract = "0x33C114d4a2916a6FC90E2eb7296aE893d814551b";
  const signer = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(addressContract, abi, signer);
  const nonce = crypto.randomBytes(8).toString("hex");
  const txId = "5d174af9d96b7ae48877cdae2cf11c6466006465ac0fed9fa3bf14dacba4734f";
  const addressRIMPED160 = "f1384ced7248c3db7fe1950d415772291fafae84";
  console.log(Buffer.from(addressRIMPED160, "hex"));
  console.log(nonce);
  console.log(Buffer.from(txId), "hex");
  const send = await contract.mintToken();
  // const send = await contract.signatureVerifier(Buffer.from(addressRIMPED160), Buffer.from(nonce, "hex"), Buffer.from(txId, "hex"));
  // console.log(send);
  // const receipt = await send.wait();
  // console.log("Transaction receipt:", receipt);
}

async function main() {
  const txs = await transectionAddress(addressUsers);
  const checkHeight = validate(txs);
}

main();

// ora se tutte le verifiche passano bisogna creare una firma e mandarla al debt issuer in modo che capisca che il block
// è stato avvenuto

/*

https://bitnodes.io/

30450221009db630e24458048c042cea333ae47d0550e96707a4cb47dfbc8962d764161f950220550298f7657e0d5dabb8f3cecda321eb8ffbd31e9ddc175c9d43987e8b929e1f
3046022100a5c466a35cab0a74e3e3f832051625bf2a2a997254f11fa3faf8d907f7335381022100e95622581ffd69ce4eee54ecb758c79b021259d6dcd5d055d72726cf4aec6c99
https://madpackets.com/2017/12/12/bitcoin-networking/#:~:text=The%20node%2Fservice%20column%20shows%20the%20IPv4%20or%20IPv6,above%2C%20this%20example%20is%20on%20the%20Bitcoin%20testnet.


per vedere nodi testnet attivi nslookup testnet-seed.bitcoin.petertodd.org
 dig testnet-seed.bitcoin.petertodd.org

https://riptutorial.com/bitcoin/example/26240/request-a-merkle-block-with-bitcore-p2p per merkle roort


function sign(p) {
  var hexMessage = "";

  for (let key in p) {
    hexMessage += p[key].toString();
  }
  const ethMessage = "\x19Ethereum Signed Message:\n" + hexMessage.length + hexMessage;
  const hashMessage = keccak256(Buffer.from(ethMessage)).toString("hex");

  const privateKey = '97401bd9e0c17c8ffdbd24d7e81141c43b4aa31e914a1ae24d05120d55243ee3'
  const keyPair = ec.keyFromPrivate(privateKey);

  const publicKey = keyPair.getPublic().encode("hex");
  const sign = keyPair.sign(hashMessage);
  // inviare per vedere la firma
  const createSign = Buffer.concat([
    Buffer.from(sign.r.toString("hex"), "hex"), // ----------------------
    Buffer.from(sign.s.toString("hex"), "hex"),
    Buffer.from([sign.recoveryParam]),
  ]);

  console.log(createSign.length);

  const v = sign.recoveryParam + 27;

  // inviare address prima di trasformarlo in bs58 quindi inviarlo ancora quando è rimped160 r s v hashmessage
  // 3db5196434fdab4c0402d7cb4875b3a64c7fee6650561f940fc742ff6aee7569034a1a176ec0f2de6992a3333e127f4057d67604d33fd5eb8d90375c61fa4e95a
}

// creazione firma


*/
