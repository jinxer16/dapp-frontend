import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useAPIContext } from '../../contexts/api';
import TopPoolsTableBodyItem from '../../components/TopPoolsTableBodyItem';
import EventsTableBodyItem from '../../components/EventsTableBodyItem';

export default function Stats() {
  const { topPairs, events, eventsDataUpdate } = useAPIContext();
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (page) {
      eventsDataUpdate(page, events.type);
    }
  }, [events.type, eventsDataUpdate, page]);
  return (
    <div className="flex justify-center items-center gap-10 flex-col px-[10px] w-full">
      {/* <div className="flex gap-2 overflow-auto justify-center items-center px-[10px]">
        <div className="flex flex-col max-w-[200px] border-[#ffeb82] border-[1px] bg-[#000000]/50 px-[8px] text-[#fff] py-[8px] rounded-[15px] justify-center items-center">
          <FiDollarSign className="text-[50px]"/>
          <span className="text-[30px]">$240B</span>
          <span className="text-[20px]">TVL</span>
        </div>

        <div className="flex flex-col max-w-[200px] border-[#ffeb82] border-[1px] bg-[#000000]/50 px-[8px] text-[#fff] py-[8px] rounded-[15px] justify-center items-center">
          <RiExchangeDollarLine className="text-[50px]"/>
          <span className="text-[30px]">$200B</span>
          <span className="text-[20px]">VOLUME (24H)</span>
        </div>

        <div className="flex flex-col max-w-[200px] border-[#ffeb82] border-[1px] bg-[#000000]/50 px-[8px] text-[#fff] py-[8px] rounded-[15px] justify-center items-center">
          <FaExchangeAlt className="text-[50px]"/>
          <span className="text-[30px]">2000</span>
          <span className="text-[20px]">TXS (24H)</span>
        </div>
      </div> */}
      <div className="flex flex-col justify-start items-start w-full md:w-[700px] font-poppins">
        <span className="font-[700] text-[20px] text-[#fff]">Top Pools</span>
        <div className="artboard artboard-horizontal bg-[#000]/50 px-[2px] rounded-[15px] overflow-auto py-[8px] shadow-lg">
          <div className="table w-full border-separate bg-transparent overflow-auto border-spacing-y-[20px] border-spacing-x-[0px]">
            <div className="table-header-group w-full h-[50px]">
              <div className="table-row text-[#fff] w-full font-[800] uppercase gap-3">
                <div className="table-cell text-left">#</div>
                <div className="table-cell text-left">Pool</div>
                <div className="table-cell text-center">Volume 24H</div>
                <div className="hidden md:table-cell text-center">Volume 7D</div>
                <div className="hidden md:table-cell text-center">Volume 30D</div>
              </div>
            </div>
            <div className="table-row-group">
              {_.map(topPairs, (pair, index) => (
                <TopPoolsTableBodyItem key={index} pair={pair} index={index + 1} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-start items-start w-full md:w-[700px] font-poppins">
        <div className="flex justify-center gap-1 items-start">
          <span className="font-[700] text-[20px] text-[#fff]">Transactions</span>
          <div className="flex justify-center gap-1 items-start">
            <label className="label cursor-pointer flex justify-center items-center gap-1 flex-col-reverse">
              <span className="label-text text-[whitesmoke]">All</span>
              <input
                onClick={() => {
                  eventsDataUpdate(1, 'all');
                  setPage(1);
                }}
                type="radio"
                className="radio radio-accent radio-sm"
                checked={events.type === 'all'}
              />
            </label>
            <label className="label cursor-pointer flex justify-center items-center gap-1 flex-col-reverse">
              <span className="label-text text-[whitesmoke]">Swaps</span>
              <input
                onClick={() => {
                  eventsDataUpdate(1, 'swap');
                  setPage(1);
                }}
                type="radio"
                className="radio radio-accent radio-sm"
                checked={events.type === 'swap'}
              />
            </label>
            <label className="label cursor-pointer flex justify-center items-center gap-1 flex-col-reverse">
              <span className="label-text text-[whitesmoke]">Adds</span>
              <input
                onClick={() => {
                  eventsDataUpdate(1, 'mint');
                  setPage(1);
                }}
                type="radio"
                className="radio radio-accent radio-sm"
                checked={events.type === 'mint'}
              />
            </label>
            <label className="label cursor-pointer flex justify-center items-center gap-1 flex-col-reverse">
              <span className="label-text text-[whitesmoke]">Removes</span>
              <input
                onClick={() => {
                  eventsDataUpdate(1, 'burn');
                  setPage(1);
                }}
                type="radio"
                className="radio radio-accent radio-sm"
                checked={events.type === 'burn'}
              />
            </label>
          </div>
        </div>
        <div className="artboard artboard-horizontal bg-[#000]/50 px-[2px] rounded-[15px] overflow-auto py-[8px] shadow-lg">
          <div className="table w-full border-separate bg-transparent overflow-auto border-spacing-y-[20px] border-spacing-x-[0px]">
            <div className="table-header-group w-full h-[50px]">
              <div className="table-row text-[#fff] w-full font-[800] uppercase gap-3">
                <div className="table-cell text-center">Transaction</div>
                <div className="table-cell text-center">Token Amount</div>
                <div className="table-cell text-center">Token Amount</div>
                <div className="table-cell text-center">Time</div>
              </div>
            </div>
            <div className="table-row-group">
              {_.map(events.items, (ev, index) => (
                <EventsTableBodyItem key={index} event={ev} />
              ))}
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 text-white/70">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="bg-transparent">
              <FiArrowLeft />
            </button>
            <span>
              Page {page} of {Math.ceil(events.totalItems / 20)}
            </span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page === Math.ceil(events.totalItems / 20)} className="bg-transparent">
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
