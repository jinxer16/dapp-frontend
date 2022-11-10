import { Fetcher, Token } from 'quasar-sdk-core';
import React, { useEffect, useMemo, useState } from 'react';
import { FiHeart, FiBell } from 'react-icons/fi';
import { formatEther } from '@ethersproject/units';
import { TokenSaleItemModel } from '../../../api/models/launchpad';
import { useAPIContext } from '../../../contexts/api';
import { useWeb3Context } from '../../../contexts/web3';
import chains from '../../../assets/chains.json';

export default function PresaleItemCard({
  id,
  token,
  tokensForSale,
  hardCap,
  softCap,
  presaleRate,
  minContribution,
  maxContribution,
  startTime,
  proceedsTo,
  endTime,
  admin,
  rank
}: TokenSaleItemModel) {
  const { tokensListingAsDictionary } = useAPIContext();
  const { chainId } = useWeb3Context();
  const [tokenObject, setTokenObject] = useState<Token>();

  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);

  useEffect(() => {
    if (!!chainId) {
      (async () => {
        try {
          const t = await Fetcher.fetchTokenData(chainId, token, chain.rpcUrl);
          setTokenObject(t);
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [chain.rpcUrl, chainId, token]);

  return (
    <>
      <div className="flex w-80 h-auto bg-[#161525] m-1 p-5 rounded-lg lg:w-85">
        <div className="w-full flex flex-col ">
          <div className="flex items-center justify-between h-10 w-full">
            <div className="flex">
              <img
                src={
                  tokensListingAsDictionary[token.toLowerCase()]
                    ? tokensListingAsDictionary[token.toLowerCase()].logoURI
                    : '/images/placeholder_image.svg'
                }
                alt={token}
              />
            </div>
            <div className="flex w-2/5 justify-around items-center">
              <span
                className={`flex items-center ${
                  rank !== 'unknown' ? (rank === 'gold' ? 'bg-[#d4af37]' : rank === 'silver' ? 'bg-[#bcc6cc]' : 'bg-[#cd7f32]') : 'bg-[#666362]'
                } text-white text-[10px] font-[600] rounded p-1`}
              >
                {rank}
              </span>
            </div>
          </div>
          <div className="flex flex-col w-full">
            <h2 className="text-[20px] uppercase text-[#fff] font-[800] pt-2 font-Montserrat">{tokenObject?.name}</h2>
            <h3 className="flex items-center justify-between text-[1rem] text-[#fff] capitalize font-[700] pb-2 font-Montserrat">
              <span>Max Contribution:</span>
              <span>{formatEther(maxContribution)}</span>
            </h3>
          </div>
          <div className="flex flex-col my-5">
            <span className="text-[#fff] font-Montserrat font-[600] pb-[0.099rem]">Progress ({progress.toFixed(3)}%)</span>
            <div className="h-[8px] bg-[#1673B9]">
              <div className="h-full bg-green-400" style={{ width: progress + '%' }} />
            </div>
            <div className="flex justify-between text-center pt-[0.099rem]">
              <span className="text-[#fff] font-bold font-Montserrat">0</span>
              <span className="text-[#fff] font-bold font-Montserrat">300</span>
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between mt-2">
              <span className="text-[#fff] font-bold font-Montserrat">Hard Cap:</span>
              <span className="text-[#fff] font-bold font-Montserrat">{hardCap}</span>
            </div>
            <div className="flex justify-between  mt-2">
              <span className="text-[#fff] font-bold font-Montserrat">Soft Cap:</span>
              <span className="text-[#fff] font-bold font-Montserrat">{softCap}</span>
            </div>
            <div className="flex justify-between  mt-2">
              <span className="text-[#fff] font-bold font-Montserrat">Liquidity:</span>
              <span className="text-[#fff] font-bold font-Montserrat">{liquidity}</span>
            </div>
            <div className="flex justify-between  mt-2">
              <span className="text-[#fff] font-bold font-Montserrat">Lock Time:</span>
              <span className="text-[#fff] font-bold font-Montserrat">{lockTime}</span>
            </div>
          </div>
          <div className="flex ">
            <div className="flex w-full justify-between items-center mt-5 border-t-[0.03rem] border-t-[#5B5B5B] pt-3">
              <div className="flex flex-col">
                <span className="text-[whitesmoke] text-sm  font-Montserrat">Sales Ends In:</span>
                <span className="text-[whitesmoke] text-sm tracking-[0.16rem]  font-Montserrat">00:56:12:45</span>
              </div>
              <div className="flex items-center justify-between text-[#fff] font-bold text-[1.5rem]">
                <span className="pr-[8px]">
                  <FiHeart />
                </span>
                <span className="bg-[#1673B9] rounded-[7px] p-[0.5rem]">
                  <FiBell />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
