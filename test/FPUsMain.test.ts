import { EscrowStatus } from "./../interfaces/enum";
/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";

import { IEscrow } from "../interfaces/escrow.interface";

// eslint-disable-next-line node/no-missing-import
import { NFT, FPUsMain, Token, FPUsMain__factory, NFT__factory, Token__factory } from "../typechain";

const { formatEther, parseEther } = ethers.utils;

const ONE_MILLION = parseEther(String(Math.pow(10, 6)));

describe("FPUsMain Test", function () {
  let nft: NFT;
  let tokenBUSD: Token;
  let fpusMain: FPUsMain;

  const signer = async () => {
    const [addr1, spv, investor1, investor2, investor3, investor4, investor5] = await ethers.getSigners();
    return { addr1, spv, investor1, investor2, investor3, investor4, investor5 };
  };

  before("Deploy Contract", async () => {
    const { addr1, spv, investor1 } = await signer();
    console.log("addr1: ", addr1.address);
    console.log("spv: ", spv.address);
    console.log("investor1: ", investor1.address);

    const NFTFactory = (await ethers.getContractFactory("NFT")) as NFT__factory;
    nft = await NFTFactory.deploy("Fragment Property Utilizations Token", "FPUs Token");
    nft.deployed();
    console.log("FPUs Token: ", nft.address);

    const BUSDFactory = (await ethers.getContractFactory("Token")) as Token__factory;
    tokenBUSD = await BUSDFactory.deploy("Binance USD", "BUSD");
    tokenBUSD.deployed();
    console.log("BUSD Token: ", nft.address);

    const FPUsMainFactory = (await ethers.getContractFactory("FPUsMain")) as FPUsMain__factory;
    fpusMain = await FPUsMainFactory.connect(spv).deploy(addr1.address);
    fpusMain.deployed();

    console.log("FPUsMain: ", fpusMain.address);
  });

  describe("FPUsMain Contract", () => {
    it("new spv", async function () {
      const { addr1, spv } = await signer();

      await fpusMain.connect(addr1).transferSpv(spv.address);
      const result = await fpusMain.connect(addr1).getSpv();

      expect(result).to.eq(spv.address);
    });

    it("get spv", async function () {
      const { addr1, spv } = await signer();

      const result = await fpusMain.connect(addr1).getSpv();

      expect(result).to.eq(spv.address);
    });

    it("new escrow", async function () {
      const { spv } = await signer();
      // const result = await tokenBUSD.connect(addr1).balanceOf(addr1.address);

      await fpusMain.connect(spv).newEscrow(spv.address, 5, tokenBUSD.address);
      const result = (await fpusMain.getEscrow(0)) as IEscrow;

      expect(result.id).to.eq("0");
      expect(result.owner).to.eq(spv.address);
      expect(result.count).to.eq("5");
      expect(result.countReserve).to.eq("5");
      expect(result.value).to.eq("0");
      expect(result.investor.length).to.eq(0);
      expect(result.status).to.eq(EscrowStatus.OPEN);
      expect(result.tokenAddress).to.eq(tokenBUSD.address);
    });

    it("add escrow 5 investor", async function () {
      const { addr1, investor1, investor2, investor3, investor4, investor5 } = await signer();

      // Mint BUST for Investor 1 - 5
      await tokenBUSD.connect(addr1).mint(investor1.address, ONE_MILLION);
      await tokenBUSD.connect(addr1).mint(investor2.address, ONE_MILLION);
      await tokenBUSD.connect(addr1).mint(investor3.address, ONE_MILLION);
      await tokenBUSD.connect(addr1).mint(investor4.address, ONE_MILLION);
      await tokenBUSD.connect(addr1).mint(investor5.address, ONE_MILLION);

      // Approve BUSD for FPUsMain Contract
      tokenBUSD.connect(investor1).approve(fpusMain.address, ethers.constants.MaxUint256);
      tokenBUSD.connect(investor2).approve(fpusMain.address, ethers.constants.MaxUint256);
      tokenBUSD.connect(investor3).approve(fpusMain.address, ethers.constants.MaxUint256);
      tokenBUSD.connect(investor4).approve(fpusMain.address, ethers.constants.MaxUint256);
      tokenBUSD.connect(investor5).approve(fpusMain.address, ethers.constants.MaxUint256);

      // Investor 1 Add Escrow
      await fpusMain.connect(investor1).addEscrow(0);

      let result = (await fpusMain.getEscrow(0)) as IEscrow;

      expect(result.countReserve).to.eq("4");
      expect(result.investor.length).to.eq(1);
      expect(result.investor[0]).to.eq(investor1.address);

      expect(await tokenBUSD.balanceOf(fpusMain.address)).to.eq(ONE_MILLION);

      // Investor 2 Add Escrow
      await fpusMain.connect(investor2).addEscrow(0);

      result = (await fpusMain.getEscrow(0)) as IEscrow;
      expect(result.countReserve).to.eq("3");
      expect(result.investor.length).to.eq(2);

      // Investor 3 Add Escrow
      await fpusMain.connect(investor3).addEscrow(0);
      result = (await fpusMain.getEscrow(0)) as IEscrow;

      expect(result.countReserve).to.eq("2");
      expect(result.investor.length).to.eq(3);

      // Investor 4 Add Escrow
      await fpusMain.connect(investor4).addEscrow(0);
      result = (await fpusMain.getEscrow(0)) as IEscrow;

      expect(result.countReserve).to.eq("1");
      expect(result.investor.length).to.eq(4);

      // Investor 5 Add Escrow
      await fpusMain.connect(investor5).addEscrow(0);
      result = (await fpusMain.getEscrow(0)) as IEscrow;

      expect(result.countReserve).to.eq("0");
      expect(result.investor.length).to.eq(5);
    });

    it("get escrow owner", async function () {
      const { spv } = await signer();

      const result = await fpusMain.connect(spv).getEscrowOwner(0);

      expect(result).to.eq(spv.address);
    });

    it("get escrow value", async function () {
      const { spv } = await signer();

      const result = await fpusMain.connect(spv).getEscrowValue(0);

      expect(Number(formatEther(result))).to.eq(5000000);
    });

  });
});
