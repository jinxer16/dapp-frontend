/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { hexStripZeros } from '@ethersproject/bytes';
import { AddressZero } from '@ethersproject/constants';
import { formatEther, parseUnits } from '@ethersproject/units';
import { ChainId, Fetcher, Pair, TokenAmount, WETH } from 'quasar-sdk-core';
import { abi as erc20Abi } from 'quasar-v1-core/artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json';
import { abi as pairAbi } from 'quasar-v1-core/artifacts/contracts/QuasarPair.sol/QuasarPair.json';
import { abi as factoryAbi } from 'quasar-v1-core/artifacts/contracts/QuasarFactory.sol/QuasarFactory.json';
import { Interface } from '@ethersproject/abi';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { ListingModel } from '../../api/models/dex';
import { useWeb3Context } from '../../contexts/web3';
import rpcCall from '../../api/rpc';
import chains from '../../assets/chains.json';
import { fetchPriceHistoryForPair, fetchSwapEventsForPairPerPeriod } from '../../api/dex';
import whitelist from '../../assets/whitelist.json';
import factories from '../../assets/factories.json';

const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export type PercentageChangeType = 'INCREASE' | 'DECREASE' | 'NEUTRAL';

export const computePair = (token1: ListingModel, token2: ListingModel, chainId: ChainId) => {
  const [pair, setPair] = useState<string>(AddressZero);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (token1 && token2 && token1.address && token2.address) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const tokenA = token1.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token1.address, url);
          const tokenB = token2.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token2.address, url);
          const address = Pair.getAddress(tokenA, tokenB);
          setPair(address);
          setError(undefined);
        } catch (error: any) {
          setError(error);
        }
      })();
    }
  }, [token1, token2, chainId]);

  return { pair, error };
};

export const getToken1Price = (tokenA: ListingModel, tokenB: ListingModel, chainId: ChainId) => {
  const [token1Price, setToken1Price] = useState<string>('0');

  useEffect(() => {
    if (tokenA && tokenB && tokenA.address && tokenB.address) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const t0 = tokenA.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, tokenA.address, url);
          const t1 = tokenB.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, tokenB.address, url);
          const pair = await Fetcher.fetchPairData(t0, t1);
          setToken1Price(pair.priceOf(t1).toSignificant(4));
        } catch (error: any) {
          console.error(error);
        }
      })();
    }
  }, [tokenA, tokenB, chainId]);

  return token1Price;
};

export const getOutputAmount = (inputToken: ListingModel, outputToken: ListingModel, amount: number, chainId: ChainId) => {
  const [outputAmount, setOutputAmount] = useState<number>(0);

  useEffect(() => {
    if (inputToken && inputToken.address && amount > 0) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const t0 = inputToken.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, inputToken.address, url);
          const t1 = outputToken.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, outputToken.address, url);
          const exponentiated = _.multiply(amount, 10 ** t0.decimals);
          const inputTokenAmount = new TokenAmount(t0, `0x${exponentiated.toString(16)}`);
          const pair = await Fetcher.fetchPairData(t0, t1, url);
          setOutputAmount(parseFloat(pair.getOutputAmount(inputTokenAmount)[0].toSignificant(4)));
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [inputToken, outputToken, amount, chainId]);
  return outputAmount;
};

export const getInputAmount = (inputToken: ListingModel, outputToken: ListingModel, amount: number, chainId: ChainId) => {
  const [inputAmount, setInputAmount] = useState<number>(0);

  useEffect(() => {
    if (inputToken && inputToken.address && amount > 0) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const t0 = inputToken.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, inputToken.address, url);
          const t1 = outputToken.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, outputToken.address, url);
          const exponentiated = _.multiply(amount, 10 ** t1.decimals);
          const outputTokenAmount = new TokenAmount(t1, `0x${exponentiated.toString(16)}`);
          const pair = await Fetcher.fetchPairData(t0, t1, url);
          setInputAmount(parseFloat(pair.getInputAmount(outputTokenAmount)[0].toSignificant(4)));
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [inputToken, outputToken, amount, chainId]);
  return inputAmount;
};

