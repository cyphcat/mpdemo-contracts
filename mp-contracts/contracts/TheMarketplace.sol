// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "wyvern-v3/contracts/exchange/Exchange.sol";

contract TheMarketplace is Exchange {

    constructor(uint chainId, address registry) {
        DOMAIN_SEPARATOR = hash(EIP712Domain({
            name: "The Marketplace",
            version: "1.0",
            chainId: chainId,
            verifyingContract: address(this)
        }));

        registries[registry] = true;
    }
}
