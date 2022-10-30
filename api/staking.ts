import { hexValue } from '@ethersproject/bytes';
import { StakeEventModel } from './models/staking';
import { default as rootDAppClient } from './root';

export const fetchStakingPools = (chainId: number, page: number = 1) => {
  return new Promise<{ totalItems: number; items: Array<string> }>((resolve, reject) => {
    rootDAppClient
      .get(`/staking/pools/${hexValue(chainId)}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchAccountStakingPools = (chainId: number, owner: string, page: number = 1) => {
  return new Promise<{ totalItems: number; items: Array<string> }>((resolve, reject) => {
    rootDAppClient
      .get(`/staking/pools/${hexValue(chainId)}/${owner}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchAccountStakes = (chainId: number, owner: string, page: number = 1) => {
  return new Promise<{ totalItems: number; items: Array<StakeEventModel> }>((resolve, reject) => {
    rootDAppClient
      .get(`/staking/stakes/${hexValue(chainId)}/${owner}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};