export const fetchTokenBalanceForConnectedWallet = (token: string, deps: Array<any> = []) => {
  const [balance, setBalance] = useState<string>('0');
  const { active, account, chainId } = useWeb3Context();
  useEffect(() => {
    if (active && !!account && !!chainId && token && token) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          if (token !== AddressZero) {
            const t = await Fetcher.fetchTokenData(chainId, token, url);
            const erc20Interface = new Interface(erc20Abi);
            const balanceOf = erc20Interface.encodeFunctionData('balanceOf(address)', [account]);
            const call = await rpcCall(url, { method: 'eth_call', params: [{ to: t.address, data: balanceOf }, 'latest'] });
            const bal = _.divide(parseInt(call, 16), 10 ** t.decimals);
            setBalance(bal.toPrecision(4));
          } else {
            const call = await rpcCall(url, { method: 'eth_getBalance', params: [account, 'latest'] });
            setBalance(parseFloat(formatEther(call)).toPrecision(4));
          }
        } catch (error: any) {
          console.log(error);
        }
      })();
    } else {
      setBalance('0');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, account, chainId, token, ...deps]);
  return balance;
};

export const fetchChartData = (
  token0: ListingModel,
  token1: ListingModel,
  chainId: ChainId,
  period: number = 60 * 60 * 24 * 1000,
  deps: Array<any> = []
) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [loading, setIsLoading] = useState<boolean>(false);

  function labelFromPeriod(date: Date): string {
    if (_.isEqual(period, 60 * 60 * 24 * 1000)) {
      return date.toLocaleTimeString();
    } else if (_.isEqual(period, 60 * 60 * 24 * 7 * 1000)) {
      return dayLabels[date.getDay()];
    } else if (_.isEqual(period, 60 * 60 * 24 * 30 * 1000)) {
      return `${monthLabels[date.getMonth()]} ${date.getDate()}`;
    } else {
      return `${date.getFullYear()}`;
    }
  }

  useEffect(() => {
    if (!!token0 && !!token1 && token0.address && token1.address) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;

          setIsLoading(true);
          const t0 = token0.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token0.address, url);
          const t1 = token1.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token1.address, url);
          const pair = Pair.getAddress(t0, t1);

          const history = _.sortBy(await fetchPriceHistoryForPair(pair, chainId, period), (model) => model.timestamp);
          let queryInfo: Array<any> = [];

          for (const item of history) {
            const receipt = await rpcCall(url, { method: 'eth_getTransactionReceipt', params: [item.transactionHash] });
            queryInfo = _.concat(queryInfo, {
              blockNumber: receipt.blockNumber,
              reserve0: item.reserve0,
              reserve1: item.reserve1,
              timestamp: item.timestamp
            });
          }

          let cData: any[] = [];

          for (const query of queryInfo) {
            try {
              const pairAbiInterface = new Interface(pairAbi);
              const token0Hash = pairAbiInterface.getSighash('token0()');

              const token0Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token0Hash }, 'latest'] });

              const [asset0, asset1] = t0.address.toLowerCase() === hexStripZeros(token0Call).toLowerCase() ? [t0, t1] : [t1, t0];
              const token0Amount = new TokenAmount(asset0, query.reserve0);
              const token1Amount = new TokenAmount(asset1, query.reserve1);

              const pairObject = new Pair(token0Amount, token1Amount);
              const date = new Date(query.timestamp);

              cData = _.concat(cData, {
                price: parseFloat(pairObject.priceOf(t0).toSignificant(4)),
                label: labelFromPeriod(date)
              });
            } catch (e: any) {
              console.log(e);
            }
          }
          setChartData(cData);
          setIsLoading(false);
          setError(undefined);
        } catch (error: any) {
          setError(error);
        }
      })();
    }
  }, [token0, token1, chainId, period, ...deps]);
  return { chartData, error, loading };
};

