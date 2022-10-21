export interface StakingPoolModel {
  id: string;
  tokenA: string;
  tokenB: string;
  tokenAAPY: number;
  tokenBAPY: number;
  chainId: string;
  tax: number;
  owner: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface StakeEventModel {
  stake: string;
  amount: string;
  token: string;
  timestamp: number;
  staker: string;
  transactionHash: string;
  chainId: string;
}
