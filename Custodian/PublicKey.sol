// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract PublicKey {
    mapping(bytes => bytes) private publicKeys;
    mapping(bytes => bool) private checkPublicKeys;

    function random(bytes memory _privateKey) public returns (bytes memory) {
        require(_privateKey.length == 33, "length to small");
        require(
            checkPublicKeys[_privateKey] == false,
            "publicKey already create"
        );
        checkPublicKeys[_privateKey] = true;
        bytes memory publicKey = new bytes(33);
        uint Number = uint(
            keccak256(
                abi.encodePacked(msg.sender, block.timestamp, _privateKey)
            )
        );
        assembly {
            mstore(add(publicKey, 33), Number)
        }
        publicKeys[_privateKey] = publicKey;
        return publicKey;
    }

    function checkPublicKey(
        bytes memory _privateKey
    ) public view returns (bytes memory) {
        require(publicKeys[_privateKey].length == 33);
        return publicKeys[_privateKey];
    }
}



// DA ELIMINARE 
