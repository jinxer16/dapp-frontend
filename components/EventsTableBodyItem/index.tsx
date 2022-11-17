import React, { useMemo } from 'react';
import { EventModel } from '../../api/models/dex';
import { FiExternalLink } from 'react-icons/fi';
import Moment from 'react-moment';
import _ from 'lodash';
import { obtainLPDetailsFromPair } from '../../hooks/dex';
import { useWeb3Context } from '../../contexts/web3';
import chains from '../../assets/chains.json';

type IEventsTableBodyItemProps = {
  event: EventModel;
};

export default function EventsTableBodyItem({ event }: IEventsTableBodyItemProps) {
  const { chainId, account } = useWeb3Context();
  const lpDetails = obtainLPDetailsFromPair(event.pair, chainId || 97, account as string);
  const label = useMemo(
    () => (event.eventName === 'swap' ? 'Swap' : event.eventName === 'mint' ? 'Add' : event.eventName === 'burn' ? 'Remove' : 'Unknown'),
    [event.eventName]
  );
  const chain = useMemo(() => chains[(chainId as unknown as keyof typeof chains) || 97], [chainId]);

  return (
    <div className="table-row text-[#fff] h-[50px] font-poppins hover:bg-[#000]/30 cursor-pointer">
      <div className="table-cell text-center px-2 py-2">
        <div className="flex justify-start gap-1 items-center">
          <span>
            {label} {lpDetails.token0Symbol} and {lpDetails.token1Symbol}
          </span>
          <a href={chain.explorer.concat(`/tx/${event.transactionHash}`)} target="_blank" rel="noreferrer">
            <FiExternalLink className="text-[blue]/50" />
          </a>
        </div>
      </div>
      <div className="table-cell text-center py-2">
        {_.divide(parseInt(event.amount1), Math.pow(10, lpDetails.token0Decimals)).toPrecision(4)} {lpDetails.token0Symbol}
      </div>
      <div className="table-cell text-center py-2">
        {_.divide(parseInt(event.amount2), Math.pow(10, lpDetails.token1Decimals)).toPrecision(4)} {lpDetails.token1Symbol}
      </div>
      <div className="table-cell text-center py-2">
        <Moment fromNow date={new Date(event.timestamp)} />
      </div>
    </div>
  );
}
