export interface ListingModel {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface SyncModel {
  pair: string;
  reserve0: string;
  reserve1: string;
  transactionHash: string;
  chainId: string;
  timestamp: number;
}

export interface SwapModel {
  pair: string;
  amount0In: string;
  amount1In: string;
  amount0Out: string;
  amount1Out: string;
  to: string;
  transactionHash: string;
  chainId: string;
  timestamp: number;
}
