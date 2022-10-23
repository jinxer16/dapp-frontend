import { Transition, Dialog } from '@headlessui/react';
import assert from 'assert';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import _ from 'lodash';
import { Interface } from '@ethersproject/abi';
import { abi as multiSigAbi } from 'vefi-multi-sig/artifacts/contracts/MultiSig.sol/MultiSig.json';
import { isAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import chains from '../../../assets/chains.json';
import { useWeb3Context } from '../../../contexts/web3';
import { parseEther } from '@ethersproject/units';

type ISendTransactionModalProps = {
  wallet: string;
  isOpen: boolean;
  onClose: () => void;
  updateParentState: () => void;
};

type AbiInterfaceModel = {
  anonymous?: boolean;
  constant?: boolean;
  inputs: Array<{
    internalType: string;
    indexed?: boolean;
    name: string;
    type: string;
  }>;
  name: string;
  outputs: Array<{
    internalType: string;
    indexed?: boolean;
    name: string;
    type: string;
  }>;
  stateMutability: string;
  type: string;
};

export default function SendTransactionModal({ wallet, isOpen, onClose, updateParentState }: ISendTransactionModalProps) {
  const { chainId, library } = useWeb3Context();
  const [abi, setAbi] = useState<Array<AbiInterfaceModel>>([]);
  const [abiString, setAbiString] = useState<string>('');
  const [functionParametersForCall, setFunctionParametersForCall] = useState<{ [key: string]: { arguments: Array<string>; value: number } }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [to, setTo] = useState<string>('');
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);

  const handleInputChangeForFunctionParameters = useCallback(
    (functionName: string, argumentIndex: number, argument: string) => {
      if (!!functionParametersForCall[functionName]) {
        const args = [...functionParametersForCall[functionName].arguments];
        args.splice(argumentIndex, 1, argument);
        setFunctionParametersForCall((data) => ({
          ...data,
          [functionName]: {
            ...data[functionName],
            arguments: args
          }
        }));
      } else {
        setFunctionParametersForCall((data) => ({
          ...data,
          [functionName]: {
            ...data[functionName],
            value: 0,
            arguments: [argument]
          }
        }));
      }
    },
    [functionParametersForCall]
  );

  const handleValueChangeForFunction = useCallback((functionName: string, newValue: number) => {
    setFunctionParametersForCall((data) => ({ ...data, [functionName]: { ...data[functionName], value: newValue } }));
  }, []);

  const parseAbi = useCallback(() => {
    try {
      const parsed: Array<AbiInterfaceModel> = JSON.parse(abiString);

      assert.ok(Array.isArray(parsed), 'ABI must be an array');

      _.each(parsed, (model, index) => {
        assert.ok(typeof model === 'object', 'Item must be an object. Wrong object type at ' + index);
        assert.ok('type' in model, 'Missing type');
        if (model.type === 'function') {
          assert.ok('inputs' in model, 'Missing inputs');
          assert.ok('outputs' in model, 'Missing outputs');
          assert.ok('name' in model, 'Missing name');
          assert.ok('stateMutability' in model, 'Missing state mutability');

          if (model.inputs?.length > 0) {
            _.each(model.inputs, (input) => {
              assert.ok('type' in input, 'Missing type');
              assert.ok('name' in input, 'Missing name');
            });
          }

          if (model.outputs?.length > 0) {
            _.each(model.outputs, (output) => {
              assert.ok('type' in output, 'Missing type');
              assert.ok('name' in output, 'Missing name');
            });
          }
        }
      });
      setAbi(parsed);
    } catch (error: any) {
      toast(error.message, { type: 'error' });
    }
  }, [abiString]);

  const callFunction = useCallback(
    async (functionName: string) => {
      try {
        updateParentState();
        setIsLoading(true);
        const functionAndParams = functionParametersForCall[functionName];
        let updatedArguments: any[] = [];

        _.each(functionAndParams.arguments, (arg) => {
          if (isAddress(arg)) updatedArguments = [...updatedArguments, arg];
          else if (!isNaN(Number(arg))) {
            updatedArguments = [...updatedArguments, `0x${parseInt(arg).toString(16)}`];
          } else {
            try {
              const parsed = JSON.parse(arg);
              updatedArguments = [...updatedArguments, parsed];
            } catch (e) {}
          }
        });

        const contractAbiInterface = new Interface(abi);
        const dataHash = contractAbiInterface.encodeFunctionData(functionName, updatedArguments.length > 0 ? updatedArguments : undefined);
        const provider = new Web3Provider(library?.givenProvider);
        const multiSigContract = new Contract(wallet, multiSigAbi, provider.getSigner());
        const executionTx = await multiSigContract.initiateTransaction(to, dataHash, parseEther(functionAndParams.value?.toString() || '0'));
        await executionTx.wait();
        toast('Contract call executed successfully', { type: 'success' });
        setIsLoading(false);
        updateParentState();
      } catch (error: any) {
        toast(error.message, { type: 'error' });
        setIsLoading(false);
        updateParentState();
      }
    },
    [abi, functionParametersForCall, library?.givenProvider, to, updateParentState, wallet]
  );

  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
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
                <div className="container  top-0 bottom-0 left-0 right-0 w-[400px] mx-auto overflow-x-hidden overflow-y-auto  bg-[#161525]/[.7] mix-blend-normal rounded-[25px] backdrop-blur-[64px] text-white">
                  <div className="bg-[#161525]/[.5] p-[30px]">
                    <div className="flex flex-row items-center justify-between">
                      <h2 className="text-2xl font-semibold">Send Contract Transaction</h2>
                      <button onClick={onClose} className="text-[#000] text-[30] p-[8px] flex justify-center rounded-[100%] bg-[#fff] font-[700]">
                        <FiX />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-center w-full px-4 py-2 gap-2 font-poppins">
                    <input
                      onChange={(e) => setTo(e.target.value)}
                      value={to}
                      type="text"
                      placeholder="Enter contract address"
                      className="p-[12px] bg-transparent text-white border-b border-white/60 w-full outline-0 appearance-none font-[600] text-[14px]"
                    />
                    <textarea
                      value={abiString}
                      onChange={(e) => setAbiString(e.target.value)}
                      className="textarea textarea-accent w-full text-[#000]"
                      placeholder="Parse contract ABI"
                    ></textarea>
                    <div className="flex flex-col md:flex-row justify-center items-center gap-1">
                      <button onClick={parseAbi} disabled={abiString.replace(/\s/g, '').length === 0} className="btn btn-accent btn-wide md:w-1/2">
                        Parse
                      </button>
                      <button
                        onClick={() => {
                          setAbi([]);
                          setAbiString('');
                        }}
                        disabled={abi.length === 0}
                        className="btn btn-warning btn-wide md:w-1/2"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-col gap-2 w-full justify-center items-center">
                      {_.filter(abi, (item) => item.type === 'function' && item.stateMutability !== 'view' && item.stateMutability !== 'pure').map(
                        (item, index) => (
                          <div key={index} tabIndex={0} className="collapse collapse-arrow border border-base-300 bg-[#000]/50 rounded-box w-full">
                            <input type="checkbox" className="peer" />
                            <div className="collapse-title text-xl font-semibold font-Montserrat">{item.name}</div>
                            <div className="collapse-content">
                              <div className="flex flex-col justify-center items-center w-full gap-3 p-3">
                                {item.stateMutability === 'payable' && (
                                  <div className="flex flex-col gap-2 justify-start items-start w-full">
                                    <label className="text-info font-[600] font-Montserrat">value ({chain.symbol})</label>
                                    <input
                                      type="number"
                                      onChange={(e) => handleValueChangeForFunction(item.name, e.target.valueAsNumber || 0)}
                                      placeholder={`payableAmount (${chain.symbol})`}
                                      className="p-[12px] bg-transparent text-white border-b border-white/60 w-full outline-0 appearance-none font-[600] text-[14px]"
                                    />
                                  </div>
                                )}
                                {_.map(item.inputs, (itemInput, inputIndex) => (
                                  <div key={inputIndex} className="flex flex-col gap-2 justify-start items-start w-full">
                                    <label className="text-info font-[600] font-Montserrat">
                                      {itemInput.name} ({itemInput.type})
                                    </label>
                                    <input
                                      onChange={(e) => handleInputChangeForFunctionParameters(item.name, inputIndex, e.target.value)}
                                      value={functionParametersForCall[item.name]?.arguments?.[inputIndex] || ''}
                                      type="text"
                                      placeholder={`${itemInput.name} (${itemInput.type})`}
                                      className="p-[12px] bg-transparent text-white border-b border-white/60 w-full outline-0 appearance-none font-[600] text-[14px]"
                                    />
                                  </div>
                                ))}
                                <button
                                  disabled={
                                    isLoading ||
                                    !functionParametersForCall[item.name] ||
                                    !functionParametersForCall[item.name].arguments ||
                                    functionParametersForCall[item.name].arguments.length !== item.inputs.length
                                  }
                                  className="btn btn-primary btn-wide"
                                  onClick={() => callFunction(item.name)}
                                >
                                  Call
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </Transition.Child>
              <ToastContainer position="top-right" theme="dark" autoClose={5000} />
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