export const calculatePercentageChange = (token0: ListingModel, token1: ListingModel, chainId: ChainId, period: number = 60 * 60 * 24 * 1000) => {
  const [token0PercentageChange, setToken0PercentageChange] = useState<number>(0);
  const [token1PercentageChange, setToken1PercentageChange] = useState<number>(0);
  const [tokensPercentageChangeType, setTokensPercentageChangeType] = useState<{
    token0PChangeType: PercentageChangeType;
    token1PChangeType: PercentageChangeType;
  }>({
    token0PChangeType: 'NEUTRAL',
    token1PChangeType: 'NEUTRAL'
  });

  useEffect(() => {
    if (token0 && token1 && token0.address && token1.address) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const t0 = token0.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token0.address, url);
          const t1 = token1.address === AddressZero ? WETH[chainId] : await Fetcher.fetchTokenData(chainId, token1.address, url);
          const pairAddress = Pair.getAddress(t0, t1);
          const pair = await Fetcher.fetchPairData(t0, t1, url);

          const history = _.sortBy(await fetchPriceHistoryForPair(pairAddress, chainId, period), (model) => model.timestamp);

          if (history.length > 0) {
            const [tA, tB] = pair.token0.address === t0.address ? [t0, t1] : [t1, t0];
            const lastPropagatedSync = history[history.length - 2];
            const pairFromTokenAmounts = new Pair(new TokenAmount(tA, lastPropagatedSync.reserve0), new TokenAmount(tB, lastPropagatedSync.reserve1));

            const currentToken0Price = pair.priceOf(t0);
            const previousToken0Price = pairFromTokenAmounts.priceOf(t0);
            const token0PercentageChange = currentToken0Price.divide(previousToken0Price).multiply(100);
            const token0PercentageChangeType: PercentageChangeType = currentToken0Price.greaterThan(previousToken0Price)
              ? 'INCREASE'
              : currentToken0Price.lessThan(previousToken0Price)
              ? 'DECREASE'
              : 'NEUTRAL';
            setToken0PercentageChange(parseFloat(token0PercentageChange.toSignificant(3)));

            const currentToken1Price = pair.priceOf(t1);
            const previousToken1Price = pairFromTokenAmounts.priceOf(t1);
            const token1PercentageChange = currentToken1Price.divide(previousToken1Price).multiply(100);
            const token1PercentageChangeType: PercentageChangeType = currentToken1Price.greaterThan(previousToken1Price)
              ? 'INCREASE'
              : currentToken1Price.lessThan(previousToken1Price)
              ? 'DECREASE'
              : 'NEUTRAL';
            setToken1PercentageChange(parseFloat(token1PercentageChange.toSignificant(3)));

            setTokensPercentageChangeType({
              token0PChangeType: token0PercentageChangeType,
              token1PChangeType: token1PercentageChangeType
            });
          } else {
            setToken0PercentageChange(0);
            setToken1PercentageChange(0);
            setTokensPercentageChangeType({
              token0PChangeType: 'NEUTRAL',
              token1PChangeType: 'NEUTRAL'
            });
          }
        } catch (error: any) {
          console.log(error);
          setToken0PercentageChange(0);
          setToken1PercentageChange(0);
          setTokensPercentageChangeType({
            token0PChangeType: 'NEUTRAL',
            token1PChangeType: 'NEUTRAL'
          });
        }
      })();
    }
  }, [token0, token1, chainId, period]);

  return {
    token0PercentageChange,
    token1PercentageChange,
    tokensPercentageChangeType
  };
};

export const obtainLPDetailsFromPair = (pair: string, chainId: number, account: string) => {
  const [lpDetails, setLpDetails] = useState({
    id: '',
    token0: '',
    token1: '',
    token0Symbol: '',
    token1Symbol: '',
    accountBalance: 0,
    token0Decimals: 18,
    token1Decimals: 18
  });

  useEffect(() => {
    if (!!pair && !!account) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const pairAbiInterface = new Interface(pairAbi);
          const erc20AbiInterface = new Interface(erc20Abi);
          const token0Hash = pairAbiInterface.getSighash('token0()');
          const token1Hash = pairAbiInterface.getSighash('token1()');
          const symbolHash = erc20AbiInterface.getSighash('symbol()');
          const balanceOf = erc20AbiInterface.encodeFunctionData('balanceOf(address)', [account]);

          const token0Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token0Hash }, 'latest'] });
          const token1Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token1Hash }, 'latest'] });
          const balanceOfCall = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: balanceOf }, 'latest'] });

          let token0SymbolCall = await rpcCall(url, { method: 'eth_call', params: [{ to: hexStripZeros(token0Call), data: symbolHash }, 'latest'] });
          let token1SymbolCall = await rpcCall(url, { method: 'eth_call', params: [{ to: hexStripZeros(token1Call), data: symbolHash }, 'latest'] });
          [token0SymbolCall] = erc20AbiInterface.decodeFunctionResult('symbol()', token0SymbolCall);
          [token1SymbolCall] = erc20AbiInterface.decodeFunctionResult('symbol()', token1SymbolCall);

          const tk1 = await Fetcher.fetchTokenData(chainId, hexStripZeros(token0Call), url);
          const tk2 = await Fetcher.fetchTokenData(chainId, hexStripZeros(token1Call), url);

          setLpDetails({
            id: pair,
            token0: hexStripZeros(token0Call),
            token1: hexStripZeros(token1Call),
            token0Symbol: token0SymbolCall,
            token1Symbol: token1SymbolCall,
            accountBalance: parseFloat(formatEther(balanceOfCall)),
            token0Decimals: tk1.decimals,
            token1Decimals: tk2.decimals
          });
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [pair, chainId, account]);
  return lpDetails;
};

