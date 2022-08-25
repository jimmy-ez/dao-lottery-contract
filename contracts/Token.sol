// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts@4.7.3/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts@4.7.3/access/Ownable.sol";

contract Lotto is ERC20, Ownable {
    constructor() ERC20("Lotto", "LTT") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
