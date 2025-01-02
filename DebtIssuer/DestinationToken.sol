// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DestinationToken {
    function signatureVerifier(
        bytes20 _addressBTC, // fornire il rimped160
        uint8 _v,
        bytes32 _hashMessage,
        bytes32 _r,
        bytes32 _s
    ) external {
        /**
         * @dev addressBTC avrà solo 20 byte derivati dall'address di BTC
         * @dev si fanno il double hash e si controlla  
         */
        address addressBTC = ecrecover(_hashMessage, _v, _r, _s);
        bytes20 derivedBTCAddress = ripemd160(
            abi.encodePacked(sha256(abi.encodePacked(addressBTC)))
        );
        require(derivedBTCAddress == _addressBTC, "invalid sign");

        mintToken();
    }

    // modifier onlyBridge() {
    //     require(addressBridge == msg.sender, "only bridge can do this call");
    //     _;
    // }
    function mintToken() public {}

    function burnToken() public {}
}
