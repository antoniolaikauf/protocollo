// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract DestinationToken {
    address addressBridge;

    modifier onlyBridge() {
        require(addressBridge == msg.sender, "only bridge can do this call");
        _;
    }
    function mintToken() public onlyBridge {}

    function burnToken() public onlyBridge {}
}
