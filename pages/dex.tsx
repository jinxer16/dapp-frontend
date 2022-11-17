import React, { useState } from 'react';
import Head from 'next/head';
import ToggleButton from '../components/Button/ToggleButton';
import { Liquidity, Stats, Swap } from '../routes/dex';

enum Route {
  SWAP,
  LIQUIDITY,
  STATS
}

export default function Dex() {
  const [route, setRoute] = useState<Route>(Route.SWAP);
  return (
    <>
      <Head>
        <title>Vefi DApps | DEX</title>
      </Head>
      <div className="flex justify-center items-center my-16 w-full">
        <div className="flex justify-center items-center my-[3px] rounded-[18px] bg-white py-[2px] px-[4px]">
          <ToggleButton isActive={route === Route.SWAP} onClick={() => setRoute(Route.SWAP)}>
            <span>Swap</span>
          </ToggleButton>
          <ToggleButton isActive={route === Route.LIQUIDITY} onClick={() => setRoute(Route.LIQUIDITY)}>
            <span>Liquidity</span>
          </ToggleButton>
          <ToggleButton isActive={route === Route.STATS} onClick={() => setRoute(Route.STATS)}>
            <span>Stats</span>
          </ToggleButton>
        </div>
      </div>
      <div className="flex justify-center items-center my-16 px-1 w-full">
        {route === Route.SWAP && <Swap />}
        {route === Route.LIQUIDITY && <Liquidity />}
        {route === Route.STATS && <Stats />}
      </div>
    </>
  );
}
