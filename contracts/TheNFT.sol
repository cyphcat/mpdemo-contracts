// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";
import '@openzeppelin/contracts/utils/Strings.sol';

contract TheNFT is ERC721A {
    using Strings for uint256;

    string private baseURI;

    constructor(string memory baseURI_) ERC721A("TheNFT", "NFT") {
        baseURI = baseURI_;
    }

    function mint(uint256 quantity) external payable {
        _safeMint(msg.sender, quantity);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        uint256 x = tokenId % 8;
        return bytes(baseURI).length != 0 ? string(abi.encodePacked(baseURI, x.toString(), ".json")) : "";
    }
}
