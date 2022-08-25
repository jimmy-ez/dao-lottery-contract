// eslint-disable-next-line node/no-unpublished-import
import { BigNumber } from "ethers";

export interface IEscrow {
  id: BigNumber;
  owner: string;
  count: BigNumber;
  countReserve: BigNumber;
  value: BigNumber;
  investor: string[];
  package: BigNumber[];
  deadline: BigNumber;
  status: number;
  tokenAddress: string;
}
