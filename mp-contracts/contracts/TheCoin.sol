// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TheCoin is ERC20 {

    constructor() ERC20("TheCoin", "COIN") {
    }

    function mint(uint256 amount) external payable {
        _mint(msg.sender, amount);
    }
}
