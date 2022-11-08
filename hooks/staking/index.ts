/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import { hexStripZeros } from '@ethersproject/bytes';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { formatEther } from '@ethersproject/units';
import _ from 'lodash';
import { abi as stakingPoolAbi } from 'vefi-token-launchpad-staking/artifacts/contracts/StakingPool.sol/StakingPool.json';
import { abi as erc20Abi } from 'vefi-token-launchpad-staking/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { abi as ownableAbi } from 'vefi-token-launchpad-staking/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json';
import { StakingPoolModel } from '../../api/models/staking';
import chains from '../../assets/chains.json';
import rpcCall from '../../api/rpc';

export const fetchStakingPoolInfo = (pool: string, chainId: number) => {
  const [stakingPoolInfo, setStakingPoolInfo] = useState<
    Omit<StakingPoolModel, 'chainId'> & { tokenABalance: number; tokenBBalance: number; tokenASymbol: string; tokenBSymbol: string }
  >({
    id: pool,
    tax: 0,
    tokenA: '',
    tokenB: '',
    tokenAAPY: 0,
    tokenBAPY: 0,
    owner: '',
    tokenABalance: 0,
    tokenBBalance: 0,
    tokenASymbol: '',
    tokenBSymbol: ''
  });

  useEffect(() => {
    if (!!pool) {
      (async () => {
        try {
          const chain = chains[chainId as unknown as keyof typeof chains];
          const url = chain.rpcUrl;
          const provider = new JsonRpcProvider(url, chainId);
          const stakingPoolContract = new Contract(pool, stakingPoolAbi, provider);
          const ownableContract = new Contract(pool, ownableAbi, provider);
          const tax = await stakingPoolContract.stakingPoolTax();
          const tokenA = (await stakingPoolContract.tokenA()).toLowerCase();
          const tokenB = (await stakingPoolContract.tokenB()).toLowerCase();
          const tokenAAPY = await stakingPoolContract.tokenAAPY();
          const tokenBAPY = await stakingPoolContract.tokenBAPY();
          const owner = await ownableContract.owner();

          const tokenAContract = tokenA === AddressZero ? undefined : new Contract(tokenA, erc20Abi, provider);
          const tokenBContract = new Contract(tokenB, erc20Abi, provider);
          const tokenASymbol = !!tokenAContract ? await tokenAContract.symbol() : chain.symbol;
          const tokenBSymbol = await tokenBContract.symbol();

          const tokenABalance = !!tokenAContract
            ? parseFloat(
                _.divide(parseInt((await tokenAContract.balanceOf(pool)).toHexString()), Math.pow(10, await tokenAContract.decimals())).toPrecision(4)
              )
            : parseFloat(parseFloat(formatEther(await rpcCall(url, { method: 'eth_getBalance', params: [pool, 'latest'] }))).toPrecision(4));
          const tokenBBalance = parseFloat(
            _.divide(parseInt((await tokenBContract.balanceOf(pool)).toHexString()), Math.pow(10, await tokenBContract.decimals())).toPrecision(4)
          );

          setStakingPoolInfo({
            id: pool,
            tax,
            tokenB,
            tokenA,
            tokenAAPY,
            tokenBAPY,
            owner,
            tokenABalance,
            tokenBBalance,
            tokenASymbol,
            tokenBSymbol
          });
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [chainId, pool]);
  return stakingPoolInfo;
};

export const fetchStakeEventPoolAndReward = (txHash: string, stakeId: string, chainId: number) => {
  const [eventInfo, setEventInfo] = useState({
    pool: '',
    reward: 0
  });

  useEffect(() => {
    if (!!txHash && !!stakeId) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const tx = await rpcCall(url, { method: 'eth_getTransactionByHash', params: [txHash] });
          const pool = hexStripZeros(tx.to);
          const provider = new JsonRpcProvider(url, chainId);
          const poolContract = new Contract(pool, stakingPoolAbi, provider);
          const reward = parseInt((await poolContract.calculateReward(stakeId)).toHexString());
          setEventInfo({
            pool,
            reward
          });
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [chainId, txHash, stakeId]);
  return eventInfo;
};
