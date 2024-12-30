const axios = require("axios");
const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const addressUsers = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const transectionRaw =
  "02000000014cbcbbe7f06a2d51ace150946691ea4239ee067dc3b81f1a956d183a2723fe6c000000006a47304402206860351004fcbd685d43693be7b05d4c9b57e1a2ce9e7eaa488fe7e7e5460f6d022060c16e210f4188095abb03aa2ea0eb8a6946ba3735adabee096f8fda2bea7c9b012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02e8030000000000001976a91406c0aa6ab779c914b9558cf4a65087fcecff709388ac10ef4b00000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000";
const amount = 500000; // in satoshi

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
      console.log("controllo");
      validateOutput(tx, amount, addressUsers);
    }
  });
}

// validazione output
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
      sign(para);
      console.log("passo");
    }
  });
}

// creazione firma
function sign(p) {
  const pairkey = ec.genKeyPair();
  const publicKey = pairkey.getPublic();
  var hexMessage = "";
  for (let key in p) {
    hexMessage += p[key].toString();
  }
  const byte = Buffer.from(hexMessage);
  const sign = pairkey.sign(byte).toDER("hex");

  // inviare firma e emssaggio a smart contract
  console.log(pairkey.verify(byte, sign));
}

async function main() {
  const txs = await transectionAddress(addressUsers);
  const checkHeight = validate(txs);
}

main();

// ora se tutte le verifiche passano bisogna creare una firma e mandarla al debt issuer in modo che capisca che il block
// è stato avvenuto

/*
testnet-seed.bitcoin.petertodd.org
testnet-seed.bluematt.me
testnet-seed.bitcoin.schildbach.de

https://bitnodes.io/


https://madpackets.com/2017/12/12/bitcoin-networking/#:~:text=The%20node%2Fservice%20column%20shows%20the%20IPv4%20or%20IPv6,above%2C%20this%20example%20is%20on%20the%20Bitcoin%20testnet.


per vedere nodi testnet attivi nslookup testnet-seed.bitcoin.petertodd.org
 dig testnet-seed.bitcoin.petertodd.org

https://riptutorial.com/bitcoin/example/26240/request-a-merkle-block-with-bitcore-p2p per merkle roort




const bitcoin = require("bitcore-lib");
const bitcoreP2p = require("bitcore-p2p");

// const ipNodeMainet = "159.148.57.59";
const ipNodeMainet = "46.166.142.2";
const ipNodeTestnet = "69.59.18.207";
// const ipNodeTestnet = "47.104.111.187";

var Networks = bitcoin.Networks;
var Peer = bitcoreP2p.Peer;
var Messages = new bitcoreP2p.Messages();
// var Messages = new bitcoreP2p.Messages();
// const peer = new Peer({ host: ipNodeTestnet, port: 18333, network: Networks.testnet });
const peer = new Peer({ host: ipNodeMainet, network: Networks.mainnet });
console.log(peer);

// console.log(Messages);

peer.on("connecting", function () {
  console.log("Connessione al peer...");
});

peer.on("ready", function () {
  console.log("Connesso al peer!");

  // Creazione del messaggio GetAddr
  const getAddrMessage = Messages.GetAddr();
  peer.sendMessage(getAddrMessage);
});

peer.on("addr", function (message) {
  console.log("Ricevuti indirizzi:");
  message.addresses.forEach(function (address) {
    console.log(address);
  });
});

// handle events
peer.on("inv", function (message) {
  // message.inventory[]
});

peer.on("tx", function (message) {
  // message.transaction
});

peer.on("disconnect", function () {
  console.log("Disconnesso dal peer");
});

// Gestione di altri eventi se necessario
peer.connect();
  */
