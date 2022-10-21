import React from 'react';
import _ from 'lodash';
import StakingPoolCard from '../../components/Staking/StakingPoolCard';
import { useAPIContext } from '../../contexts/api';

export default function RegularStakingPools() {
  const { stakingPools } = useAPIContext();
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-3 flex-nowrap md:flex-wrap w-full flex-grow px-[4px]">
      {_.map(stakingPools, (pool, index) => (
        <div className="px-[3px] py-[4px] w-full md:w-1/5" key={index}>
          <StakingPoolCard key={index} pool={pool} />
        </div>
      ))}
    </div>
  );
}
