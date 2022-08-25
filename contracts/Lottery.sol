// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery {
    address public operatorAddress;
    uint public _lotteryId;
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

    mapping(uint256 => Ticket) public _tickets;
    mapping(uint256 => uint[]) public _ticketsEachRound;
    mapping(uint256 => uint) public _balanceEachRound;
    mapping(address => mapping(uint => uint[])) public totalMyTicket;
    mapping(uint => uint) public winningTicket;
    mapping(uint => bool) public _isClaimed;
    mapping(uint => bool) public _isPickedWinner;

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function buyTicket(uint[] calldata number) external {
        require(lottoToken.balanceOf(msg.sender) >= ticketPrice * number.length, "Not enough balance");
        lottoToken.transferFrom(msg.sender, address(this), ticketPrice * number.length);
        _balanceEachRound[_lotteryId] += ticketPrice * number.length;
        for(uint i = 0; i < number.length; i++){
            _tickets[ticketCount] = Ticket(msg.sender, number[i]);
            _ticketsEachRound[_lotteryId].push(ticketCount);
            totalMyTicket[msg.sender][_lotteryId].push(ticketCount);
            ticketCount++;
        }
    }

    function pickWinner() onlyOperator external {
        require(_ticketsEachRound[_lotteryId].length > 0, "No players");
        uint randomNumber = uint(keccak256(abi.encodePacked(block.difficulty, _ticketsEachRound[_lotteryId])));
        randomNumber = randomNumber % _ticketsEachRound[_lotteryId].length;
        winningTicket[_lotteryId] = _ticketsEachRound[_lotteryId][randomNumber];
        _isPickedWinner[_lotteryId] = true;
        _lotteryId++;
    }

    function claimReward(uint256 _lotteryId) external {
        require(_isPickedWinner[_lotteryId] == true, "Winner isn't piecked");
        uint[] memory myTickets = totalMyTicket[msg.sender][_lotteryId];
        bool doIWin = false;
        for(uint i=0; i < myTickets.length; i++){
            if(myTickets[i] == winningTicket[_lotteryId]){
                doIWin = true;
            }
        }
        require(doIWin == true, "You not win");
        require(_isClaimed[_lotteryId] == false, "Reward is claimed");

        lottoToken.transfer(msg.sender, _balanceEachRound[_lotteryId]);

        _isClaimed[_lotteryId] = true;
    }

}