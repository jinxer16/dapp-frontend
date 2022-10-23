import { hexValue } from '@ethersproject/bytes';
import { default as rootDAppClient } from './root';

export const fetchAllMultiSigWalletsOfAccount = (chainId: number, account: string, page: number = 1) => {
  return new Promise<Array<string>>((resolve, reject) => {
    rootDAppClient
      .get(`/multisig/wallets/${hexValue(chainId)}/${account}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};
