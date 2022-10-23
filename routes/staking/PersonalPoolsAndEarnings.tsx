import React from 'react';
import _ from 'lodash';
import StakingPoolCard from '../../components/Staking/StakingPoolCard';
import { useAPIContext } from '../../contexts/api';
import StakeEventsTableBodyItem from '../../components/Staking/StakeEventsTableBodyItem';

export default function PersonalPoolsAndEarnings() {
  const { accountStakingPools, stakesByAccount } = useAPIContext();
  return (
    <div className="flex flex-col justify-center items-center gap-8">
      <div className="flex flex-col md:flex-row justify-center items-center gap-3 flex-nowrap md:flex-wrap w-full flex-grow px-[4px]">
        {_.map(accountStakingPools, (pool, index) => (
          <div className="px-[3px] py-[4px] w-full md:w-1/5" key={index}>
            <StakingPoolCard key={index} pool={pool} />
          </div>
        ))}
      </div>

      <div className="flex flex-col justify-start items-start w-full md:w-[700px] font-poppins">
        <span className="font-[700] text-[20px] text-[#fff]">My Stakes & Rewards</span>
        <div className="artboard artboard-horizontal bg-[#000]/50 px-[2px] rounded-[15px] overflow-auto py-[8px] shadow-lg">
          <div className="table w-full border-separate bg-transparent overflow-auto border-spacing-y-[20px] border-spacing-x-[0px]">
            <div className="table-header-group w-full h-[50px]">
              <div className="table-row text-[#fff] w-full font-[800] uppercase gap-3">
                <div className="hidden md:table-cell text-left">Pool</div>
                <div className="hidden md:table-cell text-center">Date</div>
                <div className="table-cell text-center">Amount</div>
                <div className="table-cell text-center">Reward</div>
                <div className="table-cell text-center">Actions</div>
              </div>
            </div>
            <div className="table-row-group">
              {_.map(stakesByAccount, (ev, index) => (
                <StakeEventsTableBodyItem key={index} data={ev} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
