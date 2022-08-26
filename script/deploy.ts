/* eslint-disable camelcase */
import hre, { ethers } from "hardhat";
import { saveAddress } from "../utils/address";

import { Lottery__factory, LottoCommu__factory, Lotto__factory } from "../typechain";

export const deployToken = async (name: string, symbol: string) => {
    const Contract = (await ethers.getContractFactory("Lotto")) as Lotto__factory;
    const contract = await Contract.deploy(name, symbol);

    await saveAddress(hre.network.name, {
        TokenAddress: contract.address
    })
    return contract;
}

export const deployLottery = async (tokenAddress: string, operatorAddress: string) => {
    const Contract = (await ethers.getContractFactory("Lottery")) as Lottery__factory;
    const contract = await Contract.deploy(tokenAddress, operatorAddress);

    await saveAddress(hre.network.name, {
        LotteryContract: contract.address
    })
    return contract;
}

export const deployLottoCommu = async (lotteryAddress: string, tokenAddress: string, operatorAddress: string) => {
    const Contract = (await ethers.getContractFactory("LottoCommu")) as LottoCommu__factory;
    const contract = await Contract.deploy(lotteryAddress, tokenAddress, operatorAddress);

    await saveAddress(hre.network.name, {
        LottoCommuContract: contract.address
    })
    return contract;
}


