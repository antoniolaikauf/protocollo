// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;
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
        require(nonce[_nonce] == 0, "inserito nonce sbagliato");
        require(addressWithMoney[_address] == false, "address gia esistente");

        addressWithMoney[_address] = true;
        nonce[_nonce] = _txId;
    }

    function mintToken() public {}

    function burnToken() public {}
}

/*

    function signatureVerifier(
        bytes20 _address,
        bytes8 _nonce,
        bytes8 _txId,
        bytes memory _sign,
        bytes32 _hashMessage,
        address _addressRIMPED160
    ) external {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(_sign);
        
        require(_addressRIMPED160 == ecrecover(_hashMessage, v, r, s));
        require(nonce[_nonce] == 0, "inserito nonce sbagliato");
        require(addressWithMoney[_address] == false, "address gia esistente");

        addressWithMoney[_address] = true;
        nonce[_nonce] = _txId;
    }

    function splitSignature(
        bytes memory _sig
    ) internal pure returns (uint8, bytes32, bytes32) {
        require(_sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // primi 32 bytes
            r := mload(add(_sig, 32))
            // 32 byte successivi
            s := mload(add(_sig, 64))
            // ultimo byte
            v := byte(0, mload(add(_sig, 92)))
        }

        return (v, r, s);
    }

*/
