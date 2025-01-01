// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DestinationToken {
    address addressBridge = mzmJ7eqgfrqvYGbuMNQtsyEQHrbbQ6XkwN;

    function signatureVerifier(
        address _addressBTC,
        uint8 _v,
        bytes32 _hashMessage,
        bytes32 _r,
        bytes32 _s
    ) external {
        address addressBTC = ecrecover(_hashMessage, _v, _r, _s);
        require(addressBTC == _addressBTC, "invalid sign");

        mintToken();
    }

    // modifier onlyBridge() {
    //     require(addressBridge == msg.sender, "only bridge can do this call");
    //     _;
    // }
    function mintToken() public {}

    function burnToken() public {}
}