export const fetchPairVolumeInUSDWithGivenPeriod = (pair: string, chainId: number, period: number = 60 * 60 * 24 * 1000) => {
  const [usdVolume, setUSDVolume] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
        const pairAbiInterface = new Interface(pairAbi);
        const factoryAbiInterface = new Interface(factoryAbi);
        const swapsWithinPeriod = await fetchSwapEventsForPairPerPeriod(pair, chainId, period);
        const whitelistedPeggedTokens = whitelist[chainId as unknown as keyof typeof whitelist];
        const factory = factories[chainId as unknown as keyof typeof factories];

        const token0Hash = pairAbiInterface.getSighash('token0()');
        const token1Hash = pairAbiInterface.getSighash('token1()');
        let token0Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token0Hash }, 'latest'] });
        let token1Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token1Hash }, 'latest'] });
        token0Call = hexStripZeros(token0Call);
        token1Call = hexStripZeros(token1Call);

        let priceOfToken0InUSD = 0;
        let priceOfToken1InUSD = 0;

        if (_.map(whitelistedPeggedTokens, (token) => token.toLowerCase()).includes(token0Call.toLowerCase())) {
          priceOfToken0InUSD = 1;
        } else {
          for (const token of whitelistedPeggedTokens) {
            const getPairHash = factoryAbiInterface.encodeFunctionData('getPair(address,address)', [token, token0Call]);
            const pairCall = await rpcCall(url, { method: 'eth_call', params: [{ to: factory, data: getPairHash }, 'latest'] });

            if (pairCall !== AddressZero) {
              const token0 = await Fetcher.fetchTokenData(chainId, token, url);
              const token1 = await Fetcher.fetchTokenData(chainId, token0Call, url);
              const pairObj = await Fetcher.fetchPairData(token0, token1, url);
              priceOfToken0InUSD = parseFloat(pairObj.priceOf(token1).toSignificant(4));
            }
          }
        }

        if (_.map(whitelistedPeggedTokens, (token) => token.toLowerCase()).includes(token1Call.toLowerCase())) {
          priceOfToken1InUSD = 1;
        } else {
          for (const token of whitelistedPeggedTokens) {
            const getPairHash = factoryAbiInterface.encodeFunctionData('getPair(address,address)', [token, token1Call]);
            const pairCall = await rpcCall(url, { method: 'eth_call', params: [{ to: factory, data: getPairHash }, 'latest'] });

            if (pairCall !== AddressZero) {
              const token0 = await Fetcher.fetchTokenData(chainId, token, url);
              const token1 = await Fetcher.fetchTokenData(chainId, token1Call, url);
              const pairObj = await Fetcher.fetchPairData(token0, token1, url);
              priceOfToken1InUSD = parseFloat(pairObj.priceOf(token1).toSignificant(4));
            }
          }
        }
        const token0Data = await Fetcher.fetchTokenData(chainId, token0Call, url);
        const token1Data = await Fetcher.fetchTokenData(chainId, token1Call, url);
        const volumeInUSD = _.map(
          swapsWithinPeriod,
          (swap) =>
            (_.divide(parseInt(swap.amount0In), Math.pow(10, token0Data.decimals)) +
              _.divide(parseInt(swap.amount0Out), Math.pow(10, token0Data.decimals))) *
              priceOfToken0InUSD +
            (_.divide(parseInt(swap.amount1In), Math.pow(10, token1Data.decimals)) +
              _.divide(parseInt(swap.amount1Out), Math.pow(10, token1Data.decimals))) *
              priceOfToken1InUSD
        ).reduce((prev, curr) => _.add(prev, curr), 0);

        setUSDVolume(volumeInUSD);
      } catch (error: any) {
        console.log(error);
      }
    })();
  }, [pair, chainId, period]);
  return usdVolume;
};

