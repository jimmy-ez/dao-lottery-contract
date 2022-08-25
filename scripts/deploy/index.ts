/* eslint-disable camelcase */
import hre, { ethers } from "hardhat";

import { FPUsMain__factory, NFT__factory, Token__factory, Fragment__factory } from "../../typechain";
import { savaAddress } from "./../../utils/address";

export const deployFPUsMain = async (address: string) => {
  const Contract = (await ethers.getContractFactory("FPUsMain")) as FPUsMain__factory;
  const contract = await Contract.deploy(address);

  await savaAddress(hre.network.name, {
    FPUsMain: contract.address,
  });

  return contract;
};

export const deployNFT = async (name: string, symbol: string) => {
  const Contract = (await ethers.getContractFactory("NFT")) as NFT__factory;
  const contract = await Contract.deploy(name, symbol);

  await savaAddress(hre.network.name, {
    [symbol]: contract.address,
  });

  return contract;
};

export const deployToken = async (name: string, symbol: string) => {
  const Contract = (await ethers.getContractFactory("Token")) as Token__factory;
  const contract = await Contract.deploy(name, symbol);

  await savaAddress(hre.network.name, {
    [symbol]: contract.address,
  });

  return contract;
};

export const deployFragment = async () => {
  const Contract = (await ethers.getContractFactory("Fragment")) as Fragment__factory;
  const contract = await Contract.deploy();

  return contract;
};