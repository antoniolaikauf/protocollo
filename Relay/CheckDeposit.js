const bitcoin = require("bitcore-lib");
const Peer = require("bitcore-p2p").Peer;
const ipNode = "159.148.57.59";
// const ipNode = "46.166.142.2";
const peer = new Peer({ host: ipNode });

peer.on("ready", function () {
  console.log(peer.version);
});

peer.connect();

const addressUsers = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
const transectionRaw =
  "02000000014cbcbbe7f06a2d51ace150946691ea4239ee067dc3b81f1a956d183a2723fe6c000000006a47304402206860351004fcbd685d43693be7b05d4c9b57e1a2ce9e7eaa488fe7e7e5460f6d022060c16e210f4188095abb03aa2ea0eb8a6946ba3735adabee096f8fda2bea7c9b012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02e8030000000000001976a91406c0aa6ab779c914b9558cf4a65087fcecff709388ac10ef4b00000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000";
