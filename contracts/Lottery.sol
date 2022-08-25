// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lottery {
    address public operatorAddress;
    uint private _lotteryId;
    uint public ticketPrice = 5 * 10 ** 18;

    IERC20 public lottoToken;

    constructor(address lottoAddress_, address operatorAddress_){
        lottoToken = IERC20(lottoAddress_);
        operatorAddress = operatorAddress_;
    }

    uint256 public ticketCount;

    struct Ticket {
        address owner;
        uint number;
    }

    mapping(uint256 => Ticket) private _tickets;
    mapping(uint256 => uint[]) private _ticketsEachRound;
    mapping(uint256 => uint) private _balanceEachRound;
    mapping(address => mapping(uint => uint[])) public totalMyTicket;
    mapping(uint => uint) public winningTicket;
    mapping(uint => bool) private _isClaimed;

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function buyTicket(uint[] calldata number) external payable {
        require(lottoToken.balanceOf(msg.sender) >= ticketPrice * number.length, "Not enough balance");
        lottoToken.transferFrom(msg.sender, address(this), ticketPrice * number.length);
        for(uint i = 0; i < number.length; i++){
            _tickets[ticketCount] = Ticket(msg.sender, number[i]);
            _ticketsEachRound[_lotteryId].push(ticketCount);
            totalMyTicket[msg.sender][_lotteryId].push(ticketCount);
            ticketCount++;
        }
    }

    function pickWinner() onlyOperator external {
        uint randomNumber = uint(keccak256(abi.encodePacked(block.difficulty, _ticketsEachRound[_lotteryId])));
        randomNumber = randomNumber % _ticketsEachRound[_lotteryId].length;
        winningTicket[_lotteryId] = _ticketsEachRound[_lotteryId][randomNumber];
        _lotteryId++;
    }

    function claimReward(uint _lotteryId) external {
        uint[] memory myTickets = totalMyTicket[msg.sender][_lotteryId];
        bool doIWin = false;
        for(uint i=0; i < myTickets.length; i++){
            if(myTickets[i] == winningTicket[_lotteryId]){
                doIWin = true;
            }
        }
        require(doIWin == true, "You not win");
        require(_isClaimed[_lotteryId], "Reward is claimed");

        lottoToken.transfer(msg.sender, _balanceEachRound[_lotteryId]);

        _isClaimed[_lotteryId] = true;
    }


}