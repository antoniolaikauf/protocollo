// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DestinationToken {
    mapping(bytes20 => bool) private addressWithMoney;

    mapping(bytes8 => bytes8) private nonce;

    /**
     * @dev signatureVerifier verifica che chi chiama sta funzione passi un nonce
       @dev che non sia mai stato associato ad una transazione e anche un address
       @dev che non sia mai stato registrato, bisognerebbe implementare anche
       @dev un oracolo che veda che la transazione sia stata verificata, 
       @dev ma per ora la si fa solo dalla parte front-end.
       @dev l'entropia del nonce è di 2**64 (8 bytes)  quindi ci possono essere abbastanza nonce
       @dev da non causare una collisione invece per l'address di BTC prima del passaggio
       @dev di trasformarlo in bs58 è 2**40 (5 bytes)
     */
    function signatureVerifier(
        bytes20 _address,
        bytes8 _nonce,
        bytes8 _txId
    ) external {
        require(nonce[_nonce] == false, "inserito nonce sbagliato");
        require(addressWithMoney[_address] == false, "address gia esistente");

        addressWithMoney[_address] = true;
        nonce[_nonce] = _txId;
    }

    function mintToken() public {}

    function burnToken() public {}
}
