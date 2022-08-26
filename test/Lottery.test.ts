import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Lottery, Lotto } from "../typechain";

describe("Lottery", () => {
  let operator: SignerWithAddress;

  let LotteryContract: Lottery;
  let LottoTokenContract: Lotto;

  before(async () => {
    const signer = await ethers.getSigners();
    operator = signer[0];

    const LottoToken = await ethers.getContractFactory("Lotto");
    LottoTokenContract = await LottoToken.deploy("LottoToken", "LTT");

    const Lottery = await ethers.getContractFactory("Lottery");
    LotteryContract = await Lottery.deploy(LottoTokenContract.address, operator.address);
  });

  describe("Initial value", async () => {
    it("[Initial] : Mint 100 LTT to Operator ", async () => {
      const mintLLTAmount = parseEther("100");
      await LottoTokenContract.mint(operator.address, mintLLTAmount);
      const balanceOfOperator = await LottoTokenContract.balanceOf(operator.address);
      expect(balanceOfOperator).to.equal(mintLLTAmount);
    });

    it("[Initial] : Operator approve Lottery contract ", async () => {
      await LottoTokenContract.approve(LotteryContract.address, parseEther("200"));
      const allowanceOfOperator = await LottoTokenContract.allowance(operator.address, LotteryContract.address);
      expect(allowanceOfOperator).to.equal(parseEther("200"));
    });
  });

  describe("Lottery 1st", async () => {
    const lotto1 = 111;
    const lotto2 = 222;

    it("[BuyTicket] : Operator buy 2 tickets  ", async () => {
      await LotteryContract.connect(operator).buyTicket([lotto1, lotto2]);
    });

    it("[BuyTicket] : After buy ticket , Check balance of Operator  ", async () => {
      const balanceOfOperator = await LottoTokenContract.balanceOf(operator.address);
      expect(balanceOfOperator).to.equal(parseEther("90"));
    });

    it("[MyTicket] : Check amount my ticket  ", async () => {
      const totalMyTicket = await LotteryContract.myTicketOfLotteryId(0);
      expect(totalMyTicket.length).to.equal(2);
    });

    it("[Pick Winner] : Random Ticket No. for Receive reward and Pick winner success", async () => {
      await LotteryContract.pickWinner();
      const isPickedWinner = await LotteryContract.isPickedWinner(0);
      expect(isPickedWinner).to.equal(true);
    });

    it("[BalanceOf - Before] : Balance of Operator ,Before operator claim reward", async () => {
      const balanceOfBeforeClaim = await LottoTokenContract.balanceOf(operator.address);
      expect(balanceOfBeforeClaim).to.equal(parseEther("90"));
    });

    it("[ClaimReward] : Operator claim reward", async () => {
      await LotteryContract.claimReward(0);
      const claimStatus = await LotteryContract.isClaimed(0);
      // claimStatus === true , so claimed
      expect(claimStatus).to.equal(true);
    });

    it("[BalanceOf - After] : Balance of Operator ,After operator claim reward", async () => {
      const balanceOfBeforeClaim = await LottoTokenContract.balanceOf(operator.address);
      expect(balanceOfBeforeClaim).to.equal(parseEther("100"));
    });
  });
});
