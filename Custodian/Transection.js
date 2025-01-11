const bitcoin = require("bitcore-lib");
const axios = require("axios");
const crypto = require("crypto");
const bs58check1 = require("bs58check");

function createTransection(pk) {
  // const verifyScriptHash = bitcoin.crypto.Hash.sha256ripemd160(prova);
  // const addressMoney = bitcoin.Address.fromScriptHash(verifyScriptHash, bitcoin.Networks.testnet);
  // console.log(verifyAddress.toString("hex"));

  bitcoin.Networks.add(bitcoin.Networks.testnet);
  var privateKey = new bitcoin.PrivateKey(pk);
  const addressMoney = privateKey.toAddress(bitcoin.Networks.testnet);
  // console.log(privateKey);

  // const address_test = "mg8f9rN1NWM9ZGzNgnXHr1QoV4XzzhPYEF"; // address a cui inviare soldi
  // const address_test = "2N8Wopo3ro4KJ91dp2FBC5UPfjx3fUw7dmG"; // address a cui inviare soldi
  // const address_test = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // address a cui inviare soldi
  const address_test = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr"; // address a cui inviare soldi
  // const address_test = "2MwVDMAhEX8WptvMNLRrofm4VY6t6K4j1qg"; // address a cui inviare soldi

  const utxos = {
    txId: "0135207e916986769a092c18c89a10eee1bbc811d4da2353418f640bc373b904",
    outputIndex: 1,
    address: "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN",
    script: bitcoin.Script.buildPublicKeyHashOut(addressMoney),
    satoshis: 100000, // satoshi che ha la transazione
  };

  console.log(addressMoney.toString("hex"));
  console.log("Match:", addressMoney.toString("hex") === utxos.address);

  const fee = 1000;
  var transaction = new bitcoin.Transaction()
    .from(utxos) // Feed information about what unspent outputs one can use
    .to(address_test, 2000) // Add an output with the given amount of satoshis
    .change("mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN") // Sets up a change address where the rest of the funds will go
    .fee(fee)
    .sign(privateKey);

  return transaction.serialize();
}

function broadcast(tx) {
  console.log(tx);

  const transactions = axios
    .post("https://mempool.space/testnet4/api/tx", tx, {
      // timeout: 50000,
      headers: {
        "Content-Type": "text/plain",
      },
    })
    .then((responde) => {
      console.log("risposta " + responde);
    })
    .catch((err) => {
      console.log("errore" + err);
    });
}

function doubleHash(s) {
  const first_hash = crypto.createHash("sha256").update(s).digest();
  const scriptHash = crypto.createHash("ripemd160").update(first_hash).digest();
  return scriptHash;
}

// function createTransection1() {
//   const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);

//   const addressP2SH = new bitcoin.Address("2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr");

//   console.log("P2SH Address:", addressP2SH.toString("hex"));

//   // UTXO disponibile
//   const utxo = {
//     txId: "9700f600290fe374a9e5314444af042b3738efc4491bf4aeb541bf9faa534e96",
//     outputIndex: 1,
//     satoshis: 1000, // 0.001 BTC
//   };

//   const recipientAddress = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN"; // Indirizzo del destinatario
//   const fee = 200;

//   const publicKeyHash = doubleHash(privateKey2.toPublicKey().toString("hex"));

//   const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
//   const decodedP2SH = bs58check1.default.decode(address);
//   const p2shHash = Buffer.from(decodedP2SH.slice(1), "hex");

//   const script = Buffer.concat([
//     // Buffer.from([0x63]), // OP_IF
//     Buffer.from([0x76]), // OP_DUP
//     Buffer.from([0xa9]), // OP_HASH160 The input is hashed twice: first with SHA-256 and then with RIPEMD-160.
//     Buffer.from([0x14]), // length pubKeyHash (20 byte)
//     p2shHash, // public key doblue hash
//     Buffer.from([0x88]), // OP_EQUALVERIFY
//     Buffer.from([0xac]), // OP_CHECKSIG The signature used by OP_CHECKSIG must be a valid signature for this hash and public key
//     // Buffer.from([0x67]), // OP_ELSE
//     // Buffer.from([0x6a]), // OP_RETURN Marks transaction as invalid
//     // Buffer.from([0x68]), // OP_ENDIF
//   ]);

//   var redeemScript = new bitcoin.Script(script);
//   console.log("ddddddddddddddd     " + redeemScript.toString());

