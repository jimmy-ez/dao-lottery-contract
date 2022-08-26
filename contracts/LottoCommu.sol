// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/ILottery.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract LottoCommu {
    using SafeMath for uint256;

    address public lotteryAddress;
    address public operatorAddress;
    address public lottoTokenAddress;

    uint256 public roundId;
    ILottery public lottery;
    IERC20 public lottoToken;

    constructor(
        address lotteryAddress_,
        address tokenAddress_,
        address operatorAddress_
    ) {
        lottery = ILottery(lotteryAddress_);
        lottoToken = IERC20(tokenAddress_);
        lotteryAddress = lotteryAddress_;
        operatorAddress = operatorAddress_;
        lottoTokenAddress = tokenAddress_;
    }

    mapping(uint256 => uint256) public lotteryIdEachRound; // roundId => lotteryId
    // mapping(uint => address[]) public membersDAO;
    mapping(uint256 => mapping(address => uint256)) public memberTicketsAmount; // roundId => owner => amountTicket
    mapping(uint256 => uint256) public balanceEachRound; // roundId => balanceReward
    mapping(uint256 => uint256) public ticketsEachRound; // roundId => AmountTicket
    mapping(uint256 => bool) public isStartRound;
    mapping(uint256 => bool) public isWinEachRound;
    mapping(uint256 => uint256) public roundReward;
    mapping(uint256 => mapping(address => bool)) public isClaimed;

    uint256 public fee = 5;
    uint256 public decimal = 10**3;
    mapping(address => uint256) public tokenFeeReservers;

    modifier isLotteryNotEnd() {
        require(lottery.isPickedWinner(lotteryIdEachRound[roundId]) == false, "Lottery is end");
        _;
    }

    modifier onlyOperator() {
        require(msg.sender == operatorAddress, "Not operator");
        _;
    }

    function startRound() external isLotteryNotEnd {
        require(isStartRound[roundId] == false, "This round is started");
        lotteryIdEachRound[roundId] = lottery.lotteryId();
        isStartRound[roundId] = true;
    }

    function closeRound() external onlyOperator {}

    function buyTicketDAO(uint256 ticketCount) external isLotteryNotEnd {
        require(ticketCount > 0, "ticket count is 0");
        uint256 amount = ticketCount * lottery.ticketPrice();
        uint256 fees = calculateFee(amount);

        require(lottoToken.balanceOf(msg.sender) >= amount + fees, "Balance is not enough");
        lottoToken.transferFrom(msg.sender, address(this), amount + fees);

        uint256[] memory numbers = new uint256[](ticketCount);
        for (uint256 i = 0; i < ticketCount; i++) {
            numbers[0] = 0;
        }

        lottoToken.approve(lotteryAddress, amount);
        lottery.buyTicket(numbers);

        tokenFeeReservers[lottoTokenAddress] += fees;
        memberTicketsAmount[roundId][msg.sender] += ticketCount;
        ticketsEachRound[roundId] += ticketCount;
        // membersDAO[roundId].push(msg.sender);
    }

    function claimLotteryReward(uint256 roundId_) external onlyOperator {
        require(isStartRound[roundId] == true, "Round is not start");
        lottery.claimReward(lotteryIdEachRound[roundId_]);
        balanceEachRound[roundId_] = lottery.balanceEachRound(lotteryIdEachRound[roundId_]);
        isWinEachRound[roundId_] = true;
        roundId++;
    }

    function claim(uint256 roundId_) external {
        require(isWinEachRound[roundId_] == true, "This round not win");
        require(memberTicketsAmount[roundId_][msg.sender] > 0, "Did not buy");
        require(isClaimed[roundId_][msg.sender] == false, "You are claimed");
        uint256 myReward = reward(roundId_);
        lottoToken.transfer(msg.sender, myReward);
        isClaimed[roundId_][msg.sender] = true;
    }

    // Private Function
    function calculateFee(uint256 amount) public view returns (uint256) {
        return (amount * fee) / decimal;
    }

    function reward(uint256 roundId_) public view returns (uint256) {
        return
            memberTicketsAmount[roundId_][msg.sender].mul(balanceEachRound[roundId_]).div(ticketsEachRound[roundId_]);
    }
}
