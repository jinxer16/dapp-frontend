import React, { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Interface } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { formatEther, parseEther, parseUnits } from '@ethersproject/units';
import { Fetcher, Token } from 'quasar-sdk-core';
import _ from 'lodash';
import { FiPlus, FiChevronDown, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { abi as saleCreatorAbi } from 'vefi-token-launchpad-staking/artifacts/contracts/TokenSaleCreator.sol/TokenSaleCreator.json';
import { abi as erc20Abi } from 'vefi-token-launchpad-staking/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { TokenSaleItemCard } from '../../components/LaunchPad';
import { useWeb3Context } from '../../contexts/web3';
import chains from '../../assets/chains.json';
import tokenSaleCreators from '../../assets/token_sales_creators.json';
import { useAPIContext } from '../../contexts/api';
import rpcCall from '../../api/rpc';
import { TokenSaleItemModel } from '../../api/models/launchpad';

enum Subroutes {
  ALL_ITEMS,
  SINGLE_ITEM,
  CREATE_NEW,
  APPLY
}

const AllSalesRoute = ({ onClick }: any) => {
  const { publicSaleItems, fetchPublicTokenSaleItems } = useAPIContext();
  const [page, setPage] = useState<number>(1);

  useEffect(() => fetchPublicTokenSaleItems(page), [fetchPublicTokenSaleItems, page]);
  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 flex-wrap">
        {_.map(publicSaleItems.items, (data, index) => (
          <TokenSaleItemCard key={index} data={data} saleType="public" onClick={(val) => onClick(val)} />
        ))}
      </div>
      <div className="flex justify-center items-center gap-2 text-white/70">
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="bg-transparent">
          <FiArrowLeft />
        </button>
        <span>
          Page {page} of {Math.ceil(publicSaleItems.totalItems / 20)}
        </span>
        <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(publicSaleItems.totalItems / 20)} className="bg-transparent">
          <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

const SelectedSaleItemRoute = ({}: TokenSaleItemModel) => {
  return <>Heya</>;
};

const CreateSaleRoute = () => {
  const { chainId, library } = useWeb3Context();
  const [data, setData] = useState({
    token: '',
    tokensForSale: 0,
    softCap: 0,
    hardCap: 0,
    presaleRate: 0,
    minContribution: 0,
    maxContribution: 0,
    startTime: 0,
    daysToLast: 0,
    proceedsTo: '',
    admin: ''
  });
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const publicSaleCreator = useMemo(() => tokenSaleCreators[chainId as unknown as keyof typeof tokenSaleCreators].publicTokenSaleCreator, [chainId]);
  const [tk, setToken] = useState<Token>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isValidForm = useMemo(
    () =>
      !!data.token &&
      isAddress(data.token) &&
      isAddress(data.admin) &&
      isAddress(data.proceedsTo) &&
      data.softCap > 0 &&
      data.hardCap > 0 &&
      data.presaleRate > 0 &&
      data.maxContribution > 0 &&
      data.minContribution > 0 &&
      data.startTime > 0 &&
      data.daysToLast > 0,
    [
      data.admin,
      data.daysToLast,
      data.hardCap,
      data.maxContribution,
      data.minContribution,
      data.presaleRate,
      data.proceedsTo,
      data.softCap,
      data.startTime,
      data.token
    ]
  );
  const [saleCreationFee, setSaleCreationFee] = useState<number>(0);
  const [feePercentage, setFeePercentage] = useState<number>(0);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setData((d) => ({
        ...d,
        [e.target.name]:
          e.target.type === 'number' || e.target.type === 'datetime-local' || e.target.type === 'date' ? e.target.valueAsNumber || 0 : e.target.value
      })),
    []
  );

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      try {
        e.preventDefault();
        if (isValidForm && !!tk) {
          setIsLoading(true);
          const tokenAmount = parseUnits(data.tokensForSale.toPrecision(5), tk.decimals).toHexString();
          const presaleRate = parseUnits(data.presaleRate.toPrecision(5), tk.decimals).toHexString();
          const hardCap = parseEther(data.hardCap.toPrecision(7)).toHexString();
          const softCap = parseEther(data.softCap.toPrecision(7)).toHexString();
          const minContribution = parseEther(data.minContribution.toPrecision(7)).toHexString();
          const maxContribution = parseEther(data.maxContribution.toPrecision(7)).toHexString();
          const startTime = `0x${_.divide(data.startTime, 1000).toString(16)}`;

          const provider = new Web3Provider(library?.givenProvider);
          const tokenContract = new Contract(data.token, erc20Abi, provider.getSigner());
          const approvalTx = await tokenContract.approve(publicSaleCreator, tokenAmount);
          await approvalTx.wait();
          toast('Approved!', { type: 'info' });

          const saleCreatorContract = new Contract(publicSaleCreator, saleCreatorAbi, provider.getSigner());
          const initTx = await saleCreatorContract.initTokenSale(
            data.token,
            tokenAmount,
            hardCap,
            softCap,
            presaleRate,
            minContribution,
            maxContribution,
            startTime,
            data.daysToLast,
            data.proceedsTo,
            data.admin,
            { value: parseEther(saleCreationFee.toPrecision(4)).toHexString() }
          );

          await initTx.wait();
          toast('Created successfully', { type: 'success' });
          setIsLoading(false);
        }
      } catch (error: any) {
        setIsLoading(false);
        toast(error.message, { type: 'error' });
      }
    },
    [
      data.admin,
      data.daysToLast,
      data.hardCap,
      data.maxContribution,
      data.minContribution,
      data.presaleRate,
      data.proceedsTo,
      data.softCap,
      data.startTime,
      data.token,
      data.tokensForSale,
      isValidForm,
      library?.givenProvider,
      publicSaleCreator,
      saleCreationFee,
      tk
    ]
  );

  useEffect(() => {
    if (!!data.token && isAddress(data.token) && !!chain) {
      (async () => {
        try {
          const token = await Fetcher.fetchTokenData(chainId || 97, data.token, chain.rpcUrl);
          setToken(token);
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [data.token, chain, chainId]);

  useEffect(() => {
    if (!!publicSaleCreator && !!chain) {
      (async () => {
        const saleAbiInterface = new Interface(saleCreatorAbi);
        const data1 = saleAbiInterface.getSighash('saleCreationFee()');
        const data2 = saleAbiInterface.getSighash('feePercentage()');

        const fee = await rpcCall(chain.rpcUrl, { method: 'eth_call', params: [{ to: publicSaleCreator, data: data1 }, 'latest'] });
        const percentage = await rpcCall(chain.rpcUrl, { method: 'eth_call', params: [{ to: publicSaleCreator, data: data2 }, 'latest'] });

        setSaleCreationFee(parseFloat(formatEther(fee)));
        setFeePercentage(parseInt(percentage));
      })();
    }
  }, [chain, publicSaleCreator]);

  return (
    <div className="flex justify-center items-center mx-auto w-full flex-col md:flex-row px-2 py-2">
      <div className="card shadow-xl bg-[#000]/50 w-full md:w-1/2">
        <div className="card-body w-full overflow-auto">
          <span className="card-title font-Montserrat text-white/75">Create Presale Launch</span>
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-2">
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Token*</label>
              <input
                placeholder="Token's contract address"
                type="text"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="token"
                onChange={handleInputChange}
                value={data.token}
              />

              <span className="text-info text-[12px] font-poppins">Contract address of the token</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Amount*</label>
              <input
                placeholder="Amount of tokens available for sale"
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="tokensForSale"
                onChange={handleInputChange}
                value={data.tokensForSale}
              />
              <span className="text-info text-[12px] font-poppins">How much token is available for sale?</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Soft Cap*</label>
              <input
                placeholder="Soft cap"
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="softCap"
                onChange={handleInputChange}
                value={data.softCap}
              />
              <span className="text-info text-[12px] font-poppins">
                What is the lowest amount raised for this sale to be considered a successful sale?
              </span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Hard Cap*</label>
              <input
                placeholder="Hard cap"
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="hardCap"
                onChange={handleInputChange}
                value={data.hardCap}
              />
              <span className="text-info text-[12px] font-poppins">
                What is the highest amount raised for this sale to be considered a successful sale?
              </span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Tokens per {chain.symbol} contributed*</label>
              <input
                placeholder={`Tokens per ${chain.symbol} contributed`}
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="presaleRate"
                onChange={handleInputChange}
                value={data.presaleRate}
              />
              <span className="text-info text-[12px] font-poppins">How many tokens per {chain.symbol}?</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Minimum {chain.symbol} contribution*</label>
              <input
                placeholder={`Minimum ${chain.symbol} contribution`}
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="minContribution"
                onChange={handleInputChange}
                value={data.minContribution}
              />
              <span className="text-info text-[12px] font-poppins">Lowest {chain.symbol} that can be contributed per buyer?</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Maximum {chain.symbol} contribution*</label>
              <input
                placeholder={`Maximum ${chain.symbol} contribution`}
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="maxContribution"
                onChange={handleInputChange}
                value={data.maxContribution}
              />
              <span className="text-info text-[12px] font-poppins">Highest {chain.symbol} that can be contributed per buyer?</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Sale start time*</label>
              <input
                placeholder="dd-mm-yyyy"
                type="datetime-local"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}"
                name="startTime"
                onChange={handleInputChange}
              />
              <span className="text-info text-[12px] font-poppins">When should this sale start? Must be at least 24 hours.</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Days*</label>
              <input
                placeholder="Days to last"
                type="number"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="daysToLast"
                onChange={handleInputChange}
                value={data.daysToLast}
              />
              <span className="text-info text-[12px] font-poppins">How long should this sale last?</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Proceeds to*</label>
              <input
                placeholder="Enter receiver's address"
                type="text"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="proceedsTo"
                onChange={handleInputChange}
                value={data.proceedsTo}
              />

              <span className="text-info text-[12px] font-poppins">Address that would receive the proceeds from the sale</span>
            </div>
            <div className="flex flex-col justify-center gap-2">
              <label className="font-poppins text-white/60">Admin*</label>
              <input
                placeholder="Enter admin's address"
                type="text"
                className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                name="admin"
                onChange={handleInputChange}
                value={data.admin}
              />

              <span className="text-info text-[12px] font-poppins">Address with admin rights over this sale</span>
            </div>
            <div className="flex justify-between items-center w-full">
              <span className="text-white/80 font-Montserrat text-[18px]">Fee</span>
              <span className="text-white/80 font-Montserrat text-[18px]">
                {saleCreationFee} {chain.symbol} (+ {feePercentage}% {chain.symbol} raised during sale)
              </span>
            </div>
            <button
              type="submit"
              disabled={!isValidForm || isLoading || !tk}
              className={`bg-[#0cedfc] btn py-[12px] ${isLoading ? 'loading' : ''} px-[12px] rounded-[10px] w-full`}
            >
              <span className="text-[#2b2828] font-[700] text-[15px]">Create Presale Launch</span>
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
    </div>
  );
};

const ApplyForPresaleRoute = () => <div>Apply For Presale</div>;

export default function Presales() {
  const [selectedRoute, setSelectedRoute] = useState<Subroutes>(Subroutes.ALL_ITEMS);
  const [selectedSaleItem, setSelectedSaleItem] = useState<TokenSaleItemModel>();

  return (
    <div className="h-full overflow-auto hidden-scrollbar">
      {/* <div className="flex w-full p-5 m-5">
        <div className="flex items-center w-full flex-wrap">
          <div className="flex bg-red-400 h-[80px] rounded-[15px] bg-[rgba(0,0,0,0.25)] border border-[rgba(199,199,199,0.5)] w-[168px] m-2"></div>
          <div className="flex bg-red-400 h-[80px] rounded-[15px] bg-[rgba(0,0,0,0.25)] border border-[rgba(199,199,199,0.5)] w-[168px] m-2"></div>
          <div className="flex bg-red-400 h-[80px] rounded-[15px] bg-[rgba(0,0,0,0.25)] border border-[rgba(199,199,199,0.5)] w-[168px] m-2"></div>
          <div className="flex bg-red-400 h-[80px] rounded-[15px] bg-[rgba(0,0,0,0.25)] border border-[rgba(199,199,199,0.5)] w-[168px] m-2"></div>
          <div className="flex bg-red-400 h-[80px] rounded-[15px] bg-[rgba(0,0,0,0.25)] border border-[rgba(199,199,199,0.5)] w-[168px] m-2"></div>
        </div>
      </div> */}
      {/* <div className="flex w-full mb-5">
        <div className="flex w-full items-center justify-evenly text-[#C7C7C7] font-[600] text-[14px] ">
          <div className="flex items-center ">
            <div className="flex mr-3">
              <FiBell />
            </div>
            <div className="font-Montserrat ">All Presales</div>
          </div>
          <div className="flex items-center ">
            <div className="flex mr-3">
              <FiBell />
            </div>
            <div className="font-Montserrat">My Contributions</div>
          </div>
          <div className="flex items-center ">
            <div className="flex mr-3">
              <FiBell />
            </div>
            <div className="font-Montserrat">My Alarms</div>
          </div>
          <div className="flex items-center ">
            <div className="flex mr-3">
              <FiBell />
            </div>
            <div className="font-Montserrat">Created Presales</div>
          </div>
          <div className="flex items-center ">
            <div className="flex mr-3">
              <FiBell />
            </div>
            <div className="font-Montserrat">Favorite</div>
          </div>
        </div>
      </div> */}
      <div className="flex w-full my-8">
        <div className="flex w-full items-center flex-col md:flex-row justify-between py-4 px-3">
          <div className="flex flex-1 w-full justify-center flex-col md:flex-row gap-2 py-3 px-3">
            <button
              onClick={() => setSelectedRoute(Subroutes.ALL_ITEMS)}
              className="py-2 px-3 bg-[#ffeb82] rounded-[11px] text-[#000] w-full md:w-1/3"
            >
              <span className="font-[600]">All Presale Items</span>
            </button>
            <button
              onClick={() => setSelectedRoute(Subroutes.CREATE_NEW)}
              className="flex justify-center py-2 gap-2 px-3 bg-[#ffeb82] items-center rounded-[11px] text-[#000] w-full md:w-1/3"
            >
              <FiPlus />
              <span className="font-[600]">Create</span>
            </button>
            <button onClick={() => setSelectedRoute(Subroutes.APPLY)} className="py-2 px-3 bg-[#ffeb82] rounded-[11px] text-[#000] w-full md:w-1/3">
              <span className="font-[600]">Apply For Presale Launch</span>
            </button>
          </div>
          <div className="flex flex-1 p-5 justify-end">
            <div className="dropdown">
              <div className="flex flex-col justify-center items-center">
                <span className="text-[#c7c7c7] font-[600] text-[10px] ml-[-34px] font-Montserrat">Filter By</span>
                <label
                  tabIndex={0}
                  className="border-[#1673b9] border-[1px] p-[5px] px-3 flex justify-center items-center rounded-[5px] text-[#fff] text-[11px] bg-transparent m-2"
                >
                  <span className="font-[600] mr-[4px]">All Status</span>
                  <FiChevronDown />
                </label>
              </div>
              <ul tabIndex={0} className="dropdown-content menu  shadow bg-base-100 rounded-box w-full text-[12px]">
                <li>
                  <a>Active</a>
                </li>
                <li>
                  <a>Pending</a>
                </li>
                <li>
                  <a>Failed</a>
                </li>
                <li>
                  <a>Successful</a>
                </li>
              </ul>
            </div>
            <div className="dropdown">
              <div className="flex flex-col justify-center items-center">
                <span className="text-[#c7c7c7] font-[600] text-[10px] ml-[-34px] font-Montserrat">Sort By</span>
                <label
                  tabIndex={0}
                  className="border-[#1673b9] border-[1px] p-[5px] px-3 flex justify-center items-center rounded-[5px] text-[#fff] text-[11px] bg-transparent m-2"
                >
                  <span className="font-[600] mr-[4px]">No Filter</span>
                  <FiChevronDown />
                </label>
              </div>
              <ul tabIndex={0} className="dropdown-content menu shadow bg-base-100 rounded-box w-full text-[12px]">
                <li>
                  <a>Active</a>
                </li>
                <li>
                  <a>Pending</a>
                </li>
                <li>
                  <a>Failed</a>
                </li>
                <li>
                  <a>Successful</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {selectedRoute === Subroutes.ALL_ITEMS && (
        <AllSalesRoute
          onClick={(item: TokenSaleItemModel) => {
            setSelectedSaleItem(item);
            setSelectedRoute(Subroutes.SINGLE_ITEM);
          }}
        />
      )}
      {selectedRoute === Subroutes.APPLY && <ApplyForPresaleRoute />}
      {selectedRoute === Subroutes.CREATE_NEW && <CreateSaleRoute />}
      {selectedRoute === Subroutes.SINGLE_ITEM && <SelectedSaleItemRoute {...(selectedSaleItem as TokenSaleItemModel)} />}
    </div>
  );
}
