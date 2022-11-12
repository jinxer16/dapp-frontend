/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { Interface } from '@ethersproject/abi';
import { useEffect, useMemo, useState } from 'react';
import { abi as saleCreatorAbi } from 'vefi-token-launchpad-staking/artifacts/contracts/TokenSaleCreator.sol/TokenSaleCreator.json';
import chains from '../../assets/chains.json';
import { useWeb3Context } from '../../contexts/web3';
import rpcCall from '../../api/rpc';

export const fetchSaleItemInfo = (saleCreator: string, saleId: string, deps: any[] = []) => {
  const { chainId } = useWeb3Context();
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const [info, setInfo] = useState({
    totalEtherRaised: '0'
  });

  useEffect(() => {
    if (!!saleCreator && !!saleId && chain) {
      (async () => {
        try {
          const url = chain.rpcUrl;
          const saleCreatorAbiInterface = new Interface(saleCreatorAbi);
          const data = saleCreatorAbiInterface.encodeFunctionData('getTotalEtherRaisedForSale(bytes32)', [saleId]);
          const val = await rpcCall(url, { method: 'eth_call', params: [{ to: saleCreator, data }, 'latest'] });
          setInfo({
            totalEtherRaised: parseInt(val).toString()
          });
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [saleCreator, saleId, chain, ...deps]);
  return info;
};