export const fetchLiquidityValue = (pair: string, chainId: number, tokenAddress: string, liquidity: number) => {
  const [liquidityValue, setLiquidityValue] = useState<number>(0);

  useEffect(() => {
    if (!!pair && !!tokenAddress) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const token = await Fetcher.fetchTokenData(chainId, tokenAddress, url);
          // const pairAsToken = await Fetcher.fetchTokenData(chainId, pair, url);
          const factory = factories[chainId as unknown as keyof typeof factories];
          const erc20AbiInterface = new Interface(erc20Abi);
          const pairAbiInterface = new Interface(pairAbi);
          const factoryAbiInterface = new Interface(factoryAbi);
          const totalSupplyHash = erc20AbiInterface.getSighash('totalSupply()');
          const kLastHash = pairAbiInterface.getSighash('kLast()');
          const feeToHash = factoryAbiInterface.getSighash('feeTo()');
          const token0Hash = pairAbiInterface.getSighash('token0()');
          const token1Hash = pairAbiInterface.getSighash('token1()');
          const totalSupplyCall = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: totalSupplyHash }, 'latest'] });
          const kLastCall = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: kLastHash }, 'latest'] });
          const feeToCall = await rpcCall(url, { method: 'eth_call', params: [{ to: factory, data: feeToHash }, 'latest'] });
          const token0Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token0Hash }, 'latest'] });
          const token1Call = await rpcCall(url, { method: 'eth_call', params: [{ to: pair, data: token1Hash }, 'latest'] });

          const token0 = await Fetcher.fetchTokenData(chainId, hexStripZeros(token0Call), url);
          const token1 = await Fetcher.fetchTokenData(chainId, hexStripZeros(token1Call), url);
          const pairAsToken = await Fetcher.fetchPairData(token0, token1, url);
          const totalSupplyAmount = new TokenAmount(pairAsToken.liquidityToken, totalSupplyCall);
          const liquidityAmount = new TokenAmount(pairAsToken.liquidityToken, parseUnits(liquidity.toFixed(4), 18).toHexString());

          setLiquidityValue(
            parseFloat(
              pairAsToken.getLiquidityValue(token, totalSupplyAmount, liquidityAmount, feeToCall !== AddressZero, kLastCall).toSignificant(4)
            )
          );
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [pair, chainId, tokenAddress, liquidity]);

  return liquidityValue;
};

export const quote = (address1: string, address2: string, amount1: number, chainId: number) => {
  const [amount2, setAmount2] = useState<number>(0);

  useEffect(() => {
    if (address1 && address2 && amount1 && chainId) {
      (async () => {
        try {
          const url = chains[chainId as unknown as keyof typeof chains].rpcUrl;
          const tokenA = address1 === AddressZero ? WETH[chainId as keyof typeof WETH] : await Fetcher.fetchTokenData(chainId, address1, url);
          const tokenB = address2 === AddressZero ? WETH[chainId as keyof typeof WETH] : await Fetcher.fetchTokenData(chainId, address2, url);
          const pair = await Fetcher.fetchPairData(tokenA, tokenB, url);
          const val = new TokenAmount(tokenA, parseUnits(amount1.toPrecision(4), tokenA.decimals).toHexString())
            .multiply(pair.reserveOf(tokenB))
            .divide(pair.reserveOf(tokenA));
          setAmount2(parseFloat(val.toSignificant(7)));
        } catch (error: any) {
          console.log(error);
        }
      })();
    }
  }, [address1, address2, amount1, chainId]);
  return amount2;
};
