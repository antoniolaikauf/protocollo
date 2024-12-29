// const Client = require("bitcoin-core");
// const client = new Client({ network: "regtest" });
const axios = require("axios");

async function address() {
  try {
    const data = await axios.get("https://blockstream.info/api/address/bc1qgsmfaz22lzy08wqjspd8xtm43hal5tgz4hyac6", {
      timeout: 10000, // Aumenta il timeout a 10 secondi
    });
    console.log(data);
  } catch (error) {
    console.log("Errore durante la richiesta:", error.message);
  }
}

address();

// const Peer = new bitcoinCore({ network: "testnet" });

const addressUsers = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const transectionRaw =
  "02000000014cbcbbe7f06a2d51ace150946691ea4239ee067dc3b81f1a956d183a2723fe6c000000006a47304402206860351004fcbd685d43693be7b05d4c9b57e1a2ce9e7eaa488fe7e7e5460f6d022060c16e210f4188095abb03aa2ea0eb8a6946ba3735adabee096f8fda2bea7c9b012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02e8030000000000001976a91406c0aa6ab779c914b9558cf4a65087fcecff709388ac10ef4b00000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000";

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
