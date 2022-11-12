import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FiCopy, FiX, FiCheck } from 'react-icons/fi';
import { MdSend } from 'react-icons/md';
import { toast, ToastContainer } from 'react-toastify';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Interface } from '@ethersproject/abi';
import { isAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { Web3Provider } from '@ethersproject/providers';
import { formatEther, parseEther } from '@ethersproject/units';
import { Contract } from '@ethersproject/contracts';
import { abi as multiSigAbi } from 'vefi-multi-sig/artifacts/contracts/MultiSig.sol/MultiSig.json';
import _ from 'lodash';
import chains from '../../assets/chains.json';
import rpcCall from '../../api/rpc';
import { useWeb3Context } from '../../contexts/web3';
import SendTransactionModal from '../../components/Multisig/SendTransactionModal';

type IMultiSigItemProps = {
  wallet: string;
};

type TransactionModel = [string, BigNumber, string, BigNumber, boolean, string, BigNumber];

export default function MultiSigItem({ wallet }: IMultiSigItemProps) {
  const { chainId, library } = useWeb3Context();
  const [etherBalance, setEtherBalance] = useState<string>('0');
  const [sendAmount, setSendAmount] = useState<number>(0);
  const [recipient, setRecipeint] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<Array<TransactionModel>>([]);
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const chain = useMemo(() => chains[chainId as unknown as keyof typeof chains], [chainId]);
  const isValidData = useMemo(
    () => isAddress(recipient) && sendAmount > 0 && sendAmount <= parseFloat(etherBalance),
    [etherBalance, recipient, sendAmount]
  );

  const transferEther = useCallback(async () => {
    try {
      setIsLoading(true);
      const provider = new Web3Provider(library?.givenProvider);
      const multisigContract = new Contract(wallet, multiSigAbi, provider.getSigner());
      const transferEtherTx = await multisigContract.transferEther(recipient, parseEther(sendAmount.toString()));
      const transferResponse = await transferEtherTx.wait();

      toast(
        <div className="flex justify-center gap-2 text-[16px] font-poppins items-center">
          <span className="text-white">Transaction executed successfully!</span>
          <a href={chain.explorer.concat(`/tx/${transferResponse.transactionHash}`)} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </div>,
        { type: 'success' }
      );
      setIsLoading(false);
    } catch (error: any) {
      toast(error.message, { type: 'error' });
      setIsLoading(false);
    }
  }, [chain.explorer, library?.givenProvider, recipient, sendAmount, wallet]);

  const confirmTransaction = useCallback(
    async (index: number) => {
      try {
        setIsActionLoading(true);
        const provider = new Web3Provider(library?.givenProvider);
        const multisigContract = new Contract(wallet, multiSigAbi, provider.getSigner());
        const confirmationTx = await multisigContract.confirmTransaction(`0x${index.toString(16)}`);
        const confirmationResponse = await confirmationTx.wait();

        toast(
          <div className="flex justify-center gap-2 text-[16px] font-poppins items-center">
            <span className="text-white">Transaction confirmed successfully!</span>
            <a href={chain.explorer.concat(`/tx/${confirmationResponse.transactionHash}`)} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          </div>,
          { type: 'success' }
        );
        setIsActionLoading(false);
      } catch (error: any) {
        toast(error.message, { type: 'error' });
        setIsActionLoading(false);
      }
    },
    [chain.explorer, library?.givenProvider, wallet]
  );

  const executeTransaction = useCallback(
    async (index: number) => {
      try {
        setIsActionLoading(true);
        const provider = new Web3Provider(library?.givenProvider);
        const multisigContract = new Contract(wallet, multiSigAbi, provider.getSigner());
        const executionTx = await multisigContract.executeTransaction(`0x${index.toString(16)}`);
        const executionResponse = await executionTx.wait();

        toast(
          <div className="flex justify-center gap-2 text-[16px] font-poppins items-center">
            <span className="text-white">Transaction executed successfully!</span>
            <a href={chain.explorer.concat(`/tx/${executionResponse.transactionHash}`)} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          </div>,
          { type: 'success' }
        );
        setIsActionLoading(false);
      } catch (error: any) {
        toast(error.message, { type: 'error' });
        setIsActionLoading(false);
      }
    },
    [chain.explorer, library?.givenProvider, wallet]
  );

  const revokeConfirmation = useCallback(
    async (index: number) => {
      try {
        setIsActionLoading(true);
        const provider = new Web3Provider(library?.givenProvider);
        const multisigContract = new Contract(wallet, multiSigAbi, provider.getSigner());
        const revocationTx = await multisigContract.revokeConfirmation(`0x${index.toString(16)}`);
        const revocationResponse = await revocationTx.wait();
        toast(
          <div className="flex justify-center gap-2 text-[16px] font-poppins items-center">
            <span className="text-white">Confirmation revoked successfully!</span>
            <a href={chain.explorer.concat(`/tx/${revocationResponse.transactionHash}`)} target="_blank" rel="noreferrer">
              View on explorer
            </a>
          </div>,
          { type: 'success' }
        );
        setIsActionLoading(false);
      } catch (error: any) {
        toast(error.message, { type: 'error' });
        setIsActionLoading(false);
      }
    },
    [chain.explorer, library?.givenProvider, wallet]
  );

  useEffect(() => {
    (async () => {
      const abiInterface = new Interface(multiSigAbi);
      const allTransactionsHash = abiInterface.getSighash('allTransactions()');
      const balance = await rpcCall(chain.rpcUrl, { method: 'eth_getBalance', params: [wallet, 'latest'] });
      let txs = await rpcCall(chain.rpcUrl, { method: 'eth_call', params: [{ to: wallet, data: allTransactionsHash }, 'latest'] });
      txs = abiInterface.decodeFunctionResult('allTransactions()', txs);
      setTransactions(txs[0]);
      setEtherBalance(formatEther(balance));
    })();
  }, [chain.rpcUrl, wallet, isLoading, isActionLoading]);
  return (
    <div className="flex justify-center items-center mx-auto w-full flex-col md:flex-row h-full">
      <div className="bg-[#f5f5f5]/50 w-full h-full overflow-auto flex flex-col gap-2 justify-start items-center">
        <div className="flex justify-center items-center gap-2 w-full">
          <span className="text-[16px] text-white/90 font-poppins font-[900]">{wallet}</span>
          <CopyToClipboard text={wallet}>
            <button className="btn btn-ghost">
              <FiCopy />
            </button>
          </CopyToClipboard>
        </div>
        <div className="stats shadow stats-vertical md:stats-horizontal">
          <div className="stat place-items-center">
            <div className="stat-title">Balance</div>
            <div className="stat-value">
              {parseFloat(etherBalance).toFixed(4)} {chain.symbol}
            </div>
            <div className="stat-actions">
              <label htmlFor="send-ether-modal" className="btn btn-sm btn-primary">
                Send Funds
              </label>
            </div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Total Transactions</div>
            <div className="stat-value">{transactions.length}</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title">Executed Transactions</div>
            <div className="stat-value">{_.filter(transactions, (transaction) => transaction[4]).length}</div>
          </div>
        </div>
        <button onClick={() => setShowTransactionModal(true)} className="btn btn-accent px-3 py-2 shadow-lg">
          Send Contract Transaction
        </button>
        <div className="overflow-x-auto w-full px-2 flex-col justify-start items-center gap-2">
          <span className="font-Montserrat font-[800]">Transactions</span>
          <table className="table table-zebra table-compact w-full font-poppins">
            <thead>
              <tr>
                <th>Index</th>
                <th>Initiator</th>
                <th>Confirmations</th>
                <th>To</th>
                <th>Data</th>
                <th>Value</th>
                <th>Executed?</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {_.map(transactions, (transaction, index) => (
                <tr key={index}>
                  <th>{parseInt(transaction[1].toHexString())}</th>
                  <td>{transaction[2]}</td>
                  <td>{parseInt(transaction[3].toHexString())}</td>
                  <td>{transaction[0]}</td>
                  <td>{transaction[5].slice(0, 17)}...</td>
                  <td>{formatEther(transaction[6])}</td>
                  <th>
                    <label>
                      <input readOnly type="checkbox" className="checkbox checkbox-accent" checked={transaction[4]} />
                    </label>
                  </th>
                  <td>
                    <div className="flex justify-center items-center gap-1">
                      <button
                        disabled={isActionLoading || transaction[4]}
                        onClick={() => confirmTransaction(parseInt(transaction[1].toHexString()))}
                        className="btn btn-square btn-primary"
                      >
                        <FiCheck />
                      </button>
                      <button
                        onClick={() => revokeConfirmation(parseInt(transaction[1].toHexString()))}
                        disabled={isActionLoading || transaction[4]}
                        className="btn btn-square btn-warning"
                      >
                        <FiX />
                      </button>
                      <button
                        onClick={() => executeTransaction(parseInt(transaction[1].toHexString()))}
                        disabled={isActionLoading || transaction[4]}
                        className="btn btn-square btn-success"
                      >
                        <MdSend />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <input type="checkbox" id="send-ether-modal" className="modal-toggle" />
      <div className="modal modal-bottom md:modal-middle font-Montserrat text-white/75">
        <div className="modal-box relative bg-[#000]">
          <label htmlFor="send-ether-modal" className="btn btn-sm btn-circle absolute right-2 top-2">
            <FiX />
          </label>
          <div className="flex justify-center items-center w-full px-4 flex-col gap-3 py-2">
            <div className="flex flex-col bg-[#0b0a13] border border-[#c7c7c7] gap-3 rounded-[10px] p-4 w-full">
              <div className="flex justify-between w-full items-center font-Montserrat">
                <span>Transfer</span>
                <span>Avail: {parseFloat(etherBalance).toFixed(4)}</span>
              </div>
              <input
                type="text"
                placeholder="Enter recipient's wallet address"
                className="p-[12px] bg-transparent text-white border-b border-white/60 w-full outline-0 appearance-none font-[600] text-[18px]"
                value={recipient}
                onChange={(e) => setRecipeint(e.target.value)}
              />
              <div className="flex justify-between items-center gap-4">
                <input
                  type="number"
                  className="p-[12px] bg-transparent text-white border-0 w-full outline-0 appearance-none font-[600] text-[18px]"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.valueAsNumber || 0)}
                />
                <button
                  onClick={() => setSendAmount(parseFloat(etherBalance))}
                  className="border border-[#fff] bg-[#f1f1f1]/[.11] py-[8px] px-[17px] rounded-[5px] uppercase"
                >
                  Max
                </button>
              </div>
            </div>
            <button
              onClick={transferEther}
              disabled={isLoading || !isValidData}
              className={`btn bg-[#0cedfc] rounded-[10px] text-[#000] w-full ${isLoading ? 'loading' : ''}`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" theme="dark" autoClose={5000} />
      <SendTransactionModal
        isOpen={showTransactionModal}
        wallet={wallet}
        onClose={() => setShowTransactionModal(false)}
        updateParentState={() => {
          setIsLoading((val) => !val);
          setIsActionLoading((val) => !val);
        }}
      />
    </div>
  );
}
