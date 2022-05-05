// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.5;

import "wyvern-v3/contracts/registry/ProxyRegistry.sol";
import "wyvern-v3/contracts/registry/AuthenticatedProxy.sol";

contract TheMarketplaceRegistry is ProxyRegistry {

    bool public initialAddressSet = false;

    constructor() {
        AuthenticatedProxy impl = new AuthenticatedProxy();
        impl.initialize(address(this), this);
        impl.setRevoke(true);
        delegateProxyImplementation = address(impl);
    }

    function grantInitialAuthentication(address authAddress) public onlyOwner {
        require(!initialAddressSet, "already set");
        initialAddressSet = true;
        contracts[authAddress] = true;
    }
}
