import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import _ from 'lodash';
import { FiPlus, FiChevronDown } from 'react-icons/fi';
import { ToastContainer, toast } from 'react-toastify';
import { TokenSaleItemCard } from '../../components/LaunchPad';
import { useWeb3Context } from '../../contexts/web3';
import chains from '../../assets/chains.json';
import tokenSaleCreators from '../../assets/token_sales_creators.json';
import { useAPIContext } from '../../contexts/api';

enum Subroutes {
  ALL_ITEMS,
  SINGLE_ITEM,
  CREATE_NEW,
  APPLY
}

const mockData: Array<{
  logo?: string;
  tagName: 'gold' | 'silver' | 'bronze';
  tagColor?: any;
  name: string;
  maxContribution: string;
  hardCap: string;
  softCap: string;
  liquidity: string;
  lockTime: string;
}> = [
  {
    logo: '/images/brise.png',
    tagName: 'gold',
    name: 'Wrapped Brise',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/vefi.png',
    tagName: 'gold',
    name: 'Vefi Ecosystem Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/phantom.svg',
    tagName: 'gold',
    name: 'Phantom Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/phantom.svg',
    tagName: 'gold',
    name: 'Phantom Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/phantom.svg',
    tagName: 'gold',
    name: 'Phantom Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/vefi.png',
    tagName: 'gold',
    name: 'Vefi Ecosystem Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/vefi.png',
    tagName: 'gold',
    name: 'Vefi Ecosystem Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  },
  {
    logo: '/images/vefi.png',
    tagName: 'gold',
    name: 'Vefi Ecosystem Token',
    tagColor: 'bg-[#d4af37]',
    maxContribution: '4000000 BRISE',
    hardCap: '4000000 BRISE',
    softCap: '2000000 BRISE',
    liquidity: '7%',
    lockTime: '30 Days'
  }
];

const AllSalesRoute = () => {
  const { publicSaleItems, fetchPublicTokenSaleItems } = useAPIContext();
  const [page, setPage] = useState<number>(1);

  useEffect(() => fetchPublicTokenSaleItems(page), [fetchPublicTokenSaleItems, page]);
  return (
    <div className="flex flex-col justify-center items-center gap-3">
      <div className="flex flex-col md:flex-row justify-center items-center gap-2 flex-wrap">
        {_.map(mockData, (data, index) => (
          <TokenSaleItemCard
            key={index}
            logo={data.logo}
            tagName={data.tagName}
            tagColor={data.tagColor}
            name={data.name}
            maxContribution={data.maxContribution}
            hardCap={data.hardCap}
            softCap={data.softCap}
            liquidity={data.liquidity}
            lockTime={data.lockTime}
            progress={Math.random() * 100}
          />
        ))}
      </div>
    </div>
  );
};

const CreateSaleRoute = () => {
  const { chainId } = useWeb3Context();
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

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) =>
      setData((d) => ({
        ...d,
        [e.target.name]:
          e.target.type === 'number' || e.target.type === 'datetime-local' || e.target.type === 'date' ? e.target.valueAsNumber || 0 : e.target.value
      })),
    []
  );

  return (
    <div className="flex justify-center items-center mx-auto w-full flex-col md:flex-row px-2 py-2">
      <div className="card shadow-xl bg-[#000]/50 w-full md:w-1/2">
        <div className="card-body w-full overflow-auto">
          <span className="card-title font-Montserrat text-white/75">Create Presale Launch</span>
          <form className="w-full flex flex-col gap-2">
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
                min={new Date(Date.now() + 60 * 60 * 24 * 1000).toISOString().replace('Z', '')}
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
              <span className="text-white/80 font-Montserrat text-[18px]">Network Fee</span>
              <span className="text-white/80 font-Montserrat text-[18px]">{/* {networkFee} {chain.symbol} */}</span>
            </div>
            <button type="submit" className={`bg-[#0cedfc] btn py-[12px] px-[12px] rounded-[10px] w-full`}>
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
      {selectedRoute === Subroutes.ALL_ITEMS && <AllSalesRoute />}
      {selectedRoute === Subroutes.APPLY && <ApplyForPresaleRoute />}
      {selectedRoute === Subroutes.CREATE_NEW && <CreateSaleRoute />}
    </div>
  );
}
