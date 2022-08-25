import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { Lottery, Lotto, LottoCommu } from "../typechain";

const fee = 0.5;
const ticketPrice = 5;

const balanceAfterBuyTicket = (beforeBalance, amountTicket) => {
  const totalTicketPrice = ticketPrice * amountTicket;
  const totalFee = (totalTicketPrice * fee) / 100;
  const total = totalTicketPrice + totalFee;

  return String(Number(beforeBalance) - total);
};

const totalFee = (amountTicket) => {
  return String((ticketPrice * amountTicket * fee) / 100);
};

describe("Lotto Community", () => {
  let operator: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  let LottoTokenContract: Lotto;
  let LotteryContract: Lottery;
  let LottoCommuContract: LottoCommu;

  const walletOfOperator = "100";
  const walletOfAlice = "100";
  const walletOfBob = "100";

  const testFeeBuyTicket = 1; // Amount ticket
  const AliceWantToBuyTicket = 10;
  const BobWantToBuyTicket = 10;

  before(async () => {
    const signer = await ethers.getSigners();
    operator = signer[0];
    alice = signer[1];
    bob = signer[2];

    const LottoToken = await ethers.getContractFactory("Lotto");
    LottoTokenContract = await LottoToken.deploy("LottoToken", "LTT");

    const Lottery = await ethers.getContractFactory("Lottery");
    LotteryContract = await Lottery.deploy(LottoTokenContract.address, operator.address);

    const LottoCommu = await ethers.getContractFactory("LottoCommu");
    LottoCommuContract = await LottoCommu.deploy(LotteryContract.address, LottoTokenContract.address, operator.address);
  });

  describe("Initial value", async () => {
    it(`[Initial] : Mint ${walletOfOperator} LTT to Operator`, async () => {
      const mintLLTAmount = parseEther(walletOfOperator);
      await LottoTokenContract.mint(operator.address, mintLLTAmount);
      const balanceOfOperator = await LottoTokenContract.balanceOf(operator.address);
      expect(balanceOfOperator).to.equal(mintLLTAmount);
    });

    it(`[Initial] : Mint ${walletOfAlice} LTT to Alice `, async () => {
      const mintLLTAmount = parseEther(walletOfAlice);
      await LottoTokenContract.mint(alice.address, mintLLTAmount);
      const balanceOfAlice = await LottoTokenContract.balanceOf(alice.address);
      expect(balanceOfAlice).to.equal(mintLLTAmount);
    });

    it(`[Initial] : Mint ${walletOfBob} LTT to Bob `, async () => {
      const mintLLTAmount = parseEther(walletOfBob);
      await LottoTokenContract.mint(bob.address, mintLLTAmount);
      const balanceOfBob = await LottoTokenContract.balanceOf(bob.address);
      expect(balanceOfBob).to.equal(mintLLTAmount);
    });

    it("[Initial] : LottoCommu Contract approve Lottery Contract ", async () => {
      await LottoTokenContract.connect(LottoCommuContract.signer).approve(
        LotteryContract.address,
        parseEther("1000000")
      );
    });

    it("[Initial] : Operator approve LottoCommu Contract ", async () => {
      await LottoTokenContract.connect(LottoCommuContract.signer).approve(
        LottoCommuContract.address,
        parseEther(walletOfOperator)
      );
    });

    it("[Initial] : Alice approve LottoCommu Contract ", async () => {
      await LottoTokenContract.connect(alice).approve(LottoCommuContract.address, parseEther(walletOfAlice));
    });

    it("[Initial] : Bob approve LottoCommu Contract ", async () => {
      await LottoTokenContract.connect(bob).approve(LottoCommuContract.address, parseEther(walletOfBob));
    });
  });

  describe("Lotto Community 1st", async () => {
    it("[LottoCommu - startRound] : Start lotto commu round 1", async () => {
      await LottoCommuContract.connect(operator).startRound();
      const isStartRound1 = await LottoCommuContract.isStartRound(0);
      expect(isStartRound1).to.equal(true);
    });

    it("[LottoCommu - calculateFee] : Calculate Fee 100 ", async () => {
      const fee = await LottoCommuContract.calculateFee(parseEther(String(testFeeBuyTicket * ticketPrice)));
      expect(fee).to.equal(parseEther(totalFee(testFeeBuyTicket)));
    });

    it("[LottoCommu - buyTicket] : Alice buy ticket with LottoCommu ", async () => {
      await LottoCommuContract.connect(alice).buyTicketDAO(AliceWantToBuyTicket);
    });

    it("[LottoCommu - memberTicketsAmount] : Alice check ticket inside DAO ", async () => {
      const amountTicket = await LottoCommuContract.connect(alice).memberTicketsAmount(0, alice.address);
      expect(amountTicket).to.equal(AliceWantToBuyTicket);
    });

    it("[LottoCommu - tokenFeeReservers] : Fee Reservers after Alice buy ticket ", async () => {
      const feeReservers = await LottoCommuContract.tokenFeeReservers(LottoTokenContract.address);
      expect(feeReservers).to.equal(parseEther("0.25"));
    });

    it("[LottoCommu - buyTicket] : Bob buy ticket with LottoCommu ", async () => {
      await LottoCommuContract.connect(bob).buyTicketDAO(BobWantToBuyTicket);
    });

    it("[LottoCommu - memberTicketsAmount] : Bob check ticket inside DAO ", async () => {
      const amountTicket = await LottoCommuContract.connect(bob).memberTicketsAmount(0, bob.address);
      expect(amountTicket).to.equal(BobWantToBuyTicket);
    });

    it("[LottoCommu - tokenFeeReservers] : Fee Reservers after Bob buy ticket ", async () => {
      const feeReservers = await LottoCommuContract.tokenFeeReservers(LottoTokenContract.address);
      expect(feeReservers).to.equal(parseEther("0.50"));
    });

    it("[LottoToken - balanceOf] : Balance of Alice after buy ticket ", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(alice.address);
      // console.log("Balance of Alice => ", formatEther(balanceOf));
      expect(balanceOf).to.equal(parseEther(balanceAfterBuyTicket(walletOfAlice, AliceWantToBuyTicket)));
    });

    it("[LottoToken - balanceOf] : Balance of Bob after buy ticket ", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(bob.address);
      // console.log("Balance of Bob => ", formatEther(balanceOf));
      expect(balanceOf).to.equal(parseEther(balanceAfterBuyTicket(walletOfAlice, AliceWantToBuyTicket)));
    });
  });

  describe("Lottery 1st", async () => {
    it("[Lottery - BalanceOf] : Balance of Lottery", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(LotteryContract.address);
      expect(balanceOf).to.equal(parseEther("100"));
    });

    it("[Lottery - Pick Winner] : Random Ticket No. for Receive reward and Pick winner success", async () => {
      await LotteryContract.pickWinner();
      const isPickedWinner = await LotteryContract.isPickedWinner(0);
      expect(isPickedWinner).to.equal(true);
    });
  });

  describe("Lotto Community claim 1st", async () => {
    it("[LottoCommu - claimLotteryReward] : LottoCommu claim reward", async () => {
      await LottoCommuContract.connect(operator).claimLotteryReward(0);
      const isWinEachRound = await LottoCommuContract.isWinEachRound(0);
      const isPickedWinner = await LotteryContract.isPickedWinner(0);
      const ticketId = await LotteryContract.winningTicket(0);
      const addressWinner = await LotteryContract.tickets(ticketId);
      console.log("LottoCommuContract =>", LottoCommuContract.address);
      console.log("AddressWinner =>", addressWinner.owner);
      expect(LottoCommuContract.address).to.equal(addressWinner.owner);
      expect(isWinEachRound).to.equal(true);
      expect(isPickedWinner).to.equal(true);
    });

    it("[Lottery - BalanceOf] : Balance of Lottery after LottoCommu Claimed", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(LotteryContract.address);
      expect(balanceOf).to.equal(parseEther("0"));
    });

    it("[LottoCommu - BalanceOf] : Balance of Lotto Commu", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(LottoCommuContract.address);
      const balanceEachRound = await LottoCommuContract.balanceEachRound(0);
      const tokenFeeReservers = await LottoCommuContract.tokenFeeReservers(LottoTokenContract.address);

      expect(balanceOf).to.equal(parseEther("100.5"));
      expect(balanceEachRound).to.equal(parseEther("100"));
      expect(tokenFeeReservers).to.equal(parseEther("0.5"));
    });

    it("[LottoToken - balanceOf] : Balance of Alice before claim reward ", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(alice.address);
      console.log("Before balance of Alice => ", formatEther(balanceOf));
      expect(balanceOf).to.equal(parseEther(balanceAfterBuyTicket(walletOfAlice, AliceWantToBuyTicket)));
    });

    it("[LottoToken - balanceOf] : Balance of Bob before claim reward ", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(bob.address);
      console.log("before balance of Bob => ", formatEther(balanceOf));
      expect(balanceOf).to.equal(parseEther(balanceAfterBuyTicket(walletOfAlice, AliceWantToBuyTicket)));
    });

    // it("[LottoCommu - Reward] : Reward detail", async () => {
    //   const memberTicketsAmount = await LottoCommuContract.connect(alice).memberTicketsAmount(0, alice.address);
    //   console.log("memberTicketsAmount => ", memberTicketsAmount);

    //   const ticketsEachRound = await LottoCommuContract.connect(alice).ticketsEachRound(0);
    //   console.log("ticketsEachRound => ", ticketsEachRound);

    //   const lotteryIdEachRound = await LottoCommuContract.connect(alice).lotteryIdEachRound(0);
    //   console.log("lotteryIdEachRound => ", lotteryIdEachRound);

    //   const balanceEachRound = await LotteryContract.balanceEachRound(lotteryIdEachRound);
    //   console.log("Lottery balanceEachRound", formatEther(balanceEachRound));

    //   const reward = await LottoCommuContract.connect(alice).reward(0);
    //   console.log("reward => ", reward);
    // });

    it("[LottoCommu - claim] : Alice claim Reward", async () => {
      await LottoCommuContract.connect(alice).claim(0);
      const reward = await LottoCommuContract.connect(alice).reward(0);
      console.log("Reward of Alice => ", formatEther(reward));
      const balanceOf = await LottoTokenContract.balanceOf(alice.address);
      console.log(formatEther(balanceOf));

      expect(balanceOf).to.equal(parseEther("99.75"));
    });

    it("[LottoCommu - claim] : Bob claim Reward", async () => {
      await LottoCommuContract.connect(bob).claim(0);
      const reward = await LottoCommuContract.connect(bob).reward(0);
      console.log("Reward of Bob => ", formatEther(reward));
      const balanceOf = await LottoTokenContract.balanceOf(bob.address);
      console.log(formatEther(balanceOf));

      expect(balanceOf).to.equal(parseEther("99.75"));
    });

    it("[LottoCommu - BalanceOf] : Balance of Lotto Commu", async () => {
      const balanceOf = await LottoTokenContract.balanceOf(LottoCommuContract.address);
      console.log("Balance Of LottoCommu", formatEther(balanceOf));
    });
  });
});
