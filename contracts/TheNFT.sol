// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";

contract TheNFT is ERC721A {

    constructor() ERC721A("TheNFT", "NFT") {
    }

    function mint(uint256 quantity) external payable {
        _safeMint(msg.sender, quantity);
    }

    function _startTokenId() internal view override returns (uint256) {
        return 1;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // TODO
        return "";
    }
}