//   // Creazione della transazione
//   const tx = new bitcoin.Transaction()
//     .from([
//       {
//         address: addressP2SH,
//         txId: utxo.txId,
//         outputIndex: utxo.outputIndex,
//         script: script, // Placeholder, usa redeemScript come input
//         satoshis: utxo.satoshis,
//       },
//     ])
//     .to(recipientAddress, 800) // Importo da inviare (0.0007 BTC)
//     .change(addressP2SH) // Indirizzo di cambio
//     .fee(fee);
//   tx.sign(privateKey2); // Firma con la chiave privata associata
//   console.log(tx);

//   //   return tx.serialize();
// }

function main() {
  const privateKey = "793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f";
  // const transection = createTransection1();
  const transection = createTransection(privateKey);
  broadcast(transection);
}

// main();

// */
// // https://github.com/bitpay/bitcore-lib/blob/master/docs/examples.md

// // https://medium.com/@nagasha/how-to-build-and-broadcast-a-bitcoin-transaction-using-bitcoinjs-bitcoinjs-lib-on-testnet-2d9c8ac725d6

// // https://faucet.testnet4.dev/

// /*
// mettere soldi su address mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN

// transazione c22cd889dbf88ce536b929fe35392333481e45621281d21af1c55350ad4d780d

// private key: 793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f, master chain: b2c832d167457da44eaf72ec946e5b9e94a0151f927680528e9b9775000779ec
// chiave pubblica: 04ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
// chiave pubblica compressa:03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
// punto x in SECP256k1: 03ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760e
// punto y in SECP256k1: 64c361b1b65b82b2ee9d804f06bb9637e41c785cd7657d85a6259abb1bdc86f7
// ADDRESS: b'mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN'

/*
291fafae8487509907000000000
76a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
version 02000000
input count  01
hash tx reverse 66889034c65345328d4a9d0c0d637d4186cd7680db93bb231e66930bafc9b49e01
index transection 000000
script size 6b
script della firma 483045022100bfb9fb765d30d70582c7d5e22aecd93f6253f0545cb456ec6e82ab0e477c4fbf022039ce8e3a9046fa85a88e0f332a96fe97d88076aeb46cfef6b4e2a5c1bb4719e1012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760
Input 1 sequence effffffff
output count 02
output value 1 e803000000000000
public key script lenght 17
public key script a914f1384ced7248c3db7fe1950d415772 lunga 17 
output 2 value 
ouput 2 length 19


02000000
01
66889034c65345328d4a9d0c0d637d4186cd7680db93bb231e66930bafc9b49e
010000
006b483045022100bfb9fb765d30d70582c7d5e22aecd93f6253f0545cb456ec6e82ab0e477c4fbf022039ce8e3a9046fa85a88e0f332a96fe97d88076aeb46cfef6b4e2a5c1bb4719e1012103ce657273af7b6fc1047fb56436961ab9ed57cacc382eeddf47cb63e0bcef760effffffff02e80300000000000017a914f1384ced7248c3db7fe1950d415772291fafae848750990700000000001976a914d320c24246a9245453aa45238e9456fc8aafbcf588ac00000000
*/

const EC = require("elliptic").ec; // dipendenza da installare
const ec = new EC("secp256k1");
const bs58check = require("bs58check");

function reverse(tx) {
  return Buffer.from(tx, "hex").reverse().toString("hex");
}

