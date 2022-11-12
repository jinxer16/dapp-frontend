import { hexValue } from '@ethersproject/bytes';
import { default as rootDAppClient } from './root';
import { TokenSaleItemModel } from './models/launchpad';

export const fetchAllPublicSaleItems = (chainId: number, page: number = 1) => {
  return new Promise<{ items: Array<TokenSaleItemModel>; totalItems: number }>((resolve, reject) => {
    rootDAppClient
      .get(`/launchpad/public_sales/${hexValue(chainId)}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchAllPrivateSaleItems = (chainId: number, page: number = 1) => {
  return new Promise<{ items: Array<TokenSaleItemModel>; totalItems: number }>((resolve, reject) => {
    rootDAppClient
      .get(`/launchpad/private_sales/${hexValue(chainId)}?page=${page}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};
