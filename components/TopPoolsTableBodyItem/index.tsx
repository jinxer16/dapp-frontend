import React from 'react';
import millify from 'millify';
import { useAPIContext } from '../../contexts/api';
import { useWeb3Context } from '../../contexts/web3';
import { fetchPairVolumeInUSDWithGivenPeriod, obtainLPDetailsFromPair } from '../../hooks/dex';

type ITopPoolItem = {
  pair: string;
  index: number;
};

export default function TopPoolsTableBodyItem({ pair, index }: ITopPoolItem) {
  const { chainId, account } = useWeb3Context();
  const { tokensListingAsDictionary } = useAPIContext();
  const lpDetails = obtainLPDetailsFromPair(pair, chainId || 97, account as string);
  const volume24H = fetchPairVolumeInUSDWithGivenPeriod(pair, chainId || 97);
  const volume7D = fetchPairVolumeInUSDWithGivenPeriod(pair, chainId || 97, 60 * 60 * 24 * 7 * 1000);
  const volume30D = fetchPairVolumeInUSDWithGivenPeriod(pair, chainId || 97, 60 * 60 * 24 * 30 * 1000);

  return (
    <div className="table-row text-[#fff] h-[50px] font-poppins hover:bg-[#000]/30 cursor-pointer">
      <div className="table-cell text-center">{index}</div>
      <div className="table-cell text-center">
        <div className="flex justify-start items-center gap-2 py-1 w-full">
          <div className="avatar-group -space-x-6">
            <div className="avatar">
              <div className="w-6">
                <img
                  src={
                    tokensListingAsDictionary[lpDetails.token0]
                      ? tokensListingAsDictionary[lpDetails.token0].logoURI
                      : '/images/placeholder_image.svg'
                  }
                  alt={lpDetails.token0}
                />
              </div>
            </div>
            <div className="avatar">
              <div className="w-6">
                <img
                  src={
                    tokensListingAsDictionary[lpDetails.token1]
                      ? tokensListingAsDictionary[lpDetails.token1].logoURI
                      : '/images/placeholder_image.svg'
                  }
                  alt={lpDetails.token1}
                />
              </div>
            </div>
          </div>
          <span className="text-white font-poppins font-[16px]">
            {lpDetails.token0Symbol}/{lpDetails.token1Symbol}
          </span>
        </div>
      </div>
      <div className="table-cell text-center">${millify(volume24H || 0)}</div>
      <div className="hidden md:table-cell text-center">${millify(volume7D || 0)}</div>
      <div className="hidden md:table-cell text-center">${millify(volume30D || 0)}</div>
    </div>
  );
}
