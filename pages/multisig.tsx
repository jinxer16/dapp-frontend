import React, { useState } from 'react';
import { FiPlus, FiSearch, FiChevronRight, FiKey } from 'react-icons/fi';
import _ from 'lodash';
import { formatEthAddress } from 'eth-address';
import { useAPIContext } from '../contexts/api';
import { CreateMultiSigWallet } from '../routes/multisig';

enum Routes {
  CREATE_WALLET,
  IMPORT_WALLET,
  VIEW_WALLET
}

export default function MultiSig() {
  const { multiSigsByAccount } = useAPIContext();
  const [route, setRoute] = useState<Routes>(Routes.CREATE_WALLET);
  return (
    <div className="flex flex-col md:flex-row w-screen backdrop-opacity-10 backdrop-invert bg-[#05325B]/70 h-full overflow-auto hidden-scrollbar gap-2">
      <div className="w-full md:w-80 py-10 px-5 md:h-full bg-[#161525] text-white flex flex-col gap-2 md:gap-4">
        <div className="flex justify-center items-center gap-3 w-full">
          <button className="btn btn-ghost flex flex-col gap-2">
            <FiPlus className="md:text-[20px] text-[16px]" />
            <span className="font-Montserrat">Create</span>
          </button>
          <button className="btn btn-ghost flex flex-col gap-2">
            <FiSearch className="md:text-[20px] text-[16px]" />
            <span className="font-Montserrat">Import</span>
          </button>
        </div>
        <div className="md:menu flex flex-row justify-center items-center gap-1 w-full px-[2px] md:py-[12px]">
          {_.map(multiSigsByAccount, (multisig, index) => (
            <div key={index} className="md:w-full">
              <button className="hidden md:flex justify-center items-center w-full btn btn-ghost font-poppins gap-2">
                {formatEthAddress(multisig, 6)} <FiChevronRight />{' '}
              </button>
              <button className="md:hidden flex justify-center items-center btn btn-circle">
                <FiKey />
              </button>
            </div>
          ))}
        </div>
      </div>
      {route === Routes.CREATE_WALLET && <CreateMultiSigWallet />}
    </div>
  );
}
