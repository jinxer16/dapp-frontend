import { hexValue } from '@ethersproject/bytes';
import { default as rootDAppClient } from './root';
import { EventModel, ListingModel, SwapModel, SyncModel } from './models/dex';

export const fetchListing = (chainId: number) => {
  return new Promise<Array<ListingModel>>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/listing/${chainId}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchPriceHistoryForPair = (pair: string, chainId: number, period?: number) => {
  return new Promise<Array<SyncModel>>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/price_history/${pair}/${hexValue(chainId)}${period ? `?period=${period}` : ''}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchLiquidityPoolsForUser = (chainId: number, account: string) => {
  return new Promise<Array<string>>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/pools/${hexValue(chainId)}/${account}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchTopPairs = (chainId: number) => {
  return new Promise<Array<string>>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/top_pairs/${hexValue(chainId)}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchSwapEventsForPairPerPeriod = (pair: string, chainId: number, period?: number) => {
  return new Promise<Array<SwapModel>>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/swap_events/${pair}/${hexValue(chainId)}${period ? `?period=${period}` : ''}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};

export const fetchEvents = (chainId: number, page: number = 1, eventName?: string) => {
  return new Promise<{ totalItems: number; items: Array<EventModel> }>((resolve, reject) => {
    rootDAppClient
      .get(`/dex/events/${hexValue(chainId)}?page=${page}${!!eventName ? `&eventName=${eventName}` : ''}`)
      .then((res) => resolve(res.data.result))
      .catch(reject);
  });
};
