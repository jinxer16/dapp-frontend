import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { FiPlus, FiChevronRight, FiKey, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import _ from 'lodash';
import { formatEthAddress } from 'eth-address';
import { useAPIContext } from '../contexts/api';
import { CreateMultiSigWallet, MultiSigItem } from '../routes/multisig';
import Empty from '../components/Empty';

enum Routes {
  CREATE_WALLET,
  IMPORT_WALLET,
  VIEW_WALLET
}

export default function MultiSig() {
  const { multiSigsByAccount, fetchMultiSigsByAccount } = useAPIContext();
  const [route, setRoute] = useState<Routes>(Routes.CREATE_WALLET);
  const [wallet, setWallet] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchMultiSigsByAccount(page);
  }, [fetchMultiSigsByAccount, page]);

  return (
    <>
      <Head>
        <title>Vefi DApps | Multi-Signatory Wallets</title>
      </Head>
      <div className="flex flex-col md:flex-row w-screen backdrop-opacity-10 backdrop-invert bg-[#05325B]/70 h-full overflow-auto hidden-scrollbar">
        <div className="w-full md:w-80 py-10 px-5 md:h-full bg-[#161525] text-white flex flex-col gap-2 md:gap-4">
          <div className="flex justify-center items-center gap-3 w-full">
            <button onClick={() => setRoute(Routes.CREATE_WALLET)} className="btn btn-ghost flex flex-col gap-2">
              <FiPlus className="md:text-[20px] text-[16px]" />
              <span className="font-Montserrat">Create</span>
            </button>
            {/* <button className="btn btn-ghost flex flex-col gap-2">
            <FiSearch className="md:text-[20px] text-[16px]" />
            <span className="font-Montserrat">Import</span>
          </button> */}
          </div>
          <div className="md:menu flex flex-col justify-center items-center gap-1 w-full px-[2px] md:py-[12px]">
            {multiSigsByAccount.totalItems === 0 ? (
              <Empty />
            ) : (
              <div className="flex justify-center items-center gap-1 w-full md:flex-col">
                {_.map(multiSigsByAccount.items, (multisig, index) => (
                  <div key={index} className="md:w-full">
                    <button
                      onClick={() => {
                        setWallet(multisig);
                        setRoute(Routes.VIEW_WALLET);
                      }}
                      className={`hidden md:flex justify-center items-center btn font-poppins gap-2 btn-wide ${
                        wallet === multisig && route === Routes.VIEW_WALLET ? 'btn-primary' : 'btn-ghost'
                      }`}
                    >
                      {formatEthAddress(multisig, 6)} <FiChevronRight />{' '}
                    </button>
                    <button
                      onClick={() => {
                        setWallet(multisig);
                        setRoute(Routes.VIEW_WALLET);
                      }}
                      className={`md:hidden flex justify-center items-center btn btn-circle ${
                        wallet === multisig && route === Routes.VIEW_WALLET ? 'btn-primary' : ''
                      }`}
                    >
                      <FiKey />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center items-center gap-2 text-white/70">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="bg-transparent">
                <FiArrowLeft />
              </button>
              <span>
                Page {page} of {Math.ceil(multiSigsByAccount.totalItems / 20)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(multiSigsByAccount.totalItems / 20)}
                className="bg-transparent"
              >
                <FiArrowRight />
              </button>
            </div>
          </div>
        </div>
        {route === Routes.CREATE_WALLET && <CreateMultiSigWallet />}
        {route === Routes.VIEW_WALLET && <MultiSigItem wallet={wallet} />}
      </div>
    </>
  );
}
