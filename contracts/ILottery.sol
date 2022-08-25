// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

interface ILottery {

    function buyTicket(uint[] calldata number) external;

    function pickWinner() external;

    function claimReward(uint256) external;

    function lotteryId() external returns(uint);

    function ticketPrice() external returns(uint);

    function isPickedWinner(uint) external returns(bool);

    function isClaimed(uint) external returns(bool);

    function balanceEachRound(uint) external returns(uint);

}