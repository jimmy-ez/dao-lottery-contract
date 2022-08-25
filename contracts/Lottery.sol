// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery {
    address public operatorAddress;
    uint256 public lotteryId;
    uint256 public ticketPrice = 5 * 10**18;
    address public tokenAddress;

    IERC20 public lottoToken;

    constructor(address lottoAddress_, address operatorAddress_) {
        lottoToken = IERC20(lottoAddress_);
        operatorAddress = operatorAddress_;
        tokenAddress = lottoAddress_;
    }

    uint256 public ticketCount;

    struct Ticket {
        address owner;
        uint256 number;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => uint256[]) public ticketsEachRound;
    mapping(uint256 => uint256) public balanceEachRound;
    mapping(address => mapping(uint256 => uint256[])) public totalMyTicket;
    mapping(uint256 => uint256) public winningTicket;
    mapping(uint256 => bool) public isClaimed;
    mapping(uint256 => bool) public isPickedWinner;

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function buyTicket(uint256[] calldata number) external {
        require(lottoToken.balanceOf(msg.sender) >= ticketPrice * number.length, "Not enough balance");
        lottoToken.transferFrom(msg.sender, address(this), ticketPrice * number.length);
        balanceEachRound[lotteryId] += ticketPrice * number.length;
        for (uint256 i = 0; i < number.length; i++) {
            tickets[ticketCount] = Ticket(msg.sender, number[i]);
            ticketsEachRound[lotteryId].push(ticketCount);
            totalMyTicket[msg.sender][lotteryId].push(ticketCount);
            ticketCount++;
        }
    }

    function pickWinner() external onlyOperator {
        require(ticketsEachRound[lotteryId].length > 0, "No players");
        uint256 randomNumber = uint256(keccak256(abi.encodePacked(block.difficulty, ticketsEachRound[lotteryId])));
        randomNumber = randomNumber % ticketsEachRound[lotteryId].length;
        winningTicket[lotteryId] = ticketsEachRound[lotteryId][randomNumber];
        isPickedWinner[lotteryId] = true;
        lotteryId++;
    }

    function claimReward(uint256 lotteryId_) external {
        require(isPickedWinner[lotteryId_] == true, "Winner isn't piecked");
        uint256[] memory myTickets = totalMyTicket[msg.sender][lotteryId_];
        bool doIWin = false;
        for (uint256 i = 0; i < myTickets.length; i++) {
            if (myTickets[i] == winningTicket[lotteryId_]) {
                doIWin = true;
            }
        }
        require(doIWin == true, "You not win");
        require(isClaimed[lotteryId_] == false, "Reward is claimed");

        lottoToken.transfer(msg.sender, balanceEachRound[lotteryId_]);

        isClaimed[lotteryId_] = true;
    }

    function myTicketOfLotteryId(uint256 lotteryId_) external view returns (uint256[] memory) {
        return totalMyTicket[msg.sender][lotteryId_];
    }
}
