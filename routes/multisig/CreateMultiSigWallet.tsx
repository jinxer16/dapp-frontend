import React, { ChangeEvent, FormEvent, useCallback, useMemo, useState } from 'react';
import { FiPlus, FiMinus } from 'react-icons/fi';
import _ from 'lodash';
import { isAddress } from '@ethersproject/address';
import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { abi as multiSigAbi } from 'vefi-multi-sig/artifacts/contracts/MultiSigActions.sol/MultiSigActions.json';
import chains from '../../assets/chains.json';
import actions from '../../assets/multisig_actions.json';
import { useWeb3Context } from '../../contexts/web3';

export default function CreateMultiSigWallet() {
  const { chainId, account } = useWeb3Context();
  const action = useMemo(() => actions[chainId as unknown as keyof typeof actions], [chainId]);
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const [data, setData] = useState({
    signatories: [account as string],
    requiredConfirmations: 0
  });

  const isValidData = useMemo(
    () =>
      data.signatories.length >= 2 &&
      _.every(data.signatories, (signatory) => isAddress(signatory)) &&
      data.requiredConfirmations > 0 &&
      data.requiredConfirmations <= data.signatories.length,
    [data.requiredConfirmations, data.signatories]
  );

  const handleChangeOnSignatoryField = useCallback(
    (index: number, event: ChangeEvent<HTMLInputElement>) => {
      const mutable = [...data.signatories];
      mutable.splice(index, 1, event.target.value);
      setData((d) => ({ ...d, signatories: mutable }));
    },
    [data.signatories]
  );

  const addSignatoryField = useCallback(() => {
    const signatories = [...data.signatories, ''];
    setData((d) => ({ ...d, signatories }));
  }, [data.signatories]);

  const removeSignatoryField = useCallback(
    (index: number) => {
      const signatories = [...data.signatories];
      signatories.splice(index, 1);
      setData((d) => ({ ...d, signatories }));
    },
    [data.signatories]
  );

  const submitForm = useCallback((event: FormEvent<HTMLFormElement>) => {
    try {
      event.preventDefault();
    } catch (error: any) {}
  }, []);
  return (
    <div className="flex justify-center items-center mx-auto w-full flex-col md:flex-row px-2">
      <div className="card shadow-xl bg-[#000]/50 w-full md:w-1/3">
        <div className="card-body w-full overflow-auto">
          <span className="card-title font-Montserrat text-white/75">Create Multi-Signatory Wallet</span>
          <form onSubmit={submitForm} className="w-full flex flex-col gap-2">
            {_.map(data.signatories, (signatory, index) => (
              <div key={index} className="flex justify-center flex-col md:flex-row items-center w-full gap-2">
                <input
                  placeholder="Enter wallet address"
                  value={signatory}
                  name={signatory}
                  onChange={(e) => handleChangeOnSignatoryField(index, e)}
                  className="outline-0 bg-[#000]/70 py-4 px-4 rounded-[12px] text-white flex-1"
                />
                <div className="flex justify-center gap-2 items-center">
                  <button onClick={() => removeSignatoryField(index)} disabled={data.signatories.length === 1} className="btn btn-warning btn-square">
                    <FiMinus />
                  </button>
                  {index === data.signatories.length - 1 && (
                    <button onClick={addSignatoryField} className="btn btn-primary btn-square">
                      <FiPlus />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </form>
        </div>
      </div>
    </div>
  );
}
