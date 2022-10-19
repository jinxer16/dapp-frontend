/* eslint-disable react-hooks/exhaustive-deps */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import _ from 'lodash';
import { EventModel, ListingModel } from '../../api/models/dex';
import { useWeb3Context } from '../web3';
import { fetchEvents, fetchLiquidityPoolsForUser, fetchListing, fetchTopPairs } from '../../api/dex';
import { convertListingToDictionary } from '../../api/models/utils';

type APIContextType = {
  tokensListing: Array<ListingModel>;
  tokensListingAsDictionary: { [key: string]: ListingModel };
  liquidityPoolsForUser: Array<string>;
  topPairs: Array<string>;
  importToken: (model: ListingModel) => void;
  importPool: (pool: string) => void;
  events: {
    type: 'all' | 'swap' | 'burn' | 'mint';
    totalItems: number;
    items: Array<EventModel>;
  };
  eventsDataUpdate: (page: number, type: 'all' | 'swap' | 'burn' | 'mint') => void;
};

const APIContext = createContext({} as APIContextType);

export const APIContextProvider = ({ children }: any) => {
  const { chainId, active, account } = useWeb3Context();
  const [tokensListing, setTokensListing] = useState<Array<ListingModel>>([]);
  const [tokensListingAsDictionary, setTokensListingAsDictionary] = useState<{ [key: string]: ListingModel }>({});
  const [liquidityPoolsForUser, setLiquidityPoolsForUser] = useState<Array<string>>([]);
  const [topPairs, setTopPairs] = useState<Array<string>>([]);
  const [events, setEvents] = useState<{
    type: 'all' | 'swap' | 'burn' | 'mint';
    totalItems: number;
    items: Array<EventModel>;
  }>({ type: 'all', totalItems: 0, items: [] });

  const importToken = useCallback((model: ListingModel) => {
    if (!_.includes(tokensListing, model)) setTokensListing((models) => [...models, model]);
  }, []);

  const eventsDataUpdate = useCallback(
    (page: number, t: 'all' | 'swap' | 'burn' | 'mint') => {
      fetchEvents(chainId || 97, page, t === 'all' ? undefined : t).then((val) =>
        setEvents({
          type: t,
          totalItems: val.totalItems,
          items: val.items
        })
      );
    },
    [chainId]
  );

  const importPool = useCallback((pool: string) => {
    if (!_.includes(liquidityPoolsForUser, pool)) setLiquidityPoolsForUser((pools) => [...pools, pool]);
  }, []);

  useEffect(() => {
    (async () => {
      const listing = await fetchListing(chainId || 97);
      const pairs = await fetchTopPairs(chainId || 97);

      setTokensListing(listing);
      setTopPairs(pairs);
      eventsDataUpdate(1, 'all');
    })();
  }, [chainId]);

  useEffect(() => {
    if (tokensListing.length > 0) {
      setTokensListingAsDictionary(convertListingToDictionary(tokensListing));
    }
  }, [tokensListing]);

  useEffect(() => {
    if (active && !!account) {
      fetchLiquidityPoolsForUser(chainId || 97, account)
        .then(setLiquidityPoolsForUser)
        .catch(console.log);
    }
  }, [active, chainId, account]);

  return (
    <APIContext.Provider
      value={{ tokensListing, tokensListingAsDictionary, liquidityPoolsForUser, importToken, importPool, topPairs, eventsDataUpdate, events }}
    >
      {children}
    </APIContext.Provider>
  );
};

export const useAPIContext = () => useContext(APIContext);
