import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { isAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { Interface } from '@ethersproject/abi';
import { Web3Provider } from '@ethersproject/providers';
import { ToastContainer, toast } from 'react-toastify';
import { abi as actionsAbi } from 'vefi-token-launchpad-staking/artifacts/contracts/StakingPoolActions.sol/StakingPoolActions.json';
import stakingPoolActions from '../../assets/pool_actions.json';
import chains from '../../assets/chains.json';
import { useWeb3Context } from '../../contexts/web3';
import rpcCall from '../../api/rpc';
import { formatEther } from '@ethersproject/units';

export default function CreateNewStakingPool() {
  const { chainId, library } = useWeb3Context();
  const action = useMemo(() => stakingPoolActions[chainId as unknown as keyof typeof stakingPoolActions], [chainId]);
  const [data, setData] = useState({
    token0: '',
    token1: '',
    apy1: 0,
    apy2: 0,
    tax: 0,
    withdrawalIntervals: 30
  });
  const isValidData = useMemo(
    () => isAddress(data.token0) && isAddress(data.token1) && data.apy1 > 0 && data.apy2 > 0 && data.tax >= 0 && data.withdrawalIntervals >= 30,
    [data.apy1, data.apy2, data.tax, data.token0, data.token1, data.withdrawalIntervals]
  );
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkFee, setNetworkFee] = useState<string>('0');

  const handleInputChange = (ev: ChangeEvent<HTMLInputElement>) =>
    setData((d) => ({ ...d, [ev.target.name]: ev.target.type === 'number' ? ev.target.valueAsNumber || 0 : ev.target.value }));

  const submitForm = useCallback(
    async (ev: FormEvent<HTMLFormElement>) => {
      try {
        ev.preventDefault();
        setIsLoading(true);
        const provider = new Web3Provider(library?.givenProvider);
        const stakingPoolActionContract = new Contract(action, actionsAbi, provider.getSigner());
        const value = await stakingPoolActionContract.deploymentFee();
        const deploymentTx = await stakingPoolActionContract.deployStakingPool(
          data.token0,
          data.token1,
          data.apy1,
          data.apy2,
          data.tax,
          `0x${(data.withdrawalIntervals * 60 * 60 * 24).toString(16)}`,
          { value }
        );
        const deploymentResponse = await deploymentTx.wait();
        toast(
          <div className="flex justify-center gap-2 text-[16px] font-poppins items-center">
            <span className="text-white">Staking pool deployed successfully!</span>
            <a href={chain.explorer.concat(`/tx/${deploymentResponse.transactionHash}`)} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          </div>,
          { type: 'success' }
        );
        setIsLoading(false);
      } catch (error: any) {
        toast(error.message, { type: 'error' });
        setIsLoading(false);
      }
    },
    [action, chain.explorer, data.apy1, data.apy2, data.tax, data.token0, data.token1, data.withdrawalIntervals, library?.givenProvider]
  );

  useEffect(() => {
    if (action) {
      (async () => {
        try {
          const actionAbiInterface = new Interface(actionsAbi);
          const deploymentFeeHash = actionAbiInterface.getSighash('deploymentFee()');
          const feeCall = await rpcCall(chain.rpcUrl, { method: 'eth_call', params: [{ to: action, data: deploymentFeeHash }, 'latest'] });
          setNetworkFee(parseFloat(formatEther(feeCall)).toFixed(4));
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [action, chain.rpcUrl]);

  return (
    <div className="flex justify-center items-center w-full px-4 py-4">
      <div className="card rounded-[20px] bg-[#000]/50 shadow-xl font-Montserrat overflow-auto hidden-scrollbar w-full md:w-2/6 backdrop-blur-[60px] py-4">
        <form onSubmit={submitForm} className="card-body w-full font-poppins">
          <span className="card-title text-white font-[800]">Create New Staking Pool</span>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Token 1 Address</span>
            <input
              required
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter the first token address"
              name="token0"
              onChange={handleInputChange}
              type="text"
            />
            <span className="text-info text-[12px]">The contract address of the first token in this pool.</span>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Token 2 Address</span>
            <input
              required
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter the second token address"
              name="token1"
              onChange={handleInputChange}
              type="text"
            />
            <span className="text-info text-[12px]">The contract address of the second token in this pool.</span>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Token 1 APY</span>
            <input
              required
              type="number"
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter the first token APY"
              name="apy1"
              onChange={handleInputChange}
            />
            <span className="text-info text-[12px]">
              Percentage of the first token that would be given as a reward annually when the second token is staked.
            </span>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Token 2 APY</span>
            <input
              required
              type="number"
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter the second token APY"
              name="apy2"
              onChange={handleInputChange}
            />
            <span className="text-info text-[12px]">
              Percentage of the second token that would be given as a reward annually when the first token is staked.
            </span>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Tax</span>
            <input
              required
              type="number"
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter tax"
              name="tax"
              onChange={handleInputChange}
            />
            <span className="text-info text-[12px]">Percentage of tokens paid for stake tax</span>
          </div>
          <div className="flex flex-col w-full justify-start items-start gap-1">
            <span className="text-white font-[500]">Withdrawal Intervals</span>
            <input
              required
              type="number"
              className="outline-0 w-full bg-[#000]/70 py-4 px-4 rounded-[12px] text-white"
              placeholder="Enter the second token APY"
              name="withdrawalIntervals"
              onChange={handleInputChange}
            />
            <span className="text-info text-[12px]">Intervals (in days) for withdrawals. Minimum of 30 days</span>
          </div>
          <div className="flex justify-between items-center w-full">
            <span className="font-Montserrat text-white text-[20px] font-[600]">Network Fee</span>
            <span className="font-Montserrat text-white text-[20px] font-[400]">
              {networkFee} {chain?.symbol}
            </span>
          </div>
          <button
            disabled={!isValidData || isLoading}
            type="submit"
            className={`bg-[#0cedfc] btn py-[12px] px-[12px] rounded-[10px] w-full ${isLoading ? 'loading' : ''}`}
          >
            <span className="text-[#2b2828] font-[700] text-[15px]">Deploy</span>
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </div>
  );
}
