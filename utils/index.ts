export async function addToMetamask(address: string, symbol: string, decimals: number, image?: string) {
  try {
    if ((window as any).ethereum) {
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: { type: 'ERC20', options: { address, symbol, decimals, image } }
      });
    }
  } catch (error: any) {
    console.log(error);
  }
}

export async function switchChain(chainId: string, chains: any) {
  const { ethereum } = window as any;
  try {
    if (ethereum)
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }]
      });
  } catch (error: any) {
    if (error.code === 4902 || error.code === -32603) {
      const chain = chains[parseInt(chainId, 16)];
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId,
            chainName: chain.name,
            rpcUrls: [chain.rpcUrl],
            blockExplorerUrls: [chain.explorer],
            nativeCurrency: {
              symbol: chain.symbol,
              decimals: 18
            }
          }
        ]
      });
    }
  }
}
