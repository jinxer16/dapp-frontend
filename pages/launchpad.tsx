import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { FaParachuteBox } from 'react-icons/fa';
import { FiShield, FiLock, FiDollarSign, FiSettings, FiNavigation } from 'react-icons/fi';
import { TiArrowShuffle } from 'react-icons/ti';
import { NavLink, LaunchpadNavbar } from '../components/LaunchPad';
import { Presales } from '../routes/launchpad';

enum Routes {
  PRESALES,
  PRIVATE_SALES
}

export default function Launchpad() {
  const [route, setRoute] = useState<Routes>(Routes.PRESALES);
  return (
    <>
      <Head>
        <title>Vefi DApps | Launchpad</title>
      </Head>
      {/* <div className="flex justify-center items-center w-full my-[100px]">
        <div className="flex flex-col-reverse justify-center items-center gap-6">
          <span className="text-white font-[700] text-[18px] md:text-[50px] font-Montserrat">Page under construction!</span>
          <Image src="/images/under_construction.svg" width={398.34} height={378} alt="connect_wallet" />
        </div>
      </div> */}
      <div className="flex flex-col md:flex-row w-screen backdrop-opacity-10 backdrop-invert bg-[#05325B]/70 h-screen overflow-auto hidden-scrollbar">
        <div className="w-full md:w-80 py-10 px-5 h-[40px] md:h-full bg-[#161525] text-white">
          <LaunchpadNavbar>
            <NavLink
              label="Presales"
              icon={<TiArrowShuffle className="text-white" />}
              dropdown
              onClick={() => setRoute(Routes.PRESALES)}
              active={`${route === Routes.PRESALES ? 'text-[#46aefc]' : 'text-[#fff]'}`}
            />
            <NavLink label="Private sales" icon={<FiDollarSign className="text-white" />} dropdown onClick={() => setRoute(Routes.PRIVATE_SALES)} />
            <NavLink label="Airdrops" icon={<FaParachuteBox className="text-white" />} dropdown />
            <NavLink label="Locks" icon={<FiLock className="text-white" />} dropdown />
            <NavLink label="Utitlty &amp; Tools" icon={<FiSettings className="text-white" />} dropdown />
            <NavLink label="Listing Alerts (Beta)" icon={<FiNavigation className="text-white" />} />
            <NavLink label="KYC &amp; Audit" icon={<FiShield className="text-white" />} />
          </LaunchpadNavbar>
        </div>
        <div className="w-screen p-5">{route === Routes.PRESALES && <Presales />}</div>
      </div>
    </>
  );
}
