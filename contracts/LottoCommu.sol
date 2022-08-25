// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ILottery.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LottoCommu {
    address public lotteryAddress;
    address public operatorAddress;

    uint public roundId;
    ILottery public lottery;
    IERC20 public lottoToken;

    constructor(address lotteryAddress_, address tokenAddress_, address operatorAddress_){
        lottery = ILottery(lotteryAddress_);
        lottoToken = IERC20(tokenAddress_);
        lotteryAddress = lotteryAddress_;
        operatorAddress = operatorAddress_;
    }

    mapping(uint => uint) public lotteryIdEachRound;
    // mapping(uint => address[]) public membersDAO;
    mapping(uint => mapping(address => uint)) public memberTicketsAmount;
    mapping(uint => uint) public balanceEachRound;
    mapping(uint => uint) public ticketsEachRound;
    mapping(uint => bool) public isStartRound;
    mapping(uint => bool) public isWinEachRound;
    mapping(uint => uint) public roundReward;
    mapping(uint => mapping(address => bool)) public isClaimed;

    uint public fee = 5;
    uint public decimal = 10 ** 2;

    modifier isLotteryNotEnd () {
        require(lottery.isPickedWinner(lotteryIdEachRound[roundId]) == false, "Lottery is end");
        _;
    }

    modifier onlyOperator () {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function startRound() isLotteryNotEnd external {
        require(isStartRound[roundId] == false, "This round is started");
        lotteryIdEachRound[roundId] = lottery.lotteryId();
        isStartRound[roundId] = true;
    }

    function closeRound() onlyOperator external {
        
    }


    function buyTicketDAO(uint ticketCount) isLotteryNotEnd external {
        require(ticketCount > 0, "ticket count is 0");
        uint amount = ticketCount * lottery.ticketPrice();
        uint fees = amount * ((fee / decimal) / 100);

        require(lottoToken.balanceOf(msg.sender) >= amount + fees, "Balance is not enough");
        lottoToken.transferFrom(msg.sender, address(this), amount + fees);

        uint256[] memory numbers;
        for(uint256 i=0;i < ticketCount; i++){
            numbers[i] = i;
        }
        lottoToken.approve(lotteryAddress, amount);
        lottery.buyTicket(numbers);
        
        memberTicketsAmount[roundId][msg.sender] += ticketCount;
        ticketsEachRound[roundId] += ticketCount;
        // membersDAO[roundId].push(msg.sender);
    }

    function claimLotteryReward(uint roundId_) onlyOperator external {
        require(isStartRound[roundId] == true, "Round is not start");
        lottery.claimReward(lotteryIdEachRound[roundId_]);
        isWinEachRound[roundId_] = true;
        roundId++;
    }

    function claim(uint roundId_) external {
        require(isWinEachRound[roundId_] == true, "This round not win");
        require(memberTicketsAmount[roundId_][msg.sender] > 0, "Did not buy");
        require(isClaimed[roundId_][msg.sender] == false, "You are claimed");
        uint reward = (memberTicketsAmount[roundId_][msg.sender] / ticketsEachRound[roundId_]) * lottery.balanceEachRound(lotteryIdEachRound[roundId_]);
        lottoToken.transfer(msg.sender, reward);
        isClaimed[roundId_][msg.sender] = true;
    }
}