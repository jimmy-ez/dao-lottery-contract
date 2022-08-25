/* eslint-disable camelcase */
import { expect } from "chai";
import { ethers } from "hardhat";

// eslint-disable-next-line node/no-missing-import
import { NFT, FPUsMain, FPUsMain__factory, NFT__factory } from "../typechain";

describe("NFT Test", function () {
  let nft: NFT;
  let fpusMain: FPUsMain;

  const signer = async () => {
    const [addr1, spv, investor1] = await ethers.getSigners();
    return { addr1, spv, investor1 };
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

    const FPUsMainFactory = (await ethers.getContractFactory("FPUsMain")) as FPUsMain__factory;
    fpusMain = await FPUsMainFactory.connect(spv).deploy(spv.address);
    fpusMain.deployed();

    console.log("FPUsMain: ", fpusMain.address);
  });

  describe("NFT Contract", () => {
    it("get name", async function () {
      const { addr1 } = await signer();
      const result = await nft.connect(addr1).name();
      expect(result).to.eq("Fragment Property Utilizations Token");
    });

    it("nft transfer ownership to fpus main contract", async function () {
      const { addr1 } = await signer();
      await nft.connect(addr1).transferOwnership(fpusMain.address);
      const result = await nft.owner();
      expect(result).to.eq(fpusMain.address);
    });
  });
});
