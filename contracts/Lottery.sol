// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery {
    address public operatorAddress;
    uint public lotteryId;
    uint public ticketPrice = 5 * 10 ** 18;
    address public tokenAddress;

    IERC20 public lottoToken;

    constructor(address lottoAddress_, address operatorAddress_){
        lottoToken = IERC20(lottoAddress_);
        operatorAddress = operatorAddress_;
        tokenAddress = lottoAddress_;
    }

    uint256 public ticketCount;

    struct Ticket {
        address owner;
        uint number;
    }

    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => uint[]) public ticketsEachRound;
    mapping(uint256 => uint) public balanceEachRound;
    mapping(address => mapping(uint => uint[])) public totalMyTicket;
    mapping(uint => uint) public winningTicket;
    mapping(uint => bool) public isClaimed;
    mapping(uint => bool) public isPickedWinner;

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function buyTicket(uint[] calldata number) external {
        require(lottoToken.balanceOf(msg.sender) >= ticketPrice * number.length, "Not enough balance");
        lottoToken.transferFrom(msg.sender, address(this), ticketPrice * number.length);
        balanceEachRound[lotteryId] += ticketPrice * number.length;
        for(uint i = 0; i < number.length; i++){
            tickets[ticketCount] = Ticket(msg.sender, number[i]);
            ticketsEachRound[lotteryId].push(ticketCount);
            totalMyTicket[msg.sender][lotteryId].push(ticketCount);
            ticketCount++;
        }
    }

    function pickWinner() onlyOperator external {
        require(ticketsEachRound[lotteryId].length > 0, "No players");
        uint randomNumber = uint(keccak256(abi.encodePacked(block.difficulty, ticketsEachRound[lotteryId])));
        randomNumber = randomNumber % ticketsEachRound[lotteryId].length;
        winningTicket[lotteryId] = ticketsEachRound[lotteryId][randomNumber];
        isPickedWinner[lotteryId] = true;
        lotteryId++;
    }

    function claimReward(uint256 lotteryId) external {
        require(isPickedWinner[lotteryId] == true, "Winner isn't piecked");
        uint[] memory myTickets = totalMyTicket[msg.sender][lotteryId];
        bool doIWin = false;
        for(uint i=0; i < myTickets.length; i++){
            if(myTickets[i] == winningTicket[lotteryId]){
                doIWin = true;
            }
        }
        require(doIWin == true, "You not win");
        require(isClaimed[lotteryId] == false, "Reward is claimed");

        lottoToken.transfer(msg.sender, balanceEachRound[lotteryId]);

        isClaimed[lotteryId] = true;
    }

}