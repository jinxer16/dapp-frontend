import React, { useEffect, useMemo, useState } from 'react';
import { FiExternalLink, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { isAddress } from '@ethersproject/address';
import { AddressZero } from '@ethersproject/constants';
import { formatEthAddress } from 'eth-address';
import { FiX } from 'react-icons/fi';
import { Fetcher, Token } from 'quasar-sdk-core';
import { useAPIContext } from '../../../contexts/api';
import { useWeb3Context } from '../../../contexts/web3';
import { fetchStakingPoolInfo } from '../../../hooks/staking';
import chains from '../../../assets/chains.json';
import usdb from '../../../assets/usdb.json';
import StakeTokenModal from '../StakeTokenModal';
import { addToMetamask } from '../../../utils';

type IStakingPoolCardProps = {
  pool: string;
  poolType: 'special' | 'regular';
};

export default function StakingPoolCard({ pool, poolType }: IStakingPoolCardProps) {
  const { chainId } = useWeb3Context();
  const { tokensListingAsDictionary } = useAPIContext();
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const poolDetails = fetchStakingPoolInfo(pool, chainId || 97);
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const USDB = useMemo(() => usdb[chainId as unknown as keyof typeof usdb], [chainId]);
  const [showStakeModal, setShowStakeModal] = useState<boolean>(false);
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [tokenA, setTokenA] = useState<Token>();
  const [tokenB, setTokenB] = useState<Token>();

  useEffect(() => {
    if (poolDetails.tokenA && poolDetails.tokenB) {
      (async () => {
        if (poolDetails.tokenA !== AddressZero) {
          const tA = await Fetcher.fetchTokenData(chainId || 97, poolDetails.tokenA);
          setTokenA(tA);
        }

        const tB = await Fetcher.fetchTokenData(chainId || 97, poolDetails.tokenB);
        setTokenB(tB);
      })();
    }
  }, [chainId, poolDetails.tokenA, poolDetails.tokenB]);

  return (
    <>
      <div className="card backdrop-blur-[32px] rounded-[20px] bg-[#000]/50 shadow-xl font-Montserrat overflow-auto hidden-scrollbar w-full">
        <div className="card-body w-full py-7 overflow-auto">
          <div className="flex flex-row justify-between items-center w-full gap-3">
            <div className="flex flex-row justify-center gap-1 items-center">
              <div className="avatar-group -space-x-6">
                <div className="avatar">
                  <div className="w-8">
                    <img
                      src={
                        tokensListingAsDictionary[poolDetails.tokenA]
                          ? tokensListingAsDictionary[poolDetails.tokenA].logoURI
                          : '/images/placeholder_image.svg'
                      }
                      alt={poolDetails.tokenASymbol}
                    />
                  </div>
                </div>
                <div className="avatar">
                  <div className="w-8">
                    <img
                      src={
                        tokensListingAsDictionary[poolDetails.tokenB]
                          ? tokensListingAsDictionary[poolDetails.tokenB].logoURI
                          : '/images/placeholder_image.svg'
                      }
                      alt={poolDetails.tokenBSymbol}
                    />
                  </div>
                </div>
              </div>
              <span className="card-title text-[#fff]">
                {poolDetails.tokenASymbol}-{poolDetails.tokenBSymbol}
              </span>
            </div>
            <div className={`${poolType === 'special' ? 'bg-[gold]/[.27]' : 'bg-[#0cedfc]/[.27]'} px-[2px] py-[2px] rounded-[3px]`}>
              <span className="text-[#0cedfc] font-[400] text-[12px]">{poolType === 'special' ? 'Special' : 'Regular'}</span>
            </div>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[16px] text-[#fff]">{poolDetails.tokenASymbol} APY</span>
            <span className="text-[#0cedfc] font-[500] text-[15px]">{poolDetails.tokenAAPY}%</span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[16px] text-[#fff]">{poolDetails.tokenBSymbol} APY</span>
            <span className="text-[#0cedfc] font-[500] text-[15px]">{poolDetails.tokenBAPY}%</span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[16px] text-[#fff]">Pool ID</span>
            <a href={chain.explorer.concat(`/address/${poolDetails.id}`)} target="_blank" rel="noreferrer">
              <span className="text-[#fff] font-[500] text-[15px] lowercase">
                {formatEthAddress(pool, 4)} <FiExternalLink />
              </span>
            </a>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[16px] text-[#fff]">Pool Owner</span>
            <a href={chain.explorer.concat(`/address/${poolDetails.owner}`)} target="_blank" rel="noreferrer">
              <span className="text-[#fff] font-[500] text-[15px] lowercase">
                {isAddress(poolDetails.owner) ? formatEthAddress(poolDetails.owner, 4) : poolDetails.owner} <FiExternalLink />
              </span>
            </a>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="text-[16px] text-[#fff]">Staking Tax</span>
            <span className="text-[#fff] font-[500] text-[15px]">{poolDetails.tax}%</span>
          </div>
          <div className="card-actions flex-col w-full justify-evenly gap-3">
            <label
              htmlFor={`${pool}-modal`}
              className="bg-[#0cedfc] py-[8px] px-[12px] rounded-[10px] w-full flex justify-center items-center cursor-pointer"
            >
              <span className="text-[#2b2828] font-[700] text-[15px]">Stake</span>
            </label>
            <div className="flex justify-center items-center w-full">
              <button className="text-[16px] text-[#fff] flex justify-center gap-1 items-center" onClick={() => setShowDetails((val) => !val)}>
                <span className="font-[400]">Details</span>
                {showDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>
            {showDetails && (
              <div className="flex flex-col w-full">
                <div className="flex justify-between items-center gap-2 w-full">
                  <span className="text-[16px] text-[#fff]">Total {poolDetails.tokenASymbol} Staked</span>
                  <span className="text-[#fff] font-[500] text-[15px]">{poolDetails.tokenABalance}</span>
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <span className="text-[16px] text-[#fff]">Total {poolDetails.tokenBSymbol} Staked</span>
                  <span className="text-[#fff] font-[500] text-[15px]">{poolDetails.tokenBBalance}</span>
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  {poolDetails.tokenA !== AddressZero && (
                    <button
                      disabled={!tokenA}
                      onClick={() => addToMetamask(tokenA?.address as string, tokenA?.symbol as string, tokenA?.decimals as number)}
                      className="font-[500]"
                    >
                      <span className="text-[16px] text-[#0cedfc]">Add {poolDetails.tokenASymbol} to Metamask</span>
                    </button>
                  )}
                </div>
                <div className="flex justify-between items-center gap-2 w-full">
                  <button
                    disabled={!tokenB}
                    onClick={() => addToMetamask(tokenB?.address as string, tokenB?.symbol as string, tokenB?.decimals as number)}
                    className="font-[500]"
                  >
                    <span className="text-[16px] text-[#0cedfc]">Add {poolDetails.tokenBSymbol} to Metamask</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <input type="checkbox" id={`${pool}-modal`} className="modal-toggle" />
      <div className="modal modal-bottom md:modal-middle font-Montserrat text-white/75">
        <div className="modal-box relative bg-[#000]">
          <label htmlFor={`${pool}-modal`} className="btn btn-sm btn-circle absolute right-2 top-2">
            <FiX />
          </label>
          <div className="flex flex-col w-full justify-center items-center gap-3">
            <span className="font-[900] uppercase">Select Token</span>
            <div className="flex justify-center items-center gap-4 w-full">
              <label
                htmlFor={`${pool}-modal`}
                className="btn-ghost flex flex-col justify-center items-center gap-1 cursor-pointer"
                onClick={() => {
                  setSelectedToken(poolDetails.tokenA);
                  setShowStakeModal(true);
                }}
              >
                <div className="avatar">
                  <div className="w-12">
                    <img
                      src={
                        tokensListingAsDictionary[poolDetails.tokenA]
                          ? tokensListingAsDictionary[poolDetails.tokenA].logoURI
                          : '/images/placeholder_image.svg'
                      }
                      alt={poolDetails.tokenASymbol}
                    />
                  </div>
                </div>
                <span>{poolDetails.tokenASymbol}</span>
              </label>

              {poolDetails.tokenB.toLowerCase() !== USDB.toLowerCase() && (
                <label
                  className="flex flex-col justify-center items-center gap-1 cursor-pointer"
                  htmlFor={`${pool}-modal`}
                  onClick={() => {
                    setSelectedToken(poolDetails.tokenB);
                    setShowStakeModal(true);
                  }}
                >
                  <div className="avatar">
                    <div className="w-12">
                      <img
                        src={
                          tokensListingAsDictionary[poolDetails.tokenB]
                            ? tokensListingAsDictionary[poolDetails.tokenB].logoURI
                            : '/images/placeholder_image.svg'
                        }
                        alt={poolDetails.tokenBSymbol}
                      />
                    </div>
                  </div>
                  <span>{poolDetails.tokenBSymbol}</span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
      <StakeTokenModal isOpen={showStakeModal} pool={pool} token={selectedToken} onClose={() => setShowStakeModal(false)} />
    </>
  );
}