function main1() {
  const privateKey2 = new bitcoin.PrivateKey("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9", bitcoin.Networks.testnet);
  const publicKey2 = privateKey2.toPublicKey().toString();
  const p = doubleHash(publicKey2);

  const destinationAddress = "mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN";
  const decoded = bs58check.default.decode(destinationAddress);
  const redeemScriptAddress = decoded.slice(1);

  const address = "2NFEgHLofKiFz19Sa7eqGAbMkCoa4b1dtcr";
  const decodedP2SH = bs58check.default.decode(address);
  const p2shHash = Buffer.from(decodedP2SH.slice(1), "hex");
  const privateKeyAddressTo = bitcoin.PrivateKey("793e4754ba6305f53afff74100e0d127ff548e1294955c2296811b6ec7c0be1f", bitcoin.Networks.testnet);

  const scriptAddressFrom = bitcoin.Script.buildPublicKeyHashOut(address);
  const publicKeyHash = doubleHash(publicKey2);
  const scriptAddress = bitcoin.Script.buildPublicKeyHashOut(destinationAddress); // script in address
  const publicKey = doubleHash(privateKeyAddressTo.toPublicKey().toString("hex")).toString("hex");

  // script address from OP_DUP OP_HASH160 20 0xf1384ced7248c3db7fe1950d415772291fafae84 OP_EQUALVERIFY OP_CHECKSIG

  const t = doubleHash("03f6a19b3cf3240dad60914626e293410008821f63fc05add0aaf5803791c27a33");
  console.log(t);

  const script = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    p2shHash, //--------------------s
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  console.log("sono qua \n\n" + doubleHash(script).toString("hex") + "\n\n");

  // script address to OP_DUP OP_HASH160 20 0xd320c24246a9245453aa45238e9456fc8aafbcf5 OP_EQUALVERIFY OP_CHECKSIG

  // corretto
  const ScriptPubKey = Buffer.concat([
    Buffer.from([0x76]),
    Buffer.from([0xa9]),
    Buffer.from([0x14]),
    redeemScriptAddress,
    Buffer.from([0x88]),
    Buffer.from([0xac]),
  ]);

  console.log(ScriptPubKey.toString("hex"));

  const version = reverse("2".padStart(8, "0"));
  const tx_in_count = "01";
  // input
  const hashTXReverse = reverse("2353086dbe5fa4c739408216cc319659df0b3bff41a01456ee702e7e021112e6");
  const indexPrevOutput = reverse("0".padStart(8, "0"));

  const emptyScript = "76a914" + doubleHash(p.toString("hex")).toString("hex") + "88ac";
  const emptyScriptLenght = emptyScript.length.toString(16);
  const sequence = "ffffffff";
  // output
  const tx_out_count = "01";
  // aggiunto 0
  const valueOutput = reverse("06a4").toString("hex").padEnd(16, "0"); // 1700
  const scriptLenghtOutput = ScriptPubKey.length.toString(16).padStart(2, "0");

  const lookTime = reverse("00000000");
  const sigHashCode = reverse("00000001");

  const dataToSign = Buffer.concat([
    Buffer.from(version, "hex"),
    Buffer.from(tx_in_count, "hex"),
    Buffer.from(hashTXReverse, "hex"),
    Buffer.from(indexPrevOutput, "hex"),
    Buffer.from(emptyScriptLenght, "hex"),
    Buffer.from(emptyScript, "hex"),
    Buffer.from(sequence, "hex"),
    Buffer.from(tx_out_count, "hex"),
    Buffer.from(valueOutput, "hex"),
    Buffer.from(scriptLenghtOutput, "hex"),
    ScriptPubKey, // È già un buffer, non serve convertirlo
    Buffer.from(lookTime, "hex"),
    Buffer.from(sigHashCode, "hex"),
  ]);

  const data1 = crypto.createHash("sha256").update(dataToSign).digest();
  const data = crypto.createHash("sha256").update(data1).digest();

  const keyPair = ec.keyFromPrivate("191c609103e968dc71954d68c8fbe19840673827c672a81e645987b8b514b9e9");

  const sign = keyPair.sign(data);

  const signatureWithHashType = Buffer.concat([Buffer.from(sign.toDER("hex"), "hex"), Buffer.from([0x01])]);

  const scriptSig = Buffer.concat([
    Buffer.from([signatureWithHashType.length.toString()]),
    signatureWithHashType, // ------------------s-
    // Buffer.from([publicKey2.length]),
    // Buffer.from(publicKey2),
    Buffer.from([script.length.toString()]),
    script,
  ]);

  const scriptLengthInput = scriptSig.length.toString(16).padStart(2, "0");

  const rawTx = Buffer.concat([
    Buffer.from(version, "hex"), // Versione della transazione
    Buffer.from(tx_in_count, "hex"), // Numero di input
    Buffer.from(hashTXReverse, "hex"), // Hash della transazione precedente (invertito)
    Buffer.from(indexPrevOutput, "hex"), // Indice dell'output speso
    Buffer.from(scriptLengthInput, "hex"), // Lunghezza del scriptSig
    scriptSig, // ScriptSig per sbloccare i fondi
    Buffer.from(sequence, "hex"), // Numero di sequenza
    Buffer.from(tx_out_count, "hex"), // Numero di output
    Buffer.from(valueOutput, "hex"), // Valore dell'output
    Buffer.from(scriptLenghtOutput, "hex"), // Lunghezza del script di blocco (ScriptPubKey)
    ScriptPubKey, // Script di blocco per l'output
    Buffer.from(lookTime, "hex"), // Locktime
    // Buffer.from(sigHashCode, "hex"), // Tipo di firma
  ]);

  console.log("la rawtx\n\n" + rawTx.toString("hex") + "\n\n");
}

