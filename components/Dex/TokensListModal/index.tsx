/* eslint-disable react-hooks/exhaustive-deps */
import React, { Fragment, useCallback, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ToastContainer, toast } from 'react-toastify';
import { FiSearch, FiX } from 'react-icons/fi';
import _ from 'lodash';
import { isAddress } from '@ethersproject/address';
import { Fetcher } from 'quasar-sdk-core';
import { useAPIContext } from '../../../contexts/api';
import { ListingModel } from '../../../api/models/dex';
import TokensListItem from './list';
import { useWeb3Context } from '../../../contexts/web3';

type ITokensListModalProps = {
  onClose: () => void;
  isVisible: boolean;
  onTokenSelected: (token: ListingModel) => void;
  selectedTokens?: Array<ListingModel>;
};

export default function TokensListModal({ onClose, isVisible, onTokenSelected, selectedTokens }: ITokensListModalProps) {
  const { tokensListing, importToken } = useAPIContext();
  const { chainId } = useWeb3Context();
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const addTokenUsingSearchValue = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = await Fetcher.fetchTokenData(chainId || 97, searchValue);
      importToken({
        name: token.name as string,
        logoURI: '/images/placeholder_image.svg',
        decimals: token.decimals,
        address: token.address,
        symbol: token.symbol as string
      });
      setIsLoading(false);
      toast(`Successfully imported token ${token.symbol}`, { type: 'success' });
    } catch (error: any) {
      setIsLoading(false);
      toast(error.message, { type: 'error' });
    }
  }, [chainId, searchValue]);
  return (
    <Transition appear show={isVisible}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-[#000]/[.95]" aria-hidden="true" />
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="container top-0 bottom-0 left-0 right-0 w-[400px] mx-auto bg-[#161525]/[.7] mix-blend-normal rounded-[25px] backdrop-blur-[64px] text-white">
                <div className="flex flex-col justify-center items-center w-full">
                  <div className="bg-[#161525]/[.5] p-[30px] w-full">
                    <div className="flex flex-row">
                      <div className="flex flex-row items-center justify-between w-full">
                        <h2 className="text-2xl font-semibold">Select Token</h2>
                        <button onClick={onClose} className="text-[#000] text-[30] p-[8px] flex justify-center rounded-[100%] bg-[#fff] font-[700]">
                          <FiX />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center gap-2 w-full">
                    <div className="flex justify-center items-center px-10 py-10 w-full">
                      <div className="bg-[#000]/50 rounded-[20px] py-2 flex justify-center items-center gap-1 px-4 w-full">
                        <input
                          type="text"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          className="bg-transparent outline-0 font-poppins max-w-[200px] md:w-[500px]"
                          placeholder="Search token by address or name"
                        />
                        <FiSearch />
                      </div>
                    </div>

                    <div className="flex flex-col justify-start items-start w-full overflow-auto max-h-[500px]">
                      {searchValue.replace(/\s/g, '').length > 0 &&
                      _.filter(
                        tokensListing,
                        (model) =>
                          model.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
                          model.address.toLowerCase().startsWith(searchValue.toLowerCase())
                      ).length > 0 ? (
                        _.filter(
                          tokensListing,
                          (model) =>
                            model.name.toLowerCase().startsWith(searchValue.toLowerCase()) ||
                            model.address.toLowerCase().startsWith(searchValue.toLowerCase())
                        ).map((model, index) => (
                          <div key={index} className="w-full">
                            <TokensListItem
                              model={model}
                              disabled={_.includes(selectedTokens, model)}
                              onClick={() => {
                                onTokenSelected(model);
                                onClose();
                              }}
                            />
                          </div>
                        ))
                      ) : searchValue.replace(/\s/g, '').length === 0 ? (
                        _.map(tokensListing, (model, index) => (
                          <div key={index} className="w-full">
                            <TokensListItem
                              model={model}
                              disabled={_.includes(selectedTokens, model)}
                              onClick={() => {
                                onTokenSelected(model);
                                onClose();
                              }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex justify-center items-center w-full flex-col gap-2 px-2 py-2">
                          <div className="flex justify-center items-center w-full">
                            <span className="text-[red]/50 font-[600] text-[20px]">Empty Search Result!</span>
                          </div>
                          {isAddress(searchValue) && (
                            <button
                              onClick={addTokenUsingSearchValue}
                              disabled={isLoading}
                              className={`btn btn-primary font-Montserrat w-full rounded-[25px] ${isLoading ? 'loading' : ''}`}
                            >
                              Import Token
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
            <ToastContainer position="bottom-center" theme="dark" autoClose={5000} />
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
