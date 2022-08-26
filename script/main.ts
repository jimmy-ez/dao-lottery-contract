import { ethers } from "hardhat";
import { deployLottery, deployToken, deployLottoCommu } from "./deploy";

async function main() {
    const [operator] = await ethers.getSigners();
    

    // const lottoToken = await deployToken("Lotto Token", "LTT");

    // const lottery = await deployLottery(lottoToken.address, operator.address);

    const lottoCommu = await deployLottoCommu("0xe1e6bC3ed9C0FBb686c9a2fBEDb599C0c77B8a53", "0x0Da0d104122dB8F7dFD56229d1d716b0b9Fc1a07", operator.address);
    console.log("Deploy Success", lottoCommu.address);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });