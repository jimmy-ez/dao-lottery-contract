import { deployFPUsMain, deployNFT, deployFragment, deployToken } from "./deploy/index";
import { ethers } from "hardhat";
import { Token__factory } from "../typechain";

async function main() {
  const [investor1, spv] = await ethers.getSigners();
  console.log("SPV: ", spv.address);

  const fragment = await deployFragment();
  console.log("fragment:", fragment.address);

  const fpusMain = await deployFPUsMain(spv.address);
  console.log("FPUsMain:", fpusMain.address);

  const masterNFT = await deployNFT("FPUs Master NFT", "FPUsM");
  console.log("FPUS Master NFT", masterNFT.address);

  const STSToken = await deployToken("Status Token #dev", "STS");
  console.log("STSToken ", STSToken.address);
  
  let STS = Token__factory.connect(STSToken.address, investor1);
  await STS.transferOwnership(fpusMain.address);
  console.log("transferOwnership");

  await fpusMain.connect(spv).setMasterAddress(masterNFT.address);
  console.log("setMasterAddress");
  await fpusMain.connect(spv).setFragmentContractAddress(fragment.address);
  console.log("setFragmentContractAddress");
  await fpusMain.connect(spv).setSTSAddress(STSToken.address);
  console.log("setSTSAddress");
-
  await masterNFT.transferOwnership(fpusMain.address);
  await fragment.transferOwnership(fpusMain.address);
  console.log("transferOwnership");

  const BUSD = Token__factory.connect("0x599Ae456e4944f93B205F3BF4ce28371e6163D61", investor1);
  await BUSD.approve(fpusMain.address, ethers.constants.MaxUint256);
  console.log("Approve");

  const txNewEscrow = await fpusMain
    .connect(spv)
    .newEscrow(spv.address, 1, "0x599Ae456e4944f93B205F3BF4ce28371e6163D61");
  await txNewEscrow.wait(3);
  console.log("newEscrow");

  const escrows = await fpusMain.getAvailableEscrow();
  console.log("escrows", escrows);

  let txAddEscrow = await fpusMain.connect(investor1).addEscrow(0, 2);
  await txAddEscrow.wait(3);
  console.log("addEscrow1");
  // txAddEscrow = await fpusMain.connect(investor1).addEscrow(0);
  // await txAddEscrow.wait(3);
  // console.log("addEscrow2");

  const escrow = await fpusMain.connect(spv).getEscrow(0);
  console.log("getEscrow", escrow);

  const txFinalEscrow = await fpusMain
    .connect(spv)
    .finalEscrow(0, spv.address, "0x05416460deb76d57af601be17e777b93592d8d4d4a4096c57876a91c84f4a712");
  await txFinalEscrow.wait(3);
  console.log("finalEscrow");

  const fragmentAddress = await fpusMain.connect(spv).getFragmentAddress(0);
  console.log("fragmentAddress", fragmentAddress);

  const holdedAddress = await fpusMain.connect(spv).getHoldedAddress(investor1.address);
  console.log("holdedAddress", holdedAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