main1();

/*


#bitcointools
from deserialize import parse_Transaction, opcodes
from BCDataStream import BCDataStream
from base58 import bc_address_to_hash_160, b58decode, public_key_to_bc_address, hash_160_to_bc_address

import ecdsa_ssl

import Crypto.Hash.SHA256 as sha256
import Crypto.Random

#transaction, from which we want to redeem an output
HEX_TRANSACTION="010000000126c07ece0bce7cda0ccd14d99e205f118cde27e83dd75da7b141fe487b5528fb000000008b48304502202b7e37831273d74c8b5b1956c23e79acd660635a8d1063d413c50b218eb6bc8a022100a10a3a7b5aaa0f07827207daf81f718f51eeac96695cf1ef9f2020f21a0de02f01410452684bce6797a0a50d028e9632be0c2a7e5031b710972c2a3285520fb29fcd4ecfb5fc2bf86a1e7578e4f8a305eeb341d1c6fc0173e5837e2d3c7b178aade078ffffffff02b06c191e010000001976a9143564a74f9ddb4372301c49154605573d7d1a88fe88ac00e1f505000000001976a914010966776006953d5567439e5e39f86a0d273bee88ac00000000"
#output to redeem. must exist in HEX_TRANSACTION
OUTPUT_INDEX=1
#address we want to send the redeemed coins to.
#REPLACE WITH YOUR OWN ADDRESS, unless you're feeling generous 
SEND_TO_ADDRESS="1L4xtXCdJNiYnyqE6UsB8KSJvqEuXjz6aK"
#fee we want to pay (in BTC)
TX_FEE=0.001
#constant that defines the number of Satoshis per BTC
COIN=100000000
#constant used to determine which part of the transaction is hashed.
SIGHASH_ALL=1
#private key whose public key hashes to the hash contained in scriptPubKey of output number *OUTPUT_INDEX* in the transaction described in HEX_TRANSACTION
PRIVATE_KEY=0x18E14A7B6A307F426A94F8114701E7C8E774E7F9A47E2C2035DB29A206321725

def dsha256(data):
   return sha256.new(sha256.new(data).digest()).digest()

tx_data=HEX_TRANSACTION.decode('hex_codec')
tx_hash=dsha256(tx_data)

#here we use bitcointools to parse a transaction. this gives easy access to the various fields of the transaction from which we want to redeem an output
stream = BCDataStream()
stream.write(tx_data)
tx_info = parse_Transaction(stream)

if len(tx_info['txOut']) < (OUTPUT_INDEX+1):
   raise RuntimeError, "there are only %d output(s) in the transaction you're trying to redeem from. you want to redeem output index %d" % (len(tx_info['txOut']), OUTPUT_INDEX)

#this dictionary is used to store the values of the various transaction fields
#  this is useful because we need to construct one transaction to hash and sign
#  and another that will be the final transaction
tx_fields = {}

##here we start creating the transaction that we hash and sign
sign_tx = BCDataStream()
##first we write the version number, which is 1
tx_fields['version'] = 1
sign_tx.write_int32(tx_fields['version'])
##then we write the number of transaction inputs, which is one
tx_fields['num_txin'] = 1
sign_tx.write_compact_size(tx_fields['num_txin'])

##then we write the actual transaction data
#'prevout_hash'
tx_fields['prevout_hash'] = tx_hash
sign_tx.write(tx_fields['prevout_hash']) #hash of the the transaction from which we want to redeem an output
#'prevout_n'
tx_fields['output_index'] = OUTPUT_INDEX
sign_tx.write_uint32(tx_fields['output_index']) #which output of the transaction with tx id 'prevout_hash' do we want to redeem?

##next comes the part of the transaction input. here we place the script of the *output* that we want to redeem
tx_fields['scriptSigHash'] = tx_info['txOut'][OUTPUT_INDEX]['scriptPubKey']
#first write the size
sign_tx.write_compact_size(len(tx_fields['scriptSigHash']))
#then the data
sign_tx.write(tx_fields['scriptSigHash'])

#'sequence'
tx_fields['sequence'] = 0xffffffff
sign_tx.write_uint32(tx_fields['sequence'])

##then we write the number of transaction outputs. we'll just use a single output in this example
tx_fields['num_txout'] = 1
sign_tx.write_compact_size(tx_fields['num_txout'])
##then we write the actual transaction output data
#we'll redeem everything from the original output minus TX_FEE
tx_fields['value'] = tx_info['txOut'][OUTPUT_INDEX]['value']-(TX_FEE*COIN)
sign_tx.write_int64(tx_fields['value'])
##this is where our scriptPubKey goes (a script that pays out to an address)
#we want the following script:
#"OP_DUP OP_HASH160  OP_EQUALVERIFY OP_CHECKSIG"
address_hash = bc_address_to_hash_160(SEND_TO_ADDRESS)
#chr(20) is the length of the address_hash (20 bytes or 160 bits)
scriptPubKey = chr(opcodes.OP_DUP) + chr(opcodes.OP_HASH160) + \
   chr(20) + address_hash + chr(opcodes.OP_EQUALVERIFY) + chr(opcodes.OP_CHECKSIG)
#first write the length of this lump of data
tx_fields['scriptPubKey'] = scriptPubKey
sign_tx.write_compact_size(len(tx_fields['scriptPubKey']))
#then the data
sign_tx.write(tx_fields['scriptPubKey'])

#write locktime (0)
tx_fields['locktime'] = 0
sign_tx.write_uint32(tx_fields['locktime'])
#and hash code type (1)
tx_fields['hash_type'] = SIGHASH_ALL
sign_tx.write_int32(tx_fields['hash_type'])

#then we obtain the hash of the signature-less transaction (the hash that we sign using our private key)
hash_scriptless = dsha256(sign_tx.input)

##now we begin with the ECDSA stuff.
## we create a private key from the provided private key data, and sign hash_scriptless with it
## we also check that the private key's corresponding public key can actually redeem the specified output

k = ecdsa_ssl.KEY()
k.generate(('%064x' % PRIVATE_KEY).decode('hex'))

#here we retrieve the public key data generated from the supplied private key
pubkey_data = k.get_pubkey()
#then we create a signature over the hash of the signature-less transaction
sig_data=k.sign(hash_scriptless)
#a one byte "hash type" is appended to the end of the signature (https://en.bitcoin.it/wiki/OP_CHECKSIG)
sig_data = sig_data + chr(SIGHASH_ALL)

#let's check that the provided privat key can actually redeem the output in question
if (bc_address_to_hash_160(public_key_to_bc_address(pubkey_data)) != tx_info['txOut'][OUTPUT_INDEX]['scriptPubKey'][3:-2]):
   bytes = b58decode(SEND_TO_ADDRESS, 25)
   raise RuntimeError, "The supplied private key cannot be used to redeem output index %d\nYou need to supply the private key for address %s" % \
                           (OUTPUT_INDEX, hash_160_to_bc_address(tx_info['txOut'][OUTPUT_INDEX]['scriptPubKey'][3:-2], bytes[0]))

##now we begin creating the final transaction. this is a duplicate of the signature-less transaction,
## with the scriptSig filled out with a script that pushes the signature plus one-byte hash code type, and public key from above, to the stack

final_tx = BCDataStream()
final_tx.write_int32(tx_fields['version'])
final_tx.write_compact_size(tx_fields['num_txin'])
final_tx.write(tx_fields['prevout_hash'])
final_tx.write_uint32(tx_fields['output_index'])

##now we need to write the actual scriptSig.
## this consists of the DER-encoded values r and s from the signature, a one-byte hash code type, and the public key in uncompressed format
## we also need to prepend the length of these two data pieces (encoded as a single byte
## containing the length), before each data piece. this length is a script opcode that tells the
## Bitcoin script interpreter to push the x following bytes onto the stack

scriptSig = chr(len(sig_data)) + sig_data + chr(len(pubkey_data)) + pubkey_data
#first write the length of this data
final_tx.write_compact_size(len(scriptSig))
#then the data
final_tx.write(scriptSig)

##and then we simply write the same data after the scriptSig that is in the signature-less transaction,
#  leaving out the four-byte hash code type (as this is encoded in the single byte following the signature data)

final_tx.write_uint32(tx_fields['sequence'])
final_tx.write_compact_size(tx_fields['num_txout'])
final_tx.write_int64(tx_fields['value'])
final_tx.write_compact_size(len(tx_fields['scriptPubKey']))
final_tx.write(tx_fields['scriptPubKey'])
final_tx.write_uint32(tx_fields['locktime'])

#prints out the final transaction in hex format (can be used as an argument to bitcoind's sendrawtransaction)
print final_tx.input.encode('hex')


*/
